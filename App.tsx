import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChange, signOut as supabaseSignOut, isSupabaseConfigured } from './lib/auth';
// ── Layout (carregado de imediato — sempre visível) ────────────────────────
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LgpdConsentBanner } from './components/common/LgpdConsentBanner';
import { LoginModal } from './components/common/LoginModal';
import { ProfileSelectorModal } from './components/common/ProfileSelectorModal';

// ── Rotas públicas (ISS-024: lazy loaded) ─────────────────────────────────
const LandingPage          = lazy(() => import('./components/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LawyerSearch         = lazy(() => import('./components/search/LawyerSearch').then(m => ({ default: m.LawyerSearch })));
const LawyerProfile        = lazy(() => import('./components/lawyer/LawyerProfile').then(m => ({ default: m.LawyerProfile })));
const ForLawyersPage       = lazy(() => import('./components/lawyer/ForLawyersPage').then(m => ({ default: m.ForLawyersPage })));
const ForInternsPage       = lazy(() => import('./components/intern/ForInternsPage').then(m => ({ default: m.ForInternsPage })));
const ForClientsPage       = lazy(() => import('./components/client/ForClientsPage').then(m => ({ default: m.ForClientsPage })));
const ForSecretariadoPage  = lazy(() => import('./components/secretary/ForSecretariadoPage').then(m => ({ default: m.ForSecretariadoPage })));
const ServicesPublicPage   = lazy(() => import('./components/public/ServicesPublicPage').then(m => ({ default: m.ServicesPublicPage })));
const EfficiencyServicesPage = lazy(() => import('./components/client/EfficiencyServicesPage').then(m => ({ default: m.EfficiencyServicesPage })));

// ── Dashboards autenticados (lazy loaded) ──────────────────────────────────
const AdminDashboard       = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ClientDashboard      = lazy(() => import('./components/client/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const LawyerDashboard      = lazy(() => import('./components/lawyer/LawyerDashboard').then(m => ({ default: m.LawyerDashboard })));
const InternDashboard      = lazy(() => import('./components/intern/InternDashboard').then(m => ({ default: m.InternDashboard })));
const SecretariadoDashboard = lazy(() => import('./components/secretary/SecretariadoDashboard').then(m => ({ default: m.SecretariadoDashboard })));
const CompleteProfilePage  = lazy(() => import('./components/client/CompleteProfilePage').then(m => ({ default: m.CompleteProfilePage })));

// ── Fluxos de auth (lazy loaded) ────────────────────────────────────────────────────
const LoginForm            = lazy(() => import('./components/auth/LoginForm').then(m => ({ default: m.LoginForm })));
const SignupPage           = lazy(() => import('./components/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const AdminLoginPage       = lazy(() => import('./components/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const ForcePasswordChangePage = lazy(() => import('./components/auth/ForcePasswordChangePage').then(m => ({ default: m.ForcePasswordChangePage })));
const MfaSetupPage         = lazy(() => import('./components/auth/MfaSetupPage').then(m => ({ default: m.MfaSetupPage })));
const MfaChallengePage     = lazy(() => import('./components/auth/MfaChallengePage').then(m => ({ default: m.MfaChallengePage })));
const SuperAdminDashboard  = lazy(() => import('./components/admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const DelegationManager    = lazy(() => import('./components/admin/DelegationManager').then(m => ({ default: m.DelegationManager })));
const MyAdminProfile       = lazy(() => import('./components/admin/MyAdminProfile').then(m => ({ default: m.MyAdminProfile })));

// ── Modais globais (lazy loaded) ───────────────────────────────────────────
const TermsOfServiceModal  = lazy(() => import('./components/common/TermsOfServiceModal').then(m => ({ default: m.TermsOfServiceModal })));
const PrivacyPolicyModal   = lazy(() => import('./components/common/PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })));
const EticaOABModal        = lazy(() => import('./components/common/EticaOABModal').then(m => ({ default: m.EticaOABModal })));
const ChatbotFab           = lazy(() => import('./components/chatbot/ChatbotFab').then(m => ({ default: m.ChatbotFab })));
const ChatbotModal         = lazy(() => import('./components/chatbot/ChatbotModal').then(m => ({ default: m.ChatbotModal })));

// ── Skeleton de página para Suspense ──────────────────────────────────────
const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
    <div className="h-16 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800" />
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl w-1/2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

import type { View, Lawyer, Intern, Secretary, ChatMessage, User, Case, Appointment, Review, MapsSearchResult } from './types';
import type { Credentials } from './components/auth/LoginForm';
import type { ClientSignupData } from './components/auth/ClientSignupForm';
import type { InternSignupData } from './components/auth/InternSignupForm';
import type { SecretarySignupData } from './components/secretary/SecretariadoSignupForm';
import { AdminUser } from './services/mockDataService';
import { StaffService } from './services/staffService';
import { useAppData } from './context/AppDataContext';
import { initMonitoring } from './lib/monitoring';
import { chatWithGemini } from './services/geminiService';

const TEST_EMAIL = 'teste@legisconnect.com.br';
const TEST_PASSWORD = 'teste';


const App: React.FC = () => {
  // ── Dados compartilhados com o painel admin via AppDataContext ──
  const { lawyers: allLawyers, addLawyer, updateLawyer } = useAppData();

  const [currentView, setCurrentView] = useState<View>(() => {
    // Detecta acesso via subdomínio admin (?adminLogin=1) — redireciona para login admin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('adminLogin') === '1') {
      // Remove o param da URL sem reload (history API)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return 'adminLogin';
    }
    const savedView = localStorage.getItem('legis_currentView') as View | null;
    const savedUser = localStorage.getItem('legis_user');
    const parsedUser = savedUser ? (() => { try { return JSON.parse(savedUser); } catch { return null; } })() : null;
    if (savedView === 'adminDashboard' && parsedUser?.role !== 'admin' && parsedUser?.role !== 'super_admin') return 'landing';
    if (savedView === 'superAdminDashboard' && parsedUser?.role !== 'super_admin') return 'landing';
    if (savedView === 'lawyerDashboard' && parsedUser?.role !== 'lawyer') return 'landing';
    if (savedView === 'internDashboard' && parsedUser?.role !== 'intern') return 'landing';
    if (savedView === 'secretariadoDashboard' && parsedUser?.role !== 'secretary') return 'landing';
    if (savedView === 'dashboard' && !parsedUser) return 'landing';
    // Protege views super admin
    if (['forcePasswordChange','mfaSetup','mfaChallenge','delegationManager','myAdminProfile'].includes(savedView || '') && !parsedUser) return 'landing';
    return savedView || 'landing';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('legis_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [searchResults, setSearchResults] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
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

  // ── Supabase Auth: sincroniza sessão real quando configurado ─────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsubscribe = onAuthStateChange((authProfile) => {
    if (authProfile) {
        const supaUser: User = {
          email: authProfile.email,
          name: authProfile.name,
          role: authProfile.role as User['role'],
          id: authProfile.id,
        };
        setUser(supaUser);
        // Navega para o dashboard correto baseado no role
        if (authProfile.role === 'lawyer') handleNavigate('lawyerDashboard', supaUser);
        else if (authProfile.role === 'admin') handleNavigate('adminDashboard', supaUser);
        else if (authProfile.role === 'super_admin') handleNavigate('superAdminDashboard', supaUser);
        else if (authProfile.role === 'intern') handleNavigate('internDashboard', supaUser);
        else if (authProfile.role === 'secretary') handleNavigate('secretariadoDashboard', supaUser);
        else handleNavigate('dashboard', supaUser);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ISS-031: Ativar monitoramento de produção (Sentry + Web Vitals)
  useEffect(() => {
    initMonitoring();
  }, []);

  // Seed seguro do Super Admin Universal (sem credenciais hardcoded)
  // A senha "teste" é hasheada em runtime via PBKDF2v2 (310k iter) — nunca em texto puro
  useEffect(() => {
    StaffService.initialize();
    StaffService.seedSuperAdmins().catch(e =>
      console.error('[Legis] Erro ao inicializar Super Admin:', e)
    );
    // Limpa o sistema legado de admin users (substituiído pelo StaffService)
    // Não removemos legis_admin_users para compatibilidade durante migração
  }, []);

  // Capture autocadastro token from URL on app load and redirect to signup
  useEffect(() => {
    const href = window.location.href;
    const isAutoCadastro = href.includes('/autocadastro/') || href.includes('?/autocadastro/');
    if (isAutoCadastro) {
      const tokenMatch = href.match(/(?:autocadastro\/)(LEGIS-[A-Z0-9]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        console.log("Landed via auto-registration token:", token);
        setCurrentView('signup');
        sessionStorage.setItem('legis_autocadastro_token', token);
      }
    }
  }, []);

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
    window.scrollTo(0, 0);
    const activeUser = overrideUser !== undefined ? overrideUser : user;
    // Rotas protegidas
    if (view === 'adminDashboard' && activeUser?.role !== 'admin' && activeUser?.role !== 'super_admin') {
      setCurrentView('login');
      return;
    }
    if (view === 'superAdminDashboard' && activeUser?.role !== 'super_admin') {
      setCurrentView('adminLogin');
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

  const handleLogin = useCallback((credentials: Credentials): boolean => {
    const { email, password } = credentials;
    const lowerEmail = email.toLowerCase();

    // Admin/Staff login usando StaffService centralizado
    const staff = StaffService.findByEmail(lowerEmail);
    if (staff && staff.active) {
      const authenticatedStaff = StaffService.authenticate(lowerEmail, password || '');
      if (authenticatedStaff) {
        const userRole: User['role'] = (staff.role === 'super_admin' ? 'super_admin' : 'admin');
        const adminUser: User = { email: lowerEmail, role: userRole, name: staff.name };
        setUser(adminUser);
        if (staff.role === 'super_admin') {
          handleNavigate('superAdminDashboard', adminUser);
        } else {
          handleNavigate('adminDashboard', adminUser);
        }
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

    // After successful login via modal, any pending service intent in
    // sessionStorage will be processed by the dashboard component on mount.
    return false;
  }, [allLawyers, handleNavigate]);

  // Open login modal (optionally with a pending action context)
  const handleOpenLoginModal = (pendingAction?: { type: 'service'; label: string }) => {
    setLoginPendingAction(pendingAction || null);
    setIsLoginModalOpen(true);
  };

  const handleOpenProfileSelector = () => {
    setIsProfileSelectorOpen(true);
  };

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

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabaseSignOut();
    }
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
      socialLinks: data.socialLinks,
    };
    setUser(clientUser);
    handleNavigate('dashboard', clientUser);
  }

  const handleLawyerSignup = (data: Partial<Lawyer>) => {
    const newLawyer: Lawyer = {
      // Use max ID to prevent collision if lawyers were removed
      id: allLawyers.length > 0 ? Math.max(...allLawyers.map(l => l.id)) + 1 : 1,
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
    // Adicionar ao contexto compartilhado (persiste no localStorage automaticamente)
    addLawyer(newLawyer);
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
      socialLinks: data.socialLinks,
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
      socialLinks: data.socialLinks,
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
    const targetLawyer = allLawyers.find(l => l.id === lawyerId);
    if (targetLawyer) {
      const newReview: Review = {
        id: targetLawyer.reviews.length + 1,
        clientName: user?.name || 'Anônimo',
        rating,
        comment,
        date: new Date().toLocaleDateString('pt-BR'),
      };
      const updatedReviews = [...targetLawyer.reviews, newReview];
      const newAverageRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
      updateLawyer({
        ...targetLawyer,
        reviews: updatedReviews,
        rating: parseFloat(newAverageRating.toFixed(1)),
        reviewCount: updatedReviews.length,
      });
    }

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
        return currentLawyerData ? <LawyerProfile lawyer={currentLawyerData} onBack={handleBackToSearch} onNavigate={handleNavigate} /> : <LandingPage onNavigate={handleNavigate} onSearch={handleSearch} onShowEtica={() => setIsEticaModalOpen(true)} />;
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
      case 'superAdminDashboard':
        return (user?.role === 'super_admin' || user?.role === 'admin')
          ? <SuperAdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} user={user} />
          : <AdminLoginPage onLogin={handleLogin} onBackToSite={() => setCurrentView('landing')} />;
      case 'forcePasswordChange':
        return <ForcePasswordChangePage onPasswordChanged={() => {
          handleLogout();
          setCurrentView('adminLogin');
        }} onCancel={() => setCurrentView('adminLogin')} />;
      case 'mfaSetup':
        return <MfaSetupPage onSetupComplete={() => setCurrentView('superAdminDashboard')} onSkip={() => setCurrentView('superAdminDashboard')} />;
      case 'mfaChallenge':
        return <MfaChallengePage onVerified={() => setCurrentView(user?.role === 'super_admin' ? 'superAdminDashboard' : 'adminDashboard')} onCancel={() => setCurrentView('adminLogin')} />;
      case 'delegationManager':
        return (user?.role === 'super_admin' || user?.role === 'admin')
          ? <DelegationManager onNavigate={handleNavigate} onBack={() => setCurrentView('superAdminDashboard')} />
          : <AdminLoginPage onLogin={handleLogin} onBackToSite={() => setCurrentView('landing')} />;
      case 'myAdminProfile':
        return (user?.role === 'super_admin' || user?.role === 'admin')
          ? <MyAdminProfile onNavigate={handleNavigate} onBack={() => setCurrentView(user?.role === 'super_admin' ? 'superAdminDashboard' : 'adminDashboard')} user={user} />
          : <AdminLoginPage onLogin={handleLogin} onBackToSite={() => setCurrentView('landing')} />;
      case 'adminLogin':
        return (
          <AdminLoginPage
            onLogin={handleLogin}
            onNavigate={handleNavigate}
            onBackToSite={() => setCurrentView('landing')}
          />
        );
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
        return <LandingPage onNavigate={handleNavigate} onSearch={handleSearch} onShowEtica={() => setIsEticaModalOpen(true)} />;
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
        <Suspense fallback={<PageSkeleton />}>
          {renderView()}
        </Suspense>
      </main>
      <Footer onNavigate={handleNavigate} onShowTerms={() => setIsTermsModalOpen(true)} onShowPrivacy={() => setIsPrivacyModalOpen(true)} onShowEtica={() => setIsEticaModalOpen(true)} />
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} user={user} />
      <Suspense fallback={null}>
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
      </Suspense>

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

      {/* ISS-034: Banner LGPD Art. 8 — Consentimento de Cookies */}
      <LgpdConsentBanner onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
    </div>
  );
};

export default App;
