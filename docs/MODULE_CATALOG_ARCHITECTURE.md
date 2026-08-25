# LEGIS CONNECT — ARQUITETURA MODULAR, CATÁLOGO DE FUNCIONALIDADES & ENTITLEMENTS
## Norma Oficial de Governança de Módulos, Feature Flags, Planos e Controle de Acesso

**Versão Normativa Oficial:** 3.0.0 — Enterprise Modular Architecture Edition  
**Data de Homologação:** 25 de Agosto de 2026  
**Classificação:** Fonte Oficial de Verdade de Módulos e Entitlements da Plataforma  
**Princípio Reitor:** *ESCONDER BOTÃO NÃO É AUTORIZAR ACESSO — O backend e o banco de dados são as autoridades finais de acesso funcional.*

---

## 1. VISÃO GERAL DA ARQUITETURA MODULAR

A **Legis Connect** opera sob uma arquitetura de produto estritamente desacoplada e orientada a **Entitlements**. A plataforma não é um monólito onde todos os recursos estão universalmente acessíveis a qualquer usuário conectado.

O acesso a qualquer funcionalidade é avaliado através da **Cadeia Multidimensional em 10 Camadas**:

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           REQUISIÇÃO DO CLIENTE                        │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. IDENTIDADE & AUTENTICAÇÃO (JWT Validado / Supabase Auth)            │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 2. MEMBERSHIP & TENANCY (Tenant Ativo e Vínculo Confirmado)            │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 3. CATÁLOGO CENTRAL (Módulo Existe no Catálogo Oficial?)               │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 4. GRAFO DE DEPENDÊNCIAS (Todas as Dependências Estão Ativas?)         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 5. FEATURE FLAG ENGINE (Recurso Disponível Globalmente / Rollout?)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 6. ENTITLEMENT DO TENANT (Tenant Possui Direito Contratado/Ativo?)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 7. MATRIZ RBAC & ROLE (Papel do Usuário Possui Ação Permitida?)        │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 8. SCOPE & OWNERSHIP (OWN / ASSIGNED / OFFICE / TENANT / GLOBAL)       │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 9. BACKEND ENFORCEMENT (Serviço Executa sem Bypass do Cliente)         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 10. POSTGRESQL RLS (ENABLE + FORCE RLS + USING / WITH CHECK)           │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                       DADO EFETIVAMENTE ENTREGUE                       │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CATÁLOGO OFICIAL DE MÓDULOS DA PLATAFORMA (16 MÓDULOS)

| Identificador Técnico (Key) | Nome Oficial | Categoria | Status | Dependências Técnicas | Faturável? |
|---|---|---|:---:|---|:---:|
| `core_clients` | Gestão de Clientes & CRM | Core | `ACTIVE` | Nenhuma | Sim |
| `core_cases` | Casos & Processos Jurídicos | Core | `ACTIVE` | `core_clients` | Sim |
| `legal_contracts` | Contratos & Assinaturas Digitais | Legal | `ACTIVE` | `core_cases` | Sim |
| `legal_invoices` | Faturamento, Honorários & Split | Finance | `ACTIVE` | `core_cases` | Sim |
| `legal_agenda` | Agenda Jurídica & Prazos | Productivity | `ACTIVE` | `core_cases` | Sim |
| `ai_copilot` | IA Jurídica & Gemini RAG | Intelligence | `ACTIVE` | `core_cases` | Sim (Add-on) |
| `bi_analytics` | Relatórios & BI Analytics | Intelligence | `ACTIVE` | `core_cases`, `legal_invoices` | Sim |
| `messaging_waba` | Notificações WhatsApp Business | Integration | `ACTIVE` | `core_clients` | Sim (Add-on) |
| `staff_provisioning` | Serviços Jurídicos & Diligências | Operations | `ACTIVE` | `core_cases` | Sim |
| `intern_portal` | Portal do Estagiário & Supervisão | Education | `ACTIVE` | `core_cases` | Não |
| `secretary_portal`| Portal da Secretária & Atendimento | Operations | `ACTIVE` | `core_clients`, `legal_agenda` | Não |
| `client_portal` | Portal do Cliente / Acompanhamento | Client-Facing | `ACTIVE` | `core_cases` | Não |
| `marketplace` | Marketplace de Correspondentes | Marketplace | `BETA` | `core_cases`, `legal_invoices` | Sim |
| `audit_compliance`| Auditoria, GRC & Trilha LGPD | Governance | `ACTIVE` | Nenhuma | Sim (Enterprise) |
| `super_admin` | Governança da Plataforma Global | System | `ACTIVE` | Nenhuma | Não (Internal) |
| `settings_config` | Configurações do Escritório & Tenant| System | `ACTIVE` | Nenhuma | Não |

