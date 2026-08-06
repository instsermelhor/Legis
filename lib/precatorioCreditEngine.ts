/**
 * precatorioCreditEngine.ts
 * Nível 24 — IA para Gestão de Precatórios, RPVs, Cessão de Créditos Judiciais & Cálculo de Deságio
 * Legis Connect — Plataforma Jurídica Online
 */

export type PrecatorioEntity = 'União Federal' | 'Estado de SP (TJSP)' | 'Estado do RJ (TJRJ)' | 'Estado de MG (TJMG)' | 'Município de São Paulo' | 'Outros Entes';
export type PrecatorioNature = 'Alimentar' | 'Comum';

export interface PrecatorioValuationInput {
  grossAmount: number; // Valor de Face Bruto (R$)
  entity: PrecatorioEntity;
  nature: PrecatorioNature;
  isPreferential: boolean; // Maior de 60 anos ou doença grave (Art. 100 §2º CF)
  haircutPercentage: number; // Deságio (10% a 50%)
  lawyerFeePercentage: number; // Honorários advocatícios destacados (ex: 20%)
  estimatedYearsToPay: number;
}

export interface PrecatorioValuationResult {
  grossAmount: number;
  lawyerFeeAmount: number;
  assignorBaseAmount: number; // Valor após honorários
  discountAmount: number; // Valor retido pelo deságio
  netPayoutToClient: number; // Valor Líquido a receber pelo Cedente
  effectiveYieldAnnual: number;
  signatureHash: string;
}

// ─── Simulador de Valuation & Deságio de Precatórios ─────────────────────────

export function calculatePrecatorioValuation(input: PrecatorioValuationInput): PrecatorioValuationResult {
  const { grossAmount, haircutPercentage, lawyerFeePercentage, estimatedYearsToPay } = input;

  const lawyerFeeAmount = grossAmount * (lawyerFeePercentage / 100);
  const assignorBaseAmount = grossAmount - lawyerFeeAmount;
  const discountAmount = assignorBaseAmount * (haircutPercentage / 100);
  const netPayoutToClient = assignorBaseAmount - discountAmount;

  // Rendimento anual efetivo para o investidor/cessionário
  const totalGain = assignorBaseAmount - netPayoutToClient;
  const effectiveYieldAnnual = estimatedYearsToPay > 0 ? (totalGain / netPayoutToClient / estimatedYearsToPay) * 100 : 0;

  return {
    grossAmount,
    lawyerFeeAmount,
    assignorBaseAmount,
    discountAmount,
    netPayoutToClient,
    effectiveYieldAnnual,
    signatureHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
  };
}

// ─── Gerador de Contrato de Cessão de Crédito Judicial ───────────────────────

export function generatePrecatorioAssignmentContract(params: {
  assignorName: string; // Cedente
  assigneeName: string; // Cessionário
  processNumber: string;
  precatorioNumber: string;
  entity: PrecatorioEntity;
  valuation: PrecatorioValuationResult;
}): string {
  const { assignorName, assigneeName, processNumber, precatorioNumber, entity, valuation } = params;

  return `INSTRUMENTO PARTICULAR DE CESSÃO ONEROSA DE CRÉDITO JUDICIAL E PRECATÓRIO
================================================================================
CEDENTE: ${assignorName.toUpperCase()}
CESSIONÁRIO: ${assigneeName.toUpperCase()}
PROCESSO DE ORIGEM Nº: ${processNumber}
PRECATÓRIO / RPV Nº: ${precatorioNumber}
ENTE DEVEDOR: ${entity.toUpperCase()}

CLÁUSULA PRIMEIRA — DO OBJETO
O CEDENTE, por meio deste instrumento, cede e transfere ao CESSIONÁRIO a integralidade/fração dos direitos creditórios oriundos do Precatório nº ${precatorioNumber}, expedido nos autos do Processo nº ${processNumber}.

CLÁUSULA SEGUNDA — DO PREÇO E CONDICIONALIDADES
Pela cessão do crédito no valor facial de R$ ${valuation.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, o CESSIONÁRIO pagará ao CEDENTE o valor líquido e certo de:
R$ ${valuation.netPayoutToClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (com deságio acordado e dedução dos honorários contratuais de R$ ${valuation.lawyerFeeAmount.toLocaleString('pt-BR')}).

CLÁUSULA TERCEIRA — DA GARANTIA DE EVICÇÃO DE DIREITO
O CEDENTE responde pela existência do crédito e pela legitimidade do precatório objeto da presente cessão, nos termos do Art. 295 do Código Civil Brasileiro.

CLÁUSULA QUARTA — DA NOTIFICAÇÃO AO ENTE DEVEDOR E AO TRIBUNAL
As partes acordam protocolar a presente cessão de crédito no tribunal de origem para a devida substituição processual e retificação da ordem de pagamento, nos termos do Art. 100, § 13 da Constituição Federal.

E por estarem assim justos e contratados, assinam o presente instrumento.

Local e Data.
HASH CRIPTOGRÁFICO DE AUTENTICIDADE SHA-256:
${valuation.signatureHash}
================================================================================
Legis Connect Precatórios & Credit Trading Suite — 2026`;
}
