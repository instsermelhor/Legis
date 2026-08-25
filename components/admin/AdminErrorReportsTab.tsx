/**
 * components/admin/AdminErrorReportsTab.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Painel Administrativo de Error Reporting & Incident Management
 * 
 * Funcionalidades:
 * - Visão geral com métricas de triagem
 * - Filtros por status, severidade, incidente de segurança e busca textual
 * - Deduplicação visual por fingerprint (contagem de ocorrências)
 * - Triagem com alteração de status, atribuição e comentários
 * - Visualização segura de stack traces e breadcrumbs sanitizados
 * - Histórico / timeline de eventos por relatório
 * - Isolamento multi-tenant e governança RBAC
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import {
  ErrorReportingService,
  ErrorReportRecord,
  ErrorReportStatus,
  ErrorSeverity,
} from '../../services/errorReportingService';
import { getSecurityContext } from '../../security/scopeValidator';
import { SystemRole } from '../../security/rbac';

export const AdminErrorReportsTab: React.FC = () => {
  const secCtx = getSecurityContext();
  const userRole = (secCtx?.role || 'admin') as SystemRole;
  const tenantId = secCtx?.tenantId || 'tenant_default';

  const [reports, setReports] = useState<ErrorReportRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<ErrorReportRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [securityOnly, setSecurityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados de triagem no detalhe
  const [newStatus, setNewStatus] = useState<ErrorReportStatus>('INVESTIGATING');
  const [triageComment, setTriageComment] = useState<string>('');
  const [assignedStaff, setAssignedStaff] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadReports = () => {
    const data = ErrorReportingService.getReports(tenantId, userRole);
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, [tenantId, userRole]);

  // Filtros combinados
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    if (securityOnly && !r.isSecurityIncident) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.reportId.toLowerCase().includes(q);
      const matchDesc = r.userDescription?.toLowerCase().includes(q);
      const matchMsg = r.errorMessage?.toLowerCase().includes(q);
      const matchMod = r.moduleName?.toLowerCase().includes(q);
      const matchTenant = r.tenantId?.toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchMsg && !matchMod && !matchTenant) return false;
    }
    return true;
  });

  // Métricas
  const totalCount = reports.length;
  const newCount = reports.filter(r => r.status === 'NEW').length;
  const inProgressCount = reports.filter(r => r.status === 'INVESTIGATING' || r.status === 'IN_PROGRESS').length;
  const incidentCount = reports.filter(r => r.isSecurityIncident).length;
  const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsUpdating(true);
    try {
      ErrorReportingService.updateReportStatus(
        selectedReport.reportId,
        newStatus,
        secCtx.userId || 'admin_user',
        userRole,
        triageComment.trim() || undefined,
        assignedStaff.trim() || undefined
      );

      loadReports();
      // Atualiza o selecionado
      const updated = ErrorReportingService.getReportById(selectedReport.reportId, tenantId, userRole);
      setSelectedReport(updated);
      setTriageComment('');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityBadge = (sev: ErrorSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/20 text-slate-400">INFO</span>;
    }
  };

  const getStatusBadge = (status: ErrorReportStatus) => {
    const colors: Record<ErrorReportStatus, string> = {
      NEW: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      TRIAGED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      INVESTIGATING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      BLOCKED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      FIXED: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      RETESTING: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      RESOLVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      DUPLICATE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      WONT_FIX: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[status] || colors.NEW}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-montserrat text-white flex items-center gap-2">
            <span>🛠️</span> Gestão de Relatórios de Erros & Incidentes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Triagem automatizada de falhas, evidências técnicas sanitizadas (LGPD) e isolamento multi-tenant.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>🔄</span> Atualizar Lista
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Total de Relatórios</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20">
          <p className="text-xs text-indigo-400">Novos (Pendente)</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">{newCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
          <p className="text-xs text-amber-400">Em Tratamento</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{inProgressCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/30 bg-red-950/20">
          <p className="text-xs text-red-400 font-semibold">🚨 Incidentes de Segurança</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{incidentCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
          <p className="text-xs text-emerald-400">Resolvidos</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID (ERR-...), módulo, mensagem..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">Todos os Status</option>
          <option value="NEW">NEW</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DUPLICATE">DUPLICATE</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">Todas as Severidades</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            checked={securityOnly}
            onChange={(e) => setSecurityOnly(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-red-500 focus:ring-red-500"
          />
          <span className="text-red-400 font-medium">Apenas Incidentes</span>
        </label>
      </div>

      {/* Tabela de Relatórios */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Identificador</th>
                <th className="py-3 px-4">Severidade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Módulo / Origem</th>
                <th className="py-3 px-4">Ocorrências</th>
                <th className="py-3 px-4">Tenant / Autor</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhum relatório de erro encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr
                    key={r.reportId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      r.isSecurityIncident ? 'bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {r.isSecurityIncident && <span title="Incidente de Segurança">🚨</span>}
                        <span>{r.reportId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getSeverityBadge(r.severity)}</td>
                    <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium text-white">{r.moduleName || 'general'}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">{r.url}</div>
                    </td>
                    <td className="py-3 px-4">
                      {r.occurrences > 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {r.occurrences}x recorrente
                        </span>
                      ) : (
                        <span className="text-slate-500">1x</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="font-mono text-[11px] text-slate-300">{r.tenantId}</div>
                      <div className="text-[10px]">{r.userRole} ({r.userId.slice(0, 8)})</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(r.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(r)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                      >
                        Triar / Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer de Triagem Detalhada */}
      {selectedReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
            {/* Header Detalhe */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedReport.isSecurityIncident ? '🚨' : '📋'}</span>
                <div>
                  <h3 className="font-bold text-white font-mono">{selectedReport.reportId}</h3>
                  <p className="text-xs text-slate-400">
                    Módulo: {selectedReport.moduleName} • Versão: {selectedReport.appVersion} • {selectedReport.environment}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Corpo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Alerta de Incidente */}
              {selectedReport.isSecurityIncident && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>🚨</span> INCIDENTE DE SEGURANÇA DETECTADO
                  </div>
                  <p>
                    O stack trace ou contexto deste erro contém indicadores de violação de isolamento (cross-tenant, RLS ou IDOR). A equipe de SOC/Compliance foi notificada na cadeia de auditoria imutável.
                  </p>
                </div>
              )}

              {/* Grid de Metadados */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Severidade:</span>
                  <div className="mt-1">{getSeverityBadge(selectedReport.severity)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Ocorrências:</span>
                  <span className="font-bold text-white mt-1 block">{selectedReport.occurrences}x</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Responsável:</span>
                  <span className="text-slate-300 mt-1 block font-mono">{selectedReport.assignedTo || 'Não atribuído'}</span>
                </div>
              </div>

              {/* Relato do Usuário */}
              {selectedReport.userDescription && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300">💬 Descrição informada pelo usuário:</span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                    {selectedReport.userDescription}
                  </div>
                </div>
              )}

              {/* Mensagem e Stack Trace Sanitizado */}
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">🔍 Evidência Técnica (Sanitizada):</span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-red-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {selectedReport.errorMessage}
                  {selectedReport.stackTrace && `\n\n${selectedReport.stackTrace}`}
                </div>
              </div>

              {/* Breadcrumbs de Navegação */}
              {selectedReport.breadcrumbs && selectedReport.breadcrumbs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300">🐾 Sequência de Ações (Breadcrumbs):</span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                    {selectedReport.breadcrumbs.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-400">
                        <span className="text-slate-600 shrink-0">#{i + 1}</span>
                        <span className="text-indigo-400 shrink-0">[{b.category}]</span>
                        <span className="text-slate-300">{b.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Captura de Tela */}
              {selectedReport.screenshotBase64 && selectedReport.screenshotConsent && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300">📸 Captura Visual (Campos Sensíveis Mascarados):</span>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={selectedReport.screenshotBase64}
                      alt="Screenshot do erro"
                      className="max-h-60 rounded-lg mx-auto border border-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Timeline de Eventos */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-300">📜 Histórico de Triagem & Auditoria:</span>
                <div className="space-y-2 border-l-2 border-slate-800 pl-4">
                  {selectedReport.events?.map((ev) => (
                    <div key={ev.id} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{ev.eventType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ev.createdAt).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-indigo-400">por {ev.actorRole} ({ev.actorId.slice(0, 8)})</span>
                      </div>
                      {ev.comment && <p className="text-slate-400 text-[11px]">{ev.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Triagem Inline */}
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 pt-4">
                <div className="font-bold text-white text-sm">🛠️ Atualizar Triagem do Relatório</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Novo Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ErrorReportStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="TRIAGED">TRIAGED (Triado)</option>
                      <option value="INVESTIGATING">INVESTIGATING (Em Investigação)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (Em Correção)</option>
                      <option value="BLOCKED">BLOCKED (Bloqueado)</option>
                      <option value="FIXED">FIXED (Corrigido)</option>
                      <option value="RETESTING">RETESTING (Em Reteste)</option>
                      <option value="RESOLVED">RESOLVED (Resolvido)</option>
                      <option value="DUPLICATE">DUPLICATE (Duplicado)</option>
                      <option value="WONT_FIX">WONT_FIX (Não Aplicável)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Atribuir Responsável:</label>
                    <input
                      type="text"
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      placeholder="Nome ou email do desenvolvedor/auditor"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Comentário Técnico / Resolução:</label>
                  <textarea
                    rows={2}
                    value={triageComment}
                    onChange={(e) => setTriageComment(e.target.value)}
                    placeholder="Registrar notas de investigação, causa raiz, commit vinculado ou parecer..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-xs transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isUpdating ? 'Salvando...' : 'Salvar Alteração'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
