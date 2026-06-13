import React, { useEffect } from 'react';
import type { View } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  /** If 'client' is pre-selected (from case widget), skip to client card highlighted */
  preSelected?: 'client' | 'lawyer' | 'intern' | 'secretary' | null;
}

// ─── Profile cards data ───────────────────────────────────────────────────────
const profiles = [
  {
    id: 'client' as const,
    icon: '👤',
    emoji_bg: 'from-blue-600/30 to-blue-900/20',
    border: 'border-blue-500/25 hover:border-blue-400/50',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    title: 'Sou Cliente',
    subtitle: 'Pessoa física ou empresa',
    desc: 'Encontre o advogado ideal para sua demanda jurídica com IA, segurança e preço transparente.',
    features: ['Matchmaking por IA', 'Rastreio do caso via CPF', 'Serviços com preço fixo'],
    cta: 'Cadastrar como Cliente',
    view: 'signup' as View,
    badgeLabel: 'Mais popular',
    popular: true,
  },
  {
    id: 'lawyer' as const,
    icon: '⚖️',
    emoji_bg: 'from-violet-600/30 to-purple-900/20',
    border: 'border-primary/25 hover:border-primary/50',
    badge: 'bg-primary/15 text-primary-light border-primary/30',
    glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
    title: 'Sou Advogado',
    subtitle: 'Profissional OAB ativo',
    desc: 'Expanda sua clientela, gerencie processos e impulsione seu escritório com ferramentas premium.',
    features: ['Painel de gestão completo', 'CRM de clientes', 'Agenda inteligente'],
    cta: 'Registrar Escritório',
    view: 'forLawyers' as View,
    popular: false,
  },
  {
    id: 'intern' as const,
    icon: '🎓',
    emoji_bg: 'from-teal-600/30 to-emerald-900/20',
    border: 'border-teal-500/25 hover:border-teal-400/50',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    glow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]',
    title: 'Sou Bacharelando',
    subtitle: 'Estudante de Direito',
    desc: 'Inicie sua carreira conectando-se a escritórios reconhecidos e ganhando experiência prática.',
    features: ['Acesso a casos reais', 'Mural de mentorias', 'Portfólio jurídico'],
    cta: 'Acelerar Carreira',
    view: 'forInterns' as View,
    popular: false,
  },
  {
    id: 'secretary' as const,
    icon: '📋',
    emoji_bg: 'from-rose-600/30 to-pink-900/20',
    border: 'border-rose-500/25 hover:border-rose-400/50',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    title: 'Secret./Assist. Jurídico',
    subtitle: 'Profissional administrativo',
    desc: 'Conecte-se a escritórios que valorizam expertise em secretariado e assistência jurídica.',
    features: ['Central de tarefas', 'Gestão de prazos', 'Comunicação integrada'],
    cta: 'Acessar Central',
    view: 'forSecretariado' as View,
    popular: false,
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  preSelected,
}) => {
  // Esc to close
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

  if (!isOpen) return null;

  const handleSelect = (view: View) => {
    onClose();
    onNavigate(view);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Selecione seu perfil"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-3xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="rounded-2xl border border-white/10 p-6 sm:p-8"
          style={{ background: 'rgba(14, 11, 30, 0.97)', backdropFilter: 'blur(24px)' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Fechar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-xs font-semibold mb-4">
              ✦ Bem-vindo à LEGIS CONNECT
            </div>
            <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-white mb-2">
              O que você procura na plataforma?
            </h2>
            <p className="text-sm text-gray-400">Selecione seu perfil para acessar o fluxo de cadastro correto</p>
          </div>

          {/* Profile grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.view)}
                className={`
                  relative text-left rounded-xl border p-5 cursor-pointer
                  transition-all duration-300 hover:-translate-y-1 group
                  bg-gradient-to-br ${p.emoji_bg} ${p.border} ${p.glow}
                  ${preSelected === p.id ? 'ring-2 ring-primary/60' : ''}
                `}
              >
                {/* Popular badge */}
                {p.popular && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    ⭐ Mais popular
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="text-3xl w-10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat text-base font-bold text-white">{p.title}</p>
                    <p className="text-xs text-gray-400 mb-2">{p.subtitle}</p>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">{p.desc}</p>
                    {/* Features */}
                    <ul className="space-y-1">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <svg className="w-3 h-3 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA row */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary group-hover:text-accent transition-colors">
                    {p.cta}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Already have account */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <button
              onClick={() => { onClose(); onNavigate('login'); }}
              className="text-primary hover:text-primary-light font-semibold transition-colors"
            >
              Faça login aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
