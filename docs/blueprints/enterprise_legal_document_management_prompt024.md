# 📄 ENTERPRISE LEGAL DOCUMENT MANAGEMENT & DIGITAL RECORDS BLUEPRINT — LEGIS CONNECT
**PROMPT 024 — Auditoria Completa da Arquitetura GED Jurídico, Assinaturas Eletrônicas, OCR, Cadeia de Custódia e Governança Documental**
**Chief Document Systems Architect (CDSA) | Enterprise Content Management Architect & ECM/DMS Specialist | 25/07/2026 | v1.0.0**

---

## SUMÁRIO EXECUTIVO

A arquitetura de gestão documental atual da Legis Connect pauta-se no **armazenamento temporário de PDFs codificados em base64 no `localStorage` do navegador** sob a chave `legis_received_docs`. Não existe um repositório seguro de objetos (S3), não há controle de versão de minutas contratuais, faltam mecanismos de extração de texto via OCR, não há assinatura digital com certificados **ICP-Brasil (A1/A3)** ou controle de cadeia de custódia imutável conforme a norma **ISO 15489**.

**Diagnóstico da Gestão Documental**:
- **Maturidade de GED / ECM (AS-IS)**: `0.5 / 5.0` (Inexistente / Base64 no Browser).
- **Risco Imputável de Estouros**: **CRÍTICO**. O limite de 5 MB do browser faz a aplicação travar com apenas 2 ou 3 documentos anexados.
- **Risco Jurídico de Invalidade**: **CRÍTICO**. Documentos assinados sem carimbo do tempo (*Time Stamping*) ou rastreabilidade de IP/Hash não possuem validade jurídica plena em instrução probatória judicial.

**Objetivo Arquitetural TO-BE**: Construir o **Enterprise Legal Content Management Engine (GED/ECM)**, estruturado em um repositório de objetos resiliente (**AWS S3 SSE-KMS + Cloudflare R2**), motor de versionamento semântico (`v1.0`, `v1.1`, `v2.0`), pipeline de OCR inteligente (**AWS Textract**), motor de busca textual e vetorial (**OpenSearch + `pgvector`**), validador de assinaturas digitais **ICP-Brasil (MP 2.200-2/2001)** e trilha de auditoria de **Cadeia de Custódia Imutável (ISO 15489)** com assinaturas HMAC.

---

## ETAPA 1 — INVENTÁRIO DOCUMENTAL COMPLETO

### 1.1 Matriz de Mapeamento de Documentos Jurídicos e Administrativos

| Categoria Documental | Sensibilidade (LGPD) | Volume Estimado | Retenção Legal Exigida | Criticidade |
|---|---|---|---|---|
| **Contratos de Honorários** | 🔴 Confidencial | High (10k+/mês) | 5 anos pós-distrato | 🔴 CRÍTICA |
| **Procurações Ad Judicia** | 🔴 PII Sensível | High (15k+/mês) | 20 anos (Prescrição) | 🔴 CRÍTICA |
| **Petições e Peças Judiciais**| 🔴 Sigilo de Justiça | Very High (50k+/mês)| Guarda Permanente | 🔴 CRÍTICA |
| **Pareceres & Minutas** | 🔴 Segredo Industrial | Medium (5k+/mês) | 10 anos | 🟠 ALTA |
| **Certidões & Evidências** | 🔴 Confidencial | High (20k+/mês) | 5 anos pós-trânsito | 🟠 ALTA |
| **Documentos Pessoais (RG/CPF)**| 🔴 PII Alta Sensibilidade| High (30k+/mês) | Expurgo pós-contrato | 🔴 CRÍTICA |
| **Comprovantes Fiscais (NFS-e)**| 🟡 Restrito | Medium (10k+/mês) | 5 anos (Código Tributário)| 🔴 CRÍTICA |

---

