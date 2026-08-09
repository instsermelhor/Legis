// ─────────────────────────────────────────────────────────────────────────────
// components/auth/ForcePasswordChangePage.tsx
// Página de Troca Obrigatória de Senha — Primeiro Acesso
// Bloqueia acesso ao painel até que a senha temporária seja substituída
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { StaffService } from '../../services/staffService';
import { validatePassword, SUPER_ADMIN_PASSWORD_POLICY } from '../../security/passwordPolicy';
import { getSecurityContext } from '../../security/scopeValidator';
import { AuditLogger } from '../../security/auditLogger';

interface ForcePasswordChangePageProps {
  onPasswordChanged: () => void;
  onCancel: () => void;
}

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very_strong';

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string; width: string }> = {
  weak:       { label: 'Fraca',        color: '#ef4444', width: '25%' },
  fair:       { label: 'Regular',      color: '#f59e0b', width: '50%' },
  strong:     { label: 'Forte',        color: '#10b981', width: '75%' },
  very_strong:{ label: 'Muito Forte',  color: '#8b5cf6', width: '100%' },
};

export const ForcePasswordChangePage: React.FC<ForcePasswordChangePageProps> = ({
  onPasswordChanged,
  onCancel,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validation = validatePassword(newPassword, SUPER_ADMIN_PASSWORD_POLICY);
  const strength = STRENGTH_CONFIG[validation.strength];

  // Busca o usuário atual do SecurityContext
  const secCtx = getSecurityContext();
  const currentEmail = secCtx?.userId || '';

  // Previne acesso direto sem sessão
  useEffect(() => {
    if (!secCtx) {
      onCancel();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const staff = StaffService.findByEmail(currentEmail);
      if (!staff) {
        setError('Sessão inválida. Faça login novamente.');
        setIsLoading(false);
        return;
      }

      const result = await StaffService.forcePasswordChange(staff.id, newPassword, currentEmail);
      if (!result.success) {
        setError(result.error || 'Erro ao alterar senha.');
        setIsLoading(false);
        return;
      }

      AuditLogger.log({
        action: 'PASSWORD_CHANGED',
        actorId: currentEmail,
        actorRole: staff.role,
        details: `Senha temporária substituída com sucesso. Primeiro acesso concluído para: ${currentEmail}`,
        severity: 'WARNING',
        metadata: { wasFirstAccess: true },
      });

      setSuccess(true);
      setTimeout(() => onPasswordChanged(), 2000);
    } catch {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #060410 0%, #0D0B1A 100%)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Senha Alterada com Sucesso!</h2>
          <p className="text-gray-400">Redirecionando para nova autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060410 0%, #0D0B1A 40%, #0A0820 100%)' }}
    >
      {/* Background decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Badge de segurança */}
      <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-semibold">
        🔒 Área Restrita · Troca de Senha Obrigatória
      </div>

      <div className="relative w-full max-w-md">
        <div
          className="rounded-2xl border border-white/8 p-8 sm:p-10 shadow-2xl"
          style={{ background: 'rgba(15, 12, 30, 0.92)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-red-500/20 border border-amber-500/30 text-3xl mb-5 shadow-lg">
              🔑
            </div>
            <h1 className="font-montserrat text-2xl font-bold text-white mb-2">
              Alteração de Senha Obrigatória
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Por segurança, você precisa criar uma nova senha antes de continuar.
            </p>
          </div>

          {/* Alerta informativo */}
          <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-lg shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-300 leading-relaxed">
              Esta senha temporária não poderá ser reutilizada após a troca. Após confirmar,
              você será redirecionado para autenticar novamente com a nova senha.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova senha */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors">
                  {showNew ? '👁' : '👁‍🗨'}
                </button>
              </div>

              {/* Indicador de força */}
              {newPassword.length > 0 && (
                <div className="space-y-1.5">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                    <span className="text-xs text-gray-600">{validation.score}/100</span>
                  </div>
                </div>
              )}

              {/* Política de senha */}
              {newPassword.length > 0 && validation.errors.length > 0 && (
                <div className="space-y-1">
                  {validation.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400 flex items-center gap-1.5">
                      <span>✗</span>{err}
                    </p>
                  ))}
                </div>
              )}

              {newPassword.length > 0 && validation.valid && (
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <span>✓</span> Senha atende à política de segurança
                </p>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300 tracking-wide uppercase">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirm ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400">As senhas não coincidem</p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && validation.valid && (
                <p className="text-xs text-green-400 flex items-center gap-1.5">✓ Senhas coincidem</p>
              )}
            </div>

            {/* Política resumida */}
            <div className="px-3 py-3 rounded-xl bg-white/3 border border-white/6">
              <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Política de Senha (Super Admin)</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className={newPassword.length >= 12 ? 'text-green-500' : ''}>• Mínimo 12 caracteres</li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}>• Letra maiúscula</li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-500' : ''}>• Letra minúscula</li>
                <li className={/[0-9]/.test(newPassword) ? 'text-green-500' : ''}>• Número</li>
                <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-500' : ''}>• Símbolo especial</li>
              </ul>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
                <span className="text-red-400 shrink-0">⚠</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !validation.valid || newPassword !== confirmPassword}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-90 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>🔐 Definir Nova Senha e Continuar</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/6 text-center">
            <p className="text-[11px] text-gray-600">
              Esta ação é auditada e registrada nos logs de segurança da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
