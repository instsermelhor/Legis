"""
Legis Connect — Apache Airflow DAG: Analytics Data Pipeline
Orquestra: Bronze → Silver (Spark) → Gold (dbt) → ML Predictions (SageMaker)
Schedule: A cada 4 horas | Retry: 2 tentativas com 5 min de intervalo
Owner: Data Platform Team | SLA: Pipeline completo em < 45 minutos
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.amazon.aws.operators.emr import EmrServerlessStartJobRunOperator
from airflow.providers.amazon.aws.operators.glue import GlueJobOperator
from airflow.operators.bash import BashOperator

DEFAULT_ARGS = {
    'owner': 'data-platform-team',
    'depends_on_past': False,
    'start_date': datetime(2026, 8, 1),
    'email_on_failure': True,
    'email': ['data-alerts@legis-connect.com'],
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='legis_analytics_pipeline',
    default_args=DEFAULT_ARGS,
    schedule_interval='0 */4 * * *',  # A cada 4 horas
    catchup=False,
    tags=['data-platform', 'analytics', 'production'],
    doc_md="""
    ## Legis Connect — Analytics Pipeline
    Bronze → Silver (Spark EMR Serverless) → Gold (dbt Redshift) → ML (SageMaker)
    """,
) as dag:

    # STEP 1: Bronze → Silver via Spark (EMR Serverless)
    bronze_to_silver = EmrServerlessStartJobRunOperator(
        task_id='spark_bronze_to_silver',
        application_id="{{ var.value.EMR_SERVERLESS_APP_ID }}",
        execution_role_arn="{{ var.value.EMR_EXECUTION_ROLE_ARN }}",
        job_driver={
            "sparkSubmit": {
                "entryPoint": "s3://legis-analytics-scripts/bronze_to_silver.py",
                "entryPointArguments": ["--date", "{{ ds }}"],
                "sparkSubmitParameters": "--conf spark.executor.cores=4 --conf spark.executor.memory=8g"
            }
        },
    )

    # STEP 2: Silver → Gold via dbt (Redshift Serverless)
    silver_to_gold = BashOperator(
        task_id='dbt_silver_to_gold',
        bash_command="""
            cd /opt/dbt/legis-analytics && \
            dbt run --select gold --target prod --profiles-dir /opt/dbt/profiles && \
            dbt test --select gold --target prod
        """,
    )

    # STEP 3: ML Churn Prediction (SageMaker Batch Transform)
    run_churn_model = BashOperator(
        task_id='sagemaker_churn_prediction',
        bash_command="""
            aws sagemaker create-transform-job \
              --transform-job-name legis-churn-{{ ds_nodash }} \
              --model-name legis-churn-model-latest \
              --transform-input DataSource={S3DataSource={S3DataType=S3Prefix,S3Uri=s3://legis-ml-input/churn/{{ ds }}/}} \
              --transform-output S3OutputPath=s3://legis-ml-output/churn/{{ ds }}/
        """,
    )

    # DAG Dependency Chain
    bronze_to_silver >> silver_to_gold >> run_churn_model
