import React, { useState, useEffect } from 'react';
import type { View } from '../../types';
import type { Credentials } from '../auth/LoginForm';
import { mockLawyers } from '../../services/mockLawyerService';
import { hashPassword, AdminUser } from '../../services/mockDataService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (credentials: Credentials) => boolean;
  onNavigate: (view: View) => void;
  /** If set, show a banner like "Faça login para contratar: [serviceTitle]" */
  pendingAction?: { type: 'service'; label: string } | null;
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

// ─── Role detector ────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@legisconnect.com.br';
const TEST_EMAIL  = 'teste@legisconnect.com.br';

const roleConfig = {
  admin:  { label: '🛡️ Administrador', color: 'bg-primary/15 text-primary border-primary/30' },
  lawyer: { label: '⚖️ Advogado',       color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  client: { label: '👤 Cliente',         color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  test:   { label: '🔑 Acesso de Teste', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNavigate,
  pendingAction,
}) => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [userType, setUserType]   = useState<'admin' | 'lawyer' | 'client' | 'test' | null>(null);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Trap focus + Esc close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setEmail(''); setPassword(''); setError('');
      setShowPwd(false); setPwdVisible(false); setUserType(null);
    }
  }, [isOpen]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmail(v);
    const lo = v.toLowerCase().trim();
    if (!lo || !/^\S+@\S+\.\S+$/.test(lo)) { setUserType(null); setPwdVisible(false); return; }
    setPwdVisible(true);
    if (lo === ADMIN_EMAIL) setUserType('admin');
    else if (lo === TEST_EMAIL) setUserType('test');
    else if (mockLawyers.some(l => l.contact.email.toLowerCase() === lo)) setUserType('lawyer');
    else setUserType('client');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const ok = onLoginSuccess({ email, password });
      if (!ok) setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      else onClose();
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  const role = userType ? roleConfig[userType] : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modal de Login"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="rounded-2xl border border-white/10 p-7 sm:p-9 shadow-2xl"
          style={{ background: 'rgba(18, 15, 38, 0.96)', backdropFilter: 'blur(24px)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Fechar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Pending action banner */}
          {pendingAction && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Faça login para continuar: <strong>{pendingAction.label}</strong>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 text-xl mb-4 animate-pulse-glow">
              ⚖️
            </div>
            <h2 className="font-montserrat text-xl font-bold text-white mb-1">Acesse sua conta</h2>
            <p className="text-xs text-gray-400">
              Plataforma <span className="font-cinzel text-accent/80 font-semibold tracking-wider">LEGIS CONNECT</span>
            </p>
          </div>

          {/* Role badge */}
          {role && (
            <div className={`mb-5 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold animate-fade-in ${role.color}`}>
              {role.label}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="lm-email" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                E-mail
              </label>
              <input
                id="lm-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Password */}
            {pwdVisible && (
              <div className="space-y-1.5 animate-slide-up">
                <label htmlFor="lm-password" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="lm-password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300"
                    aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 animate-fade-in">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !pwdVisible}
              className="btn-primary w-full py-3.5 text-sm mt-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Entrar na plataforma
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-white/6 flex items-center justify-between text-xs text-gray-500">
            <span>
              Não tem conta?{' '}
              <button
                onClick={() => { onClose(); onNavigate('signup'); }}
                className="text-primary hover:text-primary-light transition-colors font-semibold"
              >
                Cadastre-se
              </button>
            </span>
            <button className="text-gray-600 hover:text-gray-400 transition-colors">
              Esqueci a senha
            </button>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-primary/25 blur-2xl rounded-full pointer-events-none" />
      </div>
    </div>
  );
};