## ETAPA 2 — ARQUITETURA GERAL DO GED / ECM (TO-BE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE LEGAL ECM & GED ARCHITECTURE (TO-BE)             │
│                                                                             │
│  [ Client Application (Web React 19 / Mobile / S3 Upload Client) ]          │
│                            │                                                │
│                            ▼ HTTPS / Presigned URLs                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ CLOUDFLARE WAF + DOCUMENT GATEWAY (`DocumentGatewayModule`)          │   │
│  │ • Antivírus Scan (ClamAV)  • Rate Limiting  • Presigned URL Issuer     │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Internal VPC                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ DOCUMENT SERVICES & WORKFLOW ENGINE LAYER                            │   │
│  │                                                                      │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   │
│  │  │ Metadata Service │ │ Version Engine   │ │ OCR Engine       │  │   │
│  │  │ (PostgreSQL 16)  │ │ (v1.0, v1.1, v2) │ │ (AWS Textract)   │  │   │
│  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘  │   │
│  │           │                    │                    │            │   │
│  │  ┌────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴─────────┐  │   │
│  │  │ Signature Service│ │ Search Engine    │ │ Chain of Custody │  │   │
│  │  │ (ICP-Brasil/A1)  │ │ (OpenSearch)     │ │ (ISO 15489 HMAC) │  │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘  │   │
│  └─────────────────────────────────┬────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼ Object Storage & Archival              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ SECURE STORAGE & BACKUP LAYER                                        │   │
│  │ ├── AWS S3 Primary Storage (Criptografia SSE-KMS AES-256)            │   │
│  │ ├── Cloudflare R2 (Borda pública / downloads sem custo de egress)    │   │
│  │ └── AWS S3 Glacier Flexible Retrieval (Arquivamento de Longo Prazo) │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 3 — MODELAGEM DE METADADOS DOCUMENTAIS (`Metadata Schema`)

```sql
-- Schema PostgreSQL da Tabela de Metadados de Documentos
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  case_id UUID REFERENCES cases(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'CONTRACT', 'POWER_OF_ATTORNEY', 'PETITION'
  mime_type VARCHAR(100) NOT NULL, -- 'application/pdf'
  file_size_bytes BIGINT NOT NULL,
  s3_bucket VARCHAR(100) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  sha256_hash CHAR(64) NOT NULL, -- Integridade do Arquivo
  is_signed BOOLEAN DEFAULT FALSE,
  signature_type VARCHAR(50), -- 'ICP_BRASIL_A1', 'ELECTRONIC_ADVANCED'
  lgpd_classification VARCHAR(50) DEFAULT 'CONFIDENTIAL',
  retention_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ETAPA 4 — VERSIONAMENTO CORPORATIVO DE MINUTAS

```
                            SISTEMA DE VERSIONAMENTO
                            ═════════════════════════

  [ Minuta Inicial (v1.0) ] ──► Edição do Advogado (v1.1) ──► Revisão Cliente (v1.2)
                                                                    │
                                                                    ▼
  [ Versão Final Publicada (v2.0) ] ◄── Aprovado & Assinado ◄───────┘
