import { Icon } from '@/components/common/IconComponents';
import React, { useState } from 'react';
import { SecretariadoSignupForm, SecretarySignupData } from './SecretariadoSignupForm';

interface ForSecretariadoPageProps {
  onLogin: (credentials: { email: string; password: string }) => boolean;
  onSignup: (data: SecretarySignupData) => void;
  onShowTerms?: () => void;
}

export const ForSecretariadoPage: React.FC<ForSecretariadoPageProps> = ({ onLogin, onSignup }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const ok = onLogin({ email: loginEmail, password: loginPassword });
    if (!ok) setLoginError('E-mail ou senha incorretos.');
  };

  const features = [
    { icon: '📋', title: 'Gestão de Agenda', desc: 'Organize compromissos e prazos do escritório com facilidade.' },
    { icon: '⚖️', title: 'Protocolo Judicial', desc: 'Acompanhe publicações em diários oficiais e protocolos processuais.' },
    { icon: '📂', title: 'Organização Documental', desc: 'Centralize e arquive documentos de clientes e processos.' },
    { icon: '👥', title: 'Atendimento ao Cliente', desc: 'Triagem profissional de clientes e suporte ao advogado.' },
    { icon: '💼', title: 'Gestão de Escritório', desc: 'Controle financeiro, faturamento e suporte administrativo.' },
    { icon: '🖥️', title: 'Sistemas Jurídicos', desc: 'Suporte em PJe, e-SAJ e outros sistemas eletrônicos.' },
  ];

  if (showSignup) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-2xl">
        <button onClick={() => setShowSignup(false)} className="text-sm text-primary hover:underline mb-5 flex items-center gap-1">
          ← Voltar
        </button>
        <SecretariadoSignupForm onSignup={onSignup} onCancel={() => setShowSignup(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#fff_0%,_transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              🏛️ Secret./Assist. Jurídico
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
              Sua carreira como
              <span className="text-purple-200"> Secret./Assist. Jurídico</span>
            </h1>
            <p className="text-base sm:text-lg text-purple-100 mb-6 sm:mb-8 max-w-2xl">
              Conecte-se com escritórios de advocacia que precisam de Secretários e Assistentes Jurídicos qualificados. Gerencie sua carreira, encontre oportunidades e colabore com advogados de todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowSignup(true)}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-purple-800 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Cadastrar-se Gratuitamente
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-purple-700/50 border border-purple-400 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all backdrop-blur-sm text-sm sm:text-base"
              >
                Já tenho conta — Entrar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 dark:bg-[#1A1730] dark:border dark:border-[#2A2545] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Entrar — Secret./Assist. Jurídico</h2>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold leading-none">&times;</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">E-mail</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Seu e-mail" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Senha</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500" />
              </div>
              {loginError && <p className="text-xs text-red-600 font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{loginError}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 rounded-lg p-2">
                <Icon name="💡" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> <strong>Teste:</strong> teste@legisconnect.com.br / teste
              </p>
              <button type="submit" className="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#0F0D1A] transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-3">O que você pode fazer na plataforma</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 sm:mb-10 max-w-xl mx-auto text-sm sm:text-base">Secretários e Assistentes Jurídicos são essenciais para o bom funcionamento de escritórios de advocacia.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 dark:bg-[#1A1730] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
                <p className="text-3xl mb-3">{f.icon}</p>
                <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-purple-50 dark:bg-[#13102A] border-t border-purple-100 dark:border-white/5 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-white mb-3">Pronto para dar o próximo passo?</h2>
          <p className="text-purple-700 dark:text-purple-300 mb-6 max-w-md mx-auto text-sm sm:text-base">Cadastre-se gratuitamente e seja encontrado por advogados que precisam do seu talento.</p>
          <button
            onClick={() => setShowSignup(true)}
            className="px-8 py-3.5 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800 transition-all shadow-md hover:shadow-lg"
          >
            Começar Agora
          </button>
        </div>
      </section>
    </div>
  );
};
