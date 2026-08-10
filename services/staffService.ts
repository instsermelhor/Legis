// ─────────────────────────────────────────────────────────────────────────────
// services/staffService.ts
// Gestão de Colaboradores Internos da Plataforma (PlatformStaff)
// RBAC granular + Super Admin de Produção + Delegações + Sessões
// ─────────────────────────────────────────────────────────────────────────────

import type { PlatformStaff, StaffRole, DelegationRecord, SessionRecord } from '../types';
import { AuditLogger } from '../security/auditLogger';
import { generatePasswordHash } from '../security/passwordPolicy';
import { RecoveryProtection } from '../security/recoveryProtection';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STAFF_KEY       = 'legis_platform_staff';
const DELEGATION_KEY  = 'legis_delegations';
const SESSION_KEY     = 'legis_staff_sessions';
const SESSION_TTL_MS  = 8 * 60 * 60 * 1000; // 8 horas

// ─── Email do Super Admin de Produção ────────────────────────────────────────
const PROD_SUPER_ADMIN_EMAIL = 'legisconnectonline@gmail.com';
const PROD_SUPER_ADMIN_ID    = 'superadmin_prod_001';

// ─── Helpers de armazenamento ─────────────────────────────────────────────────
function readStaff(): PlatformStaff[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
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
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const trimmed = sessions.filter(s => s.createdAt > cutoff);
  localStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
}

