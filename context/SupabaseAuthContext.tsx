/**
 * context/SupabaseAuthContext.tsx
 *
 * Contexto React para gerenciamento de sessão de USUÁRIOS EXTERNOS
 * (clientes, advogados, estagiários, secretárias) via Supabase Auth.
 *
 * SEPARAÇÃO DE RESPONSABILIDADES:
 *  - Este contexto: usuários externos (Supabase Auth JWT).
 *  - AuthContext.tsx: staff interno (PBKDF2 local + sessionStorage).
 *
 * USO:
 *   // Envolver a aplicação (ou a área de usuários externos) com o provider:
 *   <SupabaseAuthProvider>
 *     <App />
 *   </SupabaseAuthProvider>
 *
 *   // Consumir o contexto em qualquer componente filho:
 *   const { user, signIn, signOut, isLoading } = useSupabaseAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import SupabaseAuthService, { type SupabaseAuthUser } from '../services/supabaseAuthService';
import type { UserRole } from '../lib/database.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SupabaseAuthContextValue {
  /** Usuário externo autenticado (null = não autenticado ou Supabase desabilitado) */
  user: SupabaseAuthUser | null;
  /** Verdadeiro enquanto a sessão está sendo verificada na inicialização */
  isLoading: boolean;
  /** Verdadeiro se há uma sessão ativa */
  isAuthenticated: boolean;
  /** Role do usuário atual */
  role: UserRole | null;
  /** Indica se o Supabase Auth está disponível neste ambiente */
  isSupabaseEnabled: boolean;

  /** Faz login com email e senha */
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  /** Faz registro de novo usuário externo */
  signUp: (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole }
  ) => Promise<{ success: boolean; error?: string }>;
  /** Encerra sessão */
  signOut: () => Promise<void>;
  /** Envia e-mail de recuperação de senha */
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica sessão existente na montagem e registra listener de mudanças
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      setIsLoading(true);
      try {
        // Verifica se há sessão ativa (persiste após refresh)
        const currentUser = await SupabaseAuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('[SupabaseAuthContext] Erro na inicialização:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }

      // Registra listener para mudanças de sessão em tempo real
      unsubscribe = SupabaseAuthService.onAuthStateChange((updatedUser) => {
        setUser(updatedUser);
      });
    };

    initialize();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await SupabaseAuthService.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, metadata: { name: string; role: UserRole }) => {
      const result = await SupabaseAuthService.signUp(email, password, metadata);
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    []
  );

  const signOut = useCallback(async () => {
    await SupabaseAuthService.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return SupabaseAuthService.resetPasswordByEmail(email);
  }, []);

  const value: SupabaseAuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    role: user?.role ?? null,
    isSupabaseEnabled: SupabaseAuthService.isEnabled,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSupabaseAuth(): SupabaseAuthContextValue {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error('useSupabaseAuth deve ser usado dentro de <SupabaseAuthProvider>');
  }
  return ctx;
}

export default SupabaseAuthContext;
