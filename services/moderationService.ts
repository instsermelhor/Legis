/**
 * moderationService.ts — ISS-036
 *
 * Serviço de Moderação de Conteúdo Gerado por Utilizadores (UGC).
 * Cobre: avaliações, mensagens, perfis de advogados e documentos.
 *
 * Funcionalidades:
 *  - Fila de moderação com prioridade
 *  - Aprovação / Rejeição / Escalada
 *  - Log de auditoria de todas as decisões
 *  - Filtro automático de palavras proibidas (pré-moderação)
 *  - Estatísticas do painel de moderação
 *
 * Persiste em localStorage (MVP). Migrar para Supabase tabela
 * `moderation_queue` + `moderation_log` na Sprint 5.
 */

const QUEUE_KEY  = 'legis_moderation_queue';
const LOG_KEY    = 'legis_moderation_log';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type ContentType =
  | 'review'      // Avaliação de advogado
  | 'message'     // Mensagem no chat
  | 'profile_bio' // Bio/descrição de perfil
  | 'document'    // Documento enviado
  | 'complaint';  // Denúncia de utilizador

export type ModerationStatus =
  | 'pending'   // aguardando moderação
  | 'approved'  // aprovado
  | 'rejected'  // rejeitado (conteúdo removido)
  | 'escalated' // escalado para revisão humana
  | 'auto_approved'; // aprovado automaticamente

export type ModerationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ModerationItem {
  id: string;
  contentType: ContentType;
  contentId: string;       // ID do item original
  authorId: string;        // ID de quem submeteu o conteúdo
  authorEmail: string;
  excerpt: string;         // Prévia do conteúdo (máx. 300 chars)
  status: ModerationStatus;
  priority: ModerationPriority;
  flags: string[];         // razões de sinalização automática
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reportedBy?: string;     // ID de quem denunciou (se aplicável)
}

export interface ModerationLog {
  id: string;
  itemId: string;
  action: ModerationStatus;
  actorId: string;
  notes?: string;
  timestamp: string;
}

// ── Filtro automático ─────────────────────────────────────────────────────────

/** Lista mínima de termos proibidos (expandir via painel Admin) */
const BLOCKED_TERMS_KEY = 'legis_blocked_terms';

function getBlockedTerms(): string[] {
  try {
    const raw = localStorage.getItem(BLOCKED_TERMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBlockedTerms(terms: string[]): void {
  localStorage.setItem(BLOCKED_TERMS_KEY, JSON.stringify(terms));
}

/** Analisa conteúdo e retorna flags de problemas detectados */
export function analyzeContent(text: string): { flags: string[]; priority: ModerationPriority } {
  const flags: string[] = [];
  const lower = text.toLowerCase();
  const blocked = getBlockedTerms();

  // Verifica termos bloqueados
  for (const term of blocked) {
    if (lower.includes(term.toLowerCase())) {
      flags.push(`termo_proibido:${term}`);
    }
  }

  // Heurísticas básicas de qualidade
  if (text.length < 10) flags.push('conteudo_muito_curto');
  if (/(.)\1{4,}/.test(text)) flags.push('repeticao_excessiva');
  if ((text.match(/[A-Z]/g) || []).length / text.length > 0.7 && text.length > 20) flags.push('caps_excessivo');
  if (/(https?:\/\/|www\.)/i.test(text)) flags.push('link_externo');
  if (/\b\d{2}[\s.-]?\d{4,5}[\s.-]?\d{4}\b/.test(text)) flags.push('possivel_telefone');

  // Determina prioridade
  let priority: ModerationPriority = 'low';
  if (flags.some(f => f.startsWith('termo_proibido'))) priority = 'critical';
  else if (flags.length >= 3) priority = 'high';
  else if (flags.length >= 1) priority = 'medium';

  return { flags, priority };
}

// ── Fila de Moderação ─────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getModerationQueue(): ModerationItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getPendingItems(): ModerationItem[] {
  return getModerationQueue().filter(i => i.status === 'pending' || i.status === 'escalated');
}

/**
 * Submete um item à fila de moderação.
 * Se não houver flags, aprova automaticamente.
 */
export function submitForModeration(params: {
  contentType: ContentType;
  contentId: string;
  authorId: string;
  authorEmail: string;
  text: string;
  reportedBy?: string;
}): ModerationItem {
  const { flags, priority } = analyzeContent(params.text);

  const item: ModerationItem = {
    id: generateId('mod'),
    contentType: params.contentType,
    contentId: params.contentId,
    authorId: params.authorId,
    authorEmail: params.authorEmail,
    excerpt: params.text.slice(0, 300),
    status: flags.length === 0 ? 'auto_approved' : 'pending',
    priority,
    flags,
    createdAt: new Date().toISOString(),
    reportedBy: params.reportedBy,
  };

  const queue = getModerationQueue();
  queue.unshift(item); // mais recente primeiro
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return item;
}

/** Processa a decisão de moderação de um item */
export function processModeration(
  itemId: string,
  action: 'approved' | 'rejected' | 'escalated',
  actorId: string,
  notes?: string,
): ModerationItem | null {
  const queue = getModerationQueue();
  let updated: ModerationItem | null = null;

  const next = queue.map(item => {
    if (item.id === itemId) {
      updated = {
        ...item,
        status: action,
        reviewedAt: new Date().toISOString(),
        reviewedBy: actorId,
        reviewNotes: notes,
      };
      return updated;
    }
    return item;
  });

  localStorage.setItem(QUEUE_KEY, JSON.stringify(next));

  // Auditoria
  if (updated) {
    const log: ModerationLog = {
      id: generateId('mlog'),
      itemId,
      action,
      actorId,
      notes,
      timestamp: new Date().toISOString(),
    };
    const logs = getModerationLogs();
    logs.unshift(log);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 1000)));
  }

  return updated;
}

export function getModerationLogs(): ModerationLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getModerationStats() {
  const queue = getModerationQueue();
  return {
    total:        queue.length,
    pending:      queue.filter(i => i.status === 'pending').length,
    escalated:    queue.filter(i => i.status === 'escalated').length,
    approved:     queue.filter(i => i.status === 'approved' || i.status === 'auto_approved').length,
    rejected:     queue.filter(i => i.status === 'rejected').length,
    autoApproved: queue.filter(i => i.status === 'auto_approved').length,
    critical:     queue.filter(i => i.priority === 'critical' && i.status === 'pending').length,
  };
}
