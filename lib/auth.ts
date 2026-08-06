/**
 * lib/auth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Camada de autenticação Legis Connect — wrapper sobre Supabase Auth.
 * Substitui a autenticação mock do AppContext/LoginForm.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '@supabase/supabase-js';

export { isSupabaseConfigured };

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'lawyer' | 'intern' | 'secretary' | 'admin' | 'super_admin';

export interface AuthProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  oabNumber?: string;   // advogados
  cpf?: string;         // clientes
  avatarUrl?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  oabNumber?: string;
  cpf?: string;
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

/**
 * Login com e-mail e senha.
 * Se Supabase não estiver configurado, opera em modo LOCAL (mock).
 */
export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { user: null, error: null, mode: 'local' as const };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error, mode: 'supabase' as const };
}

/**
 * Cadastro de novo usuário com perfil embutido nos metadados.
 */
export async function signUp(data: SignUpData) {
  if (!isSupabaseConfigured) {
    return { user: null, error: null, mode: 'local' as const };
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: data.role,
        oab_number: data.oabNumber ?? null,
        cpf: data.cpf ?? null,
      },
    },
  });
  return { user: authData.user, session: authData.session, error, mode: 'supabase' as const };
}

/**
 * Logout — destroi sessão JWT localmente e no servidor.
 */
export async function signOut() {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Recuperação de senha — envia e-mail com link de redefinição.
 */
export async function sendPasswordReset(email: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
}

/**
 * Atualiza a senha do usuário autenticado.
 */
export async function updatePassword(newPassword: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

/**
 * Converte um objeto User do Supabase em AuthProfile do Legis Connect.
 */
export function toAuthProfile(user: User): AuthProfile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    role: (meta.role as UserRole) ?? 'client',
    name: meta.name ?? user.email ?? '',
    oabNumber: meta.oab_number ?? undefined,
    cpf: meta.cpf ?? undefined,
    avatarUrl: meta.avatar_url ?? undefined,
  };
}

/**
 * Listener de mudanças de sessão (login / logout / refresh).
 * Retorna função de unsubscribe.
 */
export function onAuthStateChange(callback: (user: AuthProfile | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? toAuthProfile(session.user) : null);
  });
  return () => subscription.unsubscribe();
}
