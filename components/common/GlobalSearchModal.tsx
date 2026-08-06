import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './IconComponents';
import { mockLawyers, mockClients } from '../../services/mockDataService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (type: 'case' | 'lawyer' | 'client' | 'action', item: any) => void;
}

interface SearchItem {
  id: string;
  type: 'case' | 'lawyer' | 'client' | 'action';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: string;
  data?: any;
}

const QUICK_ACTIONS: SearchItem[] = [
  { id: 'act-1', type: 'action', title: 'Abrir Novo Processo', subtitle: 'Cadastrar novo caso jurídico para cliente', badge: 'Ação', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: '⚖️' },
  { id: 'act-2', type: 'action', title: 'Consultar Assistente IA (Gemini)', subtitle: 'Analisar jurisprudência ou elaborar minuta', badge: 'IA', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: '🤖' },
  { id: 'act-3', type: 'action', title: 'Agendar Consulta / Audiência', subtitle: 'Adicionar compromisso na agenda compartilhada', badge: 'Agenda', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: '📅' },
  { id: 'act-4', type: 'action', title: 'Gerar Contrato de Honorários', subtitle: 'Emitir minuta em PDF para assinatura digital', badge: 'Contrato', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: '📝' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('legis_recent_searches');
      return saved ? JSON.parse(saved) : ['Divórcio', 'Direito Trabalhista', 'Contrato'];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent if passing isOpen state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable items list
  const lawyerItems: SearchItem[] = mockLawyers.map(l => ({
    id: `lawyer-${l.id}`,
    type: 'lawyer',
    title: l.name,
    subtitle: `${l.specialties.join(', ')} • OAB ${l.oab}`,
    badge: 'Advogado',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    icon: '👨‍⚖️',
    data: l,
  }));

  const clientItems: SearchItem[] = mockClients.map(c => ({
    id: `client-${c.id}`,
    type: 'client',
    title: c.name,
    subtitle: `${c.email} • CPF ${c.cpf}`,
    badge: 'Cliente',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: '👥',
    data: c,
  }));

  const allItems = [...QUICK_ACTIONS, ...lawyerItems, ...clientItems];

  const filteredItems = query.trim() === ''
    ? QUICK_ACTIONS
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.badge.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item: SearchItem) => {
    if (query.trim()) {
      const updated = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('legis_recent_searches', JSON.stringify(updated));
    }
    if (onSelectResult) onSelectResult(item.type, item.data || item);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 dark:border-[#2A2545] gap-3 bg-gray-50/50 dark:bg-[#141126]/50">
          <Icon name="🔍" className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar processos, advogados, clientes, ações (Pressione ⌘K ou Esc)..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-[#2A2545] text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Limpar
            </button>
          )}
          <kbd className="hidden md:inline-block text-[10px] font-semibold px-2 py-1 rounded bg-gray-200 dark:bg-[#2A2545] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-[#252040]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
              <span className="text-3xl block mb-2">🔍</span>
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {query ? 'Resultados Encontrados' : 'Ações Rápidas Recomendadas'}
              </div>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    index === selectedIndex
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-[#221D3B] text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center gap-2">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches Footer */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#141126] border-t border-gray-200 dark:border-[#2A2545] flex items-center gap-2 text-xs text-gray-500 overflow-x-auto">
            <span className="font-semibold text-gray-400 flex-shrink-0">Buscas recentes:</span>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#201C3D] border border-gray-200 dark:border-[#2A2545] hover:border-primary/50 text-gray-600 dark:text-gray-300 transition-colors flex-shrink-0"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
