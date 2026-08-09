/**
 * services/escrowService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Serviço de Gestão de Custódia em Conta Garantia (Escrow Jurídico).
 * Retém honorários em garantia até a conclusão/confirmação do serviço.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { EscrowStatus, calculateOabSplit } from '../lib/paymentGateway';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLogger } from '../security/auditLogger';

export interface EscrowTransaction {
  id: string;
  transactionId: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  caseId?: string;
  caseTitle?: string;
  totalAmount: number;
  lawyerAmount: number;
  platformAmount: number;
  lawyerSharePercent: number;
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
  proofUrl?: string;
  proofNotes?: string;
  disputeReason?: string;
}

const LOCAL_STORAGE_KEY = 'legis_escrow_transactions';

function getLocalEscrow(): EscrowTransaction[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEscrow(items: EscrowTransaction[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[EscrowService] Failed to save local escrow transactions', e);
  }
}

export const EscrowService = {
  async createEscrow(data: {
    transactionId: string;
    clientId: string;
    clientName: string;
    lawyerId: string;
    lawyerName: string;
    caseId?: string;
    caseTitle?: string;
    amount: number;
    lawyerSharePercent?: number;
  }): Promise<EscrowTransaction> {
    const split = calculateOabSplit(data.amount, data.lawyerSharePercent ?? 90);

    const newEscrow: EscrowTransaction = {
      id: `escrow_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      transactionId: data.transactionId,
      clientId: data.clientId,
      clientName: data.clientName,
      lawyerId: data.lawyerId,
      lawyerName: data.lawyerName,
      caseId: data.caseId,
      caseTitle: data.caseTitle,
      totalAmount: data.amount,
      lawyerAmount: split.lawyerAmount,
      platformAmount: split.platformAmount,
      lawyerSharePercent: split.lawyerSharePercent,
      status: 'in_escrow_custody',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('invoices').insert({
          id: newEscrow.id,
          client_id: data.clientId,
          lawyer_id: data.lawyerId,
          amount: data.amount,
          status: 'in_escrow_custody',
          due_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[EscrowService] Failed to sync escrow to Supabase', e);
      }
    }

    const local = getLocalEscrow();
    saveLocalEscrow([newEscrow, ...local]);

    AuditLogger.log({
      action: 'ESCROW_CREATED',
      actorId: data.clientId,
      actorRole: 'CLIENT',
      details: `Depósito em Escrow criado: R$ ${data.amount.toFixed(2)} mantido em custódia para o advogado ${data.lawyerName}`,
      severity: 'INFO',
    });

    return newEscrow;
  },

  async getByLawyer(lawyerId: string): Promise<EscrowTransaction[]> {
    const local = getLocalEscrow();
    return local.filter(e => e.lawyerId === lawyerId);
  },

  async getByClient(clientId: string): Promise<EscrowTransaction[]> {
    const local = getLocalEscrow();
    return local.filter(e => e.clientId === clientId);
  },

  async getAll(): Promise<EscrowTransaction[]> {
    return getLocalEscrow();
  },

  async uploadProof(escrowId: string, proofNotes: string, proofUrl?: string): Promise<EscrowTransaction | null> {
    const local = getLocalEscrow();
    const idx = local.findIndex(e => e.id === escrowId);
    if (idx === -1) return null;

    local[idx].proofNotes = proofNotes;
    if (proofUrl) local[idx].proofUrl = proofUrl;
    local[idx].updatedAt = new Date().toISOString();

    saveLocalEscrow(local);
    return local[idx];
  },

  async releaseFunds(escrowId: string, actorId: string): Promise<EscrowTransaction | null> {
    const local = getLocalEscrow();
    const idx = local.findIndex(e => e.id === escrowId);
    if (idx === -1) return null;

    local[idx].status = 'released_to_lawyer';
    local[idx].releasedAt = new Date().toISOString();
    local[idx].updatedAt = new Date().toISOString();

    saveLocalEscrow(local);

    AuditLogger.log({
      action: 'ESCROW_RELEASED',
      actorId,
      actorRole: 'CLIENT',
      details: `Fundos em custódia de R$ ${local[idx].totalAmount.toFixed(2)} liberados para o advogado (Repasse: R$ ${local[idx].lawyerAmount.toFixed(2)})`,
      severity: 'INFO',
    });

    return local[idx];
  },

  async disputeEscrow(escrowId: string, reason: string, actorId: string): Promise<EscrowTransaction | null> {
    const local = getLocalEscrow();
    const idx = local.findIndex(e => e.id === escrowId);
    if (idx === -1) return null;

    local[idx].status = 'disputed';
    local[idx].disputeReason = reason;
    local[idx].updatedAt = new Date().toISOString();

    saveLocalEscrow(local);

    AuditLogger.log({
      action: 'ESCROW_DISPUTED',
      actorId,
      actorRole: 'CLIENT',
      details: `Disputa iniciada no valor de R$ ${local[idx].totalAmount.toFixed(2)}. Motivo: ${reason}`,
      severity: 'WARNING',
    });

    return local[idx];
  },
};
