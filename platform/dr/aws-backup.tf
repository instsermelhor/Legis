# platform/dr/aws-backup.tf
# AWS Backup Plan com Vault Lock Imutável para LGPD/PCI DSS Compliance

resource "aws_backup_vault" "immutable_vault" {
  name        = "legis_immutable_backup_vault"
  kms_key_arn = aws_kms_key.backup_key.arn
}

resource "aws_backup_vault_lock_configuration" "vault_lock" {
  backup_vault_name   = aws_backup_vault.immutable_vault.name
  min_retention_days  = 30
  max_retention_days  = 365
  changeable_for_days = 3  # Período de carência de 3 dias para alterar política, depois WORM imutável
}

resource "aws_backup_plan" "dr_backup_plan" {
  name = "legis_enterprise_dr_backup_plan"

  rule {
    rule_name         = "daily_immutable_backup"
    target_vault_name = aws_backup_vault.immutable_vault.name
    schedule          = "cron(0 3 * * ? *)" # 03:00 AM UTC diariamente

    lifecycle {
      delete_after = 90
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.secondary_region_vault.arn
    }
  }
}

resource "aws_kms_key" "backup_key" {
  description             = "KMS Key para Criptografia de Backups Imutáveis Legis Connect"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_backup_vault" "secondary_region_vault" {
  provider = aws.us_east_1
  name     = "legis_secondary_immutable_backup_vault"
}
