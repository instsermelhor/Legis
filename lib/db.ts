/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Camada de acesso a dados Legis Connect — wrapper tipado sobre Supabase.
 * Opera em modo DUAL:
 *   • Supabase configurado → PostgreSQL real
 *   • Supabase não configurado → localStorage (compatibilidade com estado atual)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ─── Helpers genéricos ────────────────────────────────────────────────────────

/** Lê do localStorage com fallback para array vazio. */
function localGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Persiste no localStorage. */
function localSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore storage full */ }
}

/**
 * Define o contexto de segurança RLS na sessão ativa do Supabase/PostgreSQL.
 *
 * ⚠️  SEGURANÇA CRÍTICA: Esta função DEVE ser chamada antes de qualquer query
 * de dados sensíveis. Se falhar, o erro é PROPAGADO para o chamador —
 * não silenciado — para garantir que nenhuma query execute sem contexto
 * de tenant/role correto.
 *
 * Correção V-004: substituído console.warn + silêncio por throw.
 */
export async function setDatabaseSecurityContext(
  tenantId: string,
  userId: string,
  userRole: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  // Validação defensiva antes de chamar o banco
  if (!tenantId || !userId || !userRole) {
    throw new Error(
      `[SECURITY] setDatabaseSecurityContext: parâmetros obrigatórios ausentes — ` +
      `tenantId="${tenantId}", userId="${userId}", userRole="${userRole}". ` +
      `Nenhuma query de dados deve ser executada sem contexto de segurança completo.`
    );
  }

  const { error } = await (supabase as any).rpc('set_app_security_context', {
    p_tenant_id: tenantId,
    p_user_id:   userId,
    p_user_role: userRole,
  });

  if (error) {
    // Erro BLOQUEANTE — não silencia. O chamador deve tratar.
    throw new Error(
      `[SECURITY] Falha crítica ao injetar contexto RLS de segurança: ${error.message}. ` +
      `Acesso ao banco de dados bloqueado para tenant="${tenantId}" role="${userRole}".`
    );
  }
}

// ─── CASES (Processos jurídicos) ──────────────────────────────────────────────

export const dbCases = {
  async getAll(lawyerId?: string, tenantId?: string) {
    if (isSupabaseConfigured) {
      let query = (supabase as any).from('cases').select('*').order('created_at', { ascending: false });
      if (lawyerId) query = query.eq('lawyer_id', lawyerId);
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    const local = localGet<Record<string, unknown>[]>('legis_cases', []);
    return local.filter(c => (!lawyerId || c.lawyerId === lawyerId) && (!tenantId || c.tenantId === tenantId));
  },

  async getByClient(clientId: string, tenantId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('cases')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_cases', []).filter(
      c => c.clientId === clientId && (!tenantId || c.tenantId === tenantId)
    );
  },

  async create(caseData: Record<string, unknown>, activeTenantId?: string) {
    const payload = activeTenantId ? { ...caseData, tenant_id: activeTenantId, tenantId: activeTenantId } : caseData;
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('cases').insert(payload).select().single();
      if (error) throw error;
      return data;
    }
    const cases = localGet<unknown[]>('legis_cases', []);
    const newCase = { ...payload, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_cases', [...cases, newCase]);
    return newCase;
  },

  async update(id: string, updates: Record<string, unknown>, activeTenantId?: string) {
    // Defesa em profundidade: previne mutação de tenant_id durante UPDATE
    if (updates.tenant_id && activeTenantId && updates.tenant_id !== activeTenantId) {
      throw new Error('[SECURITY DENIED] Tentativa de alteração maliciosa de tenant_id bloqueada no driver.');
    }

    if (isSupabaseConfigured) {
      let query = (supabase as any).from('cases').update(updates).eq('id', id);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    }
    const cases = localGet<Record<string, unknown>[]>('legis_cases', []);
    const target = cases.find(c => c.id === id);
    if (!target) return undefined;
    if (activeTenantId && target.tenantId && target.tenantId !== activeTenantId) {
      throw new Error('[SECURITY DENIED] Tentativa de modificação cross-tenant bloqueada no driver.');
    }
    const updated = cases.map(c => c.id === id ? { ...c, ...updates } : c);
    localSet('legis_cases', updated);
    return updated.find(c => c.id === id);
  },

  async delete(id: string, activeTenantId?: string) {
    if (isSupabaseConfigured) {
      let query = (supabase as any).from('cases').delete().eq('id', id);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { error } = await query;
      if (error) throw error;
    } else {
      const cases = localGet<Record<string, unknown>[]>('legis_cases', []);
      const target = cases.find(c => c.id === id);
      if (target && activeTenantId && target.tenantId && target.tenantId !== activeTenantId) {
        throw new Error('[SECURITY DENIED] Tentativa de exclusão cross-tenant bloqueada no driver.');
      }
      localSet('legis_cases', cases.filter(c => c.id !== id));
    }
  },
};

