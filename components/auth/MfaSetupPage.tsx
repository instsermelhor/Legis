// ─────────────────────────────────────────────────────────────────────────────
// components/auth/MfaSetupPage.tsx
// Página de Configuração de MFA (TOTP)
// Gera QR code compatível com Google Authenticator / Authy
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { MfaService } from '../../security/mfaService';
import { generateRecoveryCodes, hashRecoveryCode } from '../../security/passwordPolicy';
import { StaffService } from '../../services/staffService';
import { AuditLogger } from '../../security/auditLogger';
import { getSecurityContext } from '../../security/scopeValidator';

interface MfaSetupPageProps {
  onSetupComplete: () => void;
  onSkip: () => void;
}

type Step = 'intro' | 'qrcode' | 'verify' | 'recovery' | 'done';

export const MfaSetupPage: React.FC<MfaSetupPageProps> = ({ onSetupComplete, onSkip }) => {
  const [step, setStep] = useState<Step>('intro');
  const [totpData, setTotpData] = useState<{ secret: string; uri: string; qrCodeUrl: string } | null>(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const ctx = getSecurityContext();

  useEffect(() => {
    if (step === 'qrcode' && !totpData && ctx) {
      const data = MfaService.setupTotp(ctx.userId);
      setTotpData(data);
    }
    if (step === 'recovery') {
      const codes = generateRecoveryCodes(8);
      setRecoveryCodes(codes);
    }
  }, [step, ctx]);

  const handleVerify = async () => {
    if (!totpData || !ctx) return;
    setVerifyError('');
    setIsVerifying(true);
    try {
      const valid = await MfaService.verifySetupToken(totpData.secret, verifyToken);
      if (!valid) {
        setVerifyError('Código inválido. Verifique o app e tente novamente.');
        setIsVerifying(false);
        return;
      }
      setStep('recovery');
    } catch {
      setVerifyError('Erro na verificação. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveAndActivate = async () => {
    if (!totpData || !ctx) return;
    try {
      const staff = StaffService.findByEmail(ctx.userId);
      if (!staff) return;

      // Hash dos códigos de recuperação para armazenamento seguro
      const hashedCodes = await Promise.all(recoveryCodes.map(c => hashRecoveryCode(c)));

      StaffService.update(
        staff.id,
        {
          mfaEnabled: true,
          // @ts-ignore — campo adicionado ao PlatformStaff
          mfaMethod: 'TOTP',
          mfaSecretEncrypted: totpData.secret, // Em produção: encriptar com chave do servidor
          recoveryCodes: hashedCodes,
        },
        ctx.userId,
        staff.role
      );

      AuditLogger.log({
        action: 'MFA_ENABLED',
        actorId: ctx.userId,
        actorRole: ctx.role,
        details: `MFA TOTP ativado para: ${ctx.userId}`,
        severity: 'WARNING',
        metadata: { mfaMethod: 'TOTP', recoveryCodesCount: hashedCodes.length },
      });

      setStep('done');
    } catch (err) {
      console.error('Erro ao salvar MFA:', err);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #060410 0%, #0D0B1A 100%)' }}
    >
      <div className="w-full max-w-lg">
        <div
          className="rounded-2xl border border-white/8 p-8 shadow-2xl"
          style={{ background: 'rgba(15,12,30,0.94)', backdropFilter: 'blur(24px)' }}
        >
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['intro','qrcode','verify','recovery','done'] as Step[]).map((s, i) => (
              <div key={s} className={`flex items-center gap-2 ${i > 0 ? '' : ''}`}>
                {i > 0 && <div className={`w-8 h-px ${['qrcode','verify','recovery','done'].indexOf(step) >= i ? 'bg-violet-500' : 'bg-white/10'}`} />}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? 'bg-violet-600 text-white' :
                  (['qrcode','verify','recovery','done'].indexOf(step) > ['intro','qrcode','verify','recovery','done'].indexOf(s) ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-500')
                }`}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="text-5xl mb-4">🛡️</div>
              <h1 className="text-2xl font-bold text-white">Configurar Autenticação de Dois Fatores</h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Para máxima segurança da plataforma, recomendamos ativar o MFA com TOTP.
                Você precisará de um app como <strong className="text-white">Google Authenticator</strong> ou <strong className="text-white">Authy</strong>.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button onClick={() => setStep('qrcode')}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-primary hover:opacity-90 transition-all">
                  🔐 Configurar MFA Agora
                </button>
                <button onClick={onSkip}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-gray-500 hover:text-gray-300 transition-colors border border-white/8 hover:border-white/15">
                  Configurar mais tarde
                </button>
              </div>
            </div>
          )}

          {/* Step: QR Code */}
          {step === 'qrcode' && totpData && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Escaneie o QR Code</h2>
                <p className="text-gray-400 text-sm">Abra o Google Authenticator ou Authy e escaneie:</p>
              </div>
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-xl">
                  <img src={totpData.qrCodeUrl} alt="QR Code MFA" className="w-48 h-48" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Ou insira manualmente o código:</p>
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-center text-sm text-violet-300 break-all select-all">
                  {totpData.secret}
                </div>
              </div>
              <button onClick={() => setStep('verify')}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-primary hover:opacity-90 transition-all">
                Já configurei o app →
              </button>
            </div>
          )}

          {/* Step: Verify */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Verificar Configuração</h2>
                <p className="text-gray-400 text-sm">Digite o código de 6 dígitos gerado pelo app:</p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyToken}
                onChange={e => setVerifyToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                className="w-full text-center text-2xl font-mono py-4 px-6 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/20 tracking-widest focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                style={{ colorScheme: 'dark' }}
              />
              {verifyError && (
                <p className="text-sm text-red-400 text-center">{verifyError}</p>
              )}
              <button
                onClick={handleVerify}
                disabled={verifyToken.length < 6 || isVerifying}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-primary hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verificando...' : '✓ Verificar Código'}
              </button>
            </div>
          )}

          {/* Step: Recovery Codes */}
          {step === 'recovery' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Códigos de Recuperação</h2>
                <p className="text-gray-400 text-sm">Guarde esses códigos em local seguro. Cada código só pode ser usado uma vez.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/4 border border-white/8 grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, i) => (
                  <div key={i} className="font-mono text-sm text-emerald-300 text-center py-1.5 px-2 rounded-lg bg-white/4">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={copyRecoveryCodes}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-white/12 text-gray-300 hover:bg-white/5 transition-all">
                  {copiedCodes ? '✓ Copiado!' : '📋 Copiar Códigos'}
                </button>
                <button onClick={handleSaveAndActivate}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-primary hover:opacity-90 transition-all">
                  ✓ Ativar MFA
                </button>
              </div>
              <p className="text-xs text-amber-400 text-center">
                ⚠️ Salve esses códigos agora. Eles não serão exibidos novamente.
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center space-y-6 py-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-white">MFA Ativado com Sucesso!</h2>
              <p className="text-gray-400 text-sm">
                Sua conta agora está protegida com autenticação de dois fatores.
                A cada login, você precisará inserir um código do seu app autenticador.
              </p>
              <button onClick={onSetupComplete}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 transition-all">
                Continuar para o Painel →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
