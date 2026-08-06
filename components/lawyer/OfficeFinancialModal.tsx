import React, { useState, useMemo } from 'react';
import {
  generateSampleContracts,
  generateSampleInvoices,
  calculateHonorary,
  generateFinancialReport,
  buildDebtorCases,
  getCollectionActions,
  OAB_HONORARY_TABLE_2024,
  formatCurrency,
  getStatusLabel,
  generatePixCode,
  type Invoice,
  type HonoraryContract,
} from '../../lib/officeFinancialEngine';

interface OfficeFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'dashboard' | 'contracts' | 'invoices' | 'debtors' | 'oab_table' | 'new_contract';

// ─── Helper Components ────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StatCard = ({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: string;
}) => (
  <div
    style={{ borderLeft: `4px solid ${color}` }}
    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-start gap-3"
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const s = getStatusLabel(status as any);
  return (
    <span
      style={{ backgroundColor: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }}
      className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      {s.label}
    </span>
  );
};

// ─── Tab: Dashboard ───────────────────────────────────────────────────────────

const DashboardTab = ({ contracts, invoices }: { contracts: HonoraryContract[]; invoices: Invoice[] }) => {
  const report = generateFinancialReport(contracts, invoices, '2024');

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Faturado" value={formatCurrency(report.totalBilled)} icon="💰" color="#3b82f6" />
        <StatCard label="Recebido" value={formatCurrency(report.totalReceived)} sub={`Taxa ${report.collectionRate.toFixed(0)}%`} icon="✅" color="#10b981" />
        <StatCard label="Em Aberto" value={formatCurrency(report.totalPending)} sub="Aguardando pagamento" icon="🕐" color="#f59e0b" />
        <StatCard label="Inadimplente" value={formatCurrency(report.totalOverdue)} sub={`${Math.round(report.totalOverdue / report.totalBilled * 100)}% do faturado`} icon="⚠️" color="#ef4444" />
      </div>

      {/* Compliance OAB */}
      <div
        className={`rounded-xl p-4 flex items-center gap-3 ${
          report.oabHonoraryCompliance
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
        }`}
      >
        <span className="text-2xl">{report.oabHonoraryCompliance ? '✅' : '❌'}</span>
        <div>
          <p className={`font-bold text-sm ${report.oabHonoraryCompliance ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
            {report.oabHonoraryCompliance
              ? 'Conformidade OAB: Todos os contratos estão dentro dos parâmetros do EAOAB'
              : 'Alerta OAB: Um ou mais contratos apresentam irregularidades — revise os valores'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Baseado na Tabela de Honorários OAB 2024 (Art. 49, Lei 8.906/94)
          </p>
        </div>
      </div>

      {/* Gráfico de barras por mês (visual CSS) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4">📊 Evolução Mensal — Faturado × Recebido</h3>
        <div className="flex items-end gap-2 h-32">
          {report.byMonth.map((m) => {
            const maxVal = Math.max(...report.byMonth.map((x) => Math.max(x.billed, x.received)));
            const billedH = (m.billed / maxVal) * 100;
            const receivedH = (m.received / maxVal) * 100;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-24">
                  <div
                    className="flex-1 bg-blue-400 dark:bg-blue-500 rounded-t"
                    style={{ height: `${billedH}%` }}
                    title={`Faturado: ${formatCurrency(m.billed)}`}
                  />
                  <div
                    className="flex-1 bg-emerald-400 dark:bg-emerald-500 rounded-t"
                    style={{ height: `${receivedH}%` }}
                    title={`Recebido: ${formatCurrency(m.received)}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Faturado</span>
          <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Recebido</span>
        </div>
      </div>

      {/* Por Advogado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">👨‍⚖️ Receita por Advogado</h3>
        <div className="space-y-2">
          {report.byAdvogado.map((adv) => (
            <div key={adv.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{adv.name}</span>
                <span className="text-gray-500">{formatCurrency(adv.amount)} ({adv.percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${adv.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Contratos de Honorários ─────────────────────────────────────────────

const ContractsTab = ({ contracts }: { contracts: HonoraryContract[] }) => {
  const [selected, setSelected] = useState<HonoraryContract | null>(null);

  return (
    <div className="space-y-4">
      {selected ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            ← Voltar à lista
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selected.clientName}</h3>
                <p className="text-xs text-gray-500">{selected.clientDocument} • {selected.caseNumber || 'Sem nº processo'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                selected.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : selected.status === 'closed'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {selected.status === 'active' ? 'Ativo' : selected.status === 'closed' ? 'Encerrado' : 'Suspenso'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 text-xs">Área</span><p className="font-medium">{selected.caseArea}</p></div>
              <div><span className="text-gray-500 text-xs">Tipo</span><p className="font-medium capitalize">{selected.type === 'success' ? 'Êxito' : selected.type === 'fixed' ? 'Fixo' : selected.type === 'mixed' ? 'Misto' : selected.type === 'hourly' ? 'Por Hora' : 'Assinatura'}</p></div>
              <div><span className="text-gray-500 text-xs">Responsável</span><p className="font-medium">{selected.responsible}</p></div>
              <div><span className="text-gray-500 text-xs">Início</span><p className="font-medium">{new Date(selected.startDate).toLocaleDateString('pt-BR')}</p></div>
            </div>

            {/* Cálculo */}
            {(() => {
              const calc = calculateHonorary(selected);
              return (
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">💰 Cálculo dos Honorários</h4>
                  {calc.breakdown.map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300 font-mono">{line}</p>
                  ))}
                  {calc.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {calc.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5">{w}</p>
                      ))}
                    </div>
                  )}
                  <div className={`text-xs mt-1 ${calc.oabCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
                    {calc.oabCompliant ? '✅ Conforme EAOAB' : '❌ Revisar — Divergência OAB'}
                  </div>
                </div>
              );
            })()}

            {/* Rateio */}
            {selected.partners.length > 1 && (
              <div>
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">🤝 Rateio entre Sócios</h4>
                <div className="space-y-1">
                  {selected.partners.map((p) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <span>{p.name}</span>
                      <span className="font-semibold">{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const calc = calculateHonorary(contract);
            return (
              <button
                key={contract.id}
                onClick={() => setSelected(contract)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{contract.clientName}</p>
                    <p className="text-xs text-gray-500">{contract.caseArea} • {contract.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(calc.totalAmount)}</p>
                    <p className="text-xs text-gray-500 capitalize">{contract.type === 'success' ? 'Êxito' : contract.type === 'fixed' ? 'Fixo' : contract.type === 'mixed' ? 'Misto' : contract.type === 'hourly' ? 'Por Hora' : 'Assinatura'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">{contract.responsible}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    contract.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {contract.status === 'active' ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
                {!calc.oabCompliant && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Revisar conformidade OAB</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Tab: Faturas ─────────────────────────────────────────────────────────────

const InvoicesTab = ({ invoices }: { invoices: Invoice[] }) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  if (selectedInvoice) {
    const pix = generatePixCode(selectedInvoice);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedInvoice(null)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">← Voltar</button>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedInvoice.id}</h3>
              <p className="text-sm text-gray-500">{selectedInvoice.clientName} • {selectedInvoice.clientDocument}</p>
            </div>
            <Badge status={selectedInvoice.status} />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInvoice.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400 text-xs">Valor Bruto</span><p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.amount)}</p></div>
            <div><span className="text-gray-400 text-xs">Valor Líquido</span><p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.netAmount || selectedInvoice.amount)}</p></div>
            <div><span className="text-gray-400 text-xs">Emissão</span><p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString('pt-BR')}</p></div>
            <div><span className="text-gray-400 text-xs">Vencimento</span><p className={`font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-600' : ''}`}>{new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}</p></div>
            {selectedInvoice.taxRetention && (
              <div><span className="text-gray-400 text-xs">ISS Retido</span><p className="font-medium">{selectedInvoice.taxRetention}%</p></div>
            )}
            {selectedInvoice.paymentDate && (
              <div><span className="text-gray-400 text-xs">Pago em</span><p className="font-medium text-emerald-600">{new Date(selectedInvoice.paymentDate).toLocaleDateString('pt-BR')}</p></div>
            )}
          </div>

          {selectedInvoice.status !== 'paid' && selectedInvoice.pixKey && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">📱 PIX para Pagamento</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Chave: <span className="font-mono font-semibold">{selectedInvoice.pixKey}</span></p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 overflow-auto">
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{pix.slice(0, 80)}...</p>
              </div>
              <button className="mt-2 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                📋 Copiar código PIX
              </button>
            </div>
          )}

          <div className={`rounded-xl p-3 text-xs ${selectedInvoice.oabRegistered ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}>
            {selectedInvoice.oabRegistered ? '✅ Registrado junto à OAB' : '⚠️ Nota ainda não registrada na OAB — recomendado para compliance'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['all', 'paid', 'sent', 'overdue', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'paid' ? 'Pagas' : f === 'sent' ? 'Enviadas' : f === 'overdue' ? 'Vencidas' : 'Rascunho'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((inv) => (
          <button
            key={inv.id}
            onClick={() => setSelectedInvoice(inv)}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{inv.id}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{inv.clientName}</p>
                <p className="text-xs text-gray-500 truncate">{inv.description.slice(0, 60)}...</p>
              </div>
              <div className="ml-3 text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                <Badge status={inv.status} />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
              {inv.oabRegistered ? (
                <span className="text-xs text-blue-500">✅ OAB</span>
              ) : (
                <span className="text-xs text-amber-500">⚠️ Reg. OAB pendente</span>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Nenhuma fatura encontrada.</div>
        )}
      </div>
    </div>
  );
};

// ─── Tab: Inadimplência ───────────────────────────────────────────────────────

const DebtorsTab = ({ invoices }: { invoices: Invoice[] }) => {
  const debtors = useMemo(() => buildDebtorCases(invoices), [invoices]);

  if (debtors.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl">🎉</span>
        <p className="mt-3 font-bold text-gray-700 dark:text-gray-300">Nenhuma inadimplência registrada!</p>
        <p className="text-sm text-gray-500 mt-1">Todos os clientes estão com pagamentos em dia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
        ⚠️ <strong>{debtors.length} cliente(s)</strong> com débitos em atraso — total de{' '}
        <strong>{formatCurrency(debtors.reduce((s, d) => s + d.totalDebt, 0))}</strong>
      </div>

      {debtors.map((debtor) => {
        const actions = getCollectionActions(debtor.daysOverdue);
        const urgencyColors = {
          info: 'bg-blue-50 border-blue-200 text-blue-700',
          warning: 'bg-amber-50 border-amber-200 text-amber-700',
          critical: 'bg-red-50 border-red-200 text-red-700',
          legal: 'bg-purple-50 border-purple-200 text-purple-700',
        };

        return (
          <div key={debtor.clientDocument} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{debtor.clientName}</p>
                <p className="text-xs text-gray-500">{debtor.clientDocument}</p>
                <p className="text-xs text-gray-500">{debtor.clientEmail} • {debtor.clientPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600 text-lg">{formatCurrency(debtor.totalDebt)}</p>
                <p className="text-xs text-red-500">{debtor.daysOverdue} dias em atraso</p>
              </div>
            </div>

            {/* Faturas vencidas */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Faturas em aberto</p>
              {debtor.invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{inv.id} — {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
                  <span className="font-semibold text-red-600">{formatCurrency(inv.amount)}</span>
                </div>
              ))}
            </div>

            {/* Régua de cobrança */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Régua de Cobrança Aplicável</p>
              <div className="space-y-2">
                {actions.map((action, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border text-xs ${urgencyColors[action.urgency]} dark:bg-opacity-20`}
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>{action.action}</span>
                      <span className="uppercase text-xs opacity-70">{action.channel}</span>
                    </div>
                    <p className="opacity-80">{action.message.replace('{nome}', debtor.clientName).replace('{valor}', formatCurrency(debtor.totalDebt)).replace(/{nf}/g, debtor.invoices[0]?.id || 'NF').replace(/{pix}/g, 'financeiro@escritorio.com').replace('{vencimento}', new Date(debtor.invoices[0]?.dueDate || '').toLocaleDateString('pt-BR'))}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 text-xs bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                📤 Enviar cobrança agora
              </button>
              <button className="flex-1 text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                📄 Gerar Notificação Extrajudicial
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab: Tabela OAB ─────────────────────────────────────────────────────────

const OabTableTab = () => (
  <div className="space-y-4">
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
      ℹ️ <strong>Tabela de Honorários OAB 2024</strong> — Baseada no Art. 49 do Estatuto da OAB (Lei 8.906/94) e Tabelas Seccionais vigentes. Limite máximo de êxito: <strong>30%</strong>.
    </div>
    <div className="space-y-3">
      {OAB_HONORARY_TABLE_2024.map((entry) => (
        <div key={entry.area} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white">{entry.area}</h4>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              Mínimo: {formatCurrency(entry.minimumAmount)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{entry.description}</p>
          {entry.successMinimumPercent > 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✅ Êxito permitido: {entry.successMinimumPercent}% a {entry.successMaximumPercent}%
            </p>
          ) : (
            <p className="text-xs text-red-500">❌ Honorários de êxito VEDADOS para esta área</p>
          )}
          <p className="text-xs text-gray-400 mt-1 italic">{entry.legalBasis}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Novo Contrato (Form simulado) ────────────────────────────────────────────

const NewContractTab = () => {
  const [form, setForm] = useState({
    clientName: '',
    caseArea: 'Trabalhista',
    type: 'fixed',
    fixedAmount: '',
    successPct: '',
    causeValue: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="text-5xl">✅</span>
        <p className="font-bold text-gray-800 dark:text-white">Contrato criado com sucesso!</p>
        <p className="text-sm text-gray-500">O contrato de honorários para <strong>{form.clientName}</strong> foi registrado e já está disponível na aba Contratos.</p>
        <button onClick={() => setSubmitted(false)} className="text-xs text-indigo-600 hover:underline mt-2">+ Novo contrato</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
        ⚠️ Os valores serão validados automaticamente contra a Tabela de Honorários OAB 2024.
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nome do Cliente *</label>
          <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: João da Silva" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Área do Direito *</label>
          <select value={form.caseArea} onChange={(e) => setForm({ ...form, caseArea: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {OAB_HONORARY_TABLE_2024.map((t) => <option key={t.area} value={t.area}>{t.area}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tipo de Honorário *</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'fixed', label: '💰 Fixo' },
              { value: 'success', label: '🏆 Êxito' },
              { value: 'mixed', label: '🔀 Misto' },
              { value: 'hourly', label: '⏱️ Por Hora' },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={`py-2 text-sm rounded-lg border font-medium transition-all ${
                  form.type === t.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {(form.type === 'fixed' || form.type === 'mixed') && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Honorário Fixo (R$) *</label>
            <input type="number" value={form.fixedAmount} onChange={(e) => setForm({ ...form, fixedAmount: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: 5000" />
          </div>
        )}

        {(form.type === 'success' || form.type === 'mixed') && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">% de Êxito (máx. 30% - OAB) *</label>
              <input type="number" max="30" value={form.successPct} onChange={(e) => setForm({ ...form, successPct: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Valor estimado da causa (R$) *</label>
              <input type="number" value={form.causeValue} onChange={(e) => setForm({ ...form, causeValue: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 50000" />
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md"
      >
        ✅ Criar Contrato de Honorários
      </button>
    </form>
  );
};

// ─── Modal Principal ──────────────────────────────────────────────────────────

export const OfficeFinancialModal: React.FC<OfficeFinancialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const contracts = useMemo(() => generateSampleContracts(), []);
  const invoices = useMemo(() => generateSampleInvoices(), []);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'contracts', label: 'Contratos', icon: '📋' },
    { id: 'invoices', label: 'Faturas', icon: '🧾' },
    { id: 'debtors', label: 'Inadimplência', icon: '⚠️' },
    { id: 'oab_table', label: 'Tabela OAB', icon: '⚖️' },
    { id: 'new_contract', label: 'Novo', icon: '➕' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-white">💼 Gestão Financeira do Escritório</h2>
            <p className="text-xs text-indigo-200 mt-0.5">Honorários · Faturamento · Inadimplência · Conformidade OAB</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-3 text-xs font-semibold transition-all flex items-center gap-1 border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'dashboard' && <DashboardTab contracts={contracts} invoices={invoices} />}
          {activeTab === 'contracts' && <ContractsTab contracts={contracts} />}
          {activeTab === 'invoices' && <InvoicesTab invoices={invoices} />}
          {activeTab === 'debtors' && <DebtorsTab invoices={invoices} />}
          {activeTab === 'oab_table' && <OabTableTab />}
          {activeTab === 'new_contract' && <NewContractTab />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          <p className="text-center text-xs text-gray-400">
            Legis Connect — Financeiro Jurídico v2.0 · Conforme Lei 8.906/94 (EAOAB) & LGPD
          </p>
        </div>
      </div>
    </div>
  );
};
