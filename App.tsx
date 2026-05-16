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
import { ChatbotFab } from './components/chatbot/ChatbotFab';
import { ChatbotModal } from './components/chatbot/ChatbotModal';
import { TermsOfServiceModal } from './components/common/TermsOfServiceModal';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { EticaOABModal } from './components/common/EticaOABModal';
import { chatWithGemini } from './services/geminiService';
import type { View, Lawyer, Intern, ChatMessage, User, Case, Appointment, Review, MapsSearchResult } from './types';
import { mockLawyers } from './services/mockLawyerService';

const ADMIN_EMAIL = 'admin@legisconnect.com.br';
const ADMIN_PASSWORD = 'legisadmin';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('legis_currentView');
    return (saved as View) || 'landing';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('legis_user');
    return saved ? JSON.parse(saved) : null;
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isEticaModalOpen, setIsEticaModalOpen] = useState(false);


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

  const handleNavigate = useCallback((view: View) => {
    // Protected routes
    if (view === 'adminDashboard' && user?.role !== 'admin') {
      setCurrentView('login');
      return;
    }
    if (view === 'dashboard') {
      if (!user) {
        setCurrentView('login');
        return;
      } else if (user.role === 'lawyer') {
        setCurrentView('lawyerDashboard');
      } else if (user.role === 'intern') {
        setCurrentView('internDashboard');
      } else if (user.role === 'client') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
      return;
    }
    if (view === 'lawyerDashboard' && user?.role !== 'lawyer') {
      setCurrentView('forLawyers');
      return;
    }
    if (view === 'internDashboard' && user?.role !== 'intern') {
      setCurrentView('forInterns');
      return;
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, [user]);

  const handleLogin = useCallback((credentials: Credentials): boolean => {
    const { email, password } = credentials;
    const lowerEmail = email.toLowerCase();

    // Admin login
    if (lowerEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({ email: lowerEmail, role: 'admin', name: 'Administrador' });
      handleNavigate('adminDashboard');
      return true;
    }

    // Lawyer login
    const lawyer = allLawyers.find(l => l.contact.email.toLowerCase() === lowerEmail);
    if (lawyer) {
      // Dummy password check for mock data
      if (password) {
        setUser({ email: lowerEmail, role: 'lawyer', data: lawyer, name: lawyer.name });
        handleNavigate('lawyerDashboard');
        return true;
      }
      return false;
    }

    // Test user with incomplete profile
    if (lowerEmail === 'incomplete@legisconnect.com' && password === 'password') {
      setUser({
        email: lowerEmail,
        role: 'client',
        name: 'Cliente Incompleto',
        // Phone and address are missing
      });
      handleNavigate('dashboard');
      return true;
    }

    // Client login (any other email)
    if (password) { // Dummy password check for mock data
      const mockCases: Case[] = [
        {
          id: 'case001',
          title: 'Processo de Divórcio Consensual',
          clientName: 'Cliente Exemplo',
          lawyerName: mockLawyers[0].name,
          lawyerId: mockLawyers[0].id,
          status: 'Ativo',
          stages: [
            { name: 'Análise Inicial', status: 'completed' },
            { name: 'Coleta de Documentos', status: 'completed' },
            { name: 'Elaboração da Petição', status: 'current' },
            { name: 'Protocolo Judicial', status: 'upcoming' },
            { name: 'Sentença', status: 'upcoming' },
          ],
          reviewSubmitted: false,
        },
        {
          id: 'case002',
          title: 'Ação de Alimentos',
          clientName: 'Cliente Exemplo',
          lawyerName: mockLawyers[1].name,
          lawyerId: mockLawyers[1].id,
          status: 'Concluído',
          stages: [
            { name: 'Análise Inicial', status: 'completed' },
            { name: 'Petição Inicial', status: 'completed' },
            { name: 'Audiência', status: 'completed' },
            { name: 'Sentença', status: 'completed' },
          ],
          reviewSubmitted: false,
        }
      ];

      const mockAppointments: Appointment[] = [
        {
          id: 'apt-client-1',
          clientName: 'Cliente Exemplo',
          date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // 3 days from now
          time: '15:00',
          status: 'Confirmado',
          modality: 'Videochamada',
          consultationLink: 'https://meet.legisconnect.com/call/aghadf8923',
        },
        {
          id: 'apt-client-2',
          clientName: 'Cliente Exemplo',
          date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], // 5 days ago
          time: '11:00',
          status: 'Concluído',
          modality: 'Videochamada',
        }
      ];
      setUser({
        email: lowerEmail,
        role: 'client',
        name: 'Cliente Exemplo',
        phone: '(11) 91234-5678',
        address: 'Rua das Amostras, 123, São Paulo, SP',
        caseHistory: mockCases,
        appointments: mockAppointments
      });
      handleNavigate('dashboard');
      return true;
    }

    return false;
  }, [allLawyers, handleNavigate]);

  const handleLogout = useCallback(() => {
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

  const handleClientSignup = (data: ClientSignupData) => {
    console.log("New client signup:", data);
    setUser({
      email: data.email,
      role: 'client',
      name: data.name,
      phone: data.phone,
      address: data.address,
      caseHistory: [],
    });
    handleNavigate('dashboard');
  }

  const handleLawyerSignup = (data: Partial<Lawyer>) => {
    const newLawyer: Lawyer = {
      id: allLawyers.length + 1,
      name: data.name || 'Novo Advogado',
      oab: data.oab || 'XX000000',
      specialties: data.specialties || ['Direito Civil'],
      location: { city: 'Cidade', state: data.oabUF || 'SP' },
      photoUrl: 'https://picsum.photos/seed/newlawyer/400/400',
      rating: 0,
      reviewCount: 0,
      bio: 'Advogado recém-cadastrado na plataforma Legis Connect.',
      experience: { years: 1, cases: 0 },
      education: [],
      contact: { phone: data.contact?.phone || '', email: data.contact?.email || '' },
      reviews: [],
      availability: [],
      status: 'pendente',
      ...data,
    };
    setAllLawyers(prev => [...prev, newLawyer]);
    console.log("New lawyer signup:", newLawyer);
    setUser({ email: newLawyer.contact.email, role: 'lawyer', data: newLawyer, name: newLawyer.name });
    handleNavigate('lawyerDashboard');
    return true;
  }

  const handleInternSignup = (data: InternSignupData) => {
    const newIntern: Intern = {
      id: Math.floor(Math.random() * 10000),
      name: data.name || 'Estudante',
      cpf: data.cpf || '000.000.000-00',
      university: data.university || 'Universidade',
      semester: data.semester || '1º ao 3º semestre',
      specialtyInterest: data.specialtyInterest || 'Não definida',
      contact: { phone: data.contact?.phone || '', email: data.contact?.email || '' },
      hoursCompleted: 0,
      availableHours: 200,
      casesStudied: [],
      status: 'active',
    };
    console.log("New intern signup:", newIntern);
    setUser({ email: newIntern.contact.email, role: 'intern', data: newIntern, name: newIntern.name });
    handleNavigate('internDashboard');
    return true;
  }

  const handleUpdateProfile = (data: { name: string; phone: string; address: string; }) => {
    if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
      handleNavigate('dashboard'); // Navigate to dashboard after update
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
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatbotLoading(true);

    try {
      const responseText = await chatWithGemini(chatHistory, message);
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
        return user ? <ClientDashboard user={user} onUpdateLawyerReview={handleUpdateLawyerReview} /> : <LoginForm onLogin={handleLogin} />;
      case 'lawyerDashboard':
        return user?.data ? <LawyerDashboard lawyer={user.data} /> : <ForLawyersPage onLogin={handleLogin} onSignup={handleLawyerSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'adminDashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'login':
        return <LoginForm onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage onClientSignup={handleClientSignup} onNavigate={handleNavigate} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forLawyers':
        return <ForLawyersPage onLogin={handleLogin} onSignup={handleLawyerSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forInterns':
        return <ForInternsPage onLogin={handleLogin} onSignup={handleInternSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'forClients':
        return <ForClientsPage onLogin={handleLogin} onSignup={handleClientSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'internDashboard':
        return user?.data && user.role === 'intern' ? <InternDashboard intern={user.data as Intern} /> : <ForInternsPage onLogin={handleLogin} onSignup={handleInternSignup} onShowTerms={() => setIsTermsModalOpen(true)} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} onSearch={handleSearch} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light font-sans">
      <Header currentView={currentView} onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
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
      {isTermsModalOpen && <TermsOfServiceModal onClose={() => setIsTermsModalOpen(false)} />}
      {isPrivacyModalOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />}
      {isEticaModalOpen && <EticaOABModal onClose={() => setIsEticaModalOpen(false)} />}
    </div>
  );
};

export default App;
