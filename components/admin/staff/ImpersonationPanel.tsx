import React, { useState, useEffect, useRef } from 'react';
import { validateImpersonation } from '../../../security/scopeValidator';
import { logImpersonationStart, AuditLogger } from '../../../security/auditLogger';
import type { ImpersonationSession } from '../../../types';
import { mockClients } from '../../../services/mockDataService';
import { mockLawyers } from '../../../services/mockLawyerService';

// ─── Constantes ───────────────────────────────────────────────────────────────
const IMPERSONATION_KEY = 'legis_impersonation_session';
const MAX_DURATION_MS = 30 * 60 * 1000; // 30 minutos

// ─── Usuários disponíveis para espelhamento ────────────────────────────────────
type ImpersonationTarget = {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'lawyer' | 'intern' | 'secretary';
  cpf?: string;
};

function getAllTargets(): ImpersonationTarget[] {
  const clients: ImpersonationTarget[] = mockClients.map(c => ({
    id: `client_${c.id}`,
    email: c.email,
    name: c.name,
    role: 'client',
    cpf: c.cpf,
  }));

  const lawyers: ImpersonationTarget[] = mockLawyers.slice(0, 5).map(l => ({
    id: `lawyer_${l.id}`,
    email: l.contact.email,
    name: l.name,
    role: 'lawyer',
  }));

  return [...clients, ...lawyers];
}

