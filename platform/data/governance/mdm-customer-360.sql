-- platform/data/governance/mdm-customer-360.sql
-- Tabela Mestre do Cliente (Golden Record Customer 360 - MDM)
-- Padrão: Customer Master Data Platform (Prompt 232 - Etapa 5 & Prompt 226 Integration)

CREATE TABLE IF NOT EXISTS gold_customer_360 (
    global_customer_id UUID PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    tax_id VARCHAR(32) NOT NULL, -- CPF/CNPJ mascarado ou hash SHA-256
    legal_name VARCHAR(255) NOT NULL,
    customer_segment VARCHAR(32) CHECK (customer_segment IN ('SOLO_LAWYER', 'MID_FIRM', 'ENTERPRISE')),
    subscription_plan VARCHAR(32) NOT NULL,
    account_status VARCHAR(16) NOT NULL,
    health_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gold_customer_tenant ON gold_customer_360(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gold_customer_tax ON gold_customer_360(tax_id);
