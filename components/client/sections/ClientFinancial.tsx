'use client';

import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
type FaturaStatus = 'aberta' | 'paga' | 'vencida';
type MetodoPagamento = 'pix' | 'boleto' | 'cartao';

interface Fatura {
  id: string;
  descricao: string;
  vencimento: string;
  valor: number;
  status: FaturaStatus;
  metodos: MetodoPagamento[];
  parcela: string;
  dataPagamento?: string;
}

const MOCK_FATURAS: Fatura[] = [
  {
    id: 'f1',
    descricao: 'Honorários — Dr. Carlos Mendes (Junho/2025)',
    vencimento: '2025-06-20',
    valor: 583.33,
    status: 'aberta',
    metodos: ['pix', 'boleto', 'cartao'],
    parcela: '3/6',
  },
  {
    id: 'f2',
    descricao: 'Honorários — Dr. Carlos Mendes (Maio/2025)',
    vencimento: '2025-05-20',
    valor: 583.33,
    status: 'paga',
    metodos: ['pix'],
    parcela: '2/6',
    dataPagamento: '19/05/2025',
  },
  {
    id: 'f3',
    descricao: 'Análise de Contrato de Aluguel',
    vencimento: '2025-06-15',
    valor: 250.0,
    status: 'vencida',
    metodos: ['pix', 'boleto'],
    parcela: '1/1',
  },
  {
    id: 'f4',
    descricao: 'Honorários — Dr. Carlos Mendes (Abril/2025)',
    vencimento: '2025-04-20',
    valor: 583.33,
    status: 'paga',
    metodos: ['cartao'],
    parcela: '1/6',
    dataPagamento: '20/04/2025',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, Number(day))
  );
};

const statusLabels: Record<FaturaStatus, string> = {
  aberta: 'Em Aberto',
  paga: 'Paga',
  vencida: 'Vencida',
};

const statusBadgeStyles: Record<FaturaStatus, string> = {
  aberta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  paga: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  vencida: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
  subtext?: string;
}

