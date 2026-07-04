import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { LawyerSearch } from './components/search/LawyerSearch';
import { LawyerProfile } from './components/lawyer/LawyerProfile';
import { ClientDashboard } from './components/client/ClientDashboard';
import { LawyerDashboard } from './components/lawyer/LawyerDashboard';
import { ForLawyersPage } from './components/lawyer/ForLawyersPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginForm, Credentials } from './components/auth/LoginForm';
import { SignupPage } from './components/auth/SignupPage';
import { ClientSignupData } from './components/auth/ClientSignupForm';
import { ForInternsPage } from './components/intern/ForInternsPage';
import { InternDashboard } from './components/intern/InternDashboard';
import { InternSignupData } from './components/auth/InternSignupForm';
import { CompleteProfilePage } from './components/client/CompleteProfilePage';
import { ForClientsPage } from './components/client/ForClientsPage';
import { EfficiencyServicesPage } from './components/client/EfficiencyServicesPage';
import { ServicesPublicPage } from './components/public/ServicesPublicPage';
import { ForSecretariadoPage } from './components/secretary/ForSecretariadoPage';
import { SecretariadoDashboard } from './components/secretary/SecretariadoDashboard';
import { SecretarySignupData } from './components/secretary/SecretariadoSignupForm';
import { ChatbotFab } from './components/chatbot/ChatbotFab';
import { ChatbotModal } from './components/chatbot/ChatbotModal';
import { TermsOfServiceModal } from './components/common/TermsOfServiceModal';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { EticaOABModal } from './components/common/EticaOABModal';
import { chatWithGemini } from './services/geminiService';
import type { View, Lawyer, Intern, Secretary, ChatMessage, User, Case, Appointment, Review, MapsSearchResult } from './types';
import { mockLawyers } from './services/mockLawyerService';
import { LoginModal } from './components/common/LoginModal';
import { ProfileSelectorModal } from './components/common/ProfileSelectorModal';
import { backend } from './services/modules';
import { sessaoParaUser } from './services/modules/auth/adaptador';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    const savedView = localStorage.getItem('legis_currentView') as View | null;
    const savedUser = localStorage.getItem('legis_user');
    const parsedUser = savedUser ? (() => { try { return JSON.parse(savedUser); } catch { return null; } })() : null;
    // Validate protected views against persisted user role (security: prevent admin panel on refresh without auth)
    if (savedView === 'adminDashboard' && parsedUser?.role !== 'admin') return 'landing';
    if (savedView === 'lawyerDashboard' && parsedUser?.role !== 'lawyer') return 'landing';
    if (savedView === 'internDashboard' && parsedUser?.role !== 'intern') return 'landing';
    if (savedView === 'secretariadoDashboard' && parsedUser?.role !== 'secretary') return 'landing';
    if (savedView === 'dashboard' && !parsedUser) return 'landing';
    return savedView || 'landing';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('legis_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [searchResults, setSearchResults] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [allLawyers, setAllLawyers] = useState<Lawyer[]>(mockLawyers);
  const [mapsResult, setMapsResult] = useState<MapsSearchResult | null>(null);

  useEffect(() => {
    localStorage.setItem('legis_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('legis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('legis_user');
    }
  }, [user]);


  // Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);

  // Modal State
  const [isTermsModalOpen, setIsTermsModalOpen]     = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isEticaModalOpen, setIsEticaModalOpen]     = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen]     = useState(false);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const [loginPendingAction, setLoginPendingAction] = useState<{ type: 'service'; label: string } | null>(null);


  useEffect(() => {
    if (isChatbotOpen && chatHistory.length === 0) {
      setChatHistory([
        {
          role: 'model',
          parts: [{ text: 'Olá! Sou o assistente virtual do Legis Connect. Como posso ajudar você hoje com perguntas sobre a plataforma ou serviços jurídicos gerais?' }],
        }
      ]);
    }
  }, [isChatbotOpen, chatHistory.length]);

  const isClientProfileComplete = (user: User | null): boolean => {
    if (!user || user.role !== 'client') return false;
    return !!(user.name && user.phone && user.address);
  };

  const handleNavigate = useCallback((view: View, overrideUser?: User | null) => {
    window.scrollTo(0, 0); // Always scroll to top on any navigation
    const activeUser = overrideUser !== undefined ? overrideUser : user;
    // Protected routes
    if (view === 'adminDashboard' && activeUser?.role !== 'admin') {
      setCurrentView('login');
      return;
    }
    if (view === 'dashboard') {
      if (!activeUser) {
        setCurrentView('login');
        return;
      } else if (activeUser.role === 'lawyer') {
        setCurrentView('lawyerDashboard');
      } else if (activeUser.role === 'intern') {
        setCurrentView('internDashboard');
      } else if (activeUser.role === 'secretary') {
        setCurrentView('secretariadoDashboard');
      } else if (activeUser.role === 'client') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
      return;
    }
    if (view === 'lawyerDashboard' && activeUser?.role !== 'lawyer') {
      setCurrentView('forLawyers');
      return;
    }
    if (view === 'internDashboard' && activeUser?.role !== 'intern') {
      setCurrentView('forInterns');
      return;
    }
    if (view === 'secretariadoDashboard' && activeUser?.role !== 'secretary') {
      setCurrentView('forSecretariado');
      return;
    }
    setCurrentView(view);
  }, [user]);

  /**
   * Login real contra a API (PostgreSQL). O papel vem do banco; o
   * adaptador converte a sessão para o formato User dos painéis.
   */
  const handleLogin = useCallback(async (credentials: Credentials): Promise<boolean> => {
    try {
      const { pessoa, perfil } = await backend.auth.login(credentials.email, credentials.password ?? '');
      const logado = sessaoParaUser(pessoa, perfil);

      // Cliente: carrega processos reais e mapeia para o histórico de casos.
      if (logado.role === 'client') {
        const processos = await backend.processos.listar().catch(() => []);
        logado.caseHistory = processos.map(p => ({
          id: String(p.id),
          title: p.nome,
          clientName: logado.name ?? '',
          lawyerName: p.advogado_nome,
          lawyerId: p.advogado_id,
          status: p.status === 'Concluído' ? 'Concluído' as const : 'Ativo' as const,
          stages: [
            { name: 'Análise Inicial', status: 'completed' as const },
            { name: 'Em Andamento', status: p.status === 'Concluído' ? 'completed' as const : 'current' as const },
            { name: 'Sentença', status: p.status === 'Concluído' ? 'completed' as const : 'upcoming' as const },
          ],
          reviewSubmitted: false,
        }));
      }

      setUser(logado);
      handleNavigate(logado.role === 'admin' ? 'adminDashboard' : 'dashboard', logado);
      return true;
    } catch {
      return false;
    }
  }, [handleNavigate]);

  // Open login modal (optionally with a pending action context)
  const handleOpenLoginModal = (pendingAction?: { type: 'service'; label: string }) => {
    setLoginPendingAction(pendingAction || null);
    setIsLoginModalOpen(true);
  };

  const handleOpenProfileSelector = () => {
    setIsProfileSelectorOpen(true);
  };

  // O papel vem do banco — o login é o mesmo em todas as páginas.
  const handleLawyerPageLogin = handleLogin;

  // Context-specific login for Interns page: test user gets Intern Dashboard
  const handleInternPageLogin = handleLogin;
  const handleClientPageLogin = handleLogin;

  const handleLogout = useCallback(() => {
    void backend.auth.sair(); // invalida a sessao no servidor
    setUser(null);
    handleNavigate('landing');
  }, [handleNavigate]);

  const handleSearch = useCallback((results: Lawyer[], mapsData: MapsSearchResult | null) => {
    setSearchResults(results);
    setMapsResult(mapsData);
    handleNavigate('search');
  }, [handleNavigate]);

  const handleSelectLawyer = useCallback((lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    handleNavigate('profile');
  }, [handleNavigate]);

  const handleBackToSearch = useCallback(() => {
    setSelectedLawyer(null);
    handleNavigate('search');
  }, [handleNavigate]);

  /**
   * Cadastros reais: cada signup cria a pessoa + perfil no PostgreSQL
   * via /api/auth/registrar e ja entra logado.
   */
  const handleClientSignup = async (data: ClientSignupData) => {
    try {
      const { pessoa, perfil } = await backend.auth.registrar({
        tipo: 'cliente',
        nome: data.name,
        email: data.email,
        senha: data.password ?? '',
        telefone: data.phone,
      });
      const logado = sessaoParaUser(pessoa, perfil);
      logado.address = data.address;
      setUser(logado);
      handleNavigate('dashboard', logado);
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Falha no cadastro.');
    }
  };

  const handleLawyerSignup = (data: Partial<Lawyer> & { password?: string }) => {
    backend.auth.registrar({
      tipo: 'advogado',
      nome: data.name ?? '',
      email: data.contact?.email ?? '',
      senha: data.password ?? '',
      telefone: data.contact?.phone,
      cidade: data.location?.city,
      estado: data.oabUF,
      perfil: {
        oab: data.oab,
        especialidades: data.specialties ?? [],
        bio: data.bio,
      },
    }).then(({ pessoa, perfil }) => {
      const logado = sessaoParaUser(pessoa, perfil);
      setUser(logado);
      handleNavigate('lawyerDashboard', logado);
    }).catch(erro => {
      alert(erro instanceof Error ? erro.message : 'Falha no cadastro.');
    });
    return true;
  };

  const handleInternSignup = (data: InternSignupData) => {
    backend.auth.registrar({
      tipo: 'bacharel',
      nome: data.name ?? '',
      email: data.contact?.email ?? '',
      senha: data.password ?? '',
      telefone: data.contact?.phone,
      cidade: data.city,
      estado: data.state,
      perfil: {
        universidade: data.university,
        semestre: data.semester,
        interesse: data.specialtyInterest,
      },
    }).then(({ pessoa, perfil }) => {
      const logado = sessaoParaUser(pessoa, perfil);
      setUser(logado);
      handleNavigate('internDashboard', logado);
    }).catch(erro => {
      alert(erro instanceof Error ? erro.message : 'Falha no cadastro.');
    });
    return true;
  };

  const handleSecretarySignup = (data: SecretarySignupData) => {
    backend.auth.registrar({
      tipo: 'secretario',
      nome: data.name,
      email: data.email,
      senha: data.password,
      telefone: data.phone,
      cidade: data.city,
      estado: data.state,
      perfil: {
        experiencia_anos: data.experience,
        disponibilidade: data.availability,
      },
    }).then(({ pessoa, perfil }) => {
      const logado = sessaoParaUser(pessoa, perfil);
      setUser(logado);
      handleNavigate('secretariadoDashboard', logado);
    }).catch(erro => {
      alert(erro instanceof Error ? erro.message : 'Falha no cadastro.');
    });
  };

  const handleUpdateProfile = (data: { name: string; phone: string; address: string; }) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      handleNavigate('dashboard', updatedUser); // Navigate to dashboard after update
    }
  }

  const handleUpdateLawyerReview = (lawyerId: number, caseId: string, rating: number, comment: string) => {
    setAllLawyers(prevLawyers => {
      return prevLawyers.map(lawyer => {
        if (lawyer.id === lawyerId) {
          const newReview: Review = {
            id: lawyer.reviews.length + 1,
            clientName: user?.name || 'Anônimo',
            rating,
            comment,
            date: new Date().toLocaleDateString('pt-BR'),
          };

          const updatedReviews = [...lawyer.reviews, newReview];
          const newTotalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
          const newAverageRating = newTotalRating / updatedReviews.length;

          return {
            ...lawyer,
            reviews: updatedReviews,
            rating: parseFloat(newAverageRating.toFixed(1)),
            reviewCount: updatedReviews.length,
          };
        }
        return lawyer;
      });
    });

    setUser(prevUser => {
      if (!prevUser || !prevUser.caseHistory) return prevUser;

      const updatedCaseHistory = prevUser.caseHistory.map(c => {
        if (c.id === caseId) {
          return { ...c, reviewSubmitted: true };
        }
        return c;
      });

      return { ...prevUser, caseHistory: updatedCaseHistory };
    });
  };

  const handleSendChatMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    // Capture history snapshot BEFORE state update to avoid race condition
    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);
    setIsChatbotLoading(true);

    try {
      const responseText = await chatWithGemini(currentHistory, message);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Desculpe, não consegui processar sua solicitação. Tente novamente.' }] };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatbotLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'search':
        return <LawyerSearch lawyers={searchResults.length > 0 ? searchResults : allLawyers} onSelectLawyer={handleSelectLawyer} mapsResult={mapsResult} />;
      case 'profile': {
        // Find the most up-to-date lawyer data to pass to the profile
        const currentLawyerData = selectedLawyer ? allLawyers.find(l => l.id === selectedLawyer.id) || selectedLawyer : null;
        return currentLawyerData ? <LawyerProfile lawyer={currentLawyerData} onBack={handleBackToSearch} onNavigate={handleNavigate} /> : <LandingPage onNavigate={handleNavigate} onSearch={handleSearch} />;
      }
      case 'dashboard':
        if (user && user.role === 'client' && !isClientProfileComplete(user)) {
          return <CompleteProfilePage user={user} onUpdateProfile={handleUpdateProfile} />;
        }
        return user ? <ClientDashboard user={user} onUpdateLawyerReview={handleUpdateLawyerReview} onNavigate={handleNavigate} onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />;
      case 'lawyerDashboard':
        return user?.data ? <LawyerDashboard lawyer={user.data as import('./types').Lawyer} onLogout={handleLogout} /> : <ForLawyersPage onLogin={handleLawyerPageLogin} onSignup={handleLawyerSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'adminDashboard':
        return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage onClientSignup={handleClientSignup} onNavigate={handleNavigate} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forLawyers':
        return <ForLawyersPage onLogin={handleLawyerPageLogin} onSignup={handleLawyerSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forInterns':
        return <ForInternsPage onLogin={handleInternPageLogin} onSignup={handleInternSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forClients':
        return <ForClientsPage onLogin={handleClientPageLogin} onSignup={handleClientSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'internDashboard':
        return user?.data && user.role === 'intern' ? (
          <InternDashboard
            intern={user.data as Intern}
            userEmail={user.email}
            onUpdateIntern={(updates) => setUser(prev => prev ? { ...prev, data: { ...prev.data as Intern, ...updates } } : prev)}
            onUpdateEmail={(newEmail) => setUser(prev => prev ? { ...prev, email: newEmail } : prev)}
            onLogout={handleLogout}
          />
        ) : <ForInternsPage onLogin={handleInternPageLogin} onSignup={handleInternSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forSecretariado':
        return <ForSecretariadoPage onLogin={handleSecretaryPageLogin} onSignup={handleSecretarySignup} />;
      case 'secretariadoDashboard':
        return user?.data && user.role === 'secretary' ? (
          <SecretariadoDashboard
            secretary={user.data as Secretary}
            userEmail={user.email}
            onUpdateSecretary={(updates) => setUser(prev => prev ? { ...prev, data: { ...prev.data as Secretary, ...updates } } : prev)}
            onUpdateEmail={(newEmail) => setUser(prev => prev ? { ...prev, email: newEmail } : prev)}
            onLogout={handleLogout}
          />
        ) : <ForSecretariadoPage onLogin={handleSecretaryPageLogin} onSignup={handleSecretarySignup} />;
      case 'services':
        return <ServicesPublicPage onNavigate={handleNavigate} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} onSearch={handleSearch} />;
    }
  };

  const getThemeClass = () => {
    switch (currentView) {
      case 'lawyerDashboard':
        return 'theme-lawyer';
      case 'internDashboard':
        return 'theme-intern';
      case 'secretariadoDashboard':
        return 'theme-secretary';
      case 'dashboard':
        return 'theme-client';
      default:
        return 'theme-prelogin';
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-neutral-light font-sans ${getThemeClass()}`}>
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenProfileSelector={handleOpenProfileSelector}
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} onShowTerms={() => setIsTermsModalOpen(true)} onShowPrivacy={() => setIsPrivacyModalOpen(true)} onShowEtica={() => setIsEticaModalOpen(true)} />
      {user?.role !== 'admin' && <ChatbotFab onClick={() => setIsChatbotOpen(true)} />}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        history={chatHistory}
        onSendMessage={handleSendChatMessage}
        isLoading={isChatbotLoading}
      />
      {isTermsModalOpen   && <TermsOfServiceModal  onClose={() => setIsTermsModalOpen(false)} />}
      {isPrivacyModalOpen && <PrivacyPolicyModal   onClose={() => setIsPrivacyModalOpen(false)} />}
      {isEticaModalOpen   && <EticaOABModal        onClose={() => setIsEticaModalOpen(false)} />}

      {/* ── Auth Modals ───────────────────────────────────────────────────── */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLogin}
        onNavigate={handleNavigate}
        pendingAction={loginPendingAction}
      />
      <ProfileSelectorModal
        isOpen={isProfileSelectorOpen}
        onClose={() => setIsProfileSelectorOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default App;
