import React, { useState, useRef, useEffect } from 'react';
import type { User, Message, Lawyer, View } from '../../types';
import { advogadoParaLawyer } from '../../services/modules/pessoas/adaptador';

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
  lawyer: Lawyer;
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

  // ── Chat (flutuante — persistido no PostgreSQL via API) ──
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Advogado do caso ativo, resolvido na API ──
  const activeCase = user.caseHistory?.find(c => c.status === 'Ativo');
  const [resolvedLawyer, setResolvedLawyer] = useState<Lawyer | null>(null);

  useEffect(() => {
    if (activeCase?.lawyerId) {
      backend.pessoas.advogados.obter(activeCase.lawyerId)
        .then(a => setResolvedLawyer(advogadoParaLawyer(a)))
        .catch(() => setResolvedLawyer(null));
    } else {
      setResolvedLawyer(null);
    }
  }, [activeCase?.lawyerId]);

  // Historico real do chat quando o painel abre.
  useEffect(() => {
    if (!showChat || !resolvedLawyer) return;
    backend.chat.abrirCom(resolvedLawyer.id)
      .then(chat => backend.chat.mensagens(chat.id))
      .then(ms => setMessages(ms.map(m => ({
        id: m.id,
        sender: m.pessoa_id === resolvedLawyer.id ? 'lawyer' as const : 'client' as const,
        text: m.texto,
        timestamp: new Date(m.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        avatarUrl: m.pessoa_id === resolvedLawyer.id ? resolvedLawyer.photoUrl : 'https://i.pravatar.cc/40?u=client',
      }))))
      .catch(() => {});
  }, [showChat, resolvedLawyer]);

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
    // Persiste no PostgreSQL via API (entidades Chat/Mensagens do diagrama)
    if (resolvedLawyer) void backend.chat.enviarPara(resolvedLawyer.id, newMessage).catch(() => {});
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

  const chatSidebarButton = activeCase && resolvedLawyer ? (
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
      {showChat && resolvedLawyer && (
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