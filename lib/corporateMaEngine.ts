/**
 * corporateMaEngine.ts
 * Nível 20 — Módulo de Fusões & Aquisições (M&A), Due Diligence Societária & Auditoria de Passivos Corporativos
 * Legis Connect — Plataforma Jurídica Online
 */

export type RiskSeverity = 'low' | 'medium' | 'high' | 'deal_breaker';
export type LiabilityCategory = 'trabalhista' | 'tributario' | 'civel' | 'ambiental' | 'regulatorio' | 'lgpd';

export interface LiabilityItem {
  id: string;
  category: LiabilityCategory;
  description: string;
  estimatedValue: number;
  probability: 'provavel' | 'possivel' | 'remota';
  severity: RiskSeverity;
  mitigationStrategy: string;
}

export interface MaValuationParams {
  annualRevenue: number;
  ebitda: number;
  ebitdaMultiple: number;
  totalDebt: number;
  cashAndEquivalents: number;
  identifiedLiabilities: number; // Passivos descontados
}

export interface ValuationResult {
  enterpriseValue: number; // EV
  equityValue: number; // Valor de Mercado Acionário
  netPurchasePrice: number; // Preço Final do Deal
  escrowHoldbackAmount: number; // Valor em Custódia Escrow (10-20%)
  breakdown: string[];
}

export interface MaContractTemplate {
  id: string;
  type: 'nda' | 'term_sheet' | 'spa' | 'shareholders_agreement';
  title: string;
  keyClauses: string[];
  templateText: string;
}

// ─── Calculadora de Valuation e Preço Final de Aquisição (Deal Value) ─────────

export function calculateMaValuation(params: MaValuationParams): ValuationResult {
  const { annualRevenue, ebitda, ebitdaMultiple, totalDebt, cashAndEquivalents, identifiedLiabilities } = params;
  const breakdown: string[] = [];

  // Enterprise Value = EBITDA * Múltiplo
  const enterpriseValue = ebitda * ebitdaMultiple;
  breakdown.push(`Enterprise Value (EV): EBITDA R$ ${ebitda.toLocaleString('pt-BR')} × ${ebitdaMultiple}x = R$ ${enterpriseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  // Equity Value = EV - Dívida Líquida (Dívida - Caixa)
  const netDebt = totalDebt - cashAndEquivalents;
  const equityValue = enterpriseValue - netDebt;
  breakdown.push(`Dívida Líquida: Dívida (R$ ${totalDebt.toLocaleString('pt-BR')}) - Caixa (R$ ${cashAndEquivalents.toLocaleString('pt-BR')}) = R$ ${netDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  breakdown.push(`Equity Value: R$ ${equityValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  // Preço de Aquisição Ajustado = Equity Value - Passivos Identificados na Due Diligence
  const netPurchasePrice = Math.max(0, equityValue - identifiedLiabilities);
  breakdown.push(`Desconto de Passivos da Due Diligence: R$ ${identifiedLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  breakdown.push(`Preço Ajustado do Deal (Purchase Price): R$ ${netPurchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  // Retenção Escrow de 15% para garantia de Indenizações (Reps & Warranties)
  const escrowHoldbackAmount = netPurchasePrice * 0.15;
  breakdown.push(`Retenção em Conta Escrow (15% - Garantia 24 meses): R$ ${escrowHoldbackAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  return {
    enterpriseValue,
    equityValue,
    netPurchasePrice,
    escrowHoldbackAmount,
    breakdown,
  };
}

// ─── Dados de Exemplo de Due Diligence Societária ─────────────────────────────

export const MOCK_DUE_DILIGENCE_LIABILITIES: LiabilityItem[] = [
  {
    id: 'LIAB-001',
    category: 'tributario',
    description: 'Auto de Infração da Receita Federal sobre glosa de créditos de PIS/COFINS (período 2021-2023)',
    estimatedValue: 4500000,
    probability: 'possivel',
    severity: 'high',
    mitigationStrategy: 'Cláusula de Indenização Específica com retenção no valor de aquisição.',
  },
  {
    id: 'LIAB-002',
    category: 'trabalhista',
    description: 'Passivo trabalhista acumulado relativo a horas extras e equiparação salarial de cargos gerenciais',
    estimatedValue: 1200000,
    probability: 'provavel',
    severity: 'medium',
    mitigationStrategy: 'Desconto direto do preço final de fechamento (Purchase Price Adjustment).',
  },
  {
    id: 'LIAB-003',
    category: 'lgpd',
    description: 'Inexistência de Relatório de Impacto à Proteção de Dados (RIPD) para base de 2 milhões de usuários',
    estimatedValue: 800000,
    probability: 'possivel',
    severity: 'medium',
    mitigationStrategy: 'Plano de adequação compulsória no período de transição pré-fechamento.',
  },
  {
    id: 'LIAB-004',
    category: 'ambiental',
    description: 'Ausência de Licença de Operação renovada para planta fabril secundária',
    estimatedValue: 8500000,
    probability: 'provavel',
    severity: 'deal_breaker',
    mitigationStrategy: 'Condição Precedente (CP) para o Fechamento (Closing).',
  },
];

// ─── Minuta Padrão de Contrato SPA (Share Purchase Agreement) ────────────────

export function generateSpaContractText(targetName: string, buyerName: string, valuation: ValuationResult): string {
  return `CONTRATO DE COMPRA E VENDA DE AÇÕES E OUTRAS AVENÇAS (SPA)
ALVO: ${targetName.toUpperCase()} | COMPRADOR: ${buyerName.toUpperCase()}
================================================================================
CLÁUSULA PRIMEIRA — DO OBJETO E VALOR DE AQUISIÇÃO
1.1. O Comprador adquire 100% das ações de emissão da Sociedade pelo Preço de Aquisição Ajustado de R$ ${valuation.netPurchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.

CLÁUSULA SEGUNDA — DA RETENÇÃO EM CONTA ESCROW (GUARANTEE)
2.1. Do valor total de aquisição, a quantia de R$ ${valuation.escrowHoldbackAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (15%) ficará retida em Conta Escrow pelo prazo de 24 (vinte e quatro) meses para garantia de eventuais passivos ocultos.

CLÁUSULA TERCEIRA — DECLARAÇÕES E GARANTIAS (REPS & WARRANTIES)
3.1. Os Vendedores declaram e garantem que a Sociedade encontra-se em estrita conformidade com as leis trabalhistas, tributárias, ambientais e de LGPD.

CLÁUSULA QUARTA — DA INDENIZAÇÃO (INDEMNIFICATION)
4.1. Os Vendedores indenizarão o Comprador por qualquer Perda decorrente de inveracidade das Declarações ou passivos anteriores à Data de Fechamento.

================================================================================
Assinado digitalmente via Legis Connect com Autenticação SHA-256
================================================================================`;
}
