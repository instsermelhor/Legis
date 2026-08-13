# LEGIS CONNECT — MULTI-TENANCY & DATA ISOLATION ARCHITECTURE
**Documentação Oficial da Arquitetura de Isolamento de Dados v1.0**

---

## 1. Visão Geral e Princípios Fundamentais

A plataforma Legis Connect opera sob o **Princípio da Segregação Absoluta de Tenancy e Menor Privilégio**.
Nenhum usuário de um Tenant (escritório, empresa, instituição ou autônomo) poderá visualizar, consultar, alterar, excluir ou exportar dados de outro Tenant sem autorização explícita e auditada.

---

## 2. Hierarquia de Tenancy

```
Platform (Legis Connect)
  └── Tenant (Escritório / Organização / Autônomo)
       ├── Tenant Membership (User <-> Tenant)
       ├── Lawyers (Advogados)
       ├── Clients (Clientes)
       ├── Cases (Processos)
       ├── Documents (Documentos)
       ├── Appointments (Agenda)
       └── Financial & Invoices (Financeiro)
```

---

## 3. Modelo de Tenancy

- **Modelo**: Shared Database / Shared Schema com **Row-Level Security (RLS)** e Guardias de Aplicação.
- **Tenant ID**: Identificador único UUID (`tenant_id` / `tenantId`) presente em todas as tabelas e modelos de dados.
- **Resolução de Contexto**: O `tenantId` é resolvido de forma imutável após a autenticação através do serviço `TenantService` e token de sessão. Solicitações arbitrárias de `tenantId` vindas do frontend sem pertencimento comprovado são categoricamente rejeitadas.

---

## 4. Defesa em Profundidade (Layers de Segurança)

1. **Camada de Banco de Dados (PostgreSQL RLS)**
   - Políticas RLS ativas em `cases`, `users`, `lawyer_profiles`, `intern_profiles`, `secretary_profiles`, `service_provisionings`.
   - Restrição de `UPDATE` e `DELETE` em `staff_audit_logs`.

2. **Camada de Serviços e Guardias (`security/tenantGuard.ts` e `services/tenantService.ts`)**
   - `TenantService.assertTenantAccess()`: Valida pertencimento antes de qualquer mutação.
   - `TenantGuard.enforce()`: Bloqueia ataques do tipo IDOR.

3. **Camada de Aplicação e Interface (`context/AuthContext.tsx` e `context/AppDataContext.tsx`)**
   - `currentTenantId` propagado centralmente no `AuthContext`.
   - Scoping automático de listas no `AppDataContext`.
   - Mascaramento automático de CPF para proteção LGPD.

---

## 5. Matriz de Conformidade de Isolamento

| Recurso | Tenant Solicitante | Tenant do Recurso | Ação | Resultado Esperado |
|---------|--------------------|-------------------|------|--------------------|
| Processo | Tenant A | Tenant A | READ/WRITE | ✅ PERMITIDO |
| Processo | Tenant A | Tenant B | READ/WRITE | 🚫 BLOQUEADO (403 Forbidden) |
| Processo | Platform Super Admin | Qualquer Tenant | READ/WRITE | ✅ AUDITADO |
| Cliente PII | Tenant A | Tenant B | READ | 🚫 BLOQUEADO |
| Documento | Tenant A | Tenant B | DOWNLOAD | 🚫 BLOQUEADO |

---

## 6. Procedimento de Teste de Regressão

Para executar a suíte automatizada de validação de isolamento multi-tenant:
```bash
npx vitest run tests/multitenancy/tenant-isolation.test.ts
```