// ─── DOCUMENTS (Documentos do processo) ───────────────────────────────────────

export const dbDocuments = {
  async upload(file: File, path: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).storage
        .from('documents')
        .upload(path, file, { upsert: false });
      if (error) throw error;

      const { data: urlData } = (supabase as any).storage
        .from('documents')
        .getPublicUrl(data.path);
      return { path: data.path, publicUrl: urlData.publicUrl };
    }
    // Modo local: retorna URL de objeto em memória
    return { path, publicUrl: URL.createObjectURL(file) };
  },

  async getSignedUrl(path: string, expiresInSeconds = 3600) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).storage
        .from('documents')
        .createSignedUrl(path, expiresInSeconds);
      if (error) throw error;
      return data.signedUrl;
    }
    return path;
  },

  async delete(path: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await (supabase as any).storage.from('documents').remove([path]);
    if (error) throw error;
  },
};

// ─── CONTRACTS (Contratos de honorários) ──────────────────────────────────────

// ─── CONTRACTS (Contratos de honorários) ──────────────────────────────────────

export const dbContracts = {
  async getByCase(caseId: string, tenantId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('contracts')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_contracts', []).filter(
      c => c.caseId === caseId && (!tenantId || c.tenantId === tenantId)
    );
  },

  async create(contractData: Record<string, unknown>, activeTenantId?: string) {
    const payload = activeTenantId ? { ...contractData, tenant_id: activeTenantId, tenantId: activeTenantId } : contractData;
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('contracts').insert(payload).select().single();
      if (error) throw error;
      return data;
    }
    const contracts = localGet<Record<string, unknown>[]>('legis_contracts', []);
    const newContract = { ...payload, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_contracts', [...contracts, newContract]);
    return newContract;
  },

  async updateStatus(id: string, status: string, activeTenantId?: string) {
    return dbContracts.update(id, { status }, activeTenantId);
  },

  async update(id: string, updates: Record<string, unknown>, activeTenantId?: string) {
    if (updates.tenant_id && activeTenantId && updates.tenant_id !== activeTenantId) {
      throw new Error('[SECURITY DENIED] Tentativa de alteração maliciosa de tenant_id bloqueada no driver.');
    }
    if (isSupabaseConfigured) {
      let query = (supabase as any).from('contracts').update(updates).eq('id', id);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    }
    const contracts = localGet<Record<string, unknown>[]>('legis_contracts', []);
    const target = contracts.find(c => c.id === id);
    if (target && activeTenantId && target.tenantId && target.tenantId !== activeTenantId) {
      throw new Error('[SECURITY DENIED] Tentativa de modificação cross-tenant bloqueada no driver.');
    }
    const updated = contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    localSet('legis_contracts', updated);
    return updated.find(c => c.id === id);
  },
};

// ─── INVOICES (Faturas / cobranças) ───────────────────────────────────────────

