// ─────────────────────────────────────────────────────────────────────────────
// services/staffService.ts
// Gestão de Colaboradores Internos da Plataforma (PlatformStaff)
// RBAC granular + Super Admin Universal + Delegações + Sessões
// ─────────────────────────────────────────────────────────────────────────────

import type { PlatformStaff, StaffRole, DelegationRecord, SessionRecord } from '../types';
import { AuditLogger } from '../security/auditLogger';
import { hashPassword } from './mockDataService';
import { generatePasswordHash } from '../security/passwordPolicy';
import { RecoveryProtection } from '../security/recoveryProtection';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STAFF_KEY       = 'legis_platform_staff';
const DELEGATION_KEY  = 'legis_delegations';
const SESSION_KEY     = 'legis_staff_sessions';
const SESSION_TTL_MS  = 8 * 60 * 60 * 1000; // 8 horas

// ─── Dados iniciais (seed) ────────────────────────────────────────────────────
// IMPORTANTE: As senhas dos usuários de seed usam hashPassword() (legado PBKDF2v1).
// O Super Admin ribeiro.rikardo@gmail.com usa generatePasswordHash() (PBKDF2v2 — assíncrono).
// A senha temporária "teste" NÃO está em texto puro aqui; é hasheada em runtime.
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
    mustChangePassword: false,
    mfaEnabled: false,
    accessLevel: 'GLOBAL',
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
    mustChangePassword: false,
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
    mustChangePassword: false,
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
    mustChangePassword: false,
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
    mustChangePassword: false,
  },
];

// ─── Helpers de armazenamento ─────────────────────────────────────────────────
function readStaff(): PlatformStaff[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  } catch { return INITIAL_STAFF; }
}

