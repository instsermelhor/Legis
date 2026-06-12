'use client';

import React, { useState } from 'react';
import type { User } from '../../../types';

interface ClientContractsProps {
  user: User;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_CONTRATOS = [
  {
    id: 'c1',
    tipo: 'Contrato de Honorários',
    advogado: 'Dr. Carlos Mendes',
    oab: 'OAB/SP 123.456',
    area: 'Trabalhista',
    dataAssinatura: '15/03/2025',
    valor: 'R$ 3.500,00',
    status: 'Ativo',
    docUrl: '#',
  },
  {
    id: 'c2',
    tipo: 'Procuração Ad Judicia',
    advogado: 'Dr. Carlos Mendes',
    oab: 'OAB/SP 123.456',
    area: 'Trabalhista',
    dataAssinatura: '15/03/2025',
    valor: '—',
    status: 'Ativo',
    docUrl: '#',
  },
  {
    id: 'c3',
    tipo: 'Contrato de Honorários',
    advogado: 'Dra. Ana Ferreira',
    oab: 'OAB/RJ 78.234',
    area: 'Família',
    dataAssinatura: '10/01/2024',
    valor: 'R$ 2.000,00',
    status: 'Concluído',
    docUrl: '#',
  },
];

const MOCK_SERVICOS_CONTRATADOS = [
  { id: 's1', nome: 'Notificação Extrajudicial', data: '20/05/2025', status: 'Entregue', valor: 'R$ 180,00' },
  { id: 's2', nome: 'Análise de Contrato de Aluguel', data: '02/06/2025', status: 'Em andamento', valor: 'R$ 250,00' },
];

const MOCK_HISTORICO = [
  { id: 'h1', data: '15/03/2025', evento: 'Contrato assinado com Dr. Carlos Mendes', tipo: 'contrato' },
  { id: 'h2', data: '20/03/2025', evento: 'Primeira consulta realizada', tipo: 'consulta' },
  { id: 'h3', data: '01/04/2025', evento: 'Documentos enviados ao advogado', tipo: 'doc' },
  { id: 'h4', data: '20/05/2025', evento: 'Notificação Extrajudicial contratada', tipo: 'servico' },
  { id: 'h5', data: '02/06/2025', evento: 'Análise de Contrato iniciada', tipo: 'servico' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type ContratoStatus = 'Ativo' | 'Concluído';
type ServicoStatus = 'Entregue' | 'Em andamento';
type HistoricoTipo = 'contrato' | 'consulta' | 'doc' | 'servico';
type ContratoFiltro = 'Todos' | 'Ativos' | 'Concluídos';

const statusContratoStyles: Record<ContratoStatus, string> = {
  Ativo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Concluído: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
};

const statusServicoStyles: Record<ServicoStatus, string> = {
  Entregue: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Em andamento': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const areaColors: Record<string, string> = {
  Trabalhista: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Família: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Cível: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Penal: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const historicoIcones: Record<HistoricoTipo, string> = {
  contrato: '📝',
  consulta: '📅',
  doc: '📎',
  servico: '💼',
};

const historicoCorBorda: Record<HistoricoTipo, string> = {
  contrato: 'border-indigo-400 dark:border-indigo-500',
  consulta: 'border-blue-400 dark:border-blue-500',
  doc: 'border-amber-400 dark:border-amber-500',
  servico: 'border-emerald-400 dark:border-emerald-500',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DocumentoAction({ docUrl }: { docUrl: string }) {
  const handleAction = () => {
    if (docUrl === '#') {
      alert('Documento disponível em breve via assinatura digital.');
    } else {
      window.open(docUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={handleAction}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
          bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200
          dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:border-indigo-700
          transition-all duration-200 active:scale-95"
      >
        👁️ Visualizar Contrato
      </button>
      <button
        onClick={handleAction}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
          bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200
          dark:bg-slate-700/40 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:border-slate-600
          transition-all duration-200 active:scale-95"
      >
        ⬇️ Baixar
      </button>
    </div>
  );
}

function ContratoCard({ contrato }: { contrato: typeof MOCK_CONTRATOS[0] }) {
  const status = contrato.status as ContratoStatus;
  const areaStyle = areaColors[contrato.area] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  const tipoIcone = contrato.tipo.includes('Procuração') ? '📜' : '📄';

  return (
    <div
      className="group rounded-2xl border border-slate-200 dark:border-[#2A2545] bg-white dark:bg-[#1A1730]
        shadow-sm hover:shadow-md transition-all duration-300 p-5 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">{tipoIcone}</span>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">
              {contrato.tipo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {contrato.advogado} &middot; <span className="font-mono">{contrato.oab}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusContratoStyles[status]}`}
          >
            {status === 'Ativo' ? '🟢' : '⚫'} {status}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${areaStyle}`}>
            {contrato.area}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">Assinatura</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium mt-0.5">{contrato.dataAssinatura}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">Valor</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium mt-0.5">{contrato.valor}</span>
        </div>
      </div>

      <DocumentoAction docUrl={contrato.docUrl} />
    </div>
  );
}

function ServicoItem({ servico }: { servico: typeof MOCK_SERVICOS_CONTRATADOS[0] }) {
  const status = servico.status as ServicoStatus;
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl
        border border-slate-100 dark:border-[#2A2545] bg-slate-50/60 dark:bg-[#1A1730]/60
        hover:bg-white dark:hover:bg-[#1A1730] hover:shadow-sm transition-all duration-200 animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">📦</span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{servico.nome}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Contratado em {servico.data}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{servico.valor}</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusServicoStyles[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function TimelineItem({
  item,
  isLast,
}: {
  item: typeof MOCK_HISTORICO[0];
  isLast: boolean;
}) {
  const tipo = item.tipo as HistoricoTipo;
  const icone = historicoIcones[tipo];
  const bordaColor = historicoCorBorda[tipo];

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Line + icon column */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-base
            bg-white dark:bg-[#1A1730] border-2 shadow-sm z-10 flex-shrink-0 ${bordaColor}`}
          aria-hidden="true"
        >
          {icone}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 bg-slate-200 dark:bg-[#2A2545] min-h-[1.5rem]" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">{item.data}</p>
        <p className="text-sm text-slate-700 dark:text-slate-200">{item.evento}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center animate-fade-in">
      <span className="text-5xl mb-4" aria-hidden="true">📭</span>
      <h3 className="text-base font-semibold text-slate-700 dark:text-white">Nenhum {section} encontrado</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
        Quando você formalizar acordos com advogados, eles aparecerão aqui.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const ClientContracts: React.FC<ClientContractsProps> = ({ user: _user }) => {
  const [filtro, setFiltro] = useState<ContratoFiltro>('Todos');

  const contratosFiltrados = MOCK_CONTRATOS.filter((c) => {
    if (filtro === 'Todos') return true;
    if (filtro === 'Ativos') return c.status === 'Ativo';
    if (filtro === 'Concluídos') return c.status === 'Concluído';
    return true;
  });

  const filtros: ContratoFiltro[] = ['Todos', 'Ativos', 'Concluídos'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ------------------------------------------------------------------ */}
      {/* A) Contratos                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">📄 Meus Contratos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Contratos ativos e histórico com advogados parceiros.
            </p>
          </div>

          {/* Filter pills */}
          <div
            className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#12102A] border border-slate-200 dark:border-[#2A2545] self-start sm:self-auto"
            role="group"
            aria-label="Filtrar contratos"
          >
            {filtros.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${
                    filtro === f
                      ? 'bg-white dark:bg-[#2A2545] text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                aria-pressed={filtro === f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {contratosFiltrados.length === 0 ? (
          <EmptyState section="contrato" />
        ) : (
          <div className="space-y-4">
            {contratosFiltrados.map((c) => (
              <div key={c.id}>
                <ContratoCard contrato={c} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* B) Serviços Contratados                                              */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">📦 Meus Serviços Contratados</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Serviços de eficiência jurídica que você adquiriu.
          </p>
        </div>

        {MOCK_SERVICOS_CONTRATADOS.length === 0 ? (
          <EmptyState section="serviço" />
        ) : (
          <div className="space-y-3">
            {MOCK_SERVICOS_CONTRATADOS.map((s) => (
              <div key={s.id}>
                <ServicoItem servico={s} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* C) Linha do Tempo                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">📅 Histórico de Atividades</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Todos os eventos e marcos da sua jornada jurídica.
          </p>
        </div>

        <div
          className="rounded-2xl border border-slate-200 dark:border-[#2A2545] bg-white dark:bg-[#1A1730]
            shadow-sm p-6"
        >
          {MOCK_HISTORICO.length === 0 ? (
            <EmptyState section="evento" />
          ) : (
            <div>
              {MOCK_HISTORICO.map((item, index) => (
                <div key={item.id}>
                  <TimelineItem
                    item={item}
                    isLast={index === MOCK_HISTORICO.length - 1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClientContracts;