export const dbInvoices = {
  async getByLawyer(lawyerId: string, tenantId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .order('due_date', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_invoices', []).filter(
      i => i.lawyerId === lawyerId && (!tenantId || i.tenantId === tenantId)
    );
  },

  async getByClient(clientId: string, tenantId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('due_date', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_invoices', []).filter(
      i => i.clientId === clientId && (!tenantId || i.tenantId === tenantId)
    );
  },

  async create(invoiceData: Record<string, unknown>, activeTenantId?: string) {
    const payload = activeTenantId ? { ...invoiceData, tenant_id: activeTenantId, tenantId: activeTenantId } : invoiceData;
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('invoices').insert(payload).select().single();
      if (error) throw error;
      return data;
    }
    const invoices = localGet<Record<string, unknown>[]>('legis_invoices', []);
    const newInvoice = { ...payload, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_invoices', [...invoices, newInvoice]);
    return newInvoice;
  },

  async updateStatus(id: string, status: 'pending' | 'paid' | 'overdue' | 'cancelled', activeTenantId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('invoices')
        .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
        .eq('id', id);
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    }
    const invoices = localGet<Record<string, unknown>[]>('legis_invoices', []);
    const target = invoices.find(i => i.id === id);
    if (target && activeTenantId && target.tenantId && target.tenantId !== activeTenantId) {
      throw new Error('[SECURITY DENIED] Tentativa de modificação cross-tenant bloqueada no driver.');
    }
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    localSet('legis_invoices', updated);
    return updated.find(i => i.id === id);
  },
};

// ─── REALTIME ─────────────────────────────────────────────────────────────────

/**
 * Assina atualizações em tempo real de uma tabela.
 * Retorna função de unsubscribe.
 */
export function subscribeToTable(
  table: string,
  filter: string,
  onInsert?: (payload: unknown) => void,
  onUpdate?: (payload: unknown) => void,
  onDelete?: (payload: unknown) => void,
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`realtime:${table}:${filter}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, p => onInsert?.(p))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, p => onUpdate?.(p))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table, filter }, p => onDelete?.(p))
    .subscribe();

  return () => { (supabase as any).removeChannel(channel); };
}

// ─── CMS (Conteúdo Institucional SSOT) ────────────────────────────────────────

export const dbCms = {
  async get() {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('cms_content').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    return localGet('legis_cms_content', null);
  },

  async save(content: Record<string, unknown>, actorId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('cms_content')
        .upsert({ id: 'main', content, updated_by: actorId, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    localSet('legis_cms_content', { ...content, _updatedBy: actorId, _updatedAt: new Date().toISOString() });
    return content;
  },
};

// ─── MODERATION (Fila e Auditoria de UGC) ────────────────────────────────────

export const dbModeration = {
  async getQueue() {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('moderation_queue').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_moderation_queue', []);
  },

  async submit(item: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('moderation_queue').insert(item).select().single();
      if (error) throw error;
      return data;
    }
    const queue = localGet<unknown[]>('legis_moderation_queue', []);
    localSet('legis_moderation_queue', [item, ...queue]);
    return item;
  },

  async updateStatus(id: string, status: string, actorId: string, notes?: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('moderation_queue')
        .update({ status, reviewed_by: actorId, reviewed_at: new Date().toISOString(), review_notes: notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const queue = localGet<Record<string, unknown>[]>('legis_moderation_queue', []);
    const updated = queue.map(i => i.id === id ? { ...i, status, reviewedBy: actorId, reviewedAt: new Date().toISOString(), reviewNotes: notes } : i);
    localSet('legis_moderation_queue', updated);
    return updated.find(i => i.id === id);
  },
};

// ─── AI USAGE LOGS ───────────────────────────────────────────────────────────

export const dbAiLogs = {
  async log(entry: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('ai_usage_logs').insert(entry).select().single();
      if (error) throw error;
      return data;
    }
    const logs = localGet<unknown[]>('legis_ai_usage_logs', []);
    localSet('legis_ai_usage_logs', [entry, ...logs]);
    return entry;
  },

  async getByUser(userId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('ai_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_ai_usage_logs', []).filter(l => l.userId === userId);
  },
};

// ─── LGPD RIGHTS REQUESTS ───────────────────────────────────────────────────

export const dbLgpdRequests = {
  async getByUser(userId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('lgpd_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_lgpd_requests', []).filter(r => r.userId === userId);
  },

  async create(request: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('lgpd_requests').insert(request).select().single();
      if (error) throw error;
      return data;
    }
    const reqs = localGet<unknown[]>('legis_lgpd_requests', []);
    localSet('legis_lgpd_requests', [request, ...reqs]);
    return request;
  },
};

// ─── USERS (Usuários do sistema e Staff) ──────────────────────────────────────

export const dbUsers = {
  async getAll() {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_admin_users', []);
  },

  async getByEmail(email: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (error) throw error;
      return data;
    }
    const users = localGet<Record<string, unknown>[]>('legis_admin_users', []);
    return users.find(u => (u.email as string)?.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async create(userData: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('users').insert(userData).select().single();
      if (error) throw error;
      return data;
    }
    const users = localGet<Record<string, unknown>[]>('legis_admin_users', []);
    const newUser = { ...userData, id: userData.id || `user_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_admin_users', [...users, newUser]);
    return newUser;
  },

  async update(id: string, updates: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const users = localGet<Record<string, unknown>[]>('legis_admin_users', []);
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    localSet('legis_admin_users', updated);
    return updated.find(u => u.id === id);
  },
};