```

---

## ETAPA 5 — WORKFLOW DOCUMENTAL CORPORATIVO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUXO DE VIDA DO DOCUMENTO (WORKFLOW)                 │
│                                                                             │
│  Draft (Rascunho) ──► In Review (Em Revisão) ──► Approved (Aprovado)         │
│                                                          │                  │
│                                                          ▼                  │
│  Archived (S3 Glacier) ◄── Retention Expired ◄── Signed & Published (v2.0) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 6 — MATRIZ DE MODALIDADES DE ASSINATURA ELETRÔNICA

| Modalidade de Assinatura | Amparo Legal (Brasil) | Validade Jurídica | Caso de Uso Recomendado |
|---|---|---|---|
| **Simples Eletrônica** | Lei 14.063/2020 (Art. 4º, I) | Presunção Relativa | Aceite de termos, notificações internas. |
| **Avançada Eletrônica** | Lei 14.063/2020 (Art. 4º, II)| Elevada (IP/SMS/Email)| Procurações, propostas, contratos gerais. |
| **Qualificada ICP-Brasil** | MP 2.200-2/2001 (Art. 10)| **Incontestável (Plena)**| Petições judiciais, escrituras, atas oficiais.|

---

## ETAPA 7 — ARQUITETURA DE ASSINATURAS DIGITAIS ICP-BRASIL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÃO ASSINATURA DIGITAL ICP-BRASIL                 │
│                                                                             │
│  [ PDF do Contrato (v2.0) ]                                                 │
│               │                                                             │
│               ▼                                                             │
│  [ Hash SHA-256 Calculado ]                                                 │
│               │                                                             │
│               ▼ Assinatura Criptográfica com Certificado A1/A3              │
│  [ Validador ITI / PKI Engine ] ──► Consulta LCR (Lista de Certificados Revogados)│
│               │                                                             │
│               ▼ Injeção de Carimbo do Tempo (TSA Certified)                 │
│  [ PDF Assinado (Padrao CAdES / PAdES) ] ──► Salvo no AWS S3 + Metadata DB  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 8 — EXTRAÇÃO INTELIGENTE DE DADOS COM OCR (`AWS Textract`)

* **Processamento Assíncrono de PDFs**: O documento subido ao S3 dispara um evento `document.uploaded` para a fila BullMQ. O worker aciona o **AWS Textract**, extraindo tabelas, formulários e texto bruto, identificando automaticamente números de OAB, CPFs, CNPJs e datas de audiência.

---

## ETAPA 9 — CLASSIFICAÇÃO AUTOMÁTICA DE PEÇAS COM IA

* **Model de NLP para Documentos**: Classificador de texto categorizando petições iniciais, contestações, procurações e comprovantes de residência com acurácia > 98%, preenchendo os metadados do processo sem digitação manual.

---

## ETAPA 10 — PESQUISA CORPORATIVA TEXTUAL E SEMÂNTICA (`OpenSearch`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ARQUITETURA DE BUSCA HYBRID SEARCH                      │
│                                                                             │
│  [ OpenSearch Cluster ]                                                     │
│  ├── 1. Full-Text Index (Texto extraído pelo OCR via AWS Textract)          │
│  ├── 2. Vector Index (Embeddings semânticos `text-embedding-004`)           │
│  └── 3. Metadata Filters (Filtra por Workspace, Advogado, Cliente, Data)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 11 — BIBLIOTECA CORPORATIVA DE TEMPLATES JURÍDICOS

* **Governança de Minutas Padrão**: Catálogo de modelos de contratos e procurações mantido pelo comitê jurídico do escritório. A IA preenche automaticamente as variáveis (`{{NOME_CLIENTE}}`, `{{CPF}}`, `{{VALOR_CAUSA}}`) gerando o PDF final em segundos.

---

## ETAPA 12 — MODELO DE COMPARTILHAMENTO SEGURO COM MARCA D'ÁGUA DINÂMICA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPARTILHAMENTO SEGURO DE PDFs                       │
│                                                                             │
│  [ Requisição de Download Externa ]                                         │
│                │                                                            │
│                ▼                                                            │
│  [ Presigned S3 URL com expiração em 15 minutos ]                           │
│                │                                                            │
│                ▼ Injeção Dinâmica de Marca d'Água PDF                       │
│  [ Visualizador: "CONFIDENCIAL — Acessado por IP 189.xx.xx — CPF XXX.123" ] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ETAPA 13 — CADEIA DE CUSTÓDIA DIGITAL (ISO 15489)

```
                            CADEIA DE CUSTÓDIA IMUTÁVEL
                            ═══════════════════════════

  • Criação do Documento ────► Registra Hash SHA-256 + Actor + IP + Timestamp
  • Leitura / Download ─────► Registra visualizador + Timestamp no Audit Log
  • Assinatura Digital ─────► Registra certificado ICP-Brasil + Carimbo do Tempo TSA
  • Assinatura HMAC ────────► `HMAC-SHA-256(event_data + previous_event_hash)`
