// ─────────────────────────────────────────────────────────────────────────────
// components/admin/AdminLoginPage.tsx
// Página de Login da Área Restrita (Super Administrador)
// Enterprise Edition — PBKDF2v2, Brute-Force lockout com contador regressivo
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { AuthService, getLockoutInfo } from '../../services/authService';
import { StaffService } from '../../services/staffService';
import type { Credentials } from '../auth/LoginForm';
import type { View } from '../../types';

interface AdminLoginPageProps {
  onLogin: (credentials: Credentials) => boolean;
  onBackToSite: () => void;
  onNavigate?: (view: View) => void;
}

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

// ─── Contador Regressivo de Lockout ──────────────────────────────────────────
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBackToSite, onNavigate }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  // Lockout progressivo
  const [isLocked, setIsLocked]               = useState(false);
  const [lockoutSeconds, setLockoutSeconds]   = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animação de shake no card ao errar
  const [shake, setShake] = useState(false);

  // ─── Efeito do contador regressivo ─────────────────────────────────────────
  useEffect(() => {
    if (isLocked && lockoutSeconds > 0) {
      lockoutTimerRef.current = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            clearInterval(lockoutTimerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, [isLocked, lockoutSeconds]);

  // ─── Sincroniza lockout ao digitar o email ──────────────────────────────────
  useEffect(() => {
    if (!email) return;
    const info = getLockoutInfo(email);
    if (info.isLocked && info.remainingSeconds > 0) {
      setIsLocked(true);
      setLockoutSeconds(info.remainingSeconds);
    }
  }, [email]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError('');
    setRemainingAttempts(null);
    setIsLoading(true);

    try {
      const lowerEmail = email.toLowerCase().trim();

      // Verifica se é staff autorizado
      StaffService.initialize();
      const staff = StaffService.findByEmail(lowerEmail);
      if (!staff || !staff.active) {
        triggerShake();
        setError('Acesso negado. Este portal é exclusivo para administradores autorizados.');
        setIsLoading(false);
        return;
      }

      // Autenticação com PBKDF2v2 + lockout
      const authResult = await AuthService.authenticateStaffAsync(lowerEmail, password);

      if (!authResult.success) {
        triggerShake();

        // Lockout ativado
        if (authResult.lockoutRemainingSeconds && authResult.lockoutRemainingSeconds > 0) {
          setIsLocked(true);
          setLockoutSeconds(authResult.lockoutRemainingSeconds);
          setError('');
        } else {
          setError(authResult.error || 'Credenciais inválidas.');
          if (authResult.remainingAttempts !== undefined) {
            setRemainingAttempts(authResult.remainingAttempts);
          }
        }
        setIsLoading(false);
        return;
      }

      // Troca de senha obrigatória (primeiro acesso)
      if (authResult.requiresPasswordChange) {
        if (onNavigate) {
          onNavigate('forcePasswordChange');
        } else {
          onLogin({ email: lowerEmail, password });
        }
        setIsLoading(false);
        return;
      }

      // MFA requerido
      if (authResult.requiresMfa) {
        if (onNavigate) {
          onNavigate('mfaChallenge');
        } else {
          onLogin({ email: lowerEmail, password });
        }
        setIsLoading(false);
        return;
      }

      // Login completo
      const success = onLogin({ email: lowerEmail, password });
      if (!success) {
        triggerShake();
        setError('Falha na autenticação. Tente novamente.');
      }
    } catch (err) {
      console.error('[AdminLogin] Erro inesperado:', err);
      triggerShake();
      setError('Erro interno ao autenticar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050310 0%, #0B091A 45%, #080E1C 100%)' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] rounded-full opacity-60 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-50 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Secure badge */}
      <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)', color: '#94a3b8' }}>
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Conexão Segura TLS 1.3</span>
        <span className="mx-1" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span className="text-amber-400 font-semibold">Área Restrita</span>
        <span className="mx-1" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>PBKDF2v2 · OWASP 2024</span>
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-md transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={{ '--tw-animate-shake': 'shake 0.5s ease-in-out' } as React.CSSProperties}
      >
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            15%{transform:translateX(-6px)}
            30%{transform:translateX(6px)}
            45%{transform:translateX(-4px)}
            60%{transform:translateX(4px)}
            75%{transform:translateX(-2px)}
            90%{transform:translateX(2px)}
          }
        `}</style>

        <div
          className="rounded-2xl border p-8 sm:p-10 shadow-2xl"
          style={{
            background: 'rgba(13, 10, 28, 0.92)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-5 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(245,158,11,0.2) 100%)',
                border: '1px solid rgba(99,102,241,0.35)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
              }}
            >
              🛡️
            </div>
            <h1 className="font-montserrat text-2xl font-bold text-white mb-1.5 tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Acesso exclusivo para{' '}
              <span className="text-amber-400 font-semibold">Super Administradores</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: '#475569' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
              <span style={{ fontFamily: 'monospace' }}>admin.legisconnect.com.br</span>
            </div>
          </div>

          {/* Lockout Banner */}
          {isLocked && lockoutSeconds > 0 ? (
            <div
              className="mb-6 flex flex-col items-center gap-3 px-5 py-5 rounded-xl border"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
            >
              <div className="text-3xl">🔒</div>
              <div className="text-center">
                <p className="text-sm font-bold text-red-400 mb-1">Acesso Temporariamente Bloqueado</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Múltiplas tentativas incorretas detectadas.</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>Tente novamente em:</p>
              </div>
              <div
                className="px-6 py-2 rounded-xl font-mono font-bold text-2xl text-red-400"
                style={{ background: 'rgba(239,68,68,0.12)', letterSpacing: '4px' }}
              >
                {formatCountdown(lockoutSeconds)}
              </div>
              <p className="text-[11px] text-center" style={{ color: '#475569' }}>
                Todas as tentativas são registradas e monitoradas em tempo real.
              </p>
            </div>
          ) : (
            <>
              {/* Aviso de tentativas restantes */}
              {remainingAttempts !== null && remainingAttempts <= 2 && (
                <div
                  className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl border"
                  style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
                >
                  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-300 leading-snug">
                    <span className="font-bold">Atenção:</span> Restam apenas{' '}
                    <span className="font-bold text-amber-400">{remainingAttempts}</span>{' '}
                    tentativa{remainingAttempts !== 1 ? 's' : ''} antes do bloqueio automático.
                  </p>
                </div>
              )}

              {/* Warning badge */}
              <div
                className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.18)', color: '#fbbf24' }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Portal exclusivo para credenciais administrativas autorizadas</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="block text-xs font-semibold tracking-wide uppercase" style={{ color: '#cbd5e1' }}>
                    E-mail Administrativo
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/20 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      caretColor: '#6366f1',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="admin-password" className="block text-xs font-semibold tracking-wide uppercase" style={{ color: '#cbd5e1' }}>
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••••••"
                      disabled={isLoading}
                      className="w-full px-4 py-3 pr-11 rounded-xl text-sm font-medium text-white placeholder-white/20 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        caretColor: '#6366f1',
                        colorScheme: 'dark',
                      }}
                      onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors"
                      style={{ color: '#475569' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && !isLocked && (
                  <div
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
                    style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
                  >
                    <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-400 leading-snug">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !email || !password || isLocked}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                  }}
                  onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'right center'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundPosition = 'left center'; }}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Acessar Painel Administrativo
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 pt-5 border-t space-y-3 text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[11px]" style={{ color: '#334155' }}>
              Todas as tentativas de acesso são registradas e auditadas em tempo real.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onBackToSite}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao site
              </button>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <a
                href="mailto:suporte@legisconnect.com.br"
                className="text-xs transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              >
                Solicitar Acesso
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
