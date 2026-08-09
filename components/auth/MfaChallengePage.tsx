// ─────────────────────────────────────────────────────────────────────────────
// components/auth/MfaChallengePage.tsx
// Desafio MFA — exigido para admin com MFA habilitado após inserir credenciais
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { MfaService } from '../../security/mfaService';

interface MfaChallengePageProps {
  onVerified: () => void;
  onCancel: () => void;
  challengeId?: string;
  totpSecret?: string;
  staffId?: string;
}

export const MfaChallengePage: React.FC<MfaChallengePageProps> = ({
  onVerified,
  onCancel,
  challengeId,
  totpSecret,
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(MfaService.getTotpRemainingSeconds());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
      setRemainingSeconds(MfaService.getTotpRemainingSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (!challengeId || !totpSecret) {
      // Modo direto (sem challenge ID, verifica diretamente)
      const valid = await MfaService.verifySetupToken(totpSecret || '', token);
      if (valid) { onVerified(); return; }
      setError('Código inválido. Tente novamente.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const result = await MfaService.verifyChallenge(challengeId, token, totpSecret || '');
      if (result.success) {
        onVerified();
      } else {
        setError(result.error || 'Código inválido.');
        if (result.attemptsRemaining === 0) {
          setTimeout(onCancel, 2000);
        }
      }
    } catch {
      setError('Erro na verificação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && token.length === 6) handleVerify();
  };

  const circumference = 2 * Math.PI * 20;
  const progress = (remainingSeconds / 30) * circumference;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #060410 0%, #0D0B1A 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl border border-white/8 p-8 shadow-2xl text-center space-y-6"
          style={{ background: 'rgba(15,12,30,0.95)', backdropFilter: 'blur(24px)' }}
        >
          {/* Timer circular */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r="20" fill="none" stroke="#8b5cf6" strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{remainingSeconds}s</span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white mb-1">Verificação em 2 Etapas</h1>
            <p className="text-gray-400 text-sm">Digite o código gerado pelo seu app autenticador</p>
          </div>

          {/* Input OTP */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={token}
            onChange={e => { setToken(e.target.value.replace(/\D/g, '')); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="000 000"
            className="w-full text-center text-3xl font-mono py-4 px-4 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/20 tracking-widest focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
            style={{ colorScheme: 'dark' }}
          />

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={token.length < 6 || isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-primary hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : '✓ Verificar'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar ao login
            </button>
          </div>

          <p className="text-xs text-gray-600">
            O código muda a cada 30 segundos. Certifique-se de que o relógio do seu dispositivo está sincronizado.
          </p>
        </div>
      </div>
    </div>
  );
};
