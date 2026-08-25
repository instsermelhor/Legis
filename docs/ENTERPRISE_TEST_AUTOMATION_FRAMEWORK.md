# Legis Connect — Framework Enterprise de Testes Automatizados
## Documento Normativo de Arquitetura de Qualidade, Segurança & CI/CD

---

## 1. Visão Geral & Princípios Fundamentais

A **Legis Connect** adota uma estratégia de garantia contínua de qualidade de nível Enterprise. Nenhum código é integrado ou disponibilizado em produção sem a aprovação unânime de todos os **Quality Gates automatizados**.

### 1.1 A Cadeia Contínua de Qualidade
```text
ALTERAÇÃO DE CÓDIGO
       ↓
     LINT (0 Warnings)
       ↓
  TYPE CHECK (tsc 0 erros)
       ↓
  SECRET SCAN (0 credenciais)
       ↓
  UNIT TESTS (Suítes 01 a 11, 20, 21)
       ↓
  INTEGRATION & API TESTS (Suítes 12 a 14, 19)
       ↓
  SECURITY & MULTI-TENANCY TESTS (Suítes 02, 03, 11, 15, 16, 17, 18)
       ↓
  E2E JOURNEYS (Suíte 22 - 10 Jornadas)
       ↓
  PRODUCTION BUILD (Vite Compilation)
       ↓
  DEPLOY GATE (Aprovação Estrita)
```

---

## 2. A Pirâmide de Testes da Legis Connect

```
                    ┌─────────────────────────┐
                    │      E2E JOURNEYS       │  (10 Jornadas Críticas)
                    │        (Suíte 22)       │
                    ├─────────────────────────┤
                    │    INTEGRATION & API    │  (LGPD, Supabase Sync,
                    │  (Suítes 12, 13, 14, 19)│   UML, API & Contratos)
                    ├─────────────────────────┤
                    │    SECURITY & RLS       │  (Pentest OWASP, RBAC Matrix,
                    │ (Suítes 02, 03, 11, 15, │   Tenant Isolation, IDOR,
                    │      16, 17, 18, 20)    │   Idempotência, Secrets)
                    ├─────────────────────────┤
                    │       UNIT TESTS        │  (Auth/PBKDF2, Escrow, BI,
                    │  (Suítes 01, 04, 05,    │   IA Gemini, Multi-Agent,
                    │    06, 07, 08, 09, 21)  │   Infra, UI, WCAG A11y)
                    └─────────────────────────┘
```

---

## 3. Inventário das 22 Suítes de Testes Automatizados

| # | Nome da Suíte | Categoria | Escopo & Objetivos de Cobertura |
| :-: | :--- | :---: | :--- |
| **01** | `Authentication & PBKDF2 Hashing` | `UNIT` | Hashing com salt criptográfico, rate limit e lockout de tentativas. |
| **02** | `PRD Master Compliance Contract` | `SECURITY` | Contrato normativo de requisitos funcionais e não-funcionais. |
| **03** | `Security Pentest (OWASP Top 10)` | `SECURITY` | XSS, injeção SQL, broken access control, headers e CSRF. |
| **04** | `Escrow Custody & Fee Split` | `UNIT` | Split de honorários advocatícios, custódia e taxa de plataforma. |
| **05** | `BI Exporter Engine` | `UNIT` | Exportação de dados tabulares em PDF, Excel (XLSX) e CSV. |
| **06** | `Performance & Infrastructure Limits` | `UNIT` | Benchmarks de latência, SLAs e limites de processamento. |
| **07** | `Visual UI Conformance` | `UNIT` | Conformidade de layouts, temas claro/escuro e microinterações. |
| **08** | `Legis Multi-Agent Engine` | `UNIT` | Orquestração de agentes autônomos e resolução de tarefas jurídicas. |
| **09** | `Gemini AI Integration & Throttling` | `UNIT` | Proxy de IA, controle de cotas, throttling e resiliência fallback. |
| **10** | `UX Journeys Simulation` | `UNIT` | Simulação funcional de fluxos de navegação e telas de usuário. |
| **11** | `RBAC Conformance & Matrix` | `SECURITY` | Matriz com 12 roles × 22 recursos × 29 ações (117 cenários). |
| **12** | `LGPD & RBAC End-to-End Flow` | `INTEGRATION` | Minimização de dados, mascaramento de CPF e consentimento. |
| **13** | `Supabase Cloud Sync Engine` | `INTEGRATION` | Sincronização e persistência dual-mode (LocalStorage + Cloud). |
| **14** | `UML Sequence Architecture` | `INTEGRATION` | Validação formal dos diagramas de sequência arquiteturais. |
| **15** | `PostgreSQL RLS Database Security` | `MULTITENANCY` | Enforcement de `ROW LEVEL SECURITY` no banco de dados. |
| **16** | `Tenant Isolation & IDOR Defense` | `MULTITENANCY` | Prevenção de acesso cross-tenant e adulteração de IDs em mutations. |
| **17** | `Module Catalog & Entitlements Engine`| `SECURITY` | Resolução hierárquica de módulos por plano e dependências. |
| **18** | `Error Reporting & Incident Management`| `SECURITY` | Captura fail-safe, deduplicação por fingerprint e triagem admin. |
| **19** | `API Contracts & Endpoints Integrity`| `INTEGRATION` | Contratos HTTP, status codes (200, 201, 400, 405, 413, 500) e health check. |
| **20** | `Concurrency, Idempotency & Race Cond`| `UNIT` | Mitigação de double-submit, chaves de idempotência e race conditions. |
| **21** | `WCAG 2.1 AA Accessibility & Semantics`| `UNIT` | Cálculo de contraste de cores, semântica ARIA e foco por teclado. |
| **22** | `10 Critical User Journeys Engine` | `E2E` | Simulação completa das 10 jornadas de ponta a ponta. |

