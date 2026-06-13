// ─────────────────────────────────────────────────────────────────────────────
// services/staffService.ts
// Gestão de Colaboradores Internos da Plataforma (PlatformStaff)
// RBAC granular: Staff_Support_L1 / Staff_Finance_Admin / Staff_Compliance_Auditor
// ─────────────────────────────────────────────────────────────────────────────

import type { PlatformStaff, StaffRole } from '../types';
import { AuditLogger } from '../security/auditLogger';
import { hashPassword } from './mockDataService';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STAFF_KEY = 'legis_platform_staff';

// ─── Dados iniciais (seed) ────────────────────────────────────────────────────
const INITIAL_STAFF: PlatformStaff[] = [
  {
    id: 'staff_001',
    name: 'Carlos Supervisor',
    email: 'carlos.supervisor@legisconnect.com.br',
    password: hashPassword('supervisor123'),
    role: 'super_admin',
    department: 'Diretoria',
    phone: '(11) 99999-0001',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    permissions: [],
    lastLogin: '2026-06-12T10:00:00Z',
    loginCount: 342,
  },
  {
    id: 'staff_002',
    name: 'Amanda Financeira',
    email: 'amanda.financeira@legisconnect.com.br',
    password: hashPassword('finance456'),
    role: 'staff_finance_admin',
    department: 'Financeiro',
    phone: '(11) 99999-0002',
    active: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    createdBy: 'staff_001',
    permissions: [],
    lastLogin: '2026-06-11T14:30:00Z',
    loginCount: 128,
  },
  {
    id: 'staff_003',
    name: 'Roberto Compliance',
    email: 'roberto.compliance@legisconnect.com.br',
    password: hashPassword('compliance789'),
    role: 'staff_compliance_auditor',
    department: 'Compliance & Jurídico',
    phone: '(11) 99999-0003',
    active: true,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    createdBy: 'staff_001',
    permissions: [],
    lastLogin: '2026-06-10T09:15:00Z',
    loginCount: 87,
  },
  {
    id: 'staff_004',
    name: 'Juliana Suporte',
    email: 'juliana.suporte@legisconnect.com.br',
    password: hashPassword('suporte321'),
    role: 'staff_support_l1',
    department: 'Atendimento ao Cliente',
    phone: '(11) 99999-0004',
    active: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
    createdBy: 'staff_001',
    permissions: [],
    lastLogin: '2026-06-12T08:00:00Z',
    loginCount: 215,
  },
  {
    id: 'staff_005',
    name: 'Marcos Suporte Jr.',
    email: 'marcos.suporte@legisconnect.com.br',
    password: hashPassword('junior654'),
    role: 'staff_support_l1',
    department: 'Atendimento ao Cliente',
    phone: '(11) 99999-0005',
    active: false,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'staff_001',
    permissions: [],
    loginCount: 43,
  },
];

// ─── Inicialização ────────────────────────────────────────────────────────────
function initializeStaff(): void {
  const existing = localStorage.getItem(STAFF_KEY);
  if (!existing) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
  }
}

function readStaff(): PlatformStaff[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  } catch { return INITIAL_STAFF; }
}

function writeStaff(staff: PlatformStaff[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

function generateStaffId(): string {
  return `staff_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Service Principal ────────────────────────────────────────────────────────
export const StaffService = {
  initialize: initializeStaff,

  /** Retorna todos os colaboradores. */
  getAll(): PlatformStaff[] {
    return readStaff();
  },

  /** Retorna apenas colaboradores ativos. */
  getActive(): PlatformStaff[] {
    return readStaff().filter(s => s.active);
  },

  /** Busca colaborador por email. */
  findByEmail(email: string): PlatformStaff | null {
    return readStaff().find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /** Busca colaborador por ID. */
  findById(id: string): PlatformStaff | null {
    return readStaff().find(s => s.id === id) || null;
  },

  /**
   * Autenticação de colaborador interno.
   * Retorna o staff sem a senha se autenticado.
   */
  authenticate(email: string, password: string): Omit<PlatformStaff, 'password'> | null {
    const staff = this.findByEmail(email);
    if (!staff) return null;
    if (!staff.active) return null;

    const hashed = hashPassword(password);
    if (staff.password !== hashed) return null;

    // Atualiza lastLogin e loginCount
    const all = readStaff();
    const idx = all.findIndex(s => s.id === staff.id);
    if (idx !== -1) {
      all[idx].lastLogin = new Date().toISOString();
      all[idx].loginCount = (all[idx].loginCount || 0) + 1;
      writeStaff(all);
    }

    const { password: _, ...safeStaff } = staff;
    return safeStaff;
  },

  /**
   * Cria novo colaborador interno.
   * Apenas super_admin pode criar staff.
   */
  create(data: {
    name: string;
    email: string;
    password: string;
    role: StaffRole;
    department: string;
    phone?: string;
    permissions?: string[];
    createdBy: string;
  }): { success: boolean; staff?: PlatformStaff; error?: string } {
    // Verifica email duplicado
    if (this.findByEmail(data.email)) {
      return { success: false, error: 'E-mail já cadastrado para outro colaborador.' };
    }

    const newStaff: PlatformStaff = {
      id: generateStaffId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashPassword(data.password),
      role: data.role,
      department: data.department,
      phone: data.phone,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
      permissions: data.permissions || [],
      loginCount: 0,
    };

    const all = readStaff();
    all.push(newStaff);
    writeStaff(all);

    AuditLogger.log({
      action: 'STAFF_CREATED',
      actorId: data.createdBy,
      actorRole: 'super_admin',
      targetId: newStaff.id,
      targetType: 'staff',
      details: `Novo colaborador criado: ${newStaff.name} (${newStaff.role}) — Depto: ${newStaff.department}`,
      severity: 'INFO',
    });

    return { success: true, staff: newStaff };
  },

  /**
   * Atualiza dados de um colaborador.
   */
  update(
    id: string,
    data: Partial<Pick<PlatformStaff, 'name' | 'phone' | 'department' | 'role' | 'permissions'>>,
    actorId: string
  ): { success: boolean; error?: string } {
    const all = readStaff();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Colaborador não encontrado.' };

    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    writeStaff(all);

    AuditLogger.log({
      action: 'STAFF_UPDATED',
      actorId,
      actorRole: 'super_admin',
      targetId: id,
      targetType: 'staff',
      details: `Colaborador ${all[idx].name} atualizado: ${JSON.stringify(data)}`,
      severity: 'INFO',
    });

    return { success: true };
  },

  /**
   * Ativa ou desativa um colaborador (nunca deleta — compliance LGPD).
   */
  setActive(id: string, active: boolean, actorId: string): { success: boolean; error?: string } {
    const all = readStaff();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Colaborador não encontrado.' };

    all[idx].active = active;
    all[idx].updatedAt = new Date().toISOString();
    writeStaff(all);

    AuditLogger.log({
      action: 'STAFF_DEACTIVATED',
      actorId,
      actorRole: 'super_admin',
      targetId: id,
      targetType: 'staff',
      details: `Colaborador ${all[idx].name} ${active ? 'ativado' : 'desativado'}`,
      severity: active ? 'INFO' : 'WARNING',
    });

    return { success: true };
  },

  /** Estatísticas para o painel. */
  getStats(): {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<StaffRole, number>;
  } {
    const all = readStaff();
    const byRole = {} as Record<StaffRole, number>;
    all.forEach(s => { byRole[s.role] = (byRole[s.role] || 0) + 1; });

    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      byRole,
    };
  },
};

// Inicializa dados na carga do módulo
StaffService.initialize();
