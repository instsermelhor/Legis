/**
 * tests/unit/uxJourneysSimulation.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Suíte de Testes de Simulação de Jornadas UX/CX — Legis Connect
 * Valida a integridade de permissões e isolamento de roles para as 8 personas.
 * Utiliza a Permission type real definida em security/rbac.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { hasPermission, canImpersonate, ROLE_LEVELS } from '../../security/rbac';
import type { SystemRole } from '../../security/rbac';

export interface JourneyTestResult {
  persona: string;
  journeyName: string;
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

export async function runUxJourneysSimulationTests(): Promise<JourneyTestResult[]> {
  const results: JourneyTestResult[] = [];

  // ─────────────────────────────────────────────────────────────
  // JORNADA 1: Cliente — Acesso ao Dashboard e Serviços
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'client';
    const canSeeDashboard   = hasPermission(role, 'client:dashboard');
    const canReadServices   = hasPermission(role, 'services:read');
    const cannotAdmin       = !hasPermission(role, 'admin:read');
    const cannotFinance     = !hasPermission(role, 'finance:read');
    const passed = canSeeDashboard && canReadServices && cannotAdmin && cannotFinance;
    results.push({
      persona: 'Cliente',
      journeyName: 'Dashboard → Serviços → Bloqueio Administrativo e Financeiro',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `dashboard:${canSeeDashboard} services:${canReadServices} noAdmin:${cannotAdmin} noFinance:${cannotFinance}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 2: Advogado — Dashboard, Serviços e IA
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'lawyer';
    const canSeeDashboard   = hasPermission(role, 'lawyer:dashboard');
    const canReadServices   = hasPermission(role, 'services:read');
    const canUseAI          = hasPermission(role, 'ai:use');
    const cannotManageStaff = !hasPermission(role, 'admin:manage_staff');
    const cannotImpersonate = !canImpersonate(role);
    const passed = canSeeDashboard && canReadServices && canUseAI && cannotManageStaff && cannotImpersonate;
    results.push({
      persona: 'Advogado',
      journeyName: 'Dashboard → IA Copilot → Bloqueio Staff e Impersonação',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `dashboard:${canSeeDashboard} ai:${canUseAI} noStaff:${cannotManageStaff} noImpersonate:${cannotImpersonate}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 3: Estagiário — Acesso Restrito, Sem Financeiro
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'intern';
    const canSeeDashboard = hasPermission(role, 'intern:dashboard');
    const canUseAI        = hasPermission(role, 'ai:use');
    const cannotFinance   = !hasPermission(role, 'finance:read');
    const cannotAdmin     = !hasPermission(role, 'admin:write');
    const levelIsLow      = ROLE_LEVELS[role] < ROLE_LEVELS['lawyer'];
    const passed = canSeeDashboard && canUseAI && cannotFinance && cannotAdmin && levelIsLow;
    results.push({
      persona: 'Estagiário',
      journeyName: 'Dashboard → IA Suporte → Sem Acesso Financeiro e Administrativo',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `dashboard:${canSeeDashboard} ai:${canUseAI} noFinance:${cannotFinance} noAdmin:${cannotAdmin} lowerLevel:${levelIsLow}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 4: Secretária — Agenda e Documentos, Sem Financeiro
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'secretary';
    const canSeeDashboard = hasPermission(role, 'secretary:dashboard');
    const canReadServices = hasPermission(role, 'services:read');
    const cannotAdmin     = !hasPermission(role, 'admin:manage_staff');
    const cannotFinance   = !hasPermission(role, 'finance:write');
    const passed = canSeeDashboard && canReadServices && cannotAdmin && cannotFinance;
    results.push({
      persona: 'Secretária',
      journeyName: 'Dashboard → Serviços → Sem Gestão de Staff e Financeiro',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `dashboard:${canSeeDashboard} services:${canReadServices} noAdmin:${cannotAdmin} noFinance:${cannotFinance}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 5: Compliance Auditor — Auditoria Somente Leitura
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'staff_compliance_auditor';
    const canReadAudit      = hasPermission(role, 'audit:read');
    const canReadRegs       = hasPermission(role, 'registrations:read');
    const cannotFinance     = !hasPermission(role, 'finance:write');
    const cannotImpersonate = !canImpersonate(role);
    const passed = canReadAudit && canReadRegs && cannotFinance && cannotImpersonate;
    results.push({
      persona: 'Staff — Compliance Auditor',
      journeyName: 'Leitura Auditoria → Registros → Sem Financeiro e Impersonação',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `audit:${canReadAudit} regs:${canReadRegs} noFinance:${cannotFinance} noImpersonate:${cannotImpersonate}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 6: Finance Admin — Acesso Financeiro Completo
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'staff_finance_admin';
    const canReadFinance    = hasPermission(role, 'finance:read');
    const canWriteFinance   = hasPermission(role, 'finance:write');
    const canManageProvis   = hasPermission(role, 'provisioning:manage');
    const cannotManageStaff = !hasPermission(role, 'admin:manage_staff');
    const passed = canReadFinance && canWriteFinance && canManageProvis && cannotManageStaff;
    results.push({
      persona: 'Staff — Finance Admin',
      journeyName: 'Painel Financeiro Completo → Provisionamento → Sem Gestão Staff',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `finRead:${canReadFinance} finWrite:${canWriteFinance} provisioning:${canManageProvis} noStaffMgmt:${cannotManageStaff}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 7: Admin — Gestão Operacional Plena
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'admin';
    const canManageStaff    = hasPermission(role, 'admin:manage_staff');
    const canReadAdmin      = hasPermission(role, 'admin:read');
    const cannotImpersonate = !canImpersonate(role);
    const levelBelowSuper   = ROLE_LEVELS[role] < ROLE_LEVELS['super_admin'];
    const passed = canManageStaff && canReadAdmin && cannotImpersonate && levelBelowSuper;
    results.push({
      persona: 'Admin',
      journeyName: 'Gestão de Staff → Leitura Admin → Sem Impersonação',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `staff:${canManageStaff} adminRead:${canReadAdmin} noImpersonate:${cannotImpersonate} levelOk:${levelBelowSuper}`,
    });
  })();

  // ─────────────────────────────────────────────────────────────
  // JORNADA 8: Super Admin — Acesso Irrestrito e Impersonação
  // ─────────────────────────────────────────────────────────────
  (() => {
    const t0 = performance.now();
    const role: SystemRole = 'super_admin';
    const canManageAll    = hasPermission(role, 'admin:manage_staff');
    const canImpersonateUser = canImpersonate(role);
    const canAuditWrite   = hasPermission(role, 'audit:write');
    const canSystemConfig = hasPermission(role, 'system:config');
    const hasMaxLevel     = ROLE_LEVELS[role] === 9;
    const passed = canManageAll && canImpersonateUser && canAuditWrite && canSystemConfig && hasMaxLevel;
    results.push({
      persona: 'Super Admin',
      journeyName: 'Acesso Total → Impersonação → Audit Write → System Config → Level 9',
      passed,
      durationMs: Math.round(performance.now() - t0),
      details: `manageAll:${canManageAll} impersonate:${canImpersonateUser} auditWrite:${canAuditWrite} sysConfig:${canSystemConfig} maxLevel:${hasMaxLevel}`,
    });
  })();

  return results;
}