---

## 4. As 10 Jornadas Críticas de Ponta a Ponta (E2E)

1. **Jornada 1 — Visitante & Busca:** Acesso à landing page → busca por especialidade jurídica → visualização de perfil de advogado → solicitação de atendimento.
2. **Jornada 2 — Cadastro & Onboarding:** Cadastro de novo usuário → hashing PBKDF2 → aceite dos Termos de Uso/MFA → redirecionamento ao dashboard específico.
3. **Jornada 3 — Advogado Operacional:** Login → painel do advogado → abertura de caso/processo → redação e upload de peças processuais.
4. **Jornada 4 — Escritório & Delegação:** Gestão de membros do escritório → atribuição de papéis RBAC → trilha de auditoria imutável.
5. **Jornada 5 — Secretária Jurídica:** Gestão de agenda de audiências e clientes → bloqueio estrito de acesso a relatórios financeiros e exclusão de casos.
6. **Jornada 6 — Assistente Jurídico:** Pesquisa jurisprudencial e redação de minutas → isolamento de escopo sem privilégios de administração.
7. **Jornada 7 — Estagiário de Direito:** Registro diário de horas e atividades de estágio → envio de relatório para aprovação do orientador.
8. **Jornada 8 — Cliente & Isolamento:** Acesso a processos e documentos próprios → tentativa forçada de consultar dados de outros clientes → bloqueio com erro de autorização.
9. **Jornada 9 — Administrador do Tenant:** Gestão de configurações do escritório → controle de acessos de equipe → visualização de relatórios operacionais.
10. **Jornada 10 — Super Administrador:** Painel de governança global → gestão de tenants da plataforma → concessão de planos e módulos → auditoria global.

---

## 5. Comandos Operacionais & Execução

A esteira de testes é acionada através do `package.json`:

```bash
# Executa todas as 22 suítes automatizadas
npm test

# Executa apenas as suítes unitárias
npm run test:unit

# Executa apenas as suítes de integração
npm run test:integration

# Executa apenas as suítes de segurança e multitenancy
npm run test:security

# Executa apenas as suítes de jornadas E2E
npm run test:e2e

# Executa apenas as suítes de RLS e Multi-Tenancy
npm run test:multitenancy

# Executa o Quality Gate completo (Lint + TypeCheck + Secrets + Testes + Build)
npm run quality-gate
```

---

## 6. Política de Flaky Tests & Isolamento

- **Isolamento Total:** Todo teste deve ser autônomo e independente de execuções anteriores, utilizando o método `resetForTesting()`.
- **Zero Secrets em Código:** Proibido utilizar credenciais reais ou expor senhas em código de teste. Mocks devem ser montados dinamicamente para evitar falsos-positivos de scanners.
- **Proibição de Bypass de Testes:** É expressamente proibido comentar assertions ou adicionar skips permanentes para forçar pipelines verdes.