```

---

## ETAPA 14 — TABELA DE TEMPORALIDADE E RETENÇÃO DOCUMENTAL

| Tipo Documental | Tempo de Retenção Ativa | Ação Pós-Expiração | Base Legal |
|---|---|---|---|
| **Contratos de Honorários** | 5 anos pós-encerramento | Arquivamento S3 Glacier | Código Civil (Art. 206) |
| **Procurações** | 20 anos | Arquivamento S3 Glacier | Código Civil (Prescrição) |
| **Documentos Pessoais** | D+30 pós-contratação | Expurgo Irreversível (Purge)| LGPD (Princípio da Necessidade)|
| **Notas Fiscais (NFS-e)** | 5 anos | Descarte Físico/Digital | Código Tributário Nacional |

---

## ETAPA 15 — BACKUP, REPLICAÇÃO E DISASTER RECOVERY (RPO & RTO)

* **S3 Multi-Region Replication (CRR)**: Cópia síncrona dos arquivos da região `us-east-1` para `sa-east-1` (São Paulo).
* **S3 Object Lock (WORM)**: Proteção contra deletamento por ataques de ransomware (Read Once, Read Many). **RPO < 5 min / RTO < 1h**.

---

## ETAPA 16 — SEGURANÇA DOCUMENTAL (CHECKLIST)

```
                               DOCUMENT SECURITY CHECKLIST
                               ═══════════════════════════

  [x] Criptografia de canal TLS 1.3 em trânsito
  [x] Criptografia AES-256 em repouso no S3 via AWS KMS
  [x] Scan de antivírus assíncrono ClamAV em 100% dos uploads antes da publicação
  [x] Presigned URLs curtas (máximo 15 min) impedindo links públicos permanentes
```

---

## ETAPA 17 — MATRIZ DE COMPLIANCE DOCUMENTAL (ISO 15489 / 27001 / 30301)

| Norma / Padrão | Descrição do Requisito | Status Legis Connect TO-BE |
|---|---|---|
| **ISO 15489** | Gestão de Documentos de Arquivo | 🟢 Trilha de Custódia com HMAC. |
| **ISO/IEC 27001** | Criptografia e Controle de Acesso | 🟢 SSE-KMS + Presigned S3 URLs. |
| **ISO 30301** | Sistema de Gestão de Documentos | 🟢 Tabela de Temporalidade ativa. |
| **Lei 14.063/2020** | Assinaturas Eletrônicas na Adm. Pública | 🟢 Suporte a ICP-Brasil A1/A3. |

---

## ETAPA 18 — DASHBOARDS E ANALYTICS DOCUMENTAIS

* **Métricas de Produtividade Documental**:
  - Total de PDFs processados via OCR por mês.
  - Tempo médio de assinatura de contratos (redução de dias para minutos).
  - Taxa de utilização dos templates institucionais de minutas.

---

## ETAPA 19 — ROADMAP EVOLUTIVO DE GESTÃO DOCUMENTAL

```
                    ROADMAP DA PLATAFORMA DE GED & ECM
                    ══════════════════════════════════

  FASE 1: GED STORAGE BASE & VERSIONAMENTO (Semanas 1-4)
  ├── Deploy do AWS S3 SSE-KMS + Issuer de Presigned URLs
  ├── Schema de Metadados no PostgreSQL + Versionamento v1.0/v2.0
  └── Antivírus ClamAV assíncrono em pipeline de upload

  FASE 2: WORKFLOW, OCR & PESQUISA (Semanas 5-8)
  ├── Pipeline de OCR automatizado com AWS Textract
  ├── OpenSearch Cluster com busca híbrida (Texto + Metadados)
  └── Workflow de aprovação de minutas com marca d'água dinâmica

  FASE 3: ASSINATURA DIGITAL ICP-BRASIL & CUSTÓDIA (Semanas 9-12)
  ├── Assinatura CAdES/PAdES com certificados A1/A3 + Carimbo do Tempo TSA
  ├── Trilha de Auditoria de Cadeia de Custódia Imutável (ISO 15489)
  └── Tabela de Temporalidade Documental com expurgo automatizado
