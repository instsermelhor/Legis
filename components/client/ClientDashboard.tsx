import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Message, Case, View } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { PaperAirplaneIcon, BriefcaseIcon, VideoCameraIcon, XIcon } from '../common/IconComponents';
import { DashboardShell, type ShellNavGroup } from '../ui';
import { backend } from '../../services/modules';
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
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#2A2545] bg-gradient-to-r from-violet-600 to-violet-800 rounded-t-2xl">
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
              ? 'bg-violet-600 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}>
            <p>{msg.text}</p>
            <p className={`text-[10px] mt-0.5 text-right ${msg.sender === 'client' ? 'text-violet-200' : 'text-gray-400'}`}>
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
          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors"
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

  // ── Chat (flutuante — persistido no módulo backend.chat) ──
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
    // Persiste via módulo backend.chat (entidades Chat/Mensagens do diagrama)
    const chat = backend.chat.getOrCreate(`cliente_${user.email}`, `advogado_${resolvedLawyer.id}`);
    backend.chat.enviar(chat.id, `cliente_${user.email}`, newMessage);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // ── Navegação (DashboardShell — identidade unificada) ──
  const navGroups: ShellNavGroup<ClientTab>[] = [
    {
      title: 'Meu Painel',
      items: MENU_ITEMS.slice(0, 2).map(m => ({ id: m.id, label: m.label, icon: m.emoji })),
    },
    {
      title: 'Contratação & Serviços',
      items: MENU_ITEMS.slice(2, 4).map(m => ({ id: m.id, label: m.label, icon: m.emoji })),
    },
    {
      title: 'Acompanhamento',
      items: MENU_ITEMS.slice(4).map(m => ({ id: m.id, label: m.label, icon: m.emoji })),
    },
  ];

  const chatSidebarButton = activeCase ? (
    <button
      onClick={() => setShowChat(v => !v)}
      className="mb-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
    >
      <span>💬</span>
      <span className="truncate">Chat com {resolvedLawyer.name.split(' ')[1]}</span>
      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
    </button>
  ) : undefined;

  return (
    <>
      <DashboardShell<ClientTab>
        userName={user.name || 'Cliente'}
        panelLabel="Painel do Cliente"
        groups={navGroups}
        active={activeTab}
        onSelect={setActiveTab}
        onLogout={onLogout}
        sidebarExtra={chatSidebarButton}
      >
        <div className="animate-fade-in">

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

        </div>
      </DashboardShell>

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
    </>
  );
};