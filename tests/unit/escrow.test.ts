/**
 * tests/unit/escrow.test.ts
 * Suíte de Testes Unitários de Escrow (Conta Garantia) e Split OAB Legis Connect
 */

import { calculateOabSplit, processPayment } from '../../lib/paymentGateway';
import { EscrowService } from '../../services/escrowService';
import type { TestResult } from './auth.test';

export async function runEscrowTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Teste 1: Cálculo de Split OAB 90/10
  try {
    const t0 = performance.now();
    const amount = 1000;
    const split = calculateOabSplit(amount, 90);
    const durationMs = Math.round(performance.now() - t0);

    const isSplitCorrect =
      split.lawyerAmount === 900 &&
      split.platformAmount === 100 &&
      split.lawyerSharePercent === 90;

    results.push({
      name: 'OAB Fee Split Calculation (90/10)',
      category: 'ESCROW',
      passed: isSplitCorrect,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'OAB Fee Split Calculation (90/10)',
      category: 'ESCROW',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  // Teste 2: Criação e Ciclo de Vida do Escrow
  try {
    const t0 = performance.now();
    const escrow = await EscrowService.createEscrow({
      transactionId: `tx_unit_${Date.now()}`,
      clientId: 'client_unit_01',
      clientName: 'Cliente Teste QA',
      lawyerId: 'lawyer_unit_01',
      lawyerName: 'Dr. Advogado QA',
      amount: 500,
    });

    const isCustodyActive = escrow.status === 'in_escrow_custody';
    const released = await EscrowService.releaseFunds(escrow.id, 'client_unit_01');
    const isReleased = released?.status === 'released_to_lawyer';
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'Escrow Custody Lifecycle (Deposit -> Release)',
      category: 'ESCROW',
      passed: isCustodyActive && isReleased,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Escrow Custody Lifecycle (Deposit -> Release)',
      category: 'ESCROW',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  // Teste 3: Processamento PIX com QR Code
  try {
    const t0 = performance.now();
    const resp = await processPayment({
      amount: 250,
      description: 'Consultoria Teste PIX QA',
      method: 'pix',
      payerName: 'Cliente PIX QA',
      payerCpfEmail: 'cliente.pix@legisconnect.com.br',
    });
    const durationMs = Math.round(performance.now() - t0);

    const isPixValid =
      resp.status === 'pending' &&
      !!resp.pixCopiaECola &&
      resp.pixCopiaECola.startsWith('00020126580014');

    results.push({
      name: 'PIX Payment QR Code Generation',
      category: 'ESCROW',
      passed: isPixValid,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'PIX Payment QR Code Generation',
      category: 'ESCROW',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  return results;
}
