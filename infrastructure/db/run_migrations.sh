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
#   SUPABASE_DB_URL="postgresql://postgres:[SENHA]@db.tddzffccnuccewfoczjl.supabase.co:5432/postgres"
# ============================================================================

set -euo pipefail

# ─── Configuração ────────────────────────────────────────────────────────────
MIGRATIONS_DIR="$(dirname "$0")/migrations"
PROJECT_REF="tddzffccnuccewfoczjl"
LOG_FILE="/tmp/legis_migration_$(date +%Y%m%d_%H%M%S).log"

# Ordem de execução (dependências primeiro)
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
echo -e "${BLUE}  Legis Connect — Database Migration Runner${NC}"
echo -e "${BLUE}  Project: ${PROJECT_REF}${NC}"
echo -e "${BLUE}  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# ─── Verificar pré-requisitos ────────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Verificando pré-requisitos...${NC}"

if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}⚠️  Supabase CLI não encontrado. Tentando via npx...${NC}"
  SUPABASE_CMD="npx supabase"
else
  SUPABASE_CMD="supabase"
  echo -e "${GREEN}✅ Supabase CLI encontrado: $(supabase --version)${NC}"
fi

# ─── Verificar arquivos de migração ──────────────────────────────────────────
echo -e "${YELLOW}[2/4] Verificando arquivos de migração...${NC}"

for file in "${MIGRATION_FILES[@]}"; do
  filepath="${MIGRATIONS_DIR}/${file}"
  if [ -f "$filepath" ]; then
    size=$(du -sh "$filepath" | cut -f1)
    echo -e "  ${GREEN}✅${NC} $file (${size})"
  else
    echo -e "  ${RED}❌ ARQUIVO NÃO ENCONTRADO: $filepath${NC}"
    exit 1
  fi
done

echo ""

# ─── Confirmar execução ──────────────────────────────────────────────────────
echo -e "${YELLOW}[3/4] Executando migrações...${NC}"
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
  echo -e "  ${BLUE}▶ Executando: ${file}${NC}"

  if $SUPABASE_CMD db execute --project-ref "$PROJECT_REF" --file "$filepath" >> "$LOG_FILE" 2>&1; then
    echo -e "  ${GREEN}✅ $file — Sucesso${NC}"
    ((success_count++))
  else
    echo -e "  ${RED}❌ $file — Falha! Verifique o log: $LOG_FILE${NC}"
    ((fail_count++))
    # Não para na falha — tenta executar as demais e reporta no final
  fi
done

# ─── Sumário ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  SUMÁRIO DA MIGRAÇÃO${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "  Total de migrações: ${#MIGRATION_FILES[@]}"
echo -e "  ${GREEN}Sucessos: ${success_count}${NC}"
if [ $fail_count -gt 0 ]; then
  echo -e "  ${RED}Falhas:   ${fail_count}${NC}"
  echo -e "  Log completo: ${LOG_FILE}"
else
  echo -e "  Falhas:   0"
fi

echo ""
echo -e "${YELLOW}[4/4] Verificando tabelas criadas...${NC}"

# Lista as tabelas criadas para confirmar
$SUPABASE_CMD db execute --project-ref "$PROJECT_REF" \
  --sql "SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" \
  2>/dev/null | head -40 || true

echo ""
if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✅ Todas as migrações executadas com sucesso!${NC}"
  echo -e "${GREEN}   Log: ${LOG_FILE}${NC}"
else
  echo -e "${RED}⚠️  ${fail_count} migração(ões) falharam. Verifique: ${LOG_FILE}${NC}"
  exit 1
fi
