// ─────────────────────────────────────────────────────────────────────────────
// components/admin/MyAdminProfile.tsx
// Perfil Pessoal de Segurança do Administrador / Super Administrador
// Permite alterar senha voluntariamente, gerenciar MFA e visualizar sessões ativas
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import type { View, User, PlatformStaff } from '../../types';
import { StaffService } from '../../services/staffService';
import { validatePassword, SUPER_ADMIN_PASSWORD_POLICY } from '../../security/passwordPolicy';
import { getSecurityContext } from '../../security/scopeValidator';
import { AuditLogger } from '../../security/auditLogger';

interface MyAdminProfileProps {
  onNavigate: (view: View) => void;
  onBack: () => void;
  user: User | null;
}

export const MyAdminProfile: React.FC<MyAdminProfileProps> = ({ onNavigate, onBack, user }) => {
  const [staff, setStaff] = useState<PlatformStaff | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ctx = getSecurityContext();

  useEffect(() => {
    if (user?.email) {
      const data = StaffService.findByEmail(user.email);
      setStaff(data);
    }
  }, [user]);

  const validation = validatePassword(newPassword, SUPER_ADMIN_PASSWORD_POLICY);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!staff || !ctx) {
      setError('Sessão inválida.');
      return;
    }

    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await StaffService.forcePasswordChange(staff.id, newPassword, ctx.userId);
      if (!result.success) {
        setError(result.error || 'Erro ao alterar senha.');
      } else {
        setSuccessMsg('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Falha ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ background: 'linear-gradient(160deg, #060410 0%, #0D0B1A 100%)' }}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Meu Perfil de Segurança</h1>
            <p className="text-xs text-gray-500">Gestão de credenciais e segurança do perfil administrativo</p>
          </div>
        </div>

        {/* Card Informações da Conta */}
        <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(15,12,30,0.8)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Dados Institucionais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Nome</p>
              <p className="font-bold text-white">{staff?.name || user?.name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">E-mail</p>
              <p className="font-bold text-white">{staff?.email || user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Função Plataforma</p>
              <p className="font-bold text-amber-400 capitalize">{staff?.role || user?.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">MFA (Autenticação 2 Fatores)</p>
              <p className={`font-bold ${staff?.mfaEnabled ? 'text-green-400' : 'text-amber-400'}`}>
                {staff?.mfaEnabled ? '✓ Ativo (TOTP)' : '⚠️ Inativo'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Altera de Senha */}
        <div className="p-6 rounded-2xl border border-white/8 space-y-5" style={{ background: 'rgba(15,12,30,0.8)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Alterar Senha de Acesso</h2>

          {successMsg && <div className="p-3 rounded-lg bg-green-500/10 text-green-400 text-xs">✓ {successMsg}</div>}
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-xs">⚠️ {error}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nova Senha *</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
              />
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${validation.score}%`,
                        backgroundColor: validation.score < 50 ? '#ef4444' : validation.score < 80 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">Força da Senha: {validation.strength}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Confirmar Nova Senha *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !validation.valid || newPassword !== confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-40"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>

        {/* Card MFA Quick Action */}
        <div className="p-6 rounded-2xl border border-white/8 flex items-center justify-between gap-4" style={{ background: 'rgba(15,12,30,0.8)' }}>
          <div>
            <h3 className="font-bold text-white text-sm">Autenticação Multi-Fator (MFA)</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {staff?.mfaEnabled ? 'Sua conta está protegida com Google Authenticator.' : 'Proteja seu acesso administrativo ativando o TOTP.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('mfaSetup')}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-all shrink-0"
          >
            {staff?.mfaEnabled ? 'Reconfigurar MFA' : 'Configurar MFA'}
          </button>
        </div>
      </div>
    </div>
  );
};
