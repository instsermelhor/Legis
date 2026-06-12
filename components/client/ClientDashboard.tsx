import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Message, Case, View } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { PaperAirplaneIcon, BriefcaseIcon, VideoCameraIcon, XIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { EfficiencyServicesPage } from './EfficiencyServicesPage';

// ─── New section components ────────────────────────────────────────────────────
import { ClientOverview } from './sections/ClientOverview';
import { ClientProfile } from './sections/ClientProfile';
import { ClientLawyerSearch } from './sections/ClientLawyerSearch';
import { ClientProcessTracker } from './sections/ClientProcessTracker';
import { ClientContracts } from './sections/ClientContracts';
import { ClientFinancial } from './sections/ClientFinancial';

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientTab =
  | 'overview'
  | 'perfil'
  | 'buscar'
  | 'efficiency_services'
  | 'processos'
  | 'contratos'
  | 'financeiro';

interface ClientDashboardProps {
  user: User;
  onUpdateLawyerReview: (lawyerId: number, caseId: string, rating: number, comment: string) => void;
  onNavigate?: (view: View) => void;
  onLogout?: () => void;
}

// ─── Sidebar menu config ───────────────────────────────────────────────────────

const MENU_ITEMS: { id: ClientTab; label: string; emoji: string; desc: string }[] = [
  { id: 'overview',           label: 'Visão Geral',          emoji: '🏠', desc: 'Meu Painel' },
  { id: 'perfil',             label: 'Meu Perfil',           emoji: '👤', desc: 'Dados & Triagem IA' },
  { id: 'buscar',             label: 'Buscar Advogados',     emoji: '🔍', desc: 'Encontrar Profissional' },
  { id: 'efficiency_services',label: 'Serviços',             emoji: '💼', desc: 'Catálogo de Soluções' },
  { id: 'processos',          label: 'Meus Processos',       emoji: '⚖️', desc: 'Rastreio por CPF' },
  { id: 'contratos',          label: 'Minhas Contratações',  emoji: '📋', desc: 'Contratos & Histórico' },
  { id: 'financeiro',         label: 'Financeiro',           emoji: '💳', desc: 'Faturas & Pagamentos' },
];

// ─── Fallback data ─────────────────────────────────────────────────────────────

const FALLBACK_LAWYER = mockLawyers[0];

const initialMessages: Message[] = [
  { id: 1, sender: 'lawyer', text: 'Olá! Recebi os detalhes do seu caso. Para começarmos, poderia me enviar a documentação que mencionei?', timestamp: '10:30', avatarUrl: FALLBACK_LAWYER.photoUrl },
  { id: 2, sender: 'client', text: 'Bom dia, Dr. Carlos. Sim, já estou com os documentos. Enviando em anexo.', timestamp: '10:32', avatarUrl: 'https://i.pravatar.cc/40?u=client' },
  { id: 3, sender: 'lawyer', text: 'Perfeito, recebi aqui. Vou analisar e te retorno em breve com os próximos passos.', timestamp: '10:35', avatarUrl: FALLBACK_LAWYER.photoUrl },
];

// ─── Inline upload types (kept for the Meu Advogado chat panel in overview) ───

interface UploadedDoc {
  name: string;
  type: 'PDF' | 'Imagem';
  size: string;
  date: string;
  caseId?: string;
  lawyerName?: string;
}

// ─── Floating Chat Panel ──────────────────────────────────────────────────────

interface FloatingChatProps {
  lawyer: typeof FALLBACK_LAWYER;
  messages: Message[];
  onSend: (e: React.FormEvent) => void;
  newMessage: string;
  onNewMessage: (v: string) => void;
  onClose: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const FloatingChat: React.FC<FloatingChatProps> = ({
  lawyer, messages, onSend, newMessage, onNewMessage, onClose, messagesEndRef,
}) => (
  <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-2xl flex flex-col h-[480px]">
    {/* Header */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#2A2545] bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
      <img src={lawyer.photoUrl} className="w-9 h-9 rounded-full border-2 border-white/30" alt="" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{lawyer.name}</p>
        <p className="text-[10px] text-white/70">Online agora</p>
      </div>
      <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
        <XIcon className="w-4 h-4 text-white" />
      </button>
    </div>

    {/* Messages */}
    <div className="flex-grow overflow-y-auto p-3 space-y-3">
      {messages.map(msg => (
        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'client' ? 'justify-end' : ''}`}>
          {msg.sender === 'lawyer' && (
            <img src={msg.avatarUrl} alt="" className="w-7 h-7 rounded-full shrink-0" />
          )}
          <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
            msg.sender === 'client'
              ? 'bg-purple-600 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}>
            <p>{msg.text}</p>
            <p className={`text-[10px] mt-0.5 text-right ${msg.sender === 'client' ? 'text-purple-200' : 'text-gray-400'}`}>
              {msg.timestamp}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div className="p-3 border-t border-gray-100 dark:border-[#2A2545]">
      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={newMessage}
          onChange={e => onNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 transition-colors"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user, onUpdateLawyerReview, onLogout,
}) => {
  // ── Navigation ──
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Chat (flutuante — disponível globalmente) ──
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Derived data ──
  const activeCase = user.caseHistory?.find(c => c.status === 'Ativo');
  const resolvedLawyer = useMemo(() => {
    if (activeCase?.lawyerId) {
      return mockLawyers.find(l => l.id === activeCase.lawyerId) || FALLBACK_LAWYER;
    }
    return FALLBACK_LAWYER;
  }, [activeCase]);

  const upcomingAppointment = useMemo(() => {
    if (!user.appointments) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return user.appointments
      .filter(apt => apt.status === 'Confirmado' && new Date(apt.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [user.appointments]);

  // ── User profile update ──
  const handleUpdateProfile = (updates: Partial<User>) => {
    try {
      const saved = localStorage.getItem('legis_user');
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem('legis_user', JSON.stringify({ ...current, ...updates }));
    } catch {}
  };

  const handleUpdateEmail = (newEmail: string) => {
    try {
      const saved = localStorage.getItem('legis_user');
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem('legis_user', JSON.stringify({ ...current, email: newEmail }));
    } catch {}
  };

  // ── Chat ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: messages.length + 1,
      sender: 'client',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      avatarUrl: 'https://i.pravatar.cc/40?u=client',
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // ── Sidebar item ──
  const NavItem: React.FC<{ item: typeof MENU_ITEMS[number] }> = ({ item }) => (
    <button
      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        activeTab === item.id
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <span className="text-xl shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${activeTab === item.id ? 'text-white' : ''}`}>
          {item.label}
        </p>
        <p className={`text-[10px] truncate ${activeTab === item.id ? 'text-purple-200' : 'text-gray-400'}`}>
          {item.desc}
        </p>
      </div>
      {activeTab === item.id && (
        <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
      )}
    </button>
  );

  // ── Sidebar ──
  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white dark:bg-[#1A1730] border-r border-gray-200 dark:border-[#2A2545] w-64 shrink-0">
      {/* Logo area */}
      <div className="px-5 py-6 border-b border-gray-100 dark:border-[#2A2545]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.name || 'Cliente'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        {/* Chat rápido com advogado */}
        {activeCase && (
          <button
            onClick={() => setShowChat(v => !v)}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors"
          >
            <span>💬</span>
            <span className="truncate">Chat com {resolvedLawyer.name.split(' ')[1]}</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="px-3 py-4 border-t border-gray-100 dark:border-[#2A2545]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-semibold">Sair</span>
          </button>
        </div>
      )}
    </aside>
  );

  // ── Section header ──
  const currentMenu = MENU_ITEMS.find(m => m.id === activeTab);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0C1E] overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1A1730] border-b border-gray-200 dark:border-[#2A2545] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">{currentMenu?.emoji}</span>
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{currentMenu?.label}</p>
          </div>
          {activeCase && (
            <button
              onClick={() => setShowChat(v => !v)}
              className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200 transition-colors relative"
            >
              <span className="text-lg">💬</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* ── VISÃO GERAL ── */}
          {activeTab === 'overview' && (
            <ClientOverview
              user={user}
              onGoToLawyer={() => setShowChat(true)}
              onGoToProcessos={() => setActiveTab('processos')}
              onGoToBuscar={() => setActiveTab('buscar')}
              onGoToServicos={() => setActiveTab('efficiency_services')}
            />
          )}

          {/* ── MEU PERFIL + TRIAGEM IA ── */}
          {activeTab === 'perfil' && (
            <ClientProfile
              user={user}
              onUpdateProfile={handleUpdateProfile}
              userEmail={user.email}
              onUpdateEmail={handleUpdateEmail}
            />
          )}

          {/* ── BUSCAR ADVOGADOS ── */}
          {activeTab === 'buscar' && (
            <ClientLawyerSearch
              userCity={undefined}
              userState={undefined}
              aiSuggestedArea={undefined}
            />
          )}

          {/* ── SERVIÇOS DE EFICIÊNCIA ── */}
          {activeTab === 'efficiency_services' && (
            <EfficiencyServicesPage embedded={true} />
          )}

          {/* ── MEUS PROCESSOS ── */}
          {activeTab === 'processos' && (
            <ClientProcessTracker
              user={user}
              onUpdateLawyerReview={onUpdateLawyerReview}
            />
          )}

          {/* ── MINHAS CONTRATAÇÕES ── */}
          {activeTab === 'contratos' && (
            <ClientContracts user={user} />
          )}

          {/* ── FINANCEIRO ── */}
          {activeTab === 'financeiro' && (
            <ClientFinancial />
          )}

        </main>
      </div>

      {/* ── Floating Chat ── */}
      {showChat && (
        <FloatingChat
          lawyer={resolvedLawyer}
          messages={messages}
          onSend={handleSendMessage}
          newMessage={newMessage}
          onNewMessage={setNewMessage}
          onClose={() => setShowChat(false)}
          messagesEndRef={messagesEndRef}
        />
      )}
    </div>
  );
};