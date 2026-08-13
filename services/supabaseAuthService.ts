/**
 * services/supabaseAuthService.ts
 *
 * Serviço de autenticação de USUÁRIOS EXTERNOS (clientes, advogados, estagiários,
 * secretárias) via Supabase Auth.
 *
 * SEPARAÇÃO DE RESPONSABILIDADES:
 *  - Este arquivo: autenticação de usuários externos via Supabase Auth.
 *  - authService.ts: autenticação de STAFF INTERNO (admin) via PBKDF2 local.
 *
 * FLUXO:
 *  1. supabase.auth.signInWithPassword() → JWT retornado pelo Supabase
 *  2. JWT é armazenado automaticamente no localStorage pelo cliente Supabase
 *  3. RLS no banco usa o JWT para aplicar isolamento de dados por usuário
 *  4. onAuthStateChange() mantém o estado React sincronizado
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '../lib/database.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SupabaseAuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  session: Session;
}

export interface SupabaseSignInResult {
  success: boolean;
  user?: SupabaseAuthUser;
  error?: string;
}

export interface SupabaseSignUpResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Busca o perfil completo do usuário (role, name) a partir do seu Supabase Auth UID.
 */
async function fetchUserProfile(authUser: User): Promise<SupabaseAuthUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, name')
    .eq('id', authUser.id)
    .single();

  if (error || !data) {
    console.error('[SupabaseAuth] Erro ao buscar perfil do usuário:', error?.message);
    return null;
  }

  const session = (await supabase.auth.getSession()).data.session;
  if (!session) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role as UserRole,
    name: data.name,
    session,
  };
}

// ─── Serviço ──────────────────────────────────────────────────────────────────

export const SupabaseAuthService = {
  /**
   * Indica se o serviço de auth em nuvem está disponível.
   */
  get isEnabled(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Faz login de usuário externo com email e senha via Supabase Auth.
   * Retorna o perfil completo com role e nome.
   */
  async signIn(email: string, password: string): Promise<SupabaseSignInResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase não configurado. Use o login de staff local.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error:
          error?.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : (error?.message ?? 'Erro de autenticação.'),
      };
    }

    const profile = await fetchUserProfile(data.user);
    if (!profile) {
      // Auth OK mas sem perfil no banco — usuário não cadastrado na tabela users
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Perfil de usuário não encontrado. Entre em contato com o suporte.',
      };
    }

    return { success: true, user: profile };
  },

  /**
   * Cria nova conta de usuário externo via Supabase Auth.
   * O perfil completo (role, name) deve ser inserido em public.users separadamente
   * via trigger ou Edge Function no Supabase.
   */
  async signUp(
    email: string,
    password: string,
    metadata: { name: string; role: UserRole }
  ): Promise<SupabaseSignUpResult> {
    if (!supabase) {
      return { success: false, error: 'Supabase não configurado.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          name: metadata.name,
          role: metadata.role,
        },
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message ?? 'Erro ao criar conta.',
      };
    }

    return { success: true, userId: data.user.id };
  },

  /**
   * Encerra a sessão do usuário externo no Supabase Auth.
   */
  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  /**
   * Retorna a sessão ativa atual (ou null se não autenticado).
   */
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Retorna o usuário autenticado atual com perfil completo, ou null.
   */
  async getCurrentUser(): Promise<SupabaseAuthUser | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return fetchUserProfile(data.user);
  },

  /**
   * Registra listener para mudanças de estado de autenticação.
   * Retorna a função de cleanup (unsubscribe).
   */
  onAuthStateChange(
    callback: (user: SupabaseAuthUser | null) => void
  ): () => void {
    if (!supabase) return () => {};

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        callback(profile);
      } else {
        callback(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  },

  /**
   * Inicia fluxo de recuperação de senha por e-mail.
   */
  async resetPasswordByEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase não configurado.' };

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },
};

export default SupabaseAuthService;
