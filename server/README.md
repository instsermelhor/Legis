# Legis Connect — API (Express + PostgreSQL)

Backend real, sem mocks. PostgreSQL local (`localhost:5432`, user `postgres`,
senha `postgres`), database `legis`.

## Subir

```bash
npm run db:setup   # cria o database, aplica server/schema.sql e o bootstrap
npm run server     # API em http://localhost:4000 (tsx watch)
npm run dev        # frontend em http://localhost:5173 (proxy /api e /uploads)
```

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `schema.sql` | DDL — entidades dos diagramas (pessoa, processo, financeiro, fconta, documento, chat, mensagem, evento_agenda, contrato, servico, sessao, recuperacao_senha) |
| `db.ts` | pool `pg`, helper `q()` e `transacao()` |
| `senha.ts` | hash scrypt (node:crypto) |
| `auth.ts` | registro, login, sessão Bearer, recuperação de senha |
| `rotas/pessoas.ts` | advogados (vitrine), bachareis, secretários, admin |
| `rotas/processos.ts` | processos com escopo por papel |
| `rotas/financeiro.ts` | financeiro + fcontas + resumo agregado (SQL) |
| `rotas/documentos.ts` | upload real (base64 → `server/uploads`), tipos |
| `rotas/chats.ts` | chat 1-a-1 + mensagens |
| `rotas/agenda.ts` | eventos do calendário |
| `rotas/contratos.ts` | catálogo de serviços + contratos |
| `setup.ts` | cria DB, aplica schema, bootstrap idempotente |

## Bootstrap (dados mínimos, não mocks)

- Admin: `admin@legisconnect.com.br` / `[senha-removida]`
- Tipos de processo, tipos de documento (CNH, RG, ... com `campos` para o
  auto-preenchimento) e o catálogo público de serviços.

Contas de desenvolvimento criadas via API (senha `teste`):
`carlos.andrade@legisconnect.com` (advogado verificado),
`ana.rodrigues@email.com` (cliente),
`henrique.alves@uni.edu.br` (bacharel, supervisor: Carlos),
`clara.souza@legisconnect.com` (secretária, vinculada a Carlos).

## Classificação de documentos via IA

Fluxo externo (não implementado aqui, por decisão do produto). O ponto de
integração é `PUT /api/documentos/:id` com `{ tipo_id, descricao, campos }`.

## Recuperação de senha

Sem SMTP configurado, `POST /api/auth/recuperar` retorna o código (a UI o
exibe como "e-mail simulado"). O código é real: persistido em
`recuperacao_senha`, uso único, expira em 30 minutos.
`POST /api/auth/redefinir` valida e troca a senha.
