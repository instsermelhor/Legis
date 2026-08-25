/**
 * components/error/ErrorBoundaryFallback.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UI de Fallback Controlada para Error Boundary
 * 
 * Regra: NUNCA expor stack trace, SQL, nomes de tabelas ou segredos ao usuário final.
 * Apresenta experiência amigável com opção de tentar novamente e reportar erro.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

interface ErrorBoundaryFallbackProps {
  moduleName?: string;
  onRetry?: () => void;
  onReportError?: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  moduleName,
  onRetry,
  onReportError,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[360px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 text-white rounded-2xl border border-amber-500/30 my-6 mx-auto max-w-xl shadow-2xl backdrop-blur-sm"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mb-4 text-amber-400">
        ⚠️
      </div>

      <h2 className="text-xl font-bold font-montserrat mb-2 text-slate-100">
        Encontramos um problema nesta tela
      </h2>

      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {moduleName
          ? `Ocorreu uma instabilidade temporária na seção de ${moduleName}.`
          : 'Ocorreu uma instabilidade temporária ao carregar este conteúdo.'}{' '}
        Nossa equipe foi informada automaticamente.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            🔄 Tentar novamente
          </button>
        )}

        {onReportError && (
          <button
            type="button"
            onClick={onReportError}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg shadow-amber-600/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            📋 Reportar erro
          </button>
        )}
      </div>
    </div>
  );
};
