#!/usr/bin/env bash
# ============================================================================
# Legis Connect — Script de Execução de Migrações de Banco de Dados
# ============================================================================
# Uso: bash infrastructure/db/run_migrations.sh
#
# Pré-requisitos:
#   - Supabase CLI instalado: npm install -g supabase
#   - Autenticado: supabase login
#   - Projeto linkado: supabase link --project-ref tddzffccnuccewfoczjl
#
# Ou via psql direto:
#   SUPABASE_DB_URL="$DATABASE_URL"
# ============================================================================

set -euo pipefail

# ─── Configuração ────────────────────────────────────────────────────────────
MIGRATIONS_DIR="$(dirname "$0")/migrations"
PROJECT_REF="tddzffccnuccewfoczjl"
LOG_FILE="/tmp/legis_migration_$(date +%Y%m%d_%H%M%S).log"

# ─── Arquivos RLS pós-migração (Execução Compulsória) ────────────────────────
RLS_POST_MIGRATION_FILES=(
  "infrastructure/db/scripts/apply_production_rls.sql"
  "infrastructure/db/scripts/update_rls_rbac_v2.sql"
)

# Ordem de execução das migrações (dependências primeiro)
MIGRATION_FILES=(
  "sprint8_master_migration.sql"
  "sprint11_beta_tables.sql"
)

# ─── Cores ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Legis Connect — Database Migration & RLS Security Runner${NC}"
echo -e "${BLUE}  Project: ${PROJECT_REF}${NC}"
echo -e "${BLUE}  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# ─── Verificar pré-requisitos ────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Verificando pré-requisitos...${NC}"

if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}⚠️  Supabase CLI não encontrado. Tentando via npx...${NC}"
  SUPABASE_CMD="npx supabase"
else
  SUPABASE_CMD="supabase"
  echo -e "${GREEN}✅ Supabase CLI encontrado: $(supabase --version)${NC}"
fi

# ─── Verificar arquivos de migração e RLS ─────────────────────────────────────
echo -e "${YELLOW}[2/5] Verificando arquivos de migração e scripts RLS...${NC}"

for file in "${MIGRATION_FILES[@]}"; do
  filepath="${MIGRATIONS_DIR}/${file}"
  if [ -f "$filepath" ]; then
    size=$(du -sh "$filepath" | cut -f1)
    echo -e "  ${GREEN}✅ Migração:${NC} $file (${size})"
  else
    echo -e "  ${RED}❌ ARQUIVO NÃO ENCONTRADO: $filepath${NC}"
    exit 1
  fi
done

for rls_file in "${RLS_POST_MIGRATION_FILES[@]}"; do
  if [ -f "$rls_file" ]; then
    size=$(du -sh "$rls_file" | cut -f1)
    echo -e "  ${GREEN}✅ RLS Script:${NC} $rls_file (${size})"
  else
    echo -e "  ${RED}❌ SCRIPT RLS OBRIGATÓRIO NÃO ENCONTRADO: $rls_file${NC}"
    exit 1
  fi
done

echo ""

# ─── Confirmar execução ──────────────────────────────────────────────────────
echo -e "${YELLOW}[3/5] Executando migrações de schema...${NC}"
echo -e "${RED}⚠️  ATENÇÃO: Esta operação modifica o banco de dados de PRODUÇÃO.${NC}"
echo ""

if [ "${CI:-false}" != "true" ]; then
  read -rp "Confirma execução? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operação cancelada pelo usuário.${NC}"
    exit 0
  fi
fi

# ─── Executar migrações ───────────────────────────────────────────────────────
success_count=0
fail_count=0

for file in "${MIGRATION_FILES[@]}"; do
  filepath="${MIGRATIONS_DIR}/${file}"
  echo ""
  echo -e "  ${BLUE}▶ Executando Migração: ${file}${NC}"

  if $SUPABASE_CMD db execute --project-ref "$PROJECT_REF" --file "$filepath" >> "$LOG_FILE" 2>&1; then
    echo -e "  ${GREEN}✅ $file — Sucesso${NC}"
    ((success_count++))
  else
    echo -e "  ${RED}❌ $file — Falha! Verifique o log: $LOG_FILE${NC}"
    ((fail_count++))
  fi
done

# ─── Execução Compulsória de RLS pós-migração ─────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Aplicando Políticas de Row-Level Security (RLS) Compulsoriamente...${NC}"

for rls_file in "${RLS_POST_MIGRATION_FILES[@]}"; do
  echo ""
  echo -e "  ${BLUE}▶ Aplicando RLS Hardening: ${rls_file}${NC}"

  if $SUPABASE_CMD db execute --project-ref "$PROJECT_REF" --file "$rls_file" >> "$LOG_FILE" 2>&1; then
    echo -e "  ${GREEN}✅ $rls_file — RLS Aplicado com Sucesso${NC}"
    ((success_count++))
  else
    echo -e "  ${RED}❌ FALHA CRÍTICA DE RLS em $rls_file! Abortando por segurança.${NC}"
    ((fail_count++))
    exit 1
  fi
done

# ─── Validação de Integridade RLS nas Tabelas ─────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5] Auditando status de Row-Level Security (rowsecurity) nas tabelas públicas...${NC}"

RLS_AUDIT_SQL="
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo -e "  ${BLUE}Tabelas e Status de RLS no PostgreSQL:${NC}"
$SUPABASE_CMD db execute --project-ref "$PROJECT_REF" --sql "$RLS_AUDIT_SQL" 2>/dev/null || true

# ─── Sumário ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  SUMÁRIO DA MIGRAÇÃO & RLS HARDENING${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "  Total de arquivos executados: $((${#MIGRATION_FILES[@]} + ${#RLS_POST_MIGRATION_FILES[@]}))"
echo -e "  ${GREEN}Sucessos: ${success_count}${NC}"
if [ $fail_count -gt 0 ]; then
  echo -e "  ${RED}Falhas:   ${fail_count}${NC}"
  echo -e "  Log completo: ${LOG_FILE}"
  exit 1
else
  echo -e "  Falhas:   0"
  echo -e "${GREEN}✅ Migração concluída e 100% das políticas RLS foram reaplicadas com sucesso!${NC}"
  echo -e "${GREEN}   Log de auditoria: ${LOG_FILE}${NC}"
fi

