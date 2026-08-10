/**
 * api/health.ts — Vercel Serverless Function
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint de health check para monitoramento (Uptime Robot, BetterStack).
 * Responde em < 200ms verificando a conectividade com o Supabase.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * URL de produção: https://legisconnect.com.br/api/health
 * Resposta esperada: 200 OK { status: "ok", ... }
 */

interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

import { createClient } from '@supabase/supabase-js';

const APP_VERSION = process.env.VITE_APP_VERSION || '1.0.0-beta';
const START_TIME  = Date.now();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const startTs = Date.now();

  // ─── Verificar conectividade Supabase ──────────────────────────────────────
  let supabaseStatus: 'connected' | 'degraded' | 'unreachable' = 'unreachable';
  let supabaseLatencyMs = -1;

  const supabaseUrl  = process.env.VITE_SUPABASE_URL;
  const supabaseKey  = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const t0 = Date.now();

      // Query mínima — não lê dados reais
      const { error } = await supabase
        .from('_health_check')
        .select('1')
        .limit(1)
        .maybeSingle();

      supabaseLatencyMs = Date.now() - t0;

      // Erro de "tabela não existe" ainda significa que o banco está acessível
      if (!error || error.code === '42P01' || error.message?.includes('does not exist')) {
        supabaseStatus = 'connected';
      } else {
        supabaseStatus = 'degraded';
      }
    } catch {
      supabaseStatus = 'unreachable';
    }
  }

  const responseTimeMs = Date.now() - startTs;
  const uptimeSeconds  = Math.round((Date.now() - START_TIME) / 1000);

  const isHealthy = supabaseStatus !== 'unreachable';
  const httpStatus = isHealthy ? 200 : 503;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  return res.status(httpStatus).json({
    status:           isHealthy ? 'ok' : 'degraded',
    version:          APP_VERSION,
    timestamp:        new Date().toISOString(),
    uptimeSeconds,
    responseTimeMs,
    services: {
      supabase: {
        status:    supabaseStatus,
        latencyMs: supabaseLatencyMs,
      },
      api: {
        status:    'ok',
        latencyMs: responseTimeMs,
      },
    },
  });
}
