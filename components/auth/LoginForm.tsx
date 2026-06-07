import React, { useState } from 'react';
import { mockLawyers } from '../../services/mockLawyerService';

export interface Credentials {
    email: string;
    password?: string;
}

interface LoginFormProps {
    onLogin: (credentials: Credentials) => boolean;
}

const ADMIN_EMAIL = 'admin@legisconnect.com.br';
const ADMIN_PASSWORD = 'admin';
const TEST_EMAIL = 'teste@legisconnect.com.br';

// ── Role badge ────────────────────────────────────────────────────────────
const roleConfig = {
  admin:  { label: '🛡️ Login de Administrador', color: 'bg-primary/15 text-primary border-primary/30' },
  lawyer: { label: '⚖️ Login de Advogado',       color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  client: { label: '👤 Login de Cliente',         color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  test:   { label: '🔑 Acesso de Teste',           color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

// ── Eye icon ──────────────────────────────────────────────────────────────
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

// ── Input field component ─────────────────────────────────────────────────
const InputField: React.FC<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  rightElement?: React.ReactNode;
}> = ({ id, label, type, value, onChange, placeholder, autoComplete, required, rightElement }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="
          w-full px-4 py-3 rounded-xl
          bg-white/6 border border-white/12
          text-white placeholder-white/30
          text-sm font-medium
          caret-primary
          transition-all duration-200
          focus:outline-none focus:border-primary/60 focus:bg-white/10
          focus:ring-2 focus:ring-primary/20
          hover:border-white/20
        "
        style={{ colorScheme: 'dark' }}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [email, setEmail]                   = useState('');
    const [password, setPassword]             = useState('');
    const [showPassword, setShowPassword]     = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [userType, setUserType]             = useState<'admin' | 'lawyer' | 'client' | 'test' | null>(null);
    const [error, setError]                   = useState('');
    const [isLoading, setIsLoading]           = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);

        const lowerEmail = newEmail.toLowerCase().trim();

        if (!lowerEmail || !/^\S+@\S+\.\S+$/.test(lowerEmail)) {
            setUserType(null);
            setIsPasswordVisible(false);
            return;
        }

        setIsPasswordVisible(true);

        if (lowerEmail === ADMIN_EMAIL) {
            setUserType('admin');
        } else if (lowerEmail === TEST_EMAIL) {
            setUserType('test');
        } else if (mockLawyers.some(l => l.contact.email.toLowerCase() === lowerEmail)) {
            setUserType('lawyer');
        } else {
            setUserType('client');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setTimeout(() => {
            const success = onLogin({ email, password });
            if (!success) {
                setError('E-mail ou senha inválidos. Verifique suas credenciais.');
            }
            setIsLoading(false);
        }, 500);
    };

    const role = userType ? roleConfig[userType] : null;

    return (
        <div
          className="min-h-[65vh] flex items-center justify-center py-16 px-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F0D1A 0%, #1A1130 50%, #0D1B2A 100%)' }}
        >
          {/* Background decorations */}
          <div className="absolute top-[-20%] left-[5%]  w-96 h-96 rounded-full bg-primary/12 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[5%] w-80 h-80 rounded-full bg-accent/8 blur-[80px]  pointer-events-none" />
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />

          {/* Card */}
          <div className="relative w-full max-w-md animate-scale-in">
            <div
              className="rounded-2xl border border-white/8 p-8 sm:p-10"
              style={{ background: 'rgba(26, 23, 48, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                {/* Logo mark */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 text-2xl mb-5 animate-pulse-glow">
                  ⚖️
                </div>
                <h1 className="font-montserrat text-2xl font-bold text-white mb-1.5">
                  Acesse sua conta
                </h1>
                <p className="text-sm text-gray-400">
                  Plataforma jurídica <span className="font-cinzel text-accent/80 font-semibold tracking-wider">LEGIS CONNECT</span>
                </p>
              </div>

              {/* Role badge */}
              {role && (
                <div className={`mb-5 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold animate-fade-in ${role.color}`}>
                  {role.label}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <InputField
                  id="email-address"
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />

                {/* Password — aparece após e-mail válido */}
                {isPasswordVisible && (
                  <div className="animate-slide-up">
                    <InputField
                      id="password"
                      label="Senha"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      }
                    />
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
                  disabled={isLoading || !isPasswordVisible}
                  className="btn-primary w-full py-3.5 text-sm mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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

              {/* Divider + hint */}
              <div className="mt-6 pt-6 border-t border-white/6 text-center">
                <p className="text-xs text-gray-600">
                  Ao entrar você concorda com os{' '}
                  <span className="text-primary/70 hover:text-primary cursor-pointer transition-colors">Termos de Serviço</span>
                  {' '}e a{' '}
                  <span className="text-primary/70 hover:text-primary cursor-pointer transition-colors">Política de Privacidade</span>
                  .
                </p>
              </div>
            </div>

            {/* Subtle glow under card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
          </div>
        </div>
    );
};
