import React, { useState } from 'react';
import type { View } from '../../types';
import { ClientSignupForm, ClientSignupData } from './ClientSignupForm';

interface SignupPageProps {
    onClientSignup: (data: ClientSignupData) => void;
    onNavigate: (view: View) => void;
    onShowTerms: () => void;
}

const profileCards = [
  {
    icon: '👤',
    title: 'Sou Cliente',
    subtitle: 'Pessoa física ou empresa',
    desc: 'Encontre o advogado ideal para resolver sua demanda jurídica com segurança e eficiência.',
    cta: 'Cadastrar como Cliente',
    action: 'client' as const,
    color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/25 hover:border-blue-400/50',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    icon: '⚖️',
    title: 'Sou Advogado',
    subtitle: 'Profissional OAB ativo',
    desc: 'Expanda sua clientela, gerencie processos e organize seu escritório com ferramentas premium.',
    cta: 'Cadastrar como Advogado',
    action: 'lawyer' as const,
    color: 'from-primary/20 to-violet-600/10 border-primary/25 hover:border-primary/50',
    badge: 'bg-primary/15 text-primary-light border-primary/30',
  },
  {
    icon: '🎓',
    title: 'Sou Bacharelando',
    subtitle: 'Estudante de Direito',
    desc: 'Inicie sua carreira conectando-se a escritórios reconhecidos e ganhando experiência real.',
    cta: 'Cadastrar como Bacharelando',
    action: 'intern' as const,
    color: 'from-teal-500/20 to-emerald-600/10 border-teal-500/25 hover:border-teal-400/50',
    badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
];

export const SignupPage: React.FC<SignupPageProps> = ({ onClientSignup, onNavigate, onShowTerms }) => {
    const [showClientForm, setShowClientForm] = useState(false);

    if (showClientForm) {
        return (
            <div
              className="min-h-screen flex items-start justify-center py-12 px-4 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0F0D1A 0%, #1A1130 50%, #0D1B2A 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 left-[10%]   w-80 h-80 rounded-full bg-primary/12 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-[5%] w-64 h-64 rounded-full bg-accent/8  blur-[80px]  pointer-events-none" />
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
              />

              <div className="relative w-full max-w-xl animate-scale-in">
                <div
                  className="rounded-2xl border border-white/8 p-8"
                  style={{ background: 'rgba(26, 23, 48, 0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  <button
                    onClick={() => setShowClientForm(false)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6 group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Voltar para seleção
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">👤</div>
                    <div>
                      <h2 className="font-montserrat text-lg font-bold text-white">Cadastro de Cliente</h2>
                      <p className="text-xs text-gray-400">Preencha seus dados para criar sua conta</p>
                    </div>
                  </div>

                  {/* ClientSignupForm inputs inside a dark container — CSS selector covers them */}
                  <ClientSignupForm onSignup={onClientSignup} onShowTerms={onShowTerms} />
                </div>
              </div>
            </div>
        );
    }

    return (
        <div
          className="min-h-[75vh] flex items-center justify-center py-20 px-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F0D1A 0%, #1A1130 50%, #0D1B2A 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-[-10%] left-[5%]  w-96 h-96 rounded-full bg-primary/12 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[5%] w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />

          <div className="relative w-full max-w-4xl animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-sm font-semibold mb-6">
                ✦ Comece gratuitamente
              </div>
              <h1 className="font-montserrat text-4xl sm:text-5xl font-bold text-white mb-4">
                Junte-se à <span className="text-gradient-purple">LEGIS CONNECT</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Selecione o tipo de conta que deseja criar e inicie sua jornada no ecossistema jurídico digital.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileCards.map((card) => (
                <button
                  key={card.action}
                  onClick={() => {
                    if (card.action === 'client') setShowClientForm(true);
                    else if (card.action === 'lawyer') onNavigate('forLawyers');
                    else if (card.action === 'intern') onNavigate('forInterns');
                  }}
                  className={`
                    group text-left p-8 rounded-2xl border bg-gradient-to-br
                    transition-all duration-300 hover:-translate-y-2 hover:shadow-glow
                    cursor-pointer ${card.color}
                  `}
                  style={{ background: 'rgba(26, 23, 48, 0.7)' }}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>

                  {/* Badge */}
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border mb-4 ${card.badge}`}>
                    {card.subtitle}
                  </span>

                  {/* Title */}
                  <h2 className="font-montserrat text-xl font-bold text-white mb-3">{card.title}</h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{card.desc}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                    {card.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Já tem uma conta?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-primary hover:text-primary-light font-semibold transition-colors"
              >
                Faça login aqui →
              </button>
            </p>
          </div>
        </div>
    );
};
