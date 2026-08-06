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

// ─── CASES (Processos jurídicos) ──────────────────────────────────────────────

export const dbCases = {
  async getAll(lawyerId?: string) {
    if (isSupabaseConfigured) {
      let query = supabase.from('cases').select('*').order('created_at', { ascending: false });
      if (lawyerId) query = query.eq('lawyer_id', lawyerId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_cases', []);
  },

  async getByClient(clientId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_cases', []).filter(
      (c: unknown) => (c as Record<string, unknown>).clientId === clientId
    );
  },

  async create(caseData: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('cases').insert(caseData).select().single();
      if (error) throw error;
      return data;
    }
    const cases = localGet<unknown[]>('legis_cases', []);
    const newCase = { ...caseData, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_cases', [...cases, newCase]);
    return newCase;
  },

  async update(id: string, updates: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('cases').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const cases = localGet<Record<string, unknown>[]>('legis_cases', []);
    const updated = cases.map(c => c.id === id ? { ...c, ...updates } : c);
    localSet('legis_cases', updated);
    return updated.find(c => c.id === id);
  },

  async delete(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('cases').delete().eq('id', id);
      if (error) throw error;
    } else {
      const cases = localGet<Record<string, unknown>[]>('legis_cases', []);
      localSet('legis_cases', cases.filter(c => c.id !== id));
    }
  },
};

// ─── DOCUMENTS (Documentos do processo) ───────────────────────────────────────

export const dbDocuments = {
  async upload(file: File, path: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: false });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);
      return { path: data.path, publicUrl: urlData.publicUrl };
    }
    // Modo local: retorna URL de objeto em memória
    return { path, publicUrl: URL.createObjectURL(file) };
  },

  async getSignedUrl(path: string, expiresInSeconds = 3600) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, expiresInSeconds);
      if (error) throw error;
      return data.signedUrl;
    }
    return path;
  },

  async delete(path: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.storage.from('documents').remove([path]);
    if (error) throw error;
  },
};

// ─── CONTRACTS (Contratos de honorários) ──────────────────────────────────────

export const dbContracts = {
  async getByCase(caseId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_contracts', []).filter(
      (c: unknown) => (c as Record<string, unknown>).caseId === caseId
    );
  },

  async create(contractData: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('contracts').insert(contractData).select().single();
      if (error) throw error;
      return data;
    }
    const contracts = localGet<unknown[]>('legis_contracts', []);
    const newContract = { ...contractData, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_contracts', [...contracts, newContract]);
    return newContract;
  },

  async updateStatus(id: string, status: string) {
    return dbContracts.update(id, { status });
  },

  async update(id: string, updates: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('contracts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const contracts = localGet<Record<string, unknown>[]>('legis_contracts', []);
    const updated = contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    localSet('legis_contracts', updated);
    return updated.find(c => c.id === id);
  },
};

// ─── INVOICES (Faturas / cobranças) ───────────────────────────────────────────

export const dbInvoices = {
  async getByLawyer(lawyerId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_invoices', []).filter(
      (i: unknown) => (i as Record<string, unknown>).lawyerId === lawyerId
    );
  },

  async getByClient(clientId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_invoices', []).filter(
      (i: unknown) => (i as Record<string, unknown>).clientId === clientId
    );
  },

  async create(invoiceData: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
      if (error) throw error;
      return data;
    }
    const invoices = localGet<unknown[]>('legis_invoices', []);
    const newInvoice = { ...invoiceData, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localSet('legis_invoices', [...invoices, newInvoice]);
    return newInvoice;
  },

  async updateStatus(id: string, status: 'pending' | 'paid' | 'overdue' | 'cancelled') {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const invoices = localGet<Record<string, unknown>[]>('legis_invoices', []);
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

  return () => { supabase.removeChannel(channel); };
}

// ─── CMS (Conteúdo Institucional SSOT) ────────────────────────────────────────

export const dbCms = {
  async get() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('cms_content').select('*').single();
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
      const { data, error } = await supabase.from('moderation_queue').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<unknown[]>('legis_moderation_queue', []);
  },

  async submit(item: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('moderation_queue').insert(item).select().single();
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
      const { data, error } = await supabase.from('ai_usage_logs').insert(entry).select().single();
      if (error) throw error;
      return data;
    }
    const logs = localGet<unknown[]>('legis_ai_usage_logs', []);
    localSet('legis_ai_usage_logs', [entry, ...logs]);
    return entry;
  },

  async getByUser(userId: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('ai_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
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
      const { data, error } = await supabase.from('lgpd_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
    return localGet<Record<string, unknown>[]>('legis_lgpd_requests', []).filter(r => r.userId === userId);
  },

  async create(request: Record<string, unknown>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('lgpd_requests').insert(request).select().single();
      if (error) throw error;
      return data;
    }
    const reqs = localGet<unknown[]>('legis_lgpd_requests', []);
    localSet('legis_lgpd_requests', [request, ...reqs]);
    return request;
  },
};

