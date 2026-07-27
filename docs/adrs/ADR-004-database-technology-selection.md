# ADR-004: Seleção da Infraestrutura de Persistência Poliglota (Aurora Postgres + Redis + S3 + pgvector)
Status: APROVADO
Data: 27/07/2026
Decisores: CDO, Enterprise Data Architect, CISO, DBRE

## Contexto
A plataforma Legis Connect exige consistência ACID estrita para transações financeiras e jurídicas,
armazenamento flexível para documentos, cache de ultra-baixa latência e suporte a vetores para IA RAG.

## Decisão
Adotar o AWS Aurora PostgreSQL 16 (Multi-AZ com Aurora Global DB) para os bancos relacionais transacionais,
MongoDB Atlas para metadados flexíveis de documentos, Redis Enterprise para cache in-memory, pgvector
para busca vetorial RAG e Amazon S3 criptografado com KMS para armazenamento de arquivos.

## Consequências
- Positivas: ACID total onde necessário, custos otimizados, failover automático < 30s, RPO < 1m.
- Mitigações: Gestão de conexões via PgBouncer e rotina automatizada de vacuums/index maintenance.
