/**
 * services/supabaseDataService.ts
 *
 * Camada de acesso a dados em nuvem via Supabase PostgreSQL.
 * Substitui gradualmente as chamadas a mockDataService.ts e mockLawyerService.ts.
 *
 * PRINCÍPIO DE DESIGN:
 *  - Cada função verifica `isSupabaseConfigured` antes de consultar o banco.
 *  - Quando Supabase não está disponível, retorna null para que o caller
 *    possa usar o fallback de dados mock/localStorage.
 *  - RLS no banco garante que cada usuário veja apenas seus próprios dados.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Tipos de Retorno ─────────────────────────────────────────────────────────

export interface SupabaseLawyer {
  id: string;
  userId: string;
  name: string;
  email: string;
  oab: string;
  oabUF: string;
  bio: string | null;
  specialties: string[];
  locationCity: string | null;
  locationState: string | null;
  locationLat: number | null;
  locationLng: number | null;
  photoUrl: string | null;
  rating: number;
  reviewCount: number;
  consultationFee: number | null;
  verified: boolean;
}

export interface SupabaseCase {
  id: string;
  caseNumber: string | null;
  title: string;
  status: 'ACTIVE' | 'CONCLUDED' | 'CANCELLED';
  clientId: string;
  lawyerId: string;
  description: string | null;
  openedAt: string;
  closedAt: string | null;
}

export interface SupabaseUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}

// ─── Tipos internos de query ──────────────────────────────────────────────────

interface LawyerRow {
  id: string;
  user_id: string;
  oab: string;
  oab_uf: string;
  bio: string | null;
  specialties: string[];
  location_city: string | null;
  location_state: string | null;
  location_lat: number | null;
  location_lng: number | null;
  photo_url: string | null;
  rating: number;
  review_count: number;
  consultation_fee: number | null;
  verified: boolean;
  users: { name: string; email: string };
}

interface CaseRow {
  id: string;
  case_number: string | null;
  title: string;
  status: string;
  client_id: string;
  lawyer_id: string;
  description: string | null;
  opened_at: string;
  closed_at: string | null;
}

// ─── Advogados ────────────────────────────────────────────────────────────────

export const supabaseLawyerService = {
  /**
   * Busca todos os advogados verificados com seus perfis.
   * Retorna null quando Supabase não está configurado (usar fallback mock).
   */
  async getAll(): Promise<SupabaseLawyer[] | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await (supabase as any)
      .from('lawyer_profiles')
      .select(`
        id,
        user_id,
        oab,
        oab_uf,
        bio,
        specialties,
        location_city,
        location_state,
        location_lat,
        location_lng,
        photo_url,
        rating,
        review_count,
        consultation_fee,
        verified,
        users!inner(name, email)
      `)
      .eq('active', true)
      .eq('verified', true)
      .order('rating', { ascending: false }) as { data: LawyerRow[] | null; error: { message: string } | null };

    if (error) {
      console.error('[SupabaseData] Erro ao buscar advogados:', error.message);
      return null;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.users.name,
      email: row.users.email,
      oab: row.oab,
      oabUF: row.oab_uf,
      bio: row.bio,
      specialties: row.specialties,
      locationCity: row.location_city,
      locationState: row.location_state,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      photoUrl: row.photo_url,
      rating: Number(row.rating),
      reviewCount: row.review_count,
      consultationFee: row.consultation_fee ? Number(row.consultation_fee) : null,
      verified: row.verified,
    }));
  },

  /**
   * Busca advogados filtrando por especialidade e/ou cidade.
   */
  async search(params: {
    specialty?: string;
    city?: string;
    state?: string;
  }): Promise<SupabaseLawyer[] | null> {
    if (!isSupabaseConfigured) return null;

    let query = (supabase as any)
      .from('lawyer_profiles')
      .select(`
        id, user_id, oab, oab_uf, bio, specialties,
        location_city, location_state, location_lat, location_lng,
        photo_url, rating, review_count, consultation_fee, verified,
        users!inner(name, email)
      `)
      .eq('active', true)
      .eq('verified', true);

    if (params.specialty) {
      query = query.contains('specialties', [params.specialty]);
    }
    if (params.city) {
      query = query.ilike('location_city', `%${params.city}%`);
    }
    if (params.state) {
      query = query.eq('location_state', params.state);
    }

    const { data, error } = await query.order('rating', { ascending: false }) as {
      data: LawyerRow[] | null;
      error: { message: string } | null;
    };

    if (error) {
      console.error('[SupabaseData] Erro na busca de advogados:', error.message);
      return null;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.users.name,
      email: row.users.email,
      oab: row.oab,
      oabUF: row.oab_uf,
      bio: row.bio,
      specialties: row.specialties,
      locationCity: row.location_city,
      locationState: row.location_state,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      photoUrl: row.photo_url,
      rating: Number(row.rating),
      reviewCount: row.review_count,
      consultationFee: row.consultation_fee ? Number(row.consultation_fee) : null,
      verified: row.verified,
    }));
  },
};

