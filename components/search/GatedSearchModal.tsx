import React, { useState } from 'react';
import { SearchStore, LeadStore } from '../../utils/sessionStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GatedSearchModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  /** The search query that triggered the gating */
  query?: string;
}

// ─── CPF mask ─────────────────────────────────────────────────────────────────
const maskCpf = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

// ─── Component ────────────────────────────────────────────────────────────────
export const GatedSearchModal: React.FC<GatedSearchModalProps> = ({
  isOpen,
  onUnlock,
  query = '',
}) => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [cpf, setCpf]         = useState('');
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCpf(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Por favor, informe seu nome.'); return; }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError('E-mail inválido.'); return; }
    if (cpf.replace(/\D/g, '').length !== 11) { setError('CPF deve ter 11 dígitos.'); return; }

    setIsLoading(true);
    setTimeout(() => {
      // Save lead
      LeadStore.add({ name, email, source: 'gated_search' });
      // Unlock search in sessionStorage
      SearchStore.unlock(query);
      setIsLoading(false);
      setDone(true);
      setTimeout(onUnlock, 1200);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Liberar acesso à busca"
    >
      {/* Backdrop — NOT dismissible (gated content stays) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Card */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="rounded-2xl border border-white/10 p-7 sm:p-9"
          style={{ background: 'rgba(14, 11, 30, 0.97)', backdropFilter: 'blur(24px)' }}
        >
          {done ? (
            /* ─── Success state ────────────────────────────────────────────── */
            <div className="text-center py-4 animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 text-3xl mb-4">
                ✅
              </div>
              <h3 className="font-montserrat text-xl font-bold text-white mb-2">Acesso Liberado!</h3>
              <p className="text-sm text-gray-400">Carregando resultados de advogados para você…</p>
            </div>
          ) : (
            /* ─── Form state ───────────────────────────────────────────────── */
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 text-xl mb-3">
                  🔓
                </div>
                <h2 className="font-montserrat text-xl font-bold text-white mb-1">
                  Libere o Acesso Gratuito
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Informe seus dados para visualizar o perfil completo dos advogados e entrar em contato.
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: '⚖️', label: 'Advogados Verificados OAB' },
                  { icon: '🔒', label: 'Dados LGPD Protegidos' },
                  { icon: '⚡', label: 'Acesso Imediato' },
                ].map(b => (
                  <div key={b.label} className="rounded-xl bg-white/4 border border-white/8 p-3">
                    <div className="text-lg mb-1">{b.icon}</div>
                    <p className="text-[10px] text-gray-400 leading-tight">{b.label}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="gs-name" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                    Nome completo
                  </label>
                  <input
                    id="gs-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* CPF */}
                <div className="space-y-1.5">
                  <label htmlFor="gs-cpf" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                    CPF
                  </label>
                  <input
                    id="gs-cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="gs-email" className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                    E-mail
                  </label>
                  <input
                    id="gs-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                      </svg>
                      Liberar Acesso Gratuito
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[10px] text-gray-600 mt-4 leading-relaxed">
                Seus dados são protegidos conforme a LGPD (Lei nº 13.709/2018). Não compartilhamos com terceiros.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