// ─── LAWYER PROFILES ─────────────────────────────────────────────────────────

export const dbLawyerProfiles = {
  async getAll() {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('lawyer_profiles').select('*, users(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_lawyers', []);
  },

  async getByUserId(userId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('lawyer_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data;
    }
    const lawyers = localGet<Record<string, unknown>[]>('legis_lawyers', []);
    return lawyers.find(l => l.userId === userId || l.id === userId) ?? null;
  },

  async upsert(profile: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('lawyer_profiles').upsert(profile).select().single();
      if (error) throw error;
      return data;
    }
    const lawyers = localGet<Record<string, unknown>[]>('legis_lawyers', []);
    const updated = [...lawyers.filter(l => l.id !== profile.id && l.userId !== profile.userId), profile];
    localSet('legis_lawyers', updated);
    return profile;
  },
};

// ─── STAFF AUDIT LOGS ────────────────────────────────────────────────────────

export const dbAuditLogs = {
  async getAll() {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('staff_audit_logs').select('*').order('timestamp', { ascending: false }).limit(500);
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_audit_log', []);
  },

  async log(logEntry: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('staff_audit_logs').insert(logEntry).select().single();
      if (error) throw error;
      return data;
    }
    const logs = localGet<unknown[]>('legis_audit_log', []);
    localSet('legis_audit_log', [logEntry, ...logs]);
    return logEntry;
  },
};

// ─── FULL-TEXT SEARCH (C-1) ──────────────────────────────────────────────────

export interface SearchResultItem {
  id: string;
  type: 'case' | 'document' | 'contract' | 'client';
  title: string;
  description?: string;
  snippet?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export const dbSearch = {
  /**
   * Executa busca textual integrada respeitando isolamento multi-tenant.
   */
  async search(query: string, activeTenantId?: string, limit = 20): Promise<SearchResultItem[]> {
    if (!query || query.trim().length === 0) return [];
    const normalizedQuery = query.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        // Tenta RPC de busca full-text no PostgreSQL se configurada
        const { data, error } = await (supabase as any).rpc('search_platform_entities', {
          p_query: normalizedQuery,
          p_tenant_id: activeTenantId || '',
          p_limit: limit,
        });
        if (!error && data) return data as SearchResultItem[];
      } catch {
        // Fallback para queries com ilike
      }

      let casesQuery = (supabase as any).from('cases').select('id, title, client_name, lawyer_name, status, created_at');
      if (activeTenantId) casesQuery = casesQuery.eq('tenant_id', activeTenantId);
      casesQuery = casesQuery.or(`title.ilike.%${normalizedQuery}%,client_name.ilike.%${normalizedQuery}%`).limit(limit);
      const { data: casesData } = await casesQuery;

      const results: SearchResultItem[] = (casesData || []).map((c: any) => ({
        id: String(c.id),
        type: 'case',
        title: c.title || 'Processo sem título',
        description: `Status: ${c.status || 'N/A'} | Cliente: ${c.client_name || 'N/A'}`,
        createdAt: c.created_at,
        metadata: c,
      }));

      return results;
    }

