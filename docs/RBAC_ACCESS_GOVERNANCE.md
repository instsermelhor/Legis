# LEGIS CONNECT — ROLE-BASED ACCESS CONTROL (RBAC) & ACCESS GOVERNANCE

**Versão Normativa Oficial:** 2.0  
**Data de Aprovação:** 11 de Agosto de 2026  
**Status:** VIGENTE E NORMATIVO  
**Princípio Basilar:** *DENY BY DEFAULT — Nenhum usuário acessa, visualiza, altera ou executa qualquer função sem autorização explícita de sua Role, Escopo e Contexto.*

---

## 1. OBJETIVO E PRINCÍPIOS DE SEGURANÇA

### 1.1 Objetivo
Este documento estabelece a política oficial e arquitetura técnica de **Controle de Acesso Baseado em Funções (RBAC)** e **Governança de Acessos** da plataforma **Legis Connect**. Serve como fonte primária para frontend, backend, banco de dados (RLS) e suítes de auditoria/testes.

### 1.2 Princípios Fundamentais
1. **DENY BY DEFAULT**: Se uma ação/recurso não for expressamente concedida a uma função, ela é estritamente negada.
2. **Menor Privilégio**: Cada usuário possui apenas o acesso mínimo estritamente necessário para desempenhar sua função.
3. **Backend como Autoridade Final**: A validação de autorização DEVE ser realizada no backend/servidor (serviços e PostgreSQL RLS). A interface gráfica apenas reflete permissões já concedidas.
4. **Segregação Absoluta de Dados**: Isolamento rigoroso entre Clientes, Advogados, Estagiários, Secretárias e Staff Administrativo.
5. **Prevenção contra IDOR**: Nenhum recurso (caso, documento, cliente, transação) pode ser acessado apenas alterando parâmetros ou IDs via URL/payload.
6. **Segregation of Duties (SoD)**: Prevenção de conflito de interesses (ex.: criar e liberar pagamentos em escrow).

---

## 2. HIERARQUIA DE ROLES E NÍVEIS DE AUTORIDADE

A plataforma opera sob 9 roles estruturadas hierarquicamente com níveis numéricos de autoridade (1 a 9):

```text
┌─────────────────────────────────────────────────────────────────┐
│                      SUPER USUÁRIO / SUPER ADMIN (Level 9)      │
│                      👑 Governança Absoluta & Impersonação       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
┌───────────────────────────┐               ┌───────────────────────────┐
│     ADMINISTRADOR (7)     │               │   STAFF ESPECIALIZADO     │
│   🛡️ Gestão Operacional   │               │ 💰 Finance Admin (5)      │
└────────────┬──────────────┘               │ 🔍 Compliance Auditor (5) │
             │                              │ 🎧 Support L1 (4)         │
             │                              └───────────────────────────┘
     ┌───────┴──────────────────────┬──────────────────────┐
     ▼                              ▼                      ▼
┌───────────────┐           ┌───────────────┐      ┌───────────────┐
│ ADVOGADO (3)  │           │ CLIENTE (1)   │      │ BACHARELANDO  │
│ ⚖️ Escritório │           │ 👤 Titular    │      │ 🎓 Estudante  │
└───────┬───────┘           └───────────────┘      └───────────────┘
        │
  ┌─────┴────────────────┐
  ▼                      ▼
┌────────────────┐ ┌────────────────┐
│ SECRETÁRIA (2) │ │ ESTAGIÁRIO (2) │
│ 📋 Assistente  │ │ 🎓 Atribuído   │
└────────────────┘ └────────────────┘
```

### 2.1 Tabela de Níveis e Escopos Padrão

| SystemRole | Nível | Escopo Padrão | Descrição Resumida |
| :--- | :---: | :--- | :--- |
| `super_admin` | 9 | `global` | Autoridade máxima de governança, criação de admins e impersonação. |
| `admin` | 7 | `global` | Gestão operacional delegada de usuários, advogados e serviços. |
| `staff_finance_admin` | 5 | `global` | Gestão financeira, estornos, liberações de escrow e faturamento. |
| `staff_compliance_auditor` | 5 | `global` | Auditoria de logs, verificações OAB, reclamações e compliance. |
| `staff_support_l1` | 4 | `global` | Suporte operacional Nível 1 (leitura básica e diagnóstico). |
| `lawyer` | 3 | `office` | Gestão jurídica do seu escritório, clientes e casos vinculados. |
| `secretary` | 2 | `assigned` | Assistência operacional delegada pelo advogado (agenda, docs). |
| `intern` | 2 | `assigned` | Apoio acadêmico/estágio em casos e tarefas atribuídas. |
| `client` | 1 | `own` | Titular dos dados: visualização de seus casos, docs e finanças. |