---

## 3. MATRIZ DE ENTITLEMENTS POR PLANO DE ASSINATURA

| Módulo | Plano Starter | Plano Profissional (Pro) | Plano Enterprise / Corporate |
|---|:---:|:---:|:---:|
| `core_clients` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `core_cases` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `legal_contracts` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `legal_invoices` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `legal_agenda` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `client_portal` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `settings_config` | ✅ Incluso | ✅ Incluso | ✅ Incluso |
| `ai_copilot` | ❌ Bloqueado | ✅ Incluso | ✅ Incluso |
| `messaging_waba` | ❌ Bloqueado | ✅ Incluso | ✅ Incluso |
| `bi_analytics` | ❌ Bloqueado | ✅ Incluso | ✅ Incluso |
| `secretary_portal`| ❌ Bloqueado | ✅ Incluso | ✅ Incluso |
| `intern_portal` | ❌ Bloqueado | ✅ Incluso | ✅ Incluso |
| `marketplace` | ❌ Bloqueado | ✅ Incluso (Beta) | ✅ Incluso (Beta) |
| `staff_provisioning`| ❌ Bloqueado | ❌ Bloqueado | ✅ Incluso |
| `audit_compliance`| ❌ Bloqueado | ❌ Bloqueado | ✅ Incluso |

---

## 4. CONCESSÕES MANUAIS DE ENTITLEMENT & AUDITORIA

A arquitetura permite que administradores autorizados concedam módulos por exceção (`source: MANUAL_OVERRIDE` ou `PROMO`):
- Toda concessão exige: `actorId`, `targetTenantId`, `moduleKey`, `reason` e opcionalmente `expiresAt`.
- Concessões expiradas (`expiresAt < Date.now()`) resultam em bloqueio automático imediato no backend.
- Eventos de auditoria gerados: `ENTITLEMENT_GRANTED`, `ENTITLEMENT_REVOKED`, `MODULE_ENABLED`, `MODULE_DISABLED`.

---

## 5. REGRAS DE DESATIVAÇÃO E PRESERVAÇÃO DE DADOS HISTÓRICOS

> **"DESATIVAÇÃO $\neq$ EXCLUSÃO."**

Ao desativar um módulo para um tenant:
1. **Bloqueio de Novas Operações**: Novas inserções e edições são rejeitadas pelo backend.
2. **Preservação de Dados**: Tabelas e registros históricos existentes (`contracts`, `cases`, `invoices`, `staff_audit_logs`) são 100% preservados no banco de dados.
3. **Reativação Transparente**: Se o módulo for reativado posteriormente, o acesso é restaurado integralmente sem necessidade de migração ou intervenção manual.

---

## 6. RASTREABILIDADE E EVIDÊNCIAS DE TESTES

- **Catálogo Central Imutável**: [`security/catalog.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/catalog.ts)
- **Motor de Entitlements & Resolução**: [`security/entitlementManager.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/entitlementManager.ts)
- **Logger de Auditoria Atualizado**: [`security/auditLogger.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/security/auditLogger.ts)
- **Enforcement em IA**: [`services/geminiService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/geminiService.ts)
- **Enforcement em Relatórios / BI**: [`services/biExporterService.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/services/biExporterService.ts)
- **Suíte de Testes Automatizados**: [`tests/unit/moduleCatalog.test.ts`](file:///Users/rikardoribeiro/Documents/GitHub/Legis/tests/unit/moduleCatalog.test.ts)