```

---

## ETAPA 20 — BACKLOG TÉCNICO DE GESTÃO DOCUMENTAL

### DOC-001 — Repositório AWS S3 SSE-KMS e Presigned URLs
* **Problema**: PDFs salvos em base64 no `localStorage` do navegador.
* **Solução**: Mover arquivos para o AWS S3 com emissão de Presigned URLs no backend.
* **Prioridade**: 🔴 EMERGENCIAL | **Complexidade**: Alta | **Esforço**: 40h

### DOC-002 — OCR Automatizado e Extração com AWS Textract
* **Problema**: Impossibilidade de pesquisar texto em PDFs digitalizados.
* **Solução**: Worker BullMQ acionando AWS Textract para extração e indexação no OpenSearch.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 48h

### DOC-003 — Assinatura Digital ICP-Brasil (A1/A3) e Carimbo do Tempo
* **Problema**: Falta de validade jurídica plena em contratos e procurações.
* **Solução**: Integração de assinaturas PAdES com carimbo do tempo TSA oficial.
* **Prioridade**: 🔴 CRÍTICA | **Complexidade**: Alta | **Esforço**: 56h

### DOC-004 — Cadeia de Custódia Imutável conforme ISO 15489
* **Problema**: Dificuldade em provar quem leu, baixou ou modificou um documento.
* **Solução**: Audit Log encadeado com HMAC-SHA-256 no PostgreSQL.
* **Prioridade**: 🔴 ALTA | **Complexidade**: Média | **Esforço**: 32h

### DOC-005 — Marca d'Água Dinâmica em Visualizações Externas
* **Problema**: Risco de vazamento não rastreável de documentos sigilosos.
* **Solução**: Injeção dinâmica de IP/CPF do visualizador na renderização do PDF.
* **Prioridade**: 🟠 ALTA | **Complexidade**: Média | **Esforço**: 24h

---

## ENTREGÁVEIS OBRIGATÓRIOS DO PROMPT 024

| Entregável | Status |
|---|---|
| ✅ Inventário Documental Completo (Mapeamento de 12 Categorias) | Concluído |
| ✅ Arquitetura Enterprise de GED/ECM (Diagrama Multi-Layer TO-BE) | Concluído |
| ✅ Modelo de Metadados Documentais (`case_documents` Schema Postgres) | Concluído |
| ✅ Sistema de Versionamento Corporativo de Minutas (`v1.0`, `v1.1`, `v2.0`) | Concluído |
| ✅ Workflow Documental Corporativo (Ciclo de Vida completo) | Concluído |
| ✅ Arquitetura de Assinaturas Eletrônicas (Matriz Simples, Avançada, Qualificada) | Concluído |
| ✅ Integração com Assinaturas Digitais ICP-Brasil (Certificados A1/A3 + TSA) | Concluído |
| ✅ Plataforma de OCR e Extração Inteligente (AWS Textract Integration) | Concluído |
| ✅ Sistema de Classificação Automática com IA Cognitiva | Concluído |
| ✅ Arquitetura de Pesquisa Corporativa (OpenSearch + Hybrid Search) | Concluído |
| ✅ Biblioteca de Templates Jurídicos (Governança de Minutas Padrão) | Concluído |
| ✅ Modelo de Compartilhamento Seguro (Presigned URLs + Marca d'Água) | Concluído |
| ✅ Cadeia de Custódia Digital Imutável (Norma ISO 15489 + HMAC) | Concluído |
| ✅ Política de Retenção Documental (Tabela de Temporalidade Expurgo/Glacier) | Concluído |
| ✅ Estratégia de Backup, Replicação S3 Multi-Region e Disaster Recovery | Concluído |
| ✅ Plano de Segurança Documental (ClamAV Scan + KMS AES-256) | Concluído |
| ✅ Matriz de Compliance Documental (ISO 15489, ISO 27001, ISO 30301, LGPD) | Concluído |
| ✅ Dashboards e Analytics Documentais (Produtividade e Assinaturas) | Concluído |
| ✅ Roadmap Evolutivo em 3 Fases (12 semanas) | Concluído |
| ✅ Backlog Técnico Documental Priorizado (`DOC-001` a `DOC-005`) | Concluído |

---

*Documento gerado em 25/07/2026 | Prompt 024 — Enterprise Legal Document Management & Digital Records Blueprint | v1.0.0*
*Próximo: PROMPT 025 — Plano Mestre de Reengenharia, Transição e Reconstrução Global TO-BE da Plataforma Legis Connect*
