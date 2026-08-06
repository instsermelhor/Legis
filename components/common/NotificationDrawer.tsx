import React, { useState } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'prazo' | 'processo' | 'financeiro' | 'sistema';
  read: boolean;
  linkView?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: '⚠️ Prazo Processual Próximo',
    message: 'Processo #00123-2024 (Divórcio Consensual) vence em 48 horas.',
    timestamp: 'Há 15 min',
    category: 'prazo',
    read: false,
  },
  {
    id: 'n-2',
    title: '📄 Novo Contrato Assinado',
    message: 'Cliente Maria Oliveira assinou o contrato de honorários advocatícios.',
    timestamp: 'Há 1 hora',
    category: 'financeiro',
    read: false,
  },
  {
    id: 'n-3',
    title: '🤖 Parecer do Gemini IA Concluído',
    message: 'Análise de jurisprudência sobre Ação de Alimentos pronta para revisão.',
    timestamp: 'Há 3 horas',
    category: 'processo',
    read: true,
  },
  {
    id: 'n-4',
    title: '✅ Honorários Depositados',
    message: 'Pagamento de R$ 3.500,00 via PIX confirmado na conta do escritório.',
    timestamp: 'Ontem',
    category: 'financeiro',
    read: true,
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'prazo' | 'processo' | 'financeiro'>('todos');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (activeFilter === 'todos') return true;
    return n.category === activeFilter;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getCategoryBadge = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'prazo':
        return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Prazo</span>;
      case 'financeiro':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Financeiro</span>;
      case 'processo':
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Processo</span>;
      default:
        return <span className="bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Sistema</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-sm md:max-w-md bg-white dark:bg-[#1A1730] h-full shadow-2xl border-l border-gray-200 dark:border-[#2A2545] flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between bg-gray-50/50 dark:bg-[#141126]/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Notificações</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} novas
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252040] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-3 border-b border-gray-200 dark:border-[#2A2545] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={markAllAsRead}
              className="text-primary hover:underline font-medium text-[11px]"
            >
              ✓ Marcar todas como lidas
            </button>
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-rose-500 text-[11px]"
            >
              Limpar histórico
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            {(['todos', 'prazo', 'processo', 'financeiro'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-[#221D3B] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Stream List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#252040] p-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-xs">
              <span className="text-3xl block mb-2">🔕</span>
              Nenhuma notificação nesta categoria.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer mb-1 ${
                  !item.read
                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-primary font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-[#201C3D] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                    {item.title}
                  </div>
                  {getCategoryBadge(item.category)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                  {item.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{item.timestamp}</span>
                  {!item.read && (
                    <span className="text-primary font-bold">● Não lida</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 dark:bg-[#141126] border-t border-gray-200 dark:border-[#2A2545] text-center text-[11px] text-gray-400">
          Sincronização em tempo real via Supabase Realtime WebSocket ⚡
        </div>
      </div>
    </div>
  );
};
