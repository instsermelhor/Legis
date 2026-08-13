/**
 * scripts/validate-prod-config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validador de Configuração de Produção e Variáveis de Ambiente do Legis Connect.
 * Executado como etapa de Quality Gate antes de autorizar o build estático.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ValidationReport {
  timestamp: string;
  isProductionReady: boolean;
  checkedVariables: Array<{
    name: string;
    present: boolean;
    required: boolean;
    description: string;
  }>;
  warnings: string[];
  errors: string[];
}

export function validateProductionConfiguration(): ValidationReport {
  const env = typeof process !== 'undefined' ? process.env : {};
  const checkedVariables = [
    {
      name: 'VITE_SUPABASE_URL',
      present: Boolean(env.VITE_SUPABASE_URL),
      required: true,
      description: 'URL do projeto Supabase em produção',
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      present: Boolean(env.VITE_SUPABASE_ANON_KEY),
      required: true,
      description: 'Chave pública anônima do Supabase',
    },
    {
      name: 'GEMINI_API_KEY',
      present: Boolean(env.GEMINI_API_KEY || env.API_KEY),
      required: true,
      description: 'Chave de API do Google Gemini (SERVER-ONLY proxy)',
    },
    {
      name: 'DATABASE_URL',
      present: Boolean(env.DATABASE_URL),
      required: false,
      description: 'String de conexão PostgreSQL para Prisma ORM e RLS',
    },
  ];

  const errors: string[] = [];
  const warnings: string[] = [];

  // SECURITY AUDIT: Ensure no secret API keys carry VITE_ prefix (which leaks to frontend bundle)
  if (env.VITE_GEMINI_API_KEY || env.VITE_SECRET_KEY || env.VITE_DATABASE_URL || env.VITE_JWT_SECRET) {
    errors.push('[ERRO DE SEGURANÇA CRÍTICO] Segredos privados detectados com prefixo VITE_! Remova o prefixo VITE_ para manter no servidor.');
  }

  for (const v of checkedVariables) {
    if (v.required && !v.present) {
      errors.push(`[ERRO CRÍTICO] Variável obrigatória ausente: ${v.name} (${v.description})`);
    }
  }

  // Verificar se flags de desenvolvimento ainda estão ativas em ambiente produtivo
  if (env.NODE_ENV === 'production') {
    if (env.VITE_ENABLE_MOCK_DATA === 'true') {
      warnings.push('[AVISO] MOCK_DATA está habilitado em ambiente de produção.');
    }
  }

  const isProductionReady = errors.length === 0;

  return {
    timestamp: new Date().toISOString(),
    isProductionReady,
    checkedVariables,
    warnings,
    errors,
  };
}

// Execução CLI caso invocado diretamente via Node/TSX
if (typeof require !== 'undefined' && require.main === module) {
  const report = validateProductionConfiguration();
  console.log('====================================================');
  console.log('LEGIS CONNECT — VALIDAÇÃO DE CONFIGURAÇÃO DE PRODUÇÃO');
  console.log(`Status: ${report.isProductionReady ? '✅ APROVADO' : '❌ REPROVADO'}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log('----------------------------------------------------');
  for (const v of report.checkedVariables) {
    console.log(`- ${v.name}: ${v.present ? 'PRESENTE' : 'AUSENTE'} (Obrigatório: ${v.required})`);
  }
  if (report.warnings.length > 0) {
    console.log('\nAvisos:');
    report.warnings.forEach(w => console.log(w));
  }
  if (report.errors.length > 0) {
    console.log('\nErros Críticos:');
    report.errors.forEach(e => console.log(e));
    process.exit(1);
  }
  console.log('====================================================');
}
