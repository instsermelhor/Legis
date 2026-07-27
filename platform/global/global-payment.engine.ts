/**
 * Legis Connect — Global Payments Engine
 * Motor de processamento financeiro multi-moeda e cálculo de impostos regionais
 * Padrão: Global Payment Architecture (Prompt 230 - Etapa 16 & Prompt 219 Integration)
 */

export interface GlobalPaymentRequest {
  tenantId: string;
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
  countryCode: string;
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'SEPA_DIRECT_DEBIT' | 'ACH';
}

export interface PaymentResult {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  chargedAmount: number;
  taxAmount: number;
  currency: string;
}

export class GlobalPaymentEngine {
  async processTransaction(request: GlobalPaymentRequest): Promise<PaymentResult> {
    // 1. Calcular Impostos Regionais (VAT na UE, Sales Tax nos EUA, ISS/Impostos no Brasil)
    const taxRate = this.getRegionalTaxRate(request.countryCode);
    const taxAmount = request.amount * taxRate;
    const totalAmountWithTax = request.amount + taxAmount;

    // 2. Rotear para o Gateway Regional Otimizado
    if (request.currency === 'BRL' && request.paymentMethod === 'PIX') {
      return await this.processBacenPix(request.tenantId, totalAmountWithTax, taxAmount);
    }

    return await this.processStripeGlobal(request, totalAmountWithTax, taxAmount);
  }

  private getRegionalTaxRate(countryCode: string): number {
    const taxRates: Record<string, number> = {
      BR: 0.05,    // ISS
      DE: 0.19,    // German MwSt (VAT)
      FR: 0.20,    // French TVA
      US_CA: 0.0825, // California Sales Tax
    };
    return taxRates[countryCode] || 0.0;
  }

  private async processBacenPix(tenantId: string, total: number, tax: number): Promise<PaymentResult> {
    return {
      transactionId: `pix_${Date.now()}`,
      status: 'SUCCESS',
      chargedAmount: total,
      taxAmount: tax,
      currency: 'BRL',
    };
  }

  private async processStripeGlobal(request: GlobalPaymentRequest, total: number, tax: number): Promise<PaymentResult> {
    return {
      transactionId: `stripe_${Date.now()}`,
      status: 'SUCCESS',
      chargedAmount: total,
      taxAmount: tax,
      currency: request.currency,
    };
  }
}
