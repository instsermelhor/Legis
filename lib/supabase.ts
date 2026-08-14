/**
 * lib/supabase.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Cliente Supabase singleton para o Legis Connect.
 *
 * Configuração:
 *   1. Crie um projeto gratuito em https://supabase.com
 *   2. Vá em Project Settings → API
 *   3. Copie "Project URL" e "anon / public key"
 *   4. Cole no arquivo .env.local na raiz do projeto:
 *
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJ...
 *
 * SEGURANÇA:
 *  - Apenas VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (chave pública).
 *  - A chave service_role NUNCA deve aparecer aqui ou no frontend.
 *  - Row-Level Security (RLS) garante isolamento de dados no banco.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const sanitizedUrl = typeof rawUrl === 'string' && rawUrl.trim().length > 0 ? rawUrl.trim() : undefined;
const sanitizedKey = typeof rawKey === 'string' && rawKey.trim().length > 0 ? rawKey.trim() : undefined;

/** Verifica se o Supabase está configurado com credenciais reais. */
export const isSupabaseConfigured =
  Boolean(sanitizedUrl) &&
  sanitizedUrl !== 'https://placeholder.supabase.co' &&
  Boolean(sanitizedKey) &&
  sanitizedKey !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn(
    '[Legis Connect] Supabase não configurado. ' +
    'Crie o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. ' +
    'A plataforma operará em modo LOCAL (localStorage) até a configuração ser concluída.'
  );
}

/**
 * Cliente Supabase principal — use este em toda a aplicação.
 * Tipagem permissiva (sem genérico) para compatibilidade com lib/db.ts.
 * Para queries tipadas, use os serviços em services/supabase*.ts.
 * Já gerencia sessão JWT automaticamente (refresh token, persistência).
 */
export const supabase = createClient(
  sanitizedUrl || 'https://placeholder.supabase.co',
  sanitizedKey || 'placeholder-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
    global: {
      headers: {
        'x-application-name': 'legis-connect',
      },
    },
  }
);

/** Retorna o usuário autenticado atual (ou null se não logado). */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Retorna a sessão ativa atual (ou null se não logado). */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
