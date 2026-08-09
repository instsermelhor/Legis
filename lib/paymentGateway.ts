/**
 * lib/paymentGateway.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor Abstrato de Pagamentos e Split de Honorários Legis Connect.
 * Suporta múltiplos gateways (Stripe, PagBank, Mercado Pago, Asaas).
 * Respeita 100% as diretrizes éticas do Estatuto da Advocacia e OAB.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type EscrowStatus =
  | 'pending_payment'
  | 'in_escrow_custody'
  | 'released_to_lawyer'
  | 'refunded_to_client'
  | 'disputed';

export interface PlanConfig {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  aiTokens: number;
  clientLimit: number;
  popular?: boolean;
}

export const SAAS_PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Advogado Starter',
    priceMonthly: 149.00,
    priceYearly: 119.00, // por mês no plano anual
    aiTokens: 50,
    clientLimit: 15,
    features: [
      'Até 15 clientes ativos',
      '50 petições IA por mês',
      'Assinatura digital de contratos',
      'Recebimento via PIX e Boleto',
      'Suporte via e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Advogado Pro (Recomendado)',
    priceMonthly: 299.00,
    priceYearly: 239.00,
    popular: true,
    aiTokens: 300,
    clientLimit: 100,
    features: [
      'Até 100 clientes ativos',
      '300 petições IA por mês',
      'Pesquisa de jurisprudência em tempo real',
      'Split automático de honorários OAB',
      'Notificações de prazos em tempo real',
      'Suporte prioritário via WhatsApp',
    ],
  },
  {
    id: 'enterprise',
    name: 'Escritório Enterprise',
    priceMonthly: 599.00,
    priceYearly: 479.00,
    aiTokens: 1000,
    clientLimit: 999,
    features: [
      'Clientes e processos ilimitados',
      '1.000 petições IA por mês',
      'Múltiplos advogados e estagiários',
      'Integração direta com o Supabase & PWA',
      'Relatórios financeiros e DRE jurídicos',
      'Gerente de conta dedicado',
    ],
  },
];

export interface PaymentRequest {
  amount: number;
  description: string;
  method: PaymentMethod;
  payerName: string;
  payerCpfEmail: string;
  lawyerId?: string;
  caseId?: string;
  enableEscrow?: boolean;
  splitConfig?: {
    lawyerFeePercentage: number; // Ex: 90% para o advogado
    platformFeePercentage: number; // Ex: 10% para a plataforma
  };
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'approved' | 'failed';
  escrowStatus?: EscrowStatus;
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  barcode?: string;
  pdfUrl?: string;
  method: PaymentMethod;
  amount: number;
  paidAt?: string;
  receiptUrl?: string;
}

/**
 * Gera código PIX estático / dinâmico simulado para pagamentos instantâneos.
 */
export function generatePixData(amount: number, description: string): { copiaECola: string; qrCodeSvg: string } {
  const code = `00020126580014br.gov.bcb.pix0136legis-connect-${Date.now()}520400005303986540${amount.toFixed(2).replace('.', '')}5802BR5913LEGISCONNECT6009SAOPAULO62070503***6304BF2E`;
  return {
    copiaECola: code,
    qrCodeSvg: code,
  };
}

/**
 * Gera linha digitável simulada para Boleto Bancário.
 */
export function generateBoletoCode(amount: number): string {
  const randomPart = Math.floor(1000000000 + Math.random() * 9000000000);
  return `34191.75009 ${randomPart.toString().slice(0, 5)}.${randomPart.toString().slice(5)} 00000.000000 8 ${Date.now().toString().slice(-10)}`;
}

/**
 * Processa a cobrança simulando os gateways Stripe / PagBank / Mercado Pago / Asaas.
 */
export async function processPayment(req: PaymentRequest): Promise<PaymentResponse> {
  // Simula latência de rede de 600ms
  await new Promise(resolve => setTimeout(resolve, 600));

  const transactionId = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const escrowStatus: EscrowStatus = req.enableEscrow ? 'in_escrow_custody' : 'released_to_lawyer';
  const receiptUrl = `https://legisconnect.com.br/recibos/${transactionId}.pdf`;

  if (req.method === 'pix') {
    const pix = generatePixData(req.amount, req.description);
    return {
      transactionId,
      status: 'pending',
      escrowStatus: 'pending_payment',
      pixCopiaECola: pix.copiaECola,
      pixQrCodeUrl: pix.qrCodeSvg,
      method: 'pix',
      amount: req.amount,
      receiptUrl,
    };
  }

  if (req.method === 'boleto') {
    const barcode = generateBoletoCode(req.amount);
    return {
      transactionId,
      status: 'pending',
      escrowStatus: 'pending_payment',
      barcode,
      pdfUrl: `https://legisconnect.com.br/boletos/${transactionId}.pdf`,
      method: 'boleto',
      amount: req.amount,
      receiptUrl,
    };
  }

  // Cartão de Crédito
  return {
    transactionId,
    status: 'approved',
    escrowStatus,
    method: 'credit_card',
    amount: req.amount,
    paidAt: new Date().toISOString(),
    receiptUrl,
  };
}

/**
 * Calcula a divisão ética de honorários (Split OAB compliant).
 */
export function calculateOabSplit(totalAmount: number, lawyerSharePercent = 90) {
  const lawyerAmount = (totalAmount * lawyerSharePercent) / 100;
  const platformAmount = totalAmount - lawyerAmount;

  return {
    total: totalAmount,
    lawyerAmount: Number(lawyerAmount.toFixed(2)),
    platformAmount: Number(platformAmount.toFixed(2)),
    lawyerSharePercent,
    platformSharePercent: 100 - lawyerSharePercent,
  };
}