// ─── Banner de Aviso Ativo (exibido durante sessão de espelho) ─────────────────
export const ImpersonationBanner: React.FC<{ onEnd: () => void }> = ({ onEnd }) => {
  const session = (() => {
    try {
      const raw = sessionStorage.getItem(IMPERSONATION_KEY);
      return raw ? JSON.parse(raw) as ImpersonationSession : null;
    } catch { return null; }
  })();

  if (!session) return null;

  const remaining = Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
  const minutes = Math.floor(remaining / 60000);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-lg">👁️</span>
        <div>
          <span className="font-bold text-sm">MODO ESPELHO ATIVO</span>
          <span className="text-sm ml-2">
            Visualizando como: <strong>{session.targetUserEmail}</strong> ({session.targetRole})
          </span>
          <span className="ml-3 text-xs bg-amber-600 px-2 py-0.5 rounded">
            {minutes}min restantes
          </span>
        </div>
      </div>
      <button
        onClick={onEnd}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition"
      >
        ✕ Encerrar Modo Espelho
      </button>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
interface ImpersonationPanelProps {
  actorId?: string;
  actorEmail?: string;
}

export const ImpersonationPanel: React.FC<ImpersonationPanelProps> = ({
  actorId = 'super_admin',
  actorEmail = 'admin@legisconnect.com.br',
}) => {
  const [targets] = useState<ImpersonationTarget[]>(getAllTargets());
  const [selected, setSelected] = useState<ImpersonationTarget | null>(null);
  const [justification, setJustification] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'lawyer' | 'intern' | 'secretary'>('all');
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentLogs, setRecentLogs] = useState<ReturnType<typeof AuditLogger.filter>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carrega sessão ativa e logs recentes
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(IMPERSONATION_KEY);
      if (raw) {
        const s: ImpersonationSession = JSON.parse(raw);
        if (new Date(s.expiresAt).getTime() > Date.now()) {
          setActiveSession(s);
        } else {
          sessionStorage.removeItem(IMPERSONATION_KEY);
        }
      }
    } catch { /* ignore */ }

    setRecentLogs(AuditLogger.filter({ action: 'IMPERSONATION_START', limit: 10 }));
  }, []);

  // Auto-expiração da sessão
  useEffect(() => {
    if (!activeSession) { if (timerRef.current) clearInterval(timerRef.current); return; }

    timerRef.current = setInterval(() => {
      const remaining = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        handleEndSession();
      }
    }, 5000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSession]);

  const filteredTargets = targets.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || t.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleStartImpersonation = () => {
    setError('');
    setSuccess('');

    if (!selected) { setError('Selecione um usuário para espelhar.'); return; }

    const validation = validateImpersonation(
      { userId: actorId, role: 'super_admin' },
      selected.id,
      justification
    );

    if (!validation.granted) { setError(validation.reason); return; }

    // Gera log de auditoria obrigatório
    const logEntry = logImpersonationStart(
      actorId,
      'super_admin',
      selected.email,
      justification
    );

    // Cria sessão de impersonation
    const session: ImpersonationSession = {
      id: `imp_${Date.now().toString(36)}`,
      adminId: actorId,
      adminEmail: actorEmail,
      targetUserId: selected.id,
      targetUserEmail: selected.email,
      targetRole: selected.role,
      justification,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + MAX_DURATION_MS).toISOString(),
      auditLogId: logEntry.id,
    };

    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
    setActiveSession(session);
    setJustification('');
    setSelected(null);
    setSuccess(`✅ Modo Espelho iniciado para ${selected.name}. Sessão expira em 30 minutos.`);
    setRecentLogs(AuditLogger.filter({ action: 'IMPERSONATION_START', limit: 10 }));
  };

  const handleEndSession = () => {
    if (activeSession) {
      AuditLogger.log({
        action: 'IMPERSONATION_END',
        actorId,
        actorRole: 'super_admin',
        targetId: activeSession.targetUserId,
        details: `Modo Espelho encerrado para ${activeSession.targetUserEmail}. Duração: ${Math.round((Date.now() - new Date(activeSession.startedAt).getTime()) / 60000)}min`,
        severity: 'WARNING',
      });
    }
    sessionStorage.removeItem(IMPERSONATION_KEY);
    setActiveSession(null);
    setSuccess('Modo Espelho encerrado com sucesso.');
    setRecentLogs(AuditLogger.filter({ action: 'IMPERSONATION_START', limit: 10 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            👁️ Modo Espelho <span className="text-sm text-gray-400 font-normal">(Impersonation Panel)</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualize o painel exato de um cliente ou advogado para suporte técnico avançado.
            <span className="text-amber-500 font-medium"> Cada acesso gera um log de auditoria imutável.</span>
          </p>
        </div>
      </div>

      {/* Aviso de Segurança */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Recurso de Alto Risco — Uso Restrito</p>
            <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1 list-disc list-inside">
              <li>Disponível apenas para <strong>Super Administradores</strong></li>
              <li>Justificativa com mínimo de 20 caracteres é obrigatória</li>
              <li>A sessão expira automaticamente em <strong>30 minutos</strong></li>
              <li>Todas as ações geram registro imutável com hash de integridade (LGPD Art. 37)</li>
              <li>Logs são retidos por no mínimo 5 anos conforme LGPD</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sessão Ativa */}
      {activeSession && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-400 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">🔴 Sessão de Espelho Ativa</p>
              <div className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                <p><strong>Usuário espelhado:</strong> {activeSession.targetUserEmail}</p>
                <p><strong>Perfil:</strong> {activeSession.targetRole}</p>
                <p><strong>Iniciada em:</strong> {new Date(activeSession.startedAt).toLocaleString('pt-BR')}</p>
                <p><strong>Expira em:</strong> {new Date(activeSession.expiresAt).toLocaleString('pt-BR')}</p>
                <p><strong>Log de auditoria:</strong> <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{activeSession.auditLogId}</code></p>
              </div>
            </div>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition flex-shrink-0"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Impersonation */}
      {!activeSession && (
        <div className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Iniciar Modo Espelho</h3>

          {/* Filtros de busca */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
            />
            <select
              value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos os perfis</option>
              <option value="client">Clientes</option>
              <option value="lawyer">Advogados</option>
              <option value="intern">Bacharelandos</option>
              <option value="secretary">Secretários</option>
            </select>
          </div>

          {/* Lista de targets */}
          <div className="border border-gray-200 dark:border-[#2A2545] rounded-lg overflow-hidden max-h-56 overflow-y-auto mb-4">
            {filteredTargets.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-400">Nenhum usuário encontrado.</p>
            ) : filteredTargets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(selected?.id === t.id ? null : t)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 dark:border-[#2A2545] last:border-0 transition ${
                  selected?.id === t.id
                    ? 'bg-violet-50 dark:bg-violet-900/20 border-l-4 border-l-violet-500'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1A1730]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  t.role === 'client' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  t.role === 'lawyer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {t.role}
                </span>
                {selected?.id === t.id && <span className="text-violet-500 text-lg">✓</span>}
              </button>
            ))}
          </div>

          {/* Justificativa */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Justificativa <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(mín. 20 caracteres — registrado em auditoria)</span>
            </label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={3}
              placeholder="Ex: Cliente reportou bug no campo de upload do processo #2145. Preciso replicar o ambiente para diagnóstico."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1B3A] text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex justify-between mt-1">
              <p className={`text-xs ${justification.length < 20 ? 'text-red-400' : 'text-green-500'}`}>
                {justification.length}/20 caracteres mínimos
              </p>
              {justification.length >= 20 && <p className="text-xs text-green-500">✓ Justificativa válida</p>}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 mb-3">{success}</p>}

          <button
            onClick={handleStartImpersonation}
            disabled={!selected || justification.length < 20}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-sm"
          >
            👁️ Iniciar Modo Espelho para {selected ? selected.name : '...'}
          </button>
        </div>
      )}

      {/* Histórico de Impersonations */}
      <div className="bg-white dark:bg-[#12102A] rounded-xl border border-gray-200 dark:border-[#2A2545] p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          📋 Histórico de Acessos — Últimos 10 Eventos
        </h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum acesso de modo espelho registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#1A1730] rounded-lg border border-gray-100 dark:border-[#2A2545]">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(log.timestamp).toLocaleString('pt-BR')} — por <strong>{log.actorId}</strong>
                  </p>
                </div>
                <code className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 hidden sm:block">
                  #{log.id.slice(-6)}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
