import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
import { StaffService } from '../../services/staffService';
import type { Credentials } from '../auth/LoginForm';

interface AdminLoginPageProps {
  onLogin: (credentials: Credentials) => boolean;
  onBackToSite: () => void;
}

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

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const lowerEmail = email.toLowerCase().trim();

      // 1. Verificar se é um staff/admin registrado
      const staff = StaffService.findByEmail(lowerEmail);
      if (!staff || !staff.active) {
        setError('Acesso negado. Este portal é exclusivo para administradores autorizados.');
        setIsLoading(false);
        return;
      }

      // 2. Verificar role — apenas admin/super_admin
      const allowedRoles = ['super', 'admin', 'super_admin'];
      if (!allowedRoles.includes(staff.role)) {
        setError('Acesso negado. Permissões insuficientes para acessar o painel administrativo.');
        setIsLoading(false);
        return;
      }

      // 3. Autenticação com lockout via AuthService
      const authResult = await AuthService.authenticateStaffAsync(lowerEmail, password);
      if (!authResult.success) {
        setError(authResult.error || 'Credenciais inválidas. Verifique e-mail e senha.');
        setIsLoading(false);
        return;
      }

      // 4. Login final
      const success = onLogin({ email: lowerEmail, password });
      if (!success) {
        setError('Falha na autenticação. Tente novamente.');
      }
    } catch {
      setError('Erro interno. Contate o suporte técnico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060410 0%, #0D0B1A 40%, #0A1020 100%)' }}
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Secure badge (top) */}
      <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-medium">
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>Conexão Segura TLS 1.3</span>
        <span className="mx-1 text-white/20">·</span>
        <span className="text-amber-400 font-semibold">Área Restrita</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div
          className="rounded-2xl border border-white/8 p-8 sm:p-10 shadow-2xl"
          style={{ background: 'rgba(15, 12, 30, 0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            {/* Shield icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-amber-500/20 border border-primary/30 text-3xl mb-5 shadow-lg shadow-primary/20">
              🛡️
            </div>
            <h1 className="font-montserrat text-2xl font-bold text-white mb-1.5 tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-400">
              Acesso exclusivo para{' '}
              <span className="text-amber-400 font-semibold">Super Admin</span>
              {' '}e{' '}
              <span className="text-primary font-semibold">Administradores</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
              <span className="font-mono text-gray-500">admin.legisconnect.com.br</span>
            </div>
          </div>

          {/* Role indicator */}
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs font-semibold text-amber-300">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Este portal aceita apenas credenciais administrativas autorizadas</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                E-mail Administrativo
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="admin@legisconnect.com.br"
                className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/25 text-sm font-medium caret-primary transition-all duration-200 focus:outline-none focus:border-primary/60 focus:bg-white/10 focus:ring-2 focus:ring-primary/20 hover:border-white/20"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
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
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/25 text-sm font-medium caret-primary transition-all duration-200 focus:outline-none focus:border-primary/60 focus:bg-white/10 focus:ring-2 focus:ring-primary/20 hover:border-white/20"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 animate-fade-in">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400 leading-snug">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary via-violet-600 to-primary bg-[length:200%_auto] hover:bg-right transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-1"
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

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/6 text-center space-y-3">
            <p className="text-[11px] text-gray-600">
              Todas as tentativas de acesso são registradas e monitoradas.
            </p>
            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mx-auto"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao site institucional
            </button>
          </div>
        </div>

        {/* Glow under card */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-primary/15 blur-2xl rounded-full pointer-events-none" />
      </div>

      {/* Bottom watermark */}
      <div className="mt-8 text-center">
        <span className="font-cinzel text-[10px] tracking-[0.4em] text-gray-700 uppercase">
          LEGIS CONNECT · Painel Administrativo Seguro
        </span>
      </div>
    </div>
  );
};
