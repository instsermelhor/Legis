import React, { useState, useRef, useEffect } from 'react';

interface UnifiedToolsMenuProps {
  onOpenModal: (modalKey: string) => void;
  isAdmin?: boolean;
}

export const UnifiedToolsMenu: React.FC<UnifiedToolsMenuProps> = ({ onOpenModal, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toolCategories = [
    {
      title: '⚖️ Prática & Inteligência Processual',
      items: [
        { key: 'aiDocGen', label: 'Gerador de Peças IA', desc: 'Petições com STF/STJ & SHA-256', icon: '✍️' },
        { key: 'processTracking', label: 'Prazos & DJEN / DataJud', desc: 'Calculadora CPC & Intimações', icon: '⚖️' },
        { key: 'ocrDeadline', label: 'OCR & Leitor de Intimações', desc: 'Extração Automática de Prazos IA', icon: '📷' },
        { key: 'virtualHearing', label: 'Audiências Virtuais & Ata IA', desc: 'Sessões Live & Transcrição', icon: '🎥' },
        { key: 'jurisprudence', label: 'Jurisprudência & Teses', desc: 'Súmulas STF/STJ & Banco de Teses', icon: '📚' },
        { key: 'predictiveAi', label: 'IA Preditiva & RAG', desc: 'Ditado de Voz & Análise STF', icon: '🤖' },
      ],
    },
    {
      title: '💼 Gestão & Negócios Jurídicos',
      items: [
        { key: 'officeFinancial', label: 'Financeiro do Escritório', desc: 'Honorários OAB & Inadimplência', icon: '💼' },
        { key: 'diligenceMarketplace', label: 'Diligências & Correspondentes', desc: 'Geo-Localização GPS & Escrow', icon: '📍' },
        { key: 'biAnalytics', label: 'BI Analytics & DPO', desc: 'DRE & Auditoria OAB/LGPD', icon: '📊' },
        { key: 'clientPortal', label: 'Portal do Cliente', desc: 'Sala Virtual E2E & Status', icon: '👤' },
      ],
    },
    {
      title: '🔒 Segurança, Comunicação & SaaS',
      items: [
        { key: 'smartContract', label: 'Smart Contracts', desc: 'Assinatura Biométrica SHA-256', icon: '📜' },
        { key: 'whatsapp', label: 'WhatsApp Notifications', desc: 'Modelos HSM & Mensageria', icon: '📲' },
        { key: 'plans', label: 'Planos & Assinatura', desc: 'Upgrade SaaS & Gateways', icon: '💎' },
        ...(isAdmin
          ? [{ key: 'monitor', label: 'Monitor de Deploy CI/CD', desc: 'Health Check & Web Vitals', icon: '🖥️' }]
          : []),
      ],
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md hover:opacity-95 transition-all ring-1 ring-white/20 active:scale-95"
        title="Central Unificada de Módulos & Ferramentas"
      >
        <span>⚡</span>
        <span>Módulos & Ferramentas</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 pb-2 mb-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              🚀 Central de Ferramentas Legis
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
              14 Módulos
            </span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto space-y-3 pr-1">
            {toolCategories.map((cat) => (
              <div key={cat.title} className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 px-2 py-0.5 uppercase tracking-wide">
                  {cat.title}
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {cat.items.map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => {
                        onOpenModal(tool.key);
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-gray-700/60 transition-colors flex items-start gap-2.5 group"
                    >
                      <span className="text-lg p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/80 group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {tool.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{tool.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