function KpiCard({ label, icon, value, colorClass, subtext }: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-2 animate-fade-in
        bg-white dark:bg-[#1A1730] border-slate-200 dark:border-[#2A2545]
        hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <span className={`text-2xl`} aria-hidden="true">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QR Code Simulado (CSS grid de quadradinhos)
// ---------------------------------------------------------------------------
function SimulatedQRCode() {
  // Simple visual QR simulation with a 7x7 grid pattern
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ];

  return (
    <div className="inline-flex flex-col gap-px p-2 rounded-lg bg-white border border-slate-200 dark:border-slate-600">
      {pattern.map((row, i) => (
        <div key={i} className="flex gap-px">
          {row.map((cell, j) => (
            <div
              key={j}
              className={`w-3 h-3 rounded-sm ${cell ? 'bg-slate-900' : 'bg-white'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment Options
// ---------------------------------------------------------------------------
function PaymentOptions({ metodos, faturaId }: { metodos: MetodoPagamento[]; faturaId: string }) {
  const [activeMethod, setActiveMethod] = useState<MetodoPagamento | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);

  const FAKE_PIX_CODE = `00020126580014BR.GOV.BCB.PIX0136legisconnect@pix.com.br5204000053039865802BR5925Legis Connect Pagamentos6009SAO PAULO62070503***6304ABCD`;
  const FAKE_BOLETO = `34191.75624 30570.002456 78001.273000 8 00000000058333`;

  const handleCopyPix = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FAKE_PIX_CODE);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  }, [FAKE_PIX_CODE]);

  const handleCopyBoleto = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FAKE_BOLETO);
      setCopiedBoleto(true);
      setTimeout(() => setCopiedBoleto(false), 2500);
    } catch {
      setCopiedBoleto(true);
      setTimeout(() => setCopiedBoleto(false), 2500);
    }
  }, [FAKE_BOLETO]);

  const handleCartao = () => {
    alert('Redirecionando para checkout...');
  };

  const methodLabels: Record<MetodoPagamento, string> = {
    pix: '📲 Pix',
    boleto: '🧾 Boleto',
    cartao: '💳 Cartão',
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Method selector tabs */}
      <div className="flex flex-wrap gap-2">
        {metodos.map((m) => (
          <button
            key={m}
            onClick={() => setActiveMethod(activeMethod === m ? null : m)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95
              ${
                activeMethod === m
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-[#12102A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2A2545] hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            aria-pressed={activeMethod === m}
          >
            {methodLabels[m]}
          </button>
        ))}
      </div>

      {/* PIX */}
      {activeMethod === 'pix' && (
        <div className="rounded-xl border border-slate-200 dark:border-[#2A2545] bg-slate-50 dark:bg-[#12102A] p-4 animate-fade-in space-y-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span>📲</span> QR Code Pix
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SimulatedQRCode />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Ou copie o código abaixo:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] bg-white dark:bg-[#1A1730] border border-slate-200 dark:border-[#2A2545] rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
                  {FAKE_PIX_CODE.slice(0, 40)}…
                </code>
                <button
                  onClick={handleCopyPix}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 whitespace-nowrap
                    ${copiedPix
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  {copiedPix ? '✅ Copiado!' : 'Copiar código Pix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boleto */}
      {activeMethod === 'boleto' && (
        <div className="rounded-xl border border-slate-200 dark:border-[#2A2545] bg-slate-50 dark:bg-[#12102A] p-4 animate-fade-in space-y-2">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span>🧾</span> Linha Digitável do Boleto
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <code className="flex-1 text-xs bg-white dark:bg-[#1A1730] border border-slate-200 dark:border-[#2A2545] rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 font-mono tracking-wider break-all">
              {FAKE_BOLETO}
            </code>
            <button
              onClick={handleCopyBoleto}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 whitespace-nowrap
                ${copiedBoleto
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500'
                }`}
            >
              {copiedBoleto ? '✅ Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Cartão */}
      {activeMethod === 'cartao' && (
        <div className="rounded-xl border border-slate-200 dark:border-[#2A2545] bg-slate-50 dark:bg-[#12102A] p-4 animate-fade-in">
          <button
            onClick={handleCartao}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl
              bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md
              hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 active:scale-95"
          >
            💳 Pagar com Cartão
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fatura Card
// ---------------------------------------------------------------------------
function FaturaCard({ fatura }: { fatura: Fatura }) {
  const isPendente = fatura.status === 'aberta' || fatura.status === 'vencida';

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 transition-all duration-300 hover:shadow-md animate-fade-in
        bg-white dark:bg-[#1A1730]
        ${fatura.status === 'vencida'
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-slate-200 dark:border-[#2A2545]'
        }`}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            {fatura.status === 'vencida' && (
              <span className="text-base mt-0.5 flex-shrink-0" aria-hidden="true">⚠️</span>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
                {fatura.descricao}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parcela {fatura.parcela} &middot; Vence em {formatDate(fatura.vencimento)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            {formatCurrency(fatura.valor)}
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadgeStyles[fatura.status]}`}
          >
            {statusLabels[fatura.status]}
          </span>
        </div>
      </div>

      {/* Vencida warning */}
      {fatura.status === 'vencida' && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
          <span className="text-red-500 text-xs" aria-hidden="true">⚠️</span>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            Regularize para evitar juros e cobranças adicionais.
          </p>
        </div>
      )}

      {/* Paga info */}
      {fatura.status === 'paga' && fatura.dataPagamento && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
          <span className="text-emerald-500" aria-hidden="true">✅</span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Pago em {fatura.dataPagamento}
          </p>
        </div>
      )}

      {/* Payment options for open/overdue */}
      {isPendente && (
        <PaymentOptions metodos={fatura.metodos} faturaId={fatura.id} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
type FaturaFiltro = 'Todas' | 'Em Aberto' | 'Pagas' | 'Vencidas';

export const ClientFinancial: React.FC = () => {
  const [filtro, setFiltro] = useState<FaturaFiltro>('Todas');

  // KPI computations
  const totalPago = MOCK_FATURAS.filter((f) => f.status === 'paga').reduce((acc, f) => acc + f.valor, 0);
  const totalPendente = MOCK_FATURAS.filter((f) => f.status === 'aberta' || f.status === 'vencida').reduce(
    (acc, f) => acc + f.valor,
    0
  );
  const proximoVencimento = MOCK_FATURAS.filter((f) => f.status === 'aberta')
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];

  // Filter
  const faturasFiltradas = MOCK_FATURAS.filter((f) => {
    if (filtro === 'Todas') return true;
    if (filtro === 'Em Aberto') return f.status === 'aberta';
    if (filtro === 'Pagas') return f.status === 'paga';
    if (filtro === 'Vencidas') return f.status === 'vencida';
    return true;
  });

  const filtros: FaturaFiltro[] = ['Todas', 'Em Aberto', 'Pagas', 'Vencidas'];

  const handleManageCards = () => alert('Gestão de cartões em breve');
  const handleAddCard = () => alert('Gestão de cartões em breve');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ------------------------------------------------------------------ */}
      {/* A) KPI Cards                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">💰 Resumo Financeiro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visão geral dos seus pagamentos e obrigações.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Total Pago"
            icon="✅"
            value={formatCurrency(totalPago)}
            colorClass="text-emerald-600 dark:text-emerald-400"
            subtext="Pagamentos concluídos"
          />
          <KpiCard
            label="Pendente"
            icon="⏳"
            value={formatCurrency(totalPendente)}
            colorClass="text-amber-600 dark:text-amber-400"
            subtext="Em aberto + vencidas"
          />
          <KpiCard
            label="Próximo Vencimento"
            icon="📅"
            value={proximoVencimento ? formatDate(proximoVencimento.vencimento) : '—'}
            colorClass="text-red-600 dark:text-red-400"
            subtext={proximoVencimento ? formatCurrency(proximoVencimento.valor) : 'Nenhuma fatura aberta'}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* B) Faturas                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">🧾 Minhas Faturas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie e pague suas faturas com facilidade.
            </p>
          </div>

          {/* Filter pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#12102A] border border-slate-200 dark:border-[#2A2545] self-start sm:self-auto flex-wrap"
            role="group"
            aria-label="Filtrar faturas"
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

        {faturasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center animate-fade-in">
            <span className="text-5xl mb-4" aria-hidden="true">🎉</span>
            <h3 className="text-base font-semibold text-slate-700 dark:text-white">Nenhuma fatura encontrada</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Não há faturas nesta categoria no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {faturasFiltradas.map((f) => (
              <div key={f.id}>
                <FaturaCard fatura={f} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* C) Cartões Salvos                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">💳 Cartões Salvos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Seus métodos de pagamento cadastrados.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#2A2545] bg-white dark:bg-[#1A1730] shadow-sm p-5">
          {/* Mock card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Card visual */}
              <div
                className="w-16 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold
                  bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md flex-shrink-0"
                aria-label="Cartão Visa"
              >
                VISA
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Visa •••• 4242</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vence em 12/27</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleManageCards}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#2A2545]
                  text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2545]/50
                  transition-all duration-200 active:scale-95"
              >
                Gerenciar Cartões
              </button>
              <button
                onClick={handleAddCard}
                className="px-4 py-2 text-xs font-semibold rounded-xl
                  bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm
                  transition-all duration-200 active:scale-95"
              >
                + Adicionar Cartão
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* D) Dica de economia                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div
          className="rounded-2xl border border-indigo-200 dark:border-indigo-800/50
            bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40
            p-5 flex items-start gap-4 animate-fade-in"
          role="note"
          aria-label="Dica de economia"
        >
          <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">💡</span>
          <div>
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              Dica: Pague no Pix e economize tempo!
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Aprovação instantânea, sem taxas extras e 100% seguro. O Pix é a forma mais rápida de regularizar suas faturas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientFinancial;
