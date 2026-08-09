// ─────────────────────────────────────────────────────────────────────────────
// components/admin/DelegationManager.tsx
// Gerenciador de Delegação de Permissões e Acessos Temporários
// Permite que o Super Admin delegue funções específicas a terceiros com expiração
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import type { View, StaffRole, DelegationRecord } from '../../types';
import { StaffService } from '../../services/staffService';
import { getSecurityContext } from '../../security/scopeValidator';
import { AuditLogger } from '../../security/auditLogger';

interface DelegationManagerProps {
  onNavigate: (view: View) => void;
  onBack: () => void;
}

const STAFF_ROLES: { role: StaffRole; label: string; desc: string }[] = [
  { role: 'staff_finance_admin',     label: 'Financeiro', desc: 'Gestão de faturamento, planos e chargebacks' },
  { role: 'staff_compliance_auditor', label: 'Compliance', desc: 'Auditoria de logs, OAB e denúncias' },
  { role: 'staff_support_l1',         label: 'Suporte L1', desc: 'Atendimento e suporte operacional básico' },
  { role: 'admin',                    label: 'Administrador', desc: 'Acesso às operações normais da plataforma' },
];

export const DelegationManager: React.FC<DelegationManagerProps> = ({ onNavigate, onBack }) => {
  const [delegations, setDelegations] = useState<DelegationRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole>('staff_support_l1');
  const [scope, setScope] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const ctx = getSecurityContext();

  useEffect(() => {
    loadDelegations();
  }, []);

  const loadDelegations = () => {
    setDelegations(StaffService.listDelegations());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!targetEmail || !targetName || !organization || !scope) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!ctx) {
      setError('Sessão expirada. Autentique-se novamente.');
      return;
    }

    const days = parseInt(validDays, 10);
    const validUntil = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : undefined;

    try {
      StaffService.createDelegation(
        {
          delegatedBy: ctx.userId,
          delegatedByEmail: ctx.userId,
          targetUserId: targetEmail.toLowerCase().trim(),
          targetUserName: targetName.trim(),
          organization: organization.trim(),
          role: selectedRole,
          permissions: [],
          resources: ['*'],
          scope: scope.trim(),
          validFrom: new Date().toISOString(),
          validUntil,
          notes: notes.trim() || undefined,
        },
        ctx.userId
      );

      setSuccessMsg('Delegação criada com sucesso!');
      setShowForm(false);
      setTargetEmail('');
      setTargetName('');
      setOrganization('');
      setScope('');
      setNotes('');
      loadDelegations();
    } catch {
      setError('Erro ao criar delegação.');
    }
  };

  const handleRevoke = (id: string) => {
    if (!ctx) return;
    const res = StaffService.revokeDelegation(id, ctx.userId);
    if (!res.success) {
      alert(res.error);
    } else {
      loadDelegations();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ background: 'linear-gradient(160deg, #060410 0%, #0D0B1A 100%)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Delegação de Acessos & Permissões</h1>
              <p className="text-xs text-gray-500">Governança Central · Atribuição temporária de autoridade</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-primary text-white text-xs font-bold hover:opacity-90 transition-all shadow-lg"
          >
            {showForm ? 'Fechar Formulário' : '+ Nova Delegação'}
          </button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            ✓ {successMsg}
          </div>
        )}

        {/* Modal/Formulário de Nova Delegação */}
        {showForm && (
          <form onSubmit={handleCreate} className="p-6 rounded-2xl border border-white/10 space-y-5" style={{ background: 'rgba(15,12,30,0.95)' }}>
            <h2 className="text-lg font-bold text-white border-b border-white/8 pb-3">Criar Delegação de Acesso</h2>
            
            {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-xs">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail do Beneficiário *</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  placeholder="usuario@escritorio.com.br"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Beneficiário *</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={e => setTargetName(e.target.value)}
                  placeholder="Dr. João Silva"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Organização / Escritório *</label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="Silva & Advogados Associados"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Validade do Acesso</label>
                <select
                  value={validDays}
                  onChange={e => setValidDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="7" className="bg-gray-900">7 Dias</option>
                  <option value="15" className="bg-gray-900">15 Dias</option>
                  <option value="30" className="bg-gray-900">30 Dias</option>
                  <option value="90" className="bg-gray-900">90 Dias</option>
                  <option value="365" className="bg-gray-900">1 Ano</option>
                  <option value="0" className="bg-gray-900">Indeterminado (Sem expiração)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Função Delegada *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STAFF_ROLES.map(r => (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === r.role
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold text-white text-xs">{r.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Escopo & Objetivos *</label>
              <input
                type="text"
                value={scope}
                onChange={e => setScope(e.target.value)}
                placeholder="Ex: Auditoria de conformidade no contrato X"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Observações Internas (Opcional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Notas de justificativa para a delegação..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-gray-400 text-xs font-semibold hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all shadow-lg"
              >
                Confirmar Delegação
              </button>
            </div>
          </form>
        )}

        {/* Lista de Delegações */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Histórico de Delegações</h2>
          {delegations.length === 0 ? (
            <div className="p-12 text-center text-gray-500 rounded-2xl border border-white/5 bg-white/2 text-sm">
              Nenhuma delegação cadastrada no sistema.
            </div>
          ) : (
            <div className="space-y-3">
              {delegations.map(dlg => (
                <div
                  key={dlg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    dlg.active ? 'border-white/8 bg-white/4' : 'border-white/4 bg-white/1 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{dlg.targetUserName}</span>
                        <span className="text-xs text-gray-400">({dlg.targetUserId})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {dlg.role}
                        </span>
                        {dlg.active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-300">
                            Ativa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300">
                            Revogada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>Org:</strong> {dlg.organization} · <strong>Escopo:</strong> {dlg.scope}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Delegado por {dlg.delegatedByEmail} em {new Date(dlg.createdAt).toLocaleDateString('pt-BR')} · Expira em:{' '}
                        {dlg.validUntil ? new Date(dlg.validUntil).toLocaleDateString('pt-BR') : 'Indeterminado'}
                      </p>
                    </div>

                    {dlg.active && (
                      <button
                        onClick={() => handleRevoke(dlg.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all self-start sm:self-auto"
                      >
                        Revogar Acesso
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