    // Modo local / Fallback
    const cases = localGet<Record<string, any>[]>('legis_cases', []);
    const filteredCases = cases
      .filter(c => {
        if (activeTenantId && c.tenantId && c.tenantId !== activeTenantId) return false;
        const searchCorpus = `${c.title || ''} ${c.clientName || ''} ${c.lawyerName || ''} ${c.id || ''}`.toLowerCase();
        return searchCorpus.includes(normalizedQuery);
      })
      .slice(0, limit)
      .map(c => ({
        id: String(c.id),
        type: 'case' as const,
        title: String(c.title || c.id),
        description: `Status: ${c.status || 'Ativo'} | Cliente: ${c.clientName || 'N/A'}`,
        createdAt: c.createdAt,
        metadata: c,
      }));

    return filteredCases;
  },
};

// ─── GED: GESTÃO ELETRÔNICA DE DOCUMENTOS & VERSIONAMENTO (D-1) ─────────────

export interface DocumentVersion {
  versionId: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  uploadedBy: string;
  uploadedAt: string;
  changeSummary?: string;
  isLatest: boolean;
}

export const dbGed = {
  async getVersions(documentId: string, activeTenantId?: string): Promise<DocumentVersion[]> {
    if (isSupabaseConfigured) {
      let query = (supabase as any)
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });
      if (activeTenantId) query = query.eq('tenant_id', activeTenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    const allVersions = localGet<DocumentVersion[]>('legis_document_versions', []);
    return allVersions.filter(v => v.documentId === documentId);
  },

  async addVersion(
    documentId: string,
    versionData: Omit<DocumentVersion, 'versionId' | 'versionNumber' | 'uploadedAt' | 'isLatest'>,
    activeTenantId?: string
  ): Promise<DocumentVersion> {
    const existing = await this.getVersions(documentId, activeTenantId);
    const nextVersionNumber = existing.length > 0 ? Math.max(...existing.map(v => v.versionNumber)) + 1 : 1;

    const newVersion: DocumentVersion = {
      ...versionData,
      versionId: `v_${documentId}_${nextVersionNumber}_${Date.now()}`,
      documentId,
      versionNumber: nextVersionNumber,
      uploadedAt: new Date().toISOString(),
      isLatest: true,
    };

    if (isSupabaseConfigured) {
      // Marca versões antigas como não-mais latest
      await (supabase as any)
        .from('document_versions')
        .update({ is_latest: false })
        .eq('document_id', documentId);

      const payload = activeTenantId ? { ...newVersion, tenant_id: activeTenantId } : newVersion;
      const { data, error } = await (supabase as any).from('document_versions').insert(payload).select().single();
      if (error) throw error;
      return data;
    }

    const allVersions = localGet<DocumentVersion[]>('legis_document_versions', []);
    const updatedVersions = allVersions.map(v => v.documentId === documentId ? { ...v, isLatest: false } : v);
    localSet('legis_document_versions', [...updatedVersions, newVersion]);
    return newVersion;
  },
};

// ─── OUTBOUND WEBHOOKS ENGINE (D-2) ──────────────────────────────────────────

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export const dbWebhooks = {
  async getSubscriptions(tenantId: string): Promise<WebhookSubscription[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any)
        .from('webhook_subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    const list = localGet<WebhookSubscription[]>('legis_webhook_subscriptions', []);
    return list.filter(w => w.tenantId === tenantId);
  },

  async createSubscription(subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>): Promise<WebhookSubscription> {
    const newSub: WebhookSubscription = {
      ...subscription,
      id: `wh_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('webhook_subscriptions').insert(newSub).select().single();
      if (error) throw error;
      return data;
    }
    const list = localGet<WebhookSubscription[]>('legis_webhook_subscriptions', []);
    localSet('legis_webhook_subscriptions', [...list, newSub]);
    return newSub;
  },
};



