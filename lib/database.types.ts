/**
 * lib/database.types.ts
 *
 * Tipos TypeScript para o banco de dados Supabase da plataforma Legis Connect.
 * Gerado a partir do schema.prisma — atualizar quando o schema mudar.
 *
 * Para regerar automaticamente:
 *   npx supabase gen types typescript --project-id <project-ref> > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'LAWYER' | 'INTERN' | 'SECRETARY' | 'ADMIN' | 'SUPER_ADMIN';
export type StaffRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'STAFF_FINANCE_ADMIN'
  | 'STAFF_COMPLIANCE_AUDITOR'
  | 'STAFF_SUPPORT_L1';
export type CaseStatus = 'ACTIVE' | 'CONCLUDED' | 'CANCELLED';
export type ProvisioningStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PROVISIONED'
  | 'PROVISION_FAILED'
  | 'REFUNDED'
  | 'EXPIRED';
export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type ServiceGroup = 'CLIENT' | 'LAWYER' | 'INTERN' | 'SECRETARY';

// ─── Table Row Types ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: UserRole;
          name: string;
          cpf: string | null;
          phone: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      lawyer_profiles: {
        Row: {
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
          active: boolean;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lawyer_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['lawyer_profiles']['Insert']>;
      };
      intern_profiles: {
        Row: {
          id: string;
          user_id: string;
          university: string | null;
          semester: number | null;
          oab_registration: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['intern_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['intern_profiles']['Insert']>;
      };
      secretary_profiles: {
        Row: {
          id: string;
          user_id: string;
          assigned_lawyer_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['secretary_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['secretary_profiles']['Insert']>;
      };
      platform_staff: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: StaffRole;
          name: string;
          active: boolean;
          mfa_enabled: boolean;
          must_change_password: boolean;
          last_login: string | null;
          login_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['platform_staff']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['platform_staff']['Insert']>;
      };
      cases: {
        Row: {
          id: string;
          case_number: string | null;
          title: string;
          status: CaseStatus;
          client_id: string;
          lawyer_id: string;
          description: string | null;
          opened_at: string;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['cases']['Insert']>;
      };
      case_stages: {
        Row: {
          id: string;
          case_id: string;
          name: string;
          description: string | null;
          completed: boolean;
          completed_at: string | null;
          order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['case_stages']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['case_stages']['Insert']>;
      };
      service_provisionings: {
        Row: {
          id: string;
          user_id: string;
          service_name: string;
          service_group: ServiceGroup;
          status: ProvisioningStatus;
          amount: number | null;
          currency: string;
          provisioned_at: string | null;
          expires_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_provisionings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['service_provisionings']['Insert']>;
      };
      staff_audit_logs: {
        Row: {
          id: string;
          action: string;
          actor_id: string;
          actor_role: string;
          target_id: string | null;
          details: string;
          severity: AuditSeverity;
          ip_address: string | null;
          user_agent: string | null;
          chain_hash: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff_audit_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: never; // Imutável — append-only por RLS
      };
      impersonation_sessions: {
        Row: {
          id: string;
          staff_id: string;
          target_user_id: string;
          reason: string;
          started_at: string;
          ended_at: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['impersonation_sessions']['Row'], 'id' | 'started_at'> & {
          id?: string;
        };
        Update: Pick<Database['public']['Tables']['impersonation_sessions']['Row'], 'ended_at' | 'is_active'>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      staff_role: StaffRole;
      case_status: CaseStatus;
      provisioning_status: ProvisioningStatus;
      audit_severity: AuditSeverity;
      service_group: ServiceGroup;
    };
  };
}
