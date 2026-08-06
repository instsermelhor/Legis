import React, { useState, useMemo } from 'react';
import {
  searchPrecedents,
  searchTheses,
  formatAbntCitation,
  type PrecedentItem,
  type LegalThesis,
} from '../../lib/jurisprudenceLibraryEngine';

interface JurisprudenceTesesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'search' | 'sumulas' | 'theses' | 'citation';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const JurisprudenceTesesModal: React.FC<JurisprudenceTesesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [selectedPrecedent, setSelectedPrecedent] = useState<PrecedentItem | null>(null);
  const [selectedThesis, setSelectedThesis] = useState<LegalThesis | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const precedents = useMemo(
    () => searchPrecedents(searchQuery, selectedArea, selectedCourt),
    [searchQuery, selectedArea, selectedCourt]
  );

  const theses = useMemo(
    () => searchTheses(searchQuery, selectedArea),
    [searchQuery, selectedArea]
  );

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-3xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-white">📚 Jurisprudência & Banco de Teses</h2>
            <p className="text-xs text-blue-200 mt-0.5">Súmulas Vinculantes · Repetitivos STF/STJ · Teses Vencedoras</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'search', label: '🔎 Precedentes', icon: '⚖️' },
            { id: 'sumulas', label: '📜 Súmulas Vinculantes', icon: '🏛️' },
            { id: 'theses', label: '💡 Teses Vencedoras', icon: '🏆' },
            { id: 'citation', label: '📝 Gerador Citação ABNT', icon: '📄' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 flex-shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por assunto, tese, súmula ou palavras-chave..."
            className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas as Áreas</option>
            <option value="Trabalhista">Trabalhista</option>
            <option value="Cível">Cível</option>
            <option value="Consumidor">Consumidor</option>
            <option value="Tributário">Tributário</option>
            <option value="Família">Família</option>
            <option value="Penal">Penal</option>
            <option value="Imobiliário">Imobiliário</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Precedentes */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {precedents.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {item.court}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                    </div>
                    {item.bindingForce && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        ⚡ Art. 927 CPC (Vinculante)
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg leading-relaxed">
                    {item.fullText}
                  </p>
                  <div className="flex justify-between items-center pt-1 text-xs text-gray-400">
                    <span>Área: {item.area} • Julgado em {new Date(item.decisionDate).toLocaleDateString('pt-BR')}</span>
                    <button
                      onClick={() => handleCopy(formatAbntCitation(item), item.id)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {copiedId === item.id ? '✅ Copiado!' : '📋 Copiar Citação ABNT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Súmulas Vinculantes */}
          {activeTab === 'sumulas' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
                📌 <strong>Súmulas Vinculantes do STF</strong> possuem eficácia contra todos (erga omnes) e efeito vinculante em relação aos demais órgãos do Poder Judiciário e à administração pública direta e indireta.
              </div>
              {precedents
                .filter((p) => p.category === 'sumula_vinculante' || p.category === 'sumula_simples')
                .map((sumula) => (
                  <div key={sumula.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{sumula.title}</span>
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">{sumula.area}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{sumula.fullText}</p>
                    <div className="text-right">
                      <button
                        onClick={() => handleCopy(sumula.fullText, sumula.id)}
                        className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {copiedId === sumula.id ? '✅ Copiado!' : '📋 Copiar Ementa'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 3: Teses Vencedoras */}
          {activeTab === 'theses' && (
            <div className="space-y-4">
              {theses.map((thesis) => (
                <div key={thesis.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{thesis.title}</h4>
                      <p className="text-xs text-gray-400">{thesis.area} • Lado: {thesis.side === 'author' ? 'Autor/Reclamante' : 'Réu/Reclamado'}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                      ⭐ {thesis.winRateEstimate}% Sucesso ({thesis.timesUsed} usos)
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400">{thesis.summary}</p>

                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-serif">
                    "{thesis.argumentationText}"
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {thesis.keyArticles.map((art) => (
                      <span key={art} className="text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-md font-mono">
                        {art}
                      </span>
                    ))}
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => handleCopy(thesis.argumentationText, thesis.id)}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      {copiedId === thesis.id ? '✅ Copiado!' : '📋 Copiar Tese para Petição'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Gerador de Citação ABNT */}
          {activeTab === 'citation' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300">
                ✍️ <strong>Formatador ABNT NBR 10520 & CPC/2015</strong> — Gere citações perfeitas e prontas para inclusão em Petições Iniciais, Contestações e Recursos.
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Selecione o Precedente para Formatar</label>
                <select
                  onChange={(e) => {
                    const found = precedents.find((p) => p.id === e.target.value);
                    setSelectedPrecedent(found || null);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Escolha um precedente...</option>
                  {precedents.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.court}] {p.title}
                    </option>
                  ))}
                </select>

                {selectedPrecedent && (
                  <div className="space-y-3 pt-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-200 dark:border-gray-600">
                      {formatAbntCitation(selectedPrecedent)}
                    </div>
                    <button
                      onClick={() => handleCopy(formatAbntCitation(selectedPrecedent), 'custom_citation')}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity"
                    >
                      {copiedId === 'custom_citation' ? '✅ Citação Copiada!' : '📋 Copiar Formatado ABNT'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Base de Jurisprudência Conforme Art. 927 do CPC/2015
          </p>
        </div>
      </div>
    </div>
  );
};
