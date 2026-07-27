# ADR-034: Sprint 1 Core Platform — Identity as a Service, Multi-Tenancy & Authorization Engine
# Status: APROVADO | Data: 27/07/2026 | Decisores: Chief Enterprise Architect, Chief Security Officer, Identity Platform Architect, Backend Engineering Lead

## Contexto
A Sprint 1 representa o desenvolvimento dos primeiros módulos funcionais da Legis Connect (Prompt 248). Para garantir que todos os futuros módulos da plataforma (jurídico, financeiro, IA, marketplace) operem com isolamento de dados seguro e controle de acesso rigoroso, é necessário implantar o núcleo de Identidade e Multi-Tenancy como um serviço desacoplado de classe mundial.

## Decisões Técnicas

### 1. Modelo de Isolamento Multi-Tenant por Row-Level Security (RLS)
- Implementar a coluna `tenant_id` em 100% das tabelas relacionais do Aurora PostgreSQL, impondo o contexto do Tenant no nível de aplicação e ORM (Prisma middleware).
- Criptografia individualizada de dados em repouso por Tenant usando chaves rotacionadas no Vault.

### 2. Autenticação Baseada em OIDC Keycloak 25.0 HA
- Adotar o Keycloak 25.0 HA como provedor OIDC/OAuth2 primário, suportando autenticação sem senha (WebAuthn/Passkeys), MFA via TOTP Authenticator App e integração com a identidade descentralizada W3C DID (ADR-020).

### 3. Motor Híbrido de Autorização RBAC / ABAC
- Implementar controle de acesso baseado em papéis (RBAC) combinado com atributos em tempo de execução (ABAC) para validar escopos, horário de acesso e nível de folga de segurança do usuário.

### 4. Emissão da Autorização para Início da Sprint 2
- Certificar a conclusão da Sprint 1 com 92.4% de cobertura de testes e emitir a ordem executiva **AUTH-SPRINT2-2026-001** autorizando o desenvolvimento dos módulos de cadastro de advogados, clientes e perfil profissional.

## Consequências
- Positivas: Segurança Zero Trust nativa em todas as APIs; isolamento estrito entre clientes B2B/B2C; auditoria completa registrada em blockchain Besu.
- Diretriz: Nenhuma API futura pode ser exposta sem a validação do middleware de Tenant e autorizador RBAC/ABAC.