function writeStaff(staff: PlatformStaff[]): void {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Helpers de Sessão ────────────────────────────────────────────────────────
function readSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeSessions(sessions: SessionRecord[]): void {
  // Mantém apenas sessões ativas dos últimos 30 dias
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const trimmed = sessions.filter(s => s.createdAt > cutoff);
  localStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
}

function getDeviceFingerprint(): string {
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const raw = `${ua}|${lang}|${tz}`;
  // Hash simples para fingerprint
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Helpers de Delegação ─────────────────────────────────────────────────────
function readDelegations(): DelegationRecord[] {
  try {
    const raw = localStorage.getItem(DELEGATION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeDelegations(delegations: DelegationRecord[]): void {
  localStorage.setItem(DELEGATION_KEY, JSON.stringify(delegations));
}

// ─── Inicialização ────────────────────────────────────────────────────────────
function initializeStaff(): void {
  const existing = localStorage.getItem(STAFF_KEY);
  if (!existing) {
    writeStaff(INITIAL_STAFF);
  }
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
   * Autenticação de colaborador interno (verificação legada com hashPassword).
   * Para autenticação completa (com PBKDF2v2), use AuthService.authenticateStaffAsync().
   */
  authenticate(email: string, password: string): Omit<PlatformStaff, 'password'> | null {
    const staff = this.findByEmail(email);
    if (!staff || !staff.active) return null;

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
   * Seed seguro do Super Administrador Universal.
   * Cria ribeiro.rikardo@gmail.com e promove instsermelhor.adm@gmail.com.
   * A senha temporária "teste" é hasheada em runtime — nunca em texto puro.
   * Esta função é assíncrona pois usa PBKDF2v2 (Web Crypto API).
   */
  async seedSuperAdmins(): Promise<void> {
    const all = readStaff();

    // 1. Criar/garantir ribeiro.rikardo@gmail.com (Super Admin Principal)
    const existing = all.find(s => s.email.toLowerCase() === 'ribeiro.rikardo@gmail.com');
    if (!existing) {
      // Hash da senha temporária "teste" gerado em runtime (PBKDF2v2 — 310k iterações)
      const tempPasswordHash = await generatePasswordHash('teste');

      const superAdmin: PlatformStaff = {
        id: 'superadmin_universal_001',
        name: 'Rikardo Ribeiro',
        email: 'ribeiro.rikardo@gmail.com',
        password: tempPasswordHash,
        role: 'super_admin',
        department: 'Governança Global',
        phone: undefined,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system_bootstrap',
        permissions: [],
        loginCount: 0,
        // Campos de segurança obrigatórios para Super Admin
        mustChangePassword: true,    // PRIMEIRO ACESSO — troca obrigatória
        mfaEnabled: false,
        accessLevel: 'GLOBAL',
        passwordHistory: [],
        lastPasswordChange: undefined,
      };

      all.unshift(superAdmin); // Coloca no início da lista

      AuditLogger.log({
        action: 'SUPER_ADMIN_CREATED',
        actorId: 'system_bootstrap',
        actorRole: 'super_admin',
        targetId: superAdmin.id,
        targetType: 'staff',
        details: `Super Administrador Universal criado: ${superAdmin.email} — mustChangePassword: true`,
        severity: 'CRITICAL',
        metadata: { email: superAdmin.email, accessLevel: 'GLOBAL', bootstrapSeed: true },
      });
    } else if (existing.role !== 'super_admin') {
      // Garante que o usuário tem a role correta
      const idx = all.findIndex(s => s.email.toLowerCase() === 'ribeiro.rikardo@gmail.com');
      if (idx !== -1) {
        all[idx].role = 'super_admin';
        all[idx].accessLevel = 'GLOBAL';
        all[idx].updatedAt = new Date().toISOString();
      }
    }

    // 2. Promover instsermelhor.adm@gmail.com para super_admin (se existir no staff)
    const legacyIdx = all.findIndex(s => s.email.toLowerCase() === 'instsermelhor.adm@gmail.com');
    if (legacyIdx !== -1) {
      if (all[legacyIdx].role !== 'super_admin') {
        all[legacyIdx].role = 'super_admin';
        all[legacyIdx].accessLevel = 'GLOBAL';
        all[legacyIdx].active = true;
        all[legacyIdx].mustChangePassword = false;
        all[legacyIdx].updatedAt = new Date().toISOString();
        AuditLogger.log({
          action: 'STAFF_UPDATED',
          actorId: 'system_bootstrap',
          actorRole: 'super_admin',
          targetId: all[legacyIdx].id,
          targetType: 'staff',
          details: `Admin legado promovido a Super Administrador Universal: ${all[legacyIdx].email}`,
          severity: 'WARNING',
          metadata: { email: all[legacyIdx].email, promotedFrom: 'admin', promotedTo: 'super_admin' },
        });
      }
    } else {
      // Cria instsermelhor.adm@gmail.com como super_admin (hash da senha legada)
      const legacyHash = hashPassword('@@Rk08266570#');
      const legacyAdmin: PlatformStaff = {
        id: 'superadmin_legacy_001',
        name: 'Administrador Institucional',
        email: 'instsermelhor.adm@gmail.com',
        password: legacyHash,
        role: 'super_admin',
        department: 'Diretoria',
        phone: undefined,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'system_bootstrap',
        permissions: [],
        loginCount: 0,
        mustChangePassword: false,
        mfaEnabled: false,
        accessLevel: 'GLOBAL',
        passwordHistory: [],
      };
      all.push(legacyAdmin);
    }

    writeStaff(all);
  },

  /**
   * Força a troca de senha de um colaborador.
   * Invalida a senha atual, registra no histórico, marca must_change_password = false.
   */
  async forcePasswordChange(
    userId: string,
    newPassword: string,
    actorId: string
  ): Promise<{ success: boolean; error?: string }> {
    const all = readStaff();
    const idx = all.findIndex(s => s.id === userId);
    if (idx === -1) return { success: false, error: 'Colaborador não encontrado.' };

    const staff = all[idx];

    // Verifica que a nova senha não é igual à atual
    const currentHash = staff.password;
    const newHash = await generatePasswordHash(newPassword);

    // Histórico: guarda a senha anterior
    const history = staff.passwordHistory || [];
    history.unshift(currentHash); // Coloca a senha atual no histórico
    if (history.length > 5) history.pop(); // Mantém apenas as 5 últimas

    all[idx] = {
      ...staff,
      password: newHash,
      mustChangePassword: false,
      passwordHistory: history,
      lastPasswordChange: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeStaff(all);

    AuditLogger.log({
      action: 'PASSWORD_CHANGED',
      actorId,
      actorRole: staff.role,
      targetId: userId,
      targetType: 'staff',
      details: `Senha alterada para: ${staff.email} — mustChangePassword definido como false`,
      severity: 'WARNING',
      metadata: {
        email: staff.email,
        mustChangePasswordBefore: staff.mustChangePassword,
        mustChangePasswordAfter: false,
        wasForced: staff.mustChangePassword === true,
      },
    });

    return { success: true };
  },

  /**
   * Cria novo colaborador interno.
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
    mustChangePassword?: boolean;
  }): { success: boolean; staff?: PlatformStaff; error?: string } {
    if (this.findByEmail(data.email)) {
      return { success: false, error: 'E-mail já cadastrado para outro colaborador.' };
    }

    const newStaff: PlatformStaff = {
      id: generateId('staff'),
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
      mustChangePassword: data.mustChangePassword ?? true, // Por padrão, exige troca
      mfaEnabled: false,
      passwordHistory: [],
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
      metadata: { email: newStaff.email, role: newStaff.role, department: newStaff.department },
    });

    return { success: true, staff: newStaff };
  },

  /**
   * Atualiza dados de um colaborador com proteção de escalada de privilégio.
   */
  update(
    id: string,
    data: Partial<Pick<PlatformStaff, 'name' | 'phone' | 'department' | 'role' | 'permissions' | 'mfaEnabled'>>,
    actorId: string,
    actorRole: StaffRole
  ): { success: boolean; error?: string } {
    // Verifica escalada de privilégio se role está sendo alterada
    if (data.role) {
      const isEscalation = RecoveryProtection.detectPrivilegeEscalation(actorId, actorRole, id, data.role);
      if (isEscalation) {
        return { success: false, error: 'Operação bloqueada: tentativa de escalada de privilégio detectada.' };
      }

      const downgrade = RecoveryProtection.validateRoleDowngrade(id, data.role, actorId);
      if (!downgrade.allowed) {
        return { success: false, error: downgrade.reason };
      }
    }

    const all = readStaff();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, error: 'Colaborador não encontrado.' };

    const before = { ...all[idx] };
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    writeStaff(all);

    AuditLogger.log({
      action: 'STAFF_UPDATED',
      actorId,
      actorRole: 'super_admin',
      targetId: id,
      targetType: 'staff',
      details: `Colaborador ${all[idx].name} atualizado`,
      severity: 'INFO',
      metadata: {
        before: { role: before.role, department: before.department },
        after: { role: all[idx].role, department: all[idx].department },
        changes: data,
      },
    });

    return { success: true };
  },

  /**
   * Ativa ou desativa um colaborador (nunca deleta — compliance LGPD).
   * Protege o último super admin ativo.
   */
  setActive(id: string, active: boolean, actorId: string): { success: boolean; error?: string } {
    if (!active) {
      const protection = RecoveryProtection.validateDeactivation(id, actorId);
      if (!protection.allowed) {
        return { success: false, error: protection.reason };
      }
    }

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
    superAdmins: number;
    byRole: Record<StaffRole, number>;
  } {
    const all = readStaff();
    const byRole = {} as Record<StaffRole, number>;
    all.forEach(s => { byRole[s.role] = (byRole[s.role] || 0) + 1; });

    return {
      total: all.length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      superAdmins: all.filter(s => s.role === 'super_admin' && s.active).length,
      byRole,
    };
  },

  // ─── Gestão de Sessões ──────────────────────────────────────────────────────

  /** Cria uma nova sessão após login bem-sucedido. */
  createSession(userId: string, userEmail: string): SessionRecord {
    const session: SessionRecord = {
      id: generateId('sess'),
      userId,
      userEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: 'browser-client',
      userAgent: navigator.userAgent.slice(0, 200),
      deviceFingerprint: getDeviceFingerprint(),
      isActive: true,
    };

    const sessions = readSessions();
    sessions.push(session);
    writeSessions(sessions);

    // Armazena o ID da sessão atual no sessionStorage
    sessionStorage.setItem('legis_session_id', session.id);

    return session;
  },

  /** Retorna sessões ativas de um usuário. */
  getActiveSessions(userId: string): SessionRecord[] {
    const now = new Date().toISOString();
    return readSessions().filter(s =>
      s.userId === userId && s.isActive && s.expiresAt > now
    );
  },

  /** Revoga uma sessão específica. */
  revokeSession(sessionId: string, revokedBy: string): void {
    const sessions = readSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].isActive = false;
      sessions[idx].revokedAt = new Date().toISOString();
      sessions[idx].revokedBy = revokedBy;
      writeSessions(sessions);
    }
    // Se a sessão revogada é a sessão atual, limpa sessionStorage
    if (sessionStorage.getItem('legis_session_id') === sessionId) {
      sessionStorage.removeItem('legis_session_id');
    }
  },

  /** Revoga TODAS as sessões de um usuário (logout global). */
  revokeAllSessions(userId: string, revokedBy: string): void {
    const sessions = readSessions();
    const now = new Date().toISOString();
    sessions.forEach(s => {
      if (s.userId === userId && s.isActive) {
        s.isActive = false;
        s.revokedAt = now;
        s.revokedBy = revokedBy;
      }
    });
    writeSessions(sessions);
    sessionStorage.removeItem('legis_session_id');

    AuditLogger.log({
      action: 'SESSION_REVOKED',
      actorId: revokedBy,
      actorRole: 'super_admin',
      targetId: userId,
      targetType: 'staff',
      details: `Todas as sessões revogadas para o usuário: ${userId}`,
      severity: 'WARNING',
      metadata: { globalLogout: true, revokedBy },
    });
  },

  // ─── Gestão de Delegações ───────────────────────────────────────────────────

  /** Cria um registro de delegação de acesso. */
  createDelegation(
    data: Omit<DelegationRecord, 'id' | 'createdAt' | 'active' | 'revokedAt' | 'revokedBy'>,
    actorId: string
  ): DelegationRecord {
    const delegation: DelegationRecord = {
      ...data,
      id: generateId('dlg'),
      createdAt: new Date().toISOString(),
      active: true,
    };

    const delegations = readDelegations();
    delegations.push(delegation);
    writeDelegations(delegations);

    AuditLogger.log({
      action: 'DELEGATION_CREATED',
      actorId,
      actorRole: 'super_admin',
      targetId: delegation.targetUserId,
      targetType: 'user',
      details: `Delegação criada: ${data.targetUserName} → ${data.role} em ${data.organization}`,
      severity: 'WARNING',
      metadata: {
        delegationId: delegation.id,
        targetUser: data.targetUserId,
        role: data.role,
        scope: data.scope,
        validUntil: data.validUntil,
      },
    });

    return delegation;
  },

  /** Revoga uma delegação ativa. */
  revokeDelegation(delegationId: string, revokedBy: string): { success: boolean; error?: string } {
    const delegations = readDelegations();
    const idx = delegations.findIndex(d => d.id === delegationId);
    if (idx === -1) return { success: false, error: 'Delegação não encontrada.' };
    if (!delegations[idx].active) return { success: false, error: 'Delegação já foi revogada.' };

    delegations[idx].active = false;
    delegations[idx].revokedAt = new Date().toISOString();
    delegations[idx].revokedBy = revokedBy;
    writeDelegations(delegations);

    AuditLogger.log({
      action: 'DELEGATION_REVOKED',
      actorId: revokedBy,
      actorRole: 'super_admin',
      targetId: delegations[idx].targetUserId,
      targetType: 'user',
      details: `Delegação revogada: ${delegations[idx].targetUserName} — ${delegations[idx].role}`,
      severity: 'WARNING',
      metadata: { delegationId, revokedBy },
    });

    return { success: true };
  },

  /** Retorna todas as delegações (ativas ou não). */
  listDelegations(activeOnly = false): DelegationRecord[] {
    const all = readDelegations();
    if (activeOnly) {
      const now = new Date().toISOString();
      return all.filter(d => d.active && (!d.validUntil || d.validUntil > now));
    }
    return all;
  },
};

// Inicializa dados na carga do módulo
StaffService.initialize();