---

## 3. ESCOPOS DE ACESSO (PERÍMETROS DE DADOS)

Não basta definir *o que* o usuário pode fazer; é obrigatório definir *sobre quais dados*:

1. **`own`**: Somente os recursos pertencentes diretamente ao próprio usuário (`owner_id = user.id`).
2. **`assigned`**: Recursos atribuídos explicitamente ao usuário (`assigned_to = user.id`).
3. **`team`**: Recursos da equipe imediata do usuário.
4. **`office`**: Recursos pertencentes à mesma organização/escritório (`office_id = user.office_id`).
5. **`global`**: Recursos de toda a plataforma Legis Connect.

---

## 4. PERMISSÕES GRANULARES E MATRIZ RBAC

As permissões utilizam o padrão `<recurso>:<ação>`.

### 4.1 Recursos Padronizados
`users`, `roles`, `clients`, `lawyers`, `cases`, `documents`, `agenda`, `financial`, `escrow`, `provisioning`, `services`, `staff`, `registrations`, `audit`, `ai`, `system`.

### 4.2 Ações Padronizadas
`CREATE`, `READ`, `UPDATE`, `DELETE`, `LIST`, `SEARCH`, `EXPORT`, `IMPORT`, `APPROVE`, `REJECT`, `ASSIGN`, `UNASSIGN`, `DELEGATE`, `REVOKE`, `CONFIGURE`, `MANAGE`, `AUDIT`, `CHARGEBACK`, `RELEASE`, `DISPUTE`, `IMPERSONATE`.

---

## 5. SEGREGATION OF DUTIES (SoD) & REGRAS DE DELEGAÇÃO

### 5.1 Matriz de SoD (Conflitos Proibidos)
As seguintes combinações de permissões NÃO podem coexistir em nenhuma role (exceto `super_admin` por isenção normativo-operacional):
- `financial:approve` + `financial:chargeback` (Aprovação e estorno financeiro)
- `escrow:create` + `escrow:release` (Abertura e liberação de valores sob custódia)
- `users:create` + `roles:manage` (Criação de usuários e elevação arbitrária de permissões)
- `audit:write` + `audit:delete` (Registro e deleção de auditoria)

### 5.2 Regras de Delegação e Elevação
- **Hierarquia Inviolável**: NENHUM usuário pode conceder a outro usuário privilégios superiores ou iguais aos seus (`grantor.level > grantee.level`).
- **Escopo Restrito**: O concedente só pode delegar permissões que ele próprio possui ativamente.
- **Revogação Imediata**: Toda revogação de role/permissão invalida imediatamente a sessão ativa do usuário impactado.

---

## 6. PROTEÇÃO CONTRA IDOR E ISOLAMENTO MULTI-TENANT

Toda consulta e mutação de dados DEVE passar pelas regras RLS do PostgreSQL (`update_rls_rbac_v2.sql`):
1. **Profiles**: `id = auth.uid()` ou `legis_is_staff()`
2. **Cases**: `client_id = auth.uid()` OR `office_id = legis_get_user_office_id()` OR `assigned_to = auth.uid()`
3. **Documents**: `owner_id = auth.uid()` OR `auth.uid() = ANY(shared_with)` OR `office_id = legis_get_user_office_id()`
4. **Financial**: `client_id = auth.uid()` OR `lawyer_id = auth.uid()` OR `role IN ('super_admin', 'admin', 'staff_finance_admin')`

---

## 7. MONITORAMENTO E AUDITORIA

Todas as operações sensíveis (elevação de privilégio, impersonação, criação/deletar usuários, exportação de dados LGPD) são registradas em log de auditoria append-only com os campos:
`id`, `timestamp`, `actor_id`, `actor_role`, `action`, `resource`, `resource_id`, `status`, `ip_address`, `details`.
