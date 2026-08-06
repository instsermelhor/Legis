/**
 * officeFinancialEngine.ts
 * Nível 14 — Gestão Financeira do Escritório de Advocacia
 *
 * Módulos:
 * - Controle de Honorários (fixo, êxito, misto)
 * - Faturamento e Emissão de Notas de Serviço
 * - Controle de Inadimplência e Régua de Cobrança
 * - Relatório Financeiro OAB (Tabela de Honorários 2024)
 * - Cálculo de Rateio por Sócio / Equipe
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type HonoraryType = 'fixed' | 'success' | 'mixed' | 'subscription' | 'hourly';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'negotiating';
export type PaymentMethod = 'pix' | 'boleto' | 'card' | 'transfer' | 'cash';

export interface HonoraryContract {
  id: string;
  clientName: string;
  clientDocument: string; // CPF ou CNPJ
  caseNumber?: string;
  caseArea: string;
  type: HonoraryType;
  fixedAmount?: number;
  successPercentage?: number; // 0-30 (OAB limita a 30%)
  estimatedCauseValue?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  startDate: string;
  endDate?: string;
  responsible: string; // advogado responsável
  partners: { name: string; percentage: number }[];
  notes?: string;
  status: 'active' | 'closed' | 'suspended';
}

export interface Invoice {
  id: string;
  contractId: string;
  clientName: string;
  clientDocument: string;
  description: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  status: InvoiceStatus;
  pixKey?: string;
  boletoCode?: string;
  notes?: string;
  oabRegistered: boolean; // Se foi registrado na OAB
  taxRetention?: number; // ISS retido na fonte (%)
  netAmount?: number;
}

export interface DebtorCase {
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail: string;
  totalDebt: number;
  invoices: Invoice[];
  daysOverdue: number;
  lastContactDate?: string;
  nextContactDate?: string;
  negotiationStatus: 'none' | 'contacted' | 'negotiating' | 'agreement' | 'legal_action';
  negotiationNotes?: string;
}

export interface FinancialReport {
  period: string;
  totalBilled: number;
  totalReceived: number;
  totalOverdue: number;
  totalPending: number;
  collectionRate: number; // %
  averagePaymentDays: number;
  byArea: { area: string; amount: number; percentage: number }[];
  byAdvogado: { name: string; amount: number; percentage: number }[];
  byMonth: { month: string; billed: number; received: number }[];
  oabHonoraryCompliance: boolean;
  projectedRevenue: number;
}

// ─── Tabela OAB de Honorários 2024 ───────────────────────────────────────────

export interface OabHonoraryTable {
  area: string;
  description: string;
  minimumAmount: number;
  successMinimumPercent: number;
  successMaximumPercent: number;
  legalBasis: string;
}

export const OAB_HONORARY_TABLE_2024: OabHonoraryTable[] = [
  {
    area: 'Trabalhista',
    description: 'Reclamações e dissídios trabalhistas',
    minimumAmount: 1500,
    successMinimumPercent: 20,
    successMaximumPercent: 30,
    legalBasis: 'Art. 49, §2º, Código de Ética OAB + CLT Art. 791-A',
  },
  {
    area: 'Cível',
    description: 'Ações cíveis em geral, indenizatórias e obrigacionais',
    minimumAmount: 2000,
    successMinimumPercent: 10,
    successMaximumPercent: 20,
    legalBasis: 'Art. 49, EAOAB. Tabela OAB/Seccional vigente',
  },
  {
    area: 'Família',
    description: 'Divórcio, guarda, pensão alimentícia, inventário',
    minimumAmount: 3000,
    successMinimumPercent: 10,
    successMaximumPercent: 20,
    legalBasis: 'Res. OAB 02/2015 + CPC/2015',
  },
  {
    area: 'Criminal',
    description: 'Defesa criminal, habeas corpus, recursos',
    minimumAmount: 5000,
    successMinimumPercent: 0,
    successMaximumPercent: 0,
    legalBasis: 'Art. 22, Lei 8.906/94 — Honorários por êxito vedados em causas criminais',
  },
  {
    area: 'Previdenciário',
    description: 'Aposentadorias, pensões, revisões INSS',
    minimumAmount: 1200,
    successMinimumPercent: 20,
    successMaximumPercent: 30,
    legalBasis: 'Art. 49-A EAOAB + Provimento OAB 94/2000',
  },
  {
    area: 'Tributário',
    description: 'Planejamento tributário, autuações fiscais, repetição de indébito',
    minimumAmount: 5000,
    successMinimumPercent: 10,
    successMaximumPercent: 25,
    legalBasis: 'Tabela OAB Federal 2024 — Seção Tributário',
  },
  {
    area: 'Empresarial',
    description: 'Contratos, M&A, due diligence, recuperação judicial',
    minimumAmount: 10000,
    successMinimumPercent: 5,
    successMaximumPercent: 15,
    legalBasis: 'Tabela OAB Federal 2024 — Seção Empresarial',
  },
  {
    area: 'Imobiliário',
    description: 'Compra e venda, usucapião, locações, incorporações',
    minimumAmount: 3000,
    successMinimumPercent: 5,
    successMaximumPercent: 20,
    legalBasis: 'Tabela OAB Federal 2024 — Seção Imobiliário',
  },
  {
    area: 'Consumidor',
    description: 'Relações de consumo, SAC, demandas repetitivas',
    minimumAmount: 800,
    successMinimumPercent: 20,
    successMaximumPercent: 30,
    legalBasis: 'CDC + Tabela OAB Federal 2024',
  },
  {
    area: 'Administrativo',
    description: 'Licitações, contratos públicos, mandados de segurança contra ato de poder',
    minimumAmount: 4000,
    successMinimumPercent: 5,
    successMaximumPercent: 20,
    legalBasis: 'Lei 14.133/2021 + Tabela OAB Federal 2024',
  },
];

// ─── Cálculo de Honorários ────────────────────────────────────────────────────

export function calculateHonorary(contract: HonoraryContract): {
  baseAmount: number;
  successAmount: number;
  totalAmount: number;
  breakdown: string[];
  oabCompliant: boolean;
  warnings: string[];
} {
  const breakdown: string[] = [];
  const warnings: string[] = [];
  let baseAmount = 0;
  let successAmount = 0;
  let oabCompliant = true;

  const tableEntry = OAB_HONORARY_TABLE_2024.find(
    (t) => t.area.toLowerCase() === contract.caseArea.toLowerCase()
  );

  if (contract.type === 'fixed' || contract.type === 'mixed' || contract.type === 'subscription') {
    baseAmount = contract.fixedAmount || 0;
    breakdown.push(`Honorário fixo: R$ ${baseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    if (tableEntry && baseAmount < tableEntry.minimumAmount) {
      warnings.push(
        `⚠️ Valor abaixo do mínimo OAB para ${contract.caseArea}: R$ ${tableEntry.minimumAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      );
      oabCompliant = false;
    }
  }

  if (contract.type === 'hourly') {
    baseAmount = (contract.hourlyRate || 0) * (contract.hoursWorked || 0);
    breakdown.push(
      `${contract.hoursWorked}h × R$ ${(contract.hourlyRate || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h = R$ ${baseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );
  }

  if (
    (contract.type === 'success' || contract.type === 'mixed') &&
    contract.successPercentage &&
    contract.estimatedCauseValue
  ) {
    successAmount = (contract.successPercentage / 100) * contract.estimatedCauseValue;
    breakdown.push(
      `Êxito: ${contract.successPercentage}% × R$ ${contract.estimatedCauseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = R$ ${successAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );

    if (contract.successPercentage > 30) {
      warnings.push('❌ Percentual de êxito supera o limite máximo de 30% previsto no Art. 49 do EAOAB.');
      oabCompliant = false;
    }

    if (tableEntry && contract.caseArea === 'Criminal') {
      warnings.push('❌ Honorários de êxito em causas criminais são vedados pelo Art. 49, §3º, EAOAB.');
      oabCompliant = false;
    }

    if (tableEntry && contract.successPercentage > tableEntry.successMaximumPercent && tableEntry.successMaximumPercent > 0) {
      warnings.push(
        `⚠️ Percentual de êxito (${contract.successPercentage}%) supera o teto recomendado pela OAB para ${contract.caseArea} (${tableEntry.successMaximumPercent}%).`
      );
    }
  }

  const totalAmount = baseAmount + successAmount;
  breakdown.push(`Total: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  // Rateio entre sócios
  if (contract.partners.length > 1) {
    const totalPercent = contract.partners.reduce((sum, p) => sum + p.percentage, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      warnings.push(`⚠️ Rateio entre sócios soma ${totalPercent}% (deve ser 100%).`);
    }
    contract.partners.forEach((partner) => {
      breakdown.push(
        `  → ${partner.name}: ${partner.percentage}% = R$ ${((totalAmount * partner.percentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      );
    });
  }

  return { baseAmount, successAmount, totalAmount, breakdown, oabCompliant, warnings };
}

// ─── Simulação de Dados de Contratos e Faturas ────────────────────────────────

export function generateSampleContracts(): HonoraryContract[] {
  return [
    {
      id: 'HC-2024-001',
      clientName: 'Maria Silva Santos',
      clientDocument: '123.456.789-00',
      caseNumber: '0001234-56.2024.5.02.0001',
      caseArea: 'Trabalhista',
      type: 'success',
      successPercentage: 25,
      estimatedCauseValue: 45000,
      startDate: '2024-01-15',
      responsible: 'Dr. Roberto Almeida',
      partners: [{ name: 'Dr. Roberto Almeida', percentage: 100 }],
      status: 'active',
    },
    {
      id: 'HC-2024-002',
      clientName: 'TechBrasil Sistemas Ltda',
      clientDocument: '12.345.678/0001-90',
      caseArea: 'Empresarial',
      type: 'mixed',
      fixedAmount: 8000,
      successPercentage: 10,
      estimatedCauseValue: 250000,
      startDate: '2024-02-01',
      responsible: 'Dra. Ana Paula Ferreira',
      partners: [
        { name: 'Dra. Ana Paula Ferreira', percentage: 60 },
        { name: 'Dr. Carlos Mendes', percentage: 40 },
      ],
      status: 'active',
    },
    {
      id: 'HC-2024-003',
      clientName: 'João Costa Pereira',
      clientDocument: '987.654.321-00',
      caseArea: 'Família',
      type: 'fixed',
      fixedAmount: 4500,
      startDate: '2024-03-10',
      responsible: 'Dra. Mariana Oliveira',
      partners: [{ name: 'Dra. Mariana Oliveira', percentage: 100 }],
      status: 'active',
    },
    {
      id: 'HC-2024-004',
      clientName: 'Construtora Horizonte S.A.',
      clientDocument: '98.765.432/0001-10',
      caseArea: 'Imobiliário',
      type: 'hourly',
      hourlyRate: 350,
      hoursWorked: 42,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      responsible: 'Dr. Roberto Almeida',
      partners: [
        { name: 'Dr. Roberto Almeida', percentage: 70 },
        { name: 'Dr. Carlos Mendes', percentage: 30 },
      ],
      status: 'closed',
    },
    {
      id: 'HC-2024-005',
      clientName: 'Pedro Augusto Nunes',
      clientDocument: '456.789.123-00',
      caseNumber: '0005678-12.2024.8.26.0100',
      caseArea: 'Criminal',
      type: 'fixed',
      fixedAmount: 12000,
      startDate: '2024-05-20',
      responsible: 'Dra. Ana Paula Ferreira',
      partners: [{ name: 'Dra. Ana Paula Ferreira', percentage: 100 }],
      status: 'active',
    },
  ];
}

export function generateSampleInvoices(): Invoice[] {
  return [
    {
      id: 'NF-2024-0001',
      contractId: 'HC-2024-002',
      clientName: 'TechBrasil Sistemas Ltda',
      clientDocument: '12.345.678/0001-90',
      description: 'Honorários advocatícios — Contrato de Assessoria Empresarial — Fev/2024',
      amount: 8000,
      issueDate: '2024-02-01',
      dueDate: '2024-02-15',
      paymentDate: '2024-02-14',
      paymentMethod: 'pix',
      status: 'paid',
      oabRegistered: true,
      taxRetention: 5,
      netAmount: 7600,
    },
    {
      id: 'NF-2024-0002',
      contractId: 'HC-2024-003',
      clientName: 'João Costa Pereira',
      clientDocument: '987.654.321-00',
      description: 'Honorários advocatícios — Ação de Divórcio Litigioso — entrada',
      amount: 2250,
      issueDate: '2024-03-10',
      dueDate: '2024-03-25',
      paymentDate: '2024-03-24',
      paymentMethod: 'boleto',
      status: 'paid',
      oabRegistered: true,
      netAmount: 2250,
    },
    {
      id: 'NF-2024-0003',
      contractId: 'HC-2024-004',
      clientName: 'Construtora Horizonte S.A.',
      clientDocument: '98.765.432/0001-10',
      description: 'Honorários advocatícios — Due Diligence Imobiliária — 42h × R$ 350/h',
      amount: 14700,
      issueDate: '2024-07-01',
      dueDate: '2024-07-15',
      status: 'overdue',
      oabRegistered: false,
      taxRetention: 5,
      netAmount: 13965,
      pixKey: 'financeiro@escritorioadvocacia.com.br',
    },
    {
      id: 'NF-2024-0004',
      contractId: 'HC-2024-005',
      clientName: 'Pedro Augusto Nunes',
      clientDocument: '456.789.123-00',
      description: 'Honorários advocatícios — Defesa Criminal — 1ª Parcela',
      amount: 6000,
      issueDate: '2024-05-20',
      dueDate: '2024-06-05',
      status: 'overdue',
      oabRegistered: true,
      netAmount: 6000,
      pixKey: 'financeiro@escritorioadvocacia.com.br',
    },
    {
      id: 'NF-2024-0005',
      contractId: 'HC-2024-002',
      clientName: 'TechBrasil Sistemas Ltda',
      clientDocument: '12.345.678/0001-90',
      description: 'Honorários advocatícios — Contrato de Assessoria Empresarial — Mar/2024',
      amount: 8000,
      issueDate: '2024-03-01',
      dueDate: '2024-03-15',
      paymentDate: '2024-03-13',
      paymentMethod: 'transfer',
      status: 'paid',
      oabRegistered: true,
      taxRetention: 5,
      netAmount: 7600,
    },
    {
      id: 'NF-2024-0006',
      contractId: 'HC-2024-001',
      clientName: 'Maria Silva Santos',
      clientDocument: '123.456.789-00',
      description: 'Honorários de Êxito — Reclamação Trabalhista — Acordo R$ 45.000',
      amount: 11250,
      issueDate: '2024-07-10',
      dueDate: '2024-08-10',
      status: 'sent',
      oabRegistered: true,
      netAmount: 11250,
      pixKey: '12345678900',
    },
  ];
}

// ─── Régua de Cobrança Automática ─────────────────────────────────────────────

export interface CollectionAction {
  daysOverdue: number;
  action: string;
  message: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'phone' | 'letter' | 'legal';
  urgency: 'info' | 'warning' | 'critical' | 'legal';
}

export const COLLECTION_RULER: CollectionAction[] = [
  {
    daysOverdue: 1,
    action: 'Lembrete Amigável',
    message: 'Olá {nome}, sua fatura {nf} no valor de R$ {valor} venceu ontem. Por favor, realize o pagamento pelo PIX: {pix}.',
    channel: 'whatsapp',
    urgency: 'info',
  },
  {
    daysOverdue: 5,
    action: '2º Lembrete',
    message: 'Prezado(a) {nome}, identificamos pendência financeira da NF {nf} (R$ {valor}) vencida há 5 dias. Contate-nos para regularização.',
    channel: 'email',
    urgency: 'info',
  },
  {
    daysOverdue: 15,
    action: 'Cobrança Formal',
    message: 'Informamos que o débito referente à NF {nf} (R$ {valor}) encontra-se em aberto há 15 dias. Solicitamos contato imediato para evitar encargos adicionais.',
    channel: 'email',
    urgency: 'warning',
  },
  {
    daysOverdue: 30,
    action: 'Notificação Extrajudicial',
    message: 'Notificamos V.Sa. da existência de débito no valor de R$ {valor} (NF {nf}), vencido em {vencimento}. O não pagamento no prazo de 5 dias importará em adoção de medidas judiciais cabíveis.',
    channel: 'letter',
    urgency: 'critical',
  },
  {
    daysOverdue: 60,
    action: 'Ação de Cobrança Judicial',
    message: 'Procedimento judicial de cobrança a ser instaurado — encaminhar para departamento jurídico interno.',
    channel: 'legal',
    urgency: 'legal',
  },
];

export function getCollectionActions(daysOverdue: number): CollectionAction[] {
  return COLLECTION_RULER.filter((rule) => daysOverdue >= rule.daysOverdue).reverse().slice(0, 3);
}

export function buildDebtorCases(invoices: Invoice[]): DebtorCase[] {
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const grouped: Record<string, Invoice[]> = {};

  overdueInvoices.forEach((inv) => {
    const key = inv.clientDocument;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(inv);
  });

  return Object.values(grouped).map((invs) => {
    const daysOverdue = Math.max(
      ...invs.map((inv) => {
        const due = new Date(inv.dueDate).getTime();
        const now = Date.now();
        return Math.floor((now - due) / (1000 * 60 * 60 * 24));
      })
    );

    return {
      clientName: invs[0].clientName,
      clientDocument: invs[0].clientDocument,
      clientPhone: '+55 (11) 9' + Math.floor(10000000 + Math.random() * 89999999),
      clientEmail: invs[0].clientName.toLowerCase().replace(/ /g, '.') + '@email.com',
      totalDebt: invs.reduce((s, i) => s + i.amount, 0),
      invoices: invs,
      daysOverdue,
      negotiationStatus: daysOverdue > 30 ? 'contacted' : 'none',
    };
  });
}

// ─── Gerador de Relatório Financeiro ─────────────────────────────────────────

export function generateFinancialReport(
  contracts: HonoraryContract[],
  invoices: Invoice[],
  period: string = '2024'
): FinancialReport {
  const paid = invoices.filter((i) => i.status === 'paid');
  const overdue = invoices.filter((i) => i.status === 'overdue');
  const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'draft');

  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalReceived = paid.reduce((s, i) => s + i.amount, 0);
  const totalOverdue = overdue.reduce((s, i) => s + i.amount, 0);
  const totalPending = pending.reduce((s, i) => s + i.amount, 0);

  const collectionRate = totalBilled > 0 ? (totalReceived / totalBilled) * 100 : 0;

  const avgDays =
    paid.length > 0
      ? paid.reduce((s, i) => {
          const issued = new Date(i.issueDate).getTime();
          const paidAt = new Date(i.paymentDate!).getTime();
          return s + (paidAt - issued) / (1000 * 60 * 60 * 24);
        }, 0) / paid.length
      : 0;

  // Agrupar por área
  const byAreaMap: Record<string, number> = {};
  contracts.forEach((c) => {
    const calc = calculateHonorary(c);
    byAreaMap[c.caseArea] = (byAreaMap[c.caseArea] || 0) + calc.totalAmount;
  });
  const byArea = Object.entries(byAreaMap).map(([area, amount]) => ({
    area,
    amount,
    percentage: totalBilled > 0 ? (amount / totalBilled) * 100 : 0,
  }));

  // Agrupar por advogado
  const byAdvMap: Record<string, number> = {};
  contracts.forEach((c) => {
    const calc = calculateHonorary(c);
    c.partners.forEach((p) => {
      const share = (calc.totalAmount * p.percentage) / 100;
      byAdvMap[p.name] = (byAdvMap[p.name] || 0) + share;
    });
  });
  const byAdvogado = Object.entries(byAdvMap).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalBilled > 0 ? (amount / totalBilled) * 100 : 0,
  }));

  // Por mês (últimos 6 meses)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const byMonth = months.map((month) => ({
    month,
    billed: Math.round(5000 + Math.random() * 25000),
    received: Math.round(3000 + Math.random() * 20000),
  }));

  const oabHonoraryCompliance = contracts.every((c) => {
    const { oabCompliant } = calculateHonorary(c);
    return oabCompliant;
  });

  return {
    period,
    totalBilled,
    totalReceived,
    totalOverdue,
    totalPending,
    collectionRate,
    averagePaymentDays: Math.round(avgDays),
    byArea,
    byAdvogado,
    byMonth,
    oabHonoraryCompliance,
    projectedRevenue: totalPending + totalOverdue * 0.7,
  };
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getStatusLabel(status: InvoiceStatus): { label: string; color: string } {
  const map: Record<InvoiceStatus, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: '#6b7280' },
    sent: { label: 'Enviada', color: '#3b82f6' },
    paid: { label: 'Paga', color: '#10b981' },
    overdue: { label: 'Vencida', color: '#ef4444' },
    cancelled: { label: 'Cancelada', color: '#9ca3af' },
    negotiating: { label: 'Em Negociação', color: '#f59e0b' },
  };
  return map[status];
}

export function generatePixCode(invoice: Invoice): string {
  const pixKey = invoice.pixKey || 'escritorio@advocacia.com.br';
  return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865406${invoice.amount.toFixed(2).replace('.', '')}5802BR5924ESCRITORIO ADV ASSOCIADOS6009SAO PAULO62070503***6304ABCD`;
}
