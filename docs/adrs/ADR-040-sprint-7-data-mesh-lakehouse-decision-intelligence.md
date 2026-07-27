# ADR-040: Sprint 7 Enterprise Data Platform — Data Mesh Architecture, Apache Iceberg Lakehouse & Decision Intelligence
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Data Officer, Enterprise Data Architect, BI Director, Data Governance Officer

## Contexto
Com a plataforma de IA da Sprint 6 (Prompt 253) operacional, a Sprint 7 constrói a arquitetura corporativa de dados e inteligência analítica da Legis Connect. É necessário consolidar dados de todos os microsserviços das Sprints 0 a 6 em uma arquitetura de Data Mesh e Lakehouse capaz de responder a consultas OLAP em milissegundos com governança total sob a DAMA-DMBOK e a LGPD.

## Decisões Técnicas

### 1. Arquitetura Data Mesh com 5 Data Products
- Estruturar a plataforma de dados em 5 domínios descentralizados: *Identity*, *Marketplace*, *LegalOps*, *Communication* e *AI Execution*, cada um responsável por publicar seu respectivo Data Product na camada Gold.

### 2. Data Lakehouse em Apache Iceberg & ClickHouse OLAP
- Utilizar o formato imutável **Apache Iceberg** sobre o AWS S3 (camadas Bronze, Silver e Gold em Parquet) para armazenamento em massa.
- Utilizar o banco **ClickHouse** como Operational Data Store (ODS) e motor OLAP para garantir dashboards executivos em tempo real com latência P95 < 45ms.

### 3. Governança DAMA-DMBOK com OpenMetadata & Mascaramento PII
- Adotar o OpenMetadata para catálogo corporativo automatizado e rastreamento de linhagem (*Data Lineage*). Todos os dados pessoais (PII) passam por mascaramento automático na camada analítica.

### 4. Emissão da Autorização para Início da Sprint 8
- Certificar a conclusão da Sprint 7 com 92.5% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT8-2026-001** autorizando o desenvolvimento da Plataforma Financeira Enterprise, Split de Pagamentos, Escrow, Billing e Revenue Intelligence.

## Consequências
- Positivas: Consultas analíticas C-Level instantâneas; governança de dados automatizada; infraestrutura de dados escalável para Big Data.
- Regra de Ouro: Proibição estrita de acesso direto a bancos transacionais (Aurora PG) para fins analíticos; todas as consultas BI devem utilizar o Lakehouse/ClickHouse.
