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
import { hashPassword } from './services/mockDataService';

const ADMIN_EMAIL = 'admin@legisconnect.com.br';
const ADMIN_PASSWORD = 'admin';
const TEST_EMAIL = 'teste@legisconnect.com.br';
const TEST_PASSWORD = 'teste';


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

  const handleNavigate = useCallback((view: View, overrideUser?: User | null) => {
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
    window.scrollTo(0, 0);
  }, [user]);

  const handleLogin = useCallback((credentials: Credentials): boolean => {
    const { email, password } = credentials;
    const lowerEmail = email.toLowerCase();

    // Admin login using localStorage list
    const savedAdminUsersRaw = localStorage.getItem('legis_admin_users');
    const adminUsersList = savedAdminUsersRaw ? JSON.parse(savedAdminUsersRaw) : [
      { id: 1, name: 'Super Admin', email: 'admin@legisconnect.com.br', password: hashPassword('admin'), role: 'super', createdAt: '2024-01-01', active: true }
    ];

    const matchedAdmin = adminUsersList.find((u: any) => u.email.toLowerCase() === lowerEmail);
    if (matchedAdmin) {
      if (matchedAdmin.password === hashPassword(password || '')) {
        if (!matchedAdmin.active) {
          // User is inactive, login fails
          return false;
        }
        const adminUser: User = { email: lowerEmail, role: 'admin', name: matchedAdmin.name };
        setUser(adminUser);
        handleNavigate('adminDashboard', adminUser);
        return true;
      }
      return false;
    }

    // Lawyer login
    const lawyer = allLawyers.find(l => l.contact.email.toLowerCase() === lowerEmail);
    if (lawyer) {
      // Dummy password check for mock data
      if (password) {
        const lawyerUser: User = { email: lowerEmail, role: 'lawyer', data: lawyer, name: lawyer.name };
        setUser(lawyerUser);
        handleNavigate('lawyerDashboard', lawyerUser);
        return true;
      }
      return false;
    }

    // Test user with incomplete profile
    if (lowerEmail === 'incomplete@legisconnect.com' && password === 'password') {
      const incompleteUser: User = {
        email: lowerEmail,
        role: 'client',
        name: 'Cliente Incompleto',
        // Phone and address are missing
      };
      setUser(incompleteUser);
      handleNavigate('dashboard', incompleteUser);
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
      const clientUser: User = {
        email: lowerEmail,
        role: 'client',
        name: 'Cliente Exemplo',
        phone: '(11) 91234-5678',
        address: 'Rua das Amostras, 123, São Paulo, SP',
        caseHistory: mockCases,
        appointments: mockAppointments
      };
      setUser(clientUser);
      handleNavigate('dashboard', clientUser);
      return true;
    }

    return false;
  }, [allLawyers, handleNavigate]);

  // Context-specific login for Lawyers page: test user gets Lawyer Dashboard
  const handleLawyerPageLogin = useCallback((credentials: Credentials): boolean => {
    const lowerEmail = credentials.email.toLowerCase();
    if (lowerEmail === TEST_EMAIL && credentials.password === TEST_PASSWORD) {
      const testLawyer = { ...mockLawyers[0], contact: { ...mockLawyers[0].contact, email: TEST_EMAIL }, name: 'Advogado Teste' };
      const lawyerUser: User = { email: TEST_EMAIL, role: 'lawyer', data: testLawyer, name: testLawyer.name };
      setUser(lawyerUser);
      handleNavigate('lawyerDashboard', lawyerUser);
      return true;
    }
    return handleLogin(credentials);
  }, [handleLogin, handleNavigate]);

  // Context-specific login for Interns page: test user gets Intern Dashboard
  const handleInternPageLogin = useCallback((credentials: Credentials): boolean => {
    const lowerEmail = credentials.email.toLowerCase();
    if (lowerEmail === TEST_EMAIL && credentials.password === TEST_PASSWORD) {
      const testIntern: Intern = {
        id: 9999,
        name: 'Bacharelando Teste',
        cpf: '000.000.000-00',
        university: 'Universidade Legis Connect',
        semester: '5º ao 7º semestre',
        specialtyInterest: 'Direito Civil',
        contact: { phone: '(11) 99999-9999', email: TEST_EMAIL },
        hoursCompleted: 85,
        availableHours: 200,
        casesStudied: [],
        status: 'active',
      };
      const internUser: User = { email: TEST_EMAIL, role: 'intern', data: testIntern, name: testIntern.name };
      setUser(internUser);
      handleNavigate('internDashboard', internUser);
      return true;
    }
    return handleLogin(credentials);
  }, [handleLogin, handleNavigate]);

  // Context-specific login for Clients page: test user gets Client Dashboard
  const handleClientPageLogin = useCallback((credentials: Credentials): boolean => {
    const lowerEmail = credentials.email.toLowerCase();
    if (lowerEmail === TEST_EMAIL && credentials.password === TEST_PASSWORD) {
      const mockCases: Case[] = [
        {
          id: 'TEST-2024-001',
          title: 'Processo de Divórcio Consensual (Teste)',
          clientName: 'Cliente Teste',
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
      ];
      const mockAppointments: Appointment[] = [
        {
          id: 'apt-test-1',
          clientName: 'Cliente Teste',
          date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
          time: '14:00',
          status: 'Confirmado',
          modality: 'Videochamada',
          consultationLink: 'https://meet.legisconnect.com/call/teste123',
        },
      ];
      const clientUser: User = {
        email: TEST_EMAIL,
        role: 'client',
        name: 'Cliente Teste',
        phone: '(11) 98765-4321',
        address: 'Av. Legis Connect, 1000, São Paulo, SP',
        caseHistory: mockCases,
        appointments: mockAppointments,
      };
      setUser(clientUser);
      handleNavigate('dashboard', clientUser);
      return true;
    }
    return handleLogin(credentials);
  }, [handleLogin, handleNavigate]);

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
    const clientUser: User = {
      email: data.email,
      role: 'client',
      name: data.name,
      phone: data.phone,
      address: data.address,
      caseHistory: [],
    };
    setUser(clientUser);
    handleNavigate('dashboard', clientUser);
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
    const lawyerUser: User = { email: newLawyer.contact.email, role: 'lawyer', data: newLawyer, name: newLawyer.name };
    setUser(lawyerUser);
    handleNavigate('lawyerDashboard', lawyerUser);
    return true;
  }

  const handleInternSignup = (data: InternSignupData) => {
    const newIntern: Intern = {
      id: Math.floor(Math.random() * 10000),
      name: data.name || 'Bacharelando',
      cpf: data.cpf || '000.000.000-00',
      university: data.university || 'Universidade',
      semester: data.semester || '1º ao 3º semestre',
      specialtyInterest: data.specialtyInterest || 'Não definida',
      contact: { phone: data.contact?.phone || '', email: data.contact?.email || '' },
      hoursCompleted: 0,
      availableHours: 200,
      casesStudied: [],
      status: 'active',
      // Address fields
      address: data.address,
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      // Foreigner fields
      isForeigner: data.isForeigner,
      foreignerDocument: data.foreignerDocument,
      countryOfOrigin: data.countryOfOrigin,
      timeInBrazil: data.timeInBrazil,
    };
    console.log('New intern signup:', newIntern);
    const internUser: User = { email: newIntern.contact.email, role: 'intern', data: newIntern, name: newIntern.name };
    setUser(internUser);
    handleNavigate('internDashboard', internUser);
    return true;
  }

  // Secretary login
  const handleSecretaryPageLogin = useCallback((credentials: Credentials): boolean => {
    const lowerEmail = credentials.email.toLowerCase();
    if (lowerEmail === TEST_EMAIL && credentials.password === TEST_PASSWORD) {
      const testSecretary: Secretary = {
        id: 9998,
        name: 'Secretária Teste',
        email: TEST_EMAIL,
        phone: '(11) 98888-0000',
        city: 'São Paulo',
        state: 'SP',
        experience: 4,
        areasOfKnowledge: ['Gestão de Agenda', 'Protocolo Judicial', 'Atendimento ao Cliente'],
        availability: 'integral',
        bio: 'Secretária com experiência em escritórios jurídicos de médio porte.',
        status: 'ativo',
        joinedDate: new Date().toISOString().split('T')[0],
        assignedLawyerId: 1, // assigned to first mock lawyer
      };
      const secretaryUser: User = { email: TEST_EMAIL, role: 'secretary', data: testSecretary, name: testSecretary.name };
      setUser(secretaryUser);
      handleNavigate('secretariadoDashboard', secretaryUser);
      return true;
    }
    return handleLogin(credentials);
  }, [handleLogin, handleNavigate]);

  // Secretary signup
  const handleSecretarySignup = (data: SecretarySignupData) => {
    const newSecretary: Secretary = {
      id: Math.floor(Math.random() * 10000),
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      rg: data.rg,
      city: data.city,
      state: data.state,
      address: data.address,
      experience: data.experience,
      areasOfKnowledge: data.areasOfKnowledge,
      availability: data.availability,
      bio: data.bio,
      status: 'pendente',
      joinedDate: new Date().toISOString().split('T')[0],
      isForeigner: data.isForeigner,
      foreignerDocument: data.foreignerDocument,
      countryOfOrigin: data.countryOfOrigin,
      timeInBrazil: data.timeInBrazil,
    };
    console.log('New secretary signup:', newSecretary);
    const secretaryUser: User = { email: newSecretary.email, role: 'secretary', data: newSecretary, name: newSecretary.name };
    setUser(secretaryUser);
    handleNavigate('secretariadoDashboard', secretaryUser);
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
        return <EfficiencyServicesPage />;
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
