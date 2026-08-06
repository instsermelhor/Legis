/**
 * lgpdRightsService.ts — ISS-035
 *
 * Portal de Direitos do Titular — LGPD Arts. 17-22
 *
 * Gerencia solicitações dos titulares de dados:
 *   - Art. 18 I   → Confirmação de tratamento
 *   - Art. 18 II  → Acesso aos dados
 *   - Art. 18 III → Correção de dados incompletos/incorretos
 *   - Art. 18 IV  → Anonimização / Bloqueio / Eliminação
 *   - Art. 18 V   → Portabilidade
 *   - Art. 18 VI  → Eliminação definitiva (direito ao esquecimento)
 *   - Art. 18 VII → Informação sobre compartilhamento
 *   - Art. 18 VIII→ Revogação de consentimento
 *   - Art. 18 IX  → Petição à ANPD
 *
 * Prazo legal de resposta: 15 dias corridos (Art. 19)
 */

const STORAGE_KEY = 'legis_lgpd_requests';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type LgpdRightType =
  | 'confirmation'        // Art. 18 I
  | 'access'              // Art. 18 II
  | 'correction'          // Art. 18 III
  | 'anonymization'       // Art. 18 IV
  | 'portability'         // Art. 18 V
  | 'deletion'            // Art. 18 VI
  | 'sharing_info'        // Art. 18 VII
  | 'consent_revocation'  // Art. 18 VIII
  | 'anpd_petition';      // Art. 18 IX

export type LgpdRequestStatus =
  | 'pending'      // aguardando análise
  | 'in_review'    // em análise pelo DPO
  | 'completed'    // concluído dentro do prazo
  | 'rejected'     // rejeitado com justificativa
  | 'overdue';     // prazo legal ultrapassado

export interface LgpdRightsRequest {
  id: string;
  userId: string;
  userEmail: string;
  rightType: LgpdRightType;
  description: string;
  status: LgpdRequestStatus;
  createdAt: string;
  /** 15 dias corridos a partir de createdAt (Art. 19 LGPD) */
  deadlineAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// ── Labels e descrições para UI ───────────────────────────────────────────────

export const LGPD_RIGHT_LABELS: Record<LgpdRightType, { title: string; description: string; article: string }> = {
  confirmation:       { title: 'Confirmação de Tratamento',    description: 'Confirmar se tratamos seus dados pessoais.',                                       article: 'Art. 18, I' },
  access:             { title: 'Acesso aos Dados',             description: 'Obter cópia completa dos seus dados que tratamos.',                                  article: 'Art. 18, II' },
  correction:         { title: 'Correção de Dados',            description: 'Solicitar a correção de dados incompletos, inexatos ou desatualizados.',             article: 'Art. 18, III' },
  anonymization:      { title: 'Anonimização / Bloqueio',      description: 'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.',            article: 'Art. 18, IV' },
  portability:        { title: 'Portabilidade',                description: 'Receber seus dados em formato estruturado para outro serviço.',                      article: 'Art. 18, V' },
  deletion:           { title: 'Eliminação Definitiva',        description: 'Solicitar a exclusão permanente dos seus dados pessoais.',                           article: 'Art. 18, VI' },
  sharing_info:       { title: 'Informação sobre Compartilhamento', description: 'Saber com quais entidades seus dados são compartilhados.',                     article: 'Art. 18, VII' },
  consent_revocation: { title: 'Revogação de Consentimento',   description: 'Revogar o consentimento dado anteriormente para uso dos seus dados.',               article: 'Art. 18, VIII' },
  anpd_petition:      { title: 'Petição à ANPD',              description: 'Registrar reclamação perante a Autoridade Nacional de Proteção de Dados (ANPD).',    article: 'Art. 18, IX' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `lgpd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Calcula prazo legal de 15 dias corridos (Art. 19 LGPD) */
function calcDeadline(from: string): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 15);
  return d.toISOString();
}

// ── Service ───────────────────────────────────────────────────────────────────

export function getLgpdRequests(): LgpdRightsRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLgpdRequestsByUser(userId: string): LgpdRightsRequest[] {
  return getLgpdRequests().filter((r) => r.userId === userId);
}

export function createLgpdRequest(params: {
  userId: string;
  userEmail: string;
  rightType: LgpdRightType;
  description: string;
}): LgpdRightsRequest {
  const now = new Date().toISOString();
  const request: LgpdRightsRequest = {
    id: generateId(),
    ...params,
    status: 'pending',
    createdAt: now,
    deadlineAt: calcDeadline(now),
  };

  const all = getLgpdRequests();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([request, ...all]));
  return request;
}

export function updateLgpdRequestStatus(
  requestId: string,
  status: LgpdRequestStatus,
  actorId: string,
  notes?: string,
): LgpdRightsRequest | null {
  const all = getLgpdRequests();
  let updated: LgpdRightsRequest | null = null;

  const next = all.map((r) => {
    if (r.id === requestId) {
      updated = {
        ...r,
        status,
        resolvedAt: ['completed', 'rejected'].includes(status) ? new Date().toISOString() : r.resolvedAt,
        resolvedBy: actorId,
        resolutionNotes: notes ?? r.resolutionNotes,
      };
      return updated;
    }
    return r;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
}

/** Marca como vencidas as solicitações que ultrapassaram o prazo legal */
export function refreshOverdueRequests(): void {
  const now = new Date().toISOString();
  const all = getLgpdRequests();
  const updated = all.map((r) => {
    if ((r.status === 'pending' || r.status === 'in_review') && r.deadlineAt < now) {
      return { ...r, status: 'overdue' as LgpdRequestStatus };
    }
    return r;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getLgpdStats() {
  const all = getLgpdRequests();
  return {
    total:     all.length,
    pending:   all.filter((r) => r.status === 'pending').length,
    inReview:  all.filter((r) => r.status === 'in_review').length,
    completed: all.filter((r) => r.status === 'completed').length,
    overdue:   all.filter((r) => r.status === 'overdue').length,
  };
}