function getDeviceFingerprint(): string {
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const raw = `${ua}|${lang}|${tz}`;
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

// ─── Geração de Senha Temporária Segura ──────────────────────────────────────
// Gera senha de 16 caracteres com critério enterprise via Web Crypto API.
// Formato: 4 maiúsculas + 4 minúsculas + 4 números + 4 símbolos (embaralhado).
function generateSecureTempPassword(): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '@#$%!&*^';

  const getRandChar = (charset: string): string => {
    const bytes = crypto.getRandomValues(new Uint8Array(1));
    return charset[bytes[0] % charset.length];
  };

  const parts = [
    ...Array.from({ length: 4 }, () => getRandChar(upper)),
    ...Array.from({ length: 4 }, () => getRandChar(lower)),
    ...Array.from({ length: 4 }, () => getRandChar(numbers)),
    ...Array.from({ length: 4 }, () => getRandChar(symbols)),
  ];

  // Fisher-Yates shuffle usando crypto.getRandomValues
  for (let i = parts.length - 1; i > 0; i--) {
    const bytes = crypto.getRandomValues(new Uint8Array(1));
    const j = bytes[0] % (i + 1);
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join('');
}

// ─── Migração: Remove usuários legados do localStorage ───────────────────────
// Chamado no bootstrap para garantir ambiente limpo de produção.
function migrateLegacyStaff(all: PlatformStaff[]): PlatformStaff[] {
  const LEGACY_EMAILS = [
    'ribeiro.rikardo@gmail.com',
    'instsermelhor.adm@gmail.com',
    'carlos.supervisor@legisconnect.com.br',
    'amanda.financeira@legisconnect.com.br',
    'roberto.compliance@legisconnect.com.br',
    'juliana.suporte@legisconnect.com.br',
    'marcos.suporte@legisconnect.com.br',
  ];
  return all.filter(s => !LEGACY_EMAILS.includes(s.email.toLowerCase()));
}

// ─── Service Principal ────────────────────────────────────────────────────────
export const StaffService = {
  initialize() {
    // Lê o staff atual (pode estar vazio ou ter dados legados)
    const all = readStaff();

    // Migra dados legados se necessário
    const cleaned = migrateLegacyStaff(all);
    const changed = cleaned.length !== all.length;
    if (changed) {
      writeStaff(cleaned);
      console.info(`[StaffService] ${all.length - cleaned.length} usuário(s) legado(s) migrado(s) e removido(s).`);
    }
  },

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
   * Bootstrap do Super Administrador de Produção.
   * Cria legisconnectonline@gmail.com com senha temporária segura gerada
   * em runtime via Web Crypto API (PBKDF2v2 — 310k iterações).
   * mustChangePassword = true → troca obrigatória no primeiro acesso.
   *
   * ⚠️ A senha temporária é exibida UMA ÚNICA VEZ no console do navegador
   * durante o primeiro boot. Anote e altere imediatamente no primeiro login.
   */
  async bootstrapProductionSuperAdmin(): Promise<void> {
    const all = readStaff();

    const existing = all.find(s => s.email.toLowerCase() === PROD_SUPER_ADMIN_EMAIL);
    if (existing) {
      // Super Admin já existe — garante que está ativo e com role correta
      const idx = all.findIndex(s => s.email.toLowerCase() === PROD_SUPER_ADMIN_EMAIL);
      if (idx !== -1) {
        if (all[idx].role !== 'super_admin' || !all[idx].active || all[idx].accessLevel !== 'GLOBAL') {
          all[idx].role = 'super_admin';
          all[idx].active = true;
          all[idx].accessLevel = 'GLOBAL';
          all[idx].updatedAt = new Date().toISOString();
          writeStaff(all);
          console.info(`[StaffService] Super Admin de produção validado: ${PROD_SUPER_ADMIN_EMAIL}`);
        }
      }
      return;
    }

    // Primeiro boot: gera senha temporária segura
    const tempPassword = generateSecureTempPassword();
    const tempPasswordHash = await generatePasswordHash(tempPassword);

    const superAdmin: PlatformStaff = {
      id: PROD_SUPER_ADMIN_ID,
      name: 'Legis Connect',
      email: PROD_SUPER_ADMIN_EMAIL,
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
      mustChangePassword: true, // PRIMEIRO ACESSO — troca obrigatória
      mfaEnabled: false,
      accessLevel: 'GLOBAL',
      passwordHistory: [],
      lastPasswordChange: undefined,
    };

    all.unshift(superAdmin);
    writeStaff(all);

    // ⚠️ SENHA TEMPORÁRIA — Exibida UMA ÚNICA VEZ no primeiro boot
    console.group('%c🔐 LEGIS CONNECT — SUPER ADMIN BOOTSTRAP', 'color:#f59e0b;font-size:14px;font-weight:bold;');
    console.log('%cSuperAdmin criado com sucesso!', 'color:#10b981;font-weight:bold;');
    console.log(`%cEmail:  ${PROD_SUPER_ADMIN_EMAIL}`, 'color:#e2e8f0;');
    console.log(`%cSenha:  ${tempPassword}`, 'color:#fbbf24;font-size:16px;font-weight:bold;letter-spacing:2px;');
    console.log('%c⚠️  Esta senha é temporária. ALTERE IMEDIATAMENTE no primeiro acesso!', 'color:#f87171;font-weight:bold;');
    console.groupEnd();

    AuditLogger.log({
      action: 'SUPER_ADMIN_CREATED',
      actorId: 'system_bootstrap',
      actorRole: 'super_admin',
      targetId: superAdmin.id,
      targetType: 'staff',
      details: `Super Admin de Produção criado: ${PROD_SUPER_ADMIN_EMAIL} — mustChangePassword: true`,
      severity: 'CRITICAL',
      metadata: {
        email: PROD_SUPER_ADMIN_EMAIL,
        accessLevel: 'GLOBAL',
        bootstrapSeed: true,
        firstBoot: true,
      },
    });
  },

  /**
   * Força a troca de senha de um colaborador.
   * Invalida a senha atual, registra no histórico e marca mustChangePassword = false.
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

    const newHash = await generatePasswordHash(newPassword);

    // Histórico: guarda a senha anterior
    const history = staff.passwordHistory || [];
    history.unshift(staff.password);
    if (history.length > 5) history.pop();

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
    passwordHash: string; // Hash PBKDF2v2 já gerado pelo chamador
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
      password: data.passwordHash,
      role: data.role,
      department: data.department,
      phone: data.phone,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
      permissions: data.permissions || [],
      loginCount: 0,
      mustChangePassword: data.mustChangePassword ?? true,
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
   * Protege o Super Admin de produção contra desativação acidental.
   */
  setActive(id: string, active: boolean, actorId: string): { success: boolean; error?: string } {
    // Protege o Super Admin de produção
    if (id === PROD_SUPER_ADMIN_ID && !active) {
      return { success: false, error: 'O Super Administrador de produção não pode ser desativado.' };
    }

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

// Inicializa e migra dados na carga do módulo
StaffService.initialize();