// ─── Processos (Cases) ────────────────────────────────────────────────────────

export const supabaseCaseService = {
  /**
   * Busca todos os processos do usuário autenticado.
   * RLS garante que apenas processos do próprio usuário sejam retornados.
   */
  async getMyCases(): Promise<SupabaseCase[] | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await (supabase as any)
      .from('cases')
      .select('id, case_number, title, status, client_id, lawyer_id, description, opened_at, closed_at')
      .is('deleted_at', null)
      .order('opened_at', { ascending: false }) as { data: CaseRow[] | null; error: { message: string } | null };

    if (error) {
      console.error('[SupabaseData] Erro ao buscar processos:', error.message);
      return null;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      caseNumber: row.case_number,
      title: row.title,
      status: row.status as SupabaseCase['status'],
      clientId: row.client_id,
      lawyerId: row.lawyer_id,
      description: row.description,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    }));
  },

  /**
   * Busca um processo específico pelo ID.
   */
  async getById(caseId: string): Promise<SupabaseCase | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await (supabase as any)
      .from('cases')
      .select('id, case_number, title, status, client_id, lawyer_id, description, opened_at, closed_at')
      .eq('id', caseId)
      .is('deleted_at', null)
      .single() as { data: CaseRow | null; error: { message: string } | null };

    if (error || !data) return null;

    return {
      id: data.id,
      caseNumber: data.case_number,
      title: data.title,
      status: data.status as SupabaseCase['status'],
      clientId: data.client_id,
      lawyerId: data.lawyer_id,
      description: data.description,
      openedAt: data.opened_at,
      closedAt: data.closed_at,
    };
  },
};

// ─── Usuários / Perfis ────────────────────────────────────────────────────────

export const supabaseUserService = {
  /**
   * Busca o perfil completo do usuário pelo ID.
   */
  async getProfile(userId: string): Promise<SupabaseUserProfile | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await (supabase as any)
      .from('users')
      .select('id, name, email, role, phone')
      .eq('id', userId)
      .eq('active', true)
      .is('deleted_at', null)
      .single() as { data: SupabaseUserProfile | null; error: { message: string } | null };

    if (error || !data) return null;
    return data;
  },

  /**
   * Atualiza o perfil do usuário autenticado.
   */
  async updateProfile(userId: string, updates: {
    name?: string;
    phone?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await (supabase as any)
      .from('users')
      .update(updates as Record<string, string | undefined>)
      .eq('id', userId) as { error: { message: string } | null };

    if (error) {
      console.error('[SupabaseData] Erro ao atualizar perfil:', error.message);
      return false;
    }
    return true;
  },
};

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const supabaseAuditService = {
  /**
   * Persiste uma entrada de log de auditoria no banco.
   * A tabela é append-only (RLS bloqueia UPDATE e DELETE).
   */
  async log(entry: {
    action: string;
    actorId: string;
    actorRole: string;
    details: string;
    severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    targetId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await (supabase as any).from('staff_audit_logs').insert({
      action: entry.action,
      actor_id: entry.actorId,
      actor_role: entry.actorRole,
      details: entry.details,
      severity: entry.severity ?? 'INFO',
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? null,
    }) as { error: { message: string } | null };

    if (error) {
      // Nunca bloquear o fluxo por falha de auditoria — apenas logar
      console.error('[SupabaseAudit] Erro ao gravar log:', error.message);
    }
  },
};
