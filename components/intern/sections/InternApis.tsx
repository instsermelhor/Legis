/**
 * InternApis.tsx
 * Central de APIs — Painel do Bacharelando
 * Conectores universitários (SIGAA, Totvs, Canvas, Blackboard, Lyceum)
 * + Integração com tribunais para consulta de andamentos de processos.
 */
import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectorStatus = 'connected' | 'pending' | 'disconnected' | 'error';

interface UniversityConnector {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: ConnectorStatus;
  lastSync?: string;
  features: string[];
  setupUrl?: string;
}

interface TribunalConnector {
  id: string;
  name: string;
  sigla: string;
  url: string;
  status: ConnectorStatus;
  tipo: 'estadual' | 'federal' | 'trabalhista' | 'especial';
  lastCheck?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const UNIVERSITY_CONNECTORS: UniversityConnector[] = [
  {
    id: 'sigaa', name: 'SIGAA', logo: '🎓',
    description: 'Sistema Integrado de Gestão de Atividades Acadêmicas — usado por universidades federais (UFMG, UFC, UFRN, UNB, etc.)',
    status: 'disconnected',
    features: ['Notas por período', 'Frequência', 'Histórico Escolar', 'Ementas das disciplinas', 'Pendências acadêmicas'],
  },
  {
    id: 'totvs', name: 'TOTVS Educacional', logo: '📊',
    description: 'ERP acadêmico de larga adoção em faculdades privadas. Integração via API REST com token institucional.',
    status: 'pending',
    lastSync: '2024-12-05T10:30:00',
    features: ['Boletim eletrônico', 'Frequência em tempo real', 'Boleto mensalidade', 'Agendamento de provas'],
  },
  {
    id: 'canvas', name: 'Canvas LMS', logo: '🖼️',
    description: 'Plataforma de ensino online amplamente adotada por instituições de alto desempenho.',
    status: 'connected',
    lastSync: '2024-12-06T08:00:00',
    features: ['Notas de atividades', 'Cronograma de entregas', 'Conteúdos das disciplinas', 'Fórum acadêmico'],
  },
  {
    id: 'blackboard', name: 'Blackboard Learn', logo: '⬛',
    description: 'Sistema de gestão de aprendizado usado por grandes redes de ensino superior.',
    status: 'disconnected',
    features: ['Portfólio de atividades', 'Avaliações online', 'Sala de aula virtual', 'Notas consolidadas'],
  },
  {
    id: 'lyceum', name: 'Lyceum', logo: '📚',
    description: 'Sistema acadêmico usado em faculdades privadas brasileiras. Integração via API SOAP.',
    status: 'disconnected',
    features: ['Histórico escolar digital', 'Dados cadastrais', 'Declarações automáticas', 'Frequência por matéria'],
  },
  {
    id: 'moodle', name: 'Moodle', logo: '🌐',
    description: 'Plataforma open-source de e-learning, muito popular em universidades públicas.',
    status: 'connected',
    lastSync: '2024-12-06T07:45:00',
    features: ['Quizzes e atividades', 'Notas do curso', 'Recursos digitais', 'Comunicados do professor'],
  },
];

const TRIBUNAL_CONNECTORS: TribunalConnector[] = [
  { id: 'tjsp', name: 'Tribunal de Justiça de São Paulo', sigla: 'TJSP', url: 'https://esaj.tjsp.jus.br', status: 'connected', tipo: 'estadual', lastCheck: '2024-12-06T09:00:00' },
  { id: 'tjrj', name: 'Tribunal de Justiça do Rio de Janeiro', sigla: 'TJRJ', url: 'https://www.tjrj.jus.br', status: 'connected', tipo: 'estadual', lastCheck: '2024-12-06T09:00:00' },
  { id: 'trt15', name: 'TRT da 15ª Região (Campinas)', sigla: 'TRT-15', url: 'https://pje.trt15.jus.br', status: 'connected', tipo: 'trabalhista', lastCheck: '2024-12-06T09:00:00' },
  { id: 'stj', name: 'Superior Tribunal de Justiça', sigla: 'STJ', url: 'https://www.stj.jus.br', status: 'pending', tipo: 'federal' },
  { id: 'stf', name: 'Supremo Tribunal Federal', sigla: 'STF', url: 'https://portal.stf.jus.br', status: 'connected', tipo: 'federal', lastCheck: '2024-12-06T09:00:00' },
  { id: 'tse', name: 'Tribunal Superior Eleitoral', sigla: 'TSE', url: 'https://www.tse.jus.br', status: 'disconnected', tipo: 'especial' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<ConnectorStatus, { label: string; color: string; dot: string; icon: string }> = {
  connected:    { label: 'Conectado',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40', dot: 'bg-emerald-500', icon: '✅' },
  pending:      { label: 'Pendente',      color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40',       dot: 'bg-amber-500',    icon: '⏳' },
  disconnected: { label: 'Desconectado', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-500 dark:border-gray-700',                dot: 'bg-gray-300',     icon: '⭕' },
  error:        { label: 'Erro',          color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40',                    dot: 'bg-red-500',      icon: '❌' },
};

const TRIBUNAL_TIPO_MAP = {
  estadual:     { label: 'Estadual',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  federal:      { label: 'Federal',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' },
  trabalhista:  { label: 'Trabalhista', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  especial:     { label: 'Especial',    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

type ApisSubTab = 'universidades' | 'tribunais';

export const InternApis: React.FC = () => {
  const [subTab, setSubTab] = useState<ApisSubTab>('universidades');
  const [connectors, setConnectors] = useState<UniversityConnector[]>(UNIVERSITY_CONNECTORS);
  const [expandedConnector, setExpandedConnector] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const connectedCount = connectors.filter(c => c.status === 'connected').length;

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 2000);
  };

  const handleConnect = (id: string) => {
    setConnectors(prev => prev.map(c => c.id === id ? { ...c, status: 'pending' } : c));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-5 text-white">
        <h4 className="text-sm font-bold mb-1">🔌 Central de Integrações</h4>
        <p className="text-xs text-white/70 mb-3">Conecte sua conta a sistemas universitários e tribunais para sincronizar dados automaticamente.</p>
        <div className="flex gap-5">
          <div>
            <p className="text-2xl font-black">{connectedCount}</p>
            <p className="text-xs text-white/70">sistemas ativos</p>
          </div>
          <div>
            <p className="text-2xl font-black">{connectors.filter(c => c.status === 'pending').length}</p>
            <p className="text-xs text-white/70">pendentes</p>
          </div>
          <div>
            <p className="text-2xl font-black">{TRIBUNAL_CONNECTORS.filter(t => t.status === 'connected').length}</p>
            <p className="text-xs text-white/70">tribunais monitorados</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button onClick={() => setSubTab('universidades')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'universidades' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}>
          🎓 Sistemas Universitários
        </button>
        <button onClick={() => setSubTab('tribunais')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'tribunais' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}>
          ⚖️ Tribunais
        </button>
      </div>

      {/* ── Sistemas Universitários ── */}
      {subTab === 'universidades' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Integre com o sistema acadêmico da sua universidade para importar notas, frequências e histórico automaticamente.</p>
          {connectors.map(connector => {
            const statusMeta = STATUS_META[connector.status];
            const isExpanded = expandedConnector === connector.id;
            const isSyncing = syncingId === connector.id;
            return (
              <div key={connector.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-black/10 transition-colors"
                  onClick={() => setExpandedConnector(isExpanded ? null : connector.id)}
                >
                  <div className="text-3xl shrink-0">{connector.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{connector.name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot} inline-block mr-1`} />
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{connector.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {connector.status === 'connected' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleSync(connector.id); }}
                        disabled={isSyncing}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        {isSyncing ? '⏳ Sincronizando...' : '↺ Sincronizar'}
                      </button>
                    )}
                    {connector.status === 'disconnected' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleConnect(connector.id); }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        Conectar
                      </button>
                    )}
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-[#2A2545] px-4 py-3 bg-gray-50 dark:bg-black/10 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dados que serão importados</p>
                      <div className="flex flex-wrap gap-1.5">
                        {connector.features.map(f => (
                          <span key={f} className="text-[10px] font-semibold px-2 py-0.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                    {connector.lastSync && (
                      <p className="text-[10px] text-gray-400">
                        Última sincronização: {new Date(connector.lastSync).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {connector.status === 'pending' && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">⏳ Configuração Pendente</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">Aguardando aprovação do departamento de TI da sua universidade ou token de acesso institucional.</p>
                      </div>
                    )}
                    {connector.status === 'disconnected' && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">ℹ️ Como Conectar</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">Solicite ao setor acadêmico da sua universidade o token de integração ou use suas credenciais institucionais.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tribunais ── */}
      {subTab === 'tribunais' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Monitoramento de andamentos de processos em tribunais. Utilize para acompanhar casos do estágio em tempo real.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRIBUNAL_CONNECTORS.map(tribunal => {
              const statusMeta = STATUS_META[tribunal.status];
              const tipoMeta = TRIBUNAL_TIPO_MAP[tribunal.tipo];
              return (
                <div key={tribunal.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${tipoMeta.color}`}>{tipoMeta.label}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                          {statusMeta.icon} {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{tribunal.sigla}</p>
                      <p className="text-[10px] text-gray-400 truncate">{tribunal.name}</p>
                    </div>
                  </div>
                  {tribunal.lastCheck && (
                    <p className="text-[10px] text-gray-400 mb-2">
                      Verificado: {new Date(tribunal.lastCheck).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <a
                    href={tribunal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    🔗 Acessar {tribunal.sigla} →
                  </a>
                </div>
              );
            })}
          </div>

          {/* Info about process search */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mb-2">🔍 Consulta de Processos</h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
              Para consultar andamentos específicos, use o número do processo CNJ (NNNNNNN-DD.AAAA.J.TT.OOOO) nos sistemas conectados acima.
            </p>
            <div className="flex gap-2">
              <input
                placeholder="0000000-00.0000.0.00.0000"
                className="flex-1 border border-indigo-300 dark:border-indigo-900/50 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap">
                Consultar
              </button>
            </div>
            <p className="text-[10px] text-indigo-400 mt-2">* Consulta pública via Datajud (CNJ) — sem necessidade de certificado digital.</p>
          </div>
        </div>
      )}
    </div>
  );
};
