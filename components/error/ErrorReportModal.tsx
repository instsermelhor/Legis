/**
 * components/error/ErrorReportModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal Institucional de Reporte de Erros — Legis Connect
 * 
 * Permite ao usuário relatar problemas com facilidade, coletando dados técnicos
 * e consentimento LGPD de forma transparente, gerando o Report ID rastreável.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { ErrorReportingService } from '../../services/errorReportingService';
import { SystemRole } from '../../security/rbac';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentError?: unknown;
  moduleName?: string;
  tenantId?: string;
  userId?: string;
  userRole?: SystemRole;
}

export const ErrorReportModal: React.FC<ErrorReportModalProps> = ({
  isOpen,
  onClose,
  currentError,
  moduleName,
  tenantId,
  userId,
  userRole,
}) => {
  const [description, setDescription] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setDescription('');
    setIncludeScreenshot(false);
    setSubmittedReportId(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let screenshotBase64: string | undefined;

      // Tentativa segura de captura de screenshot com html2canvas se autorizado
      if (includeScreenshot && typeof window !== 'undefined') {
        try {
          const html2canvasModule = await import(/* @vite-ignore */ 'html2canvas').catch(() => null);
          if (html2canvasModule?.default) {
            const canvas = await html2canvasModule.default(document.body, {
              ignoreElements: (el: Element) => {
                return (
                  el.classList?.contains('error-report-modal') ||
                  el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'password' ||
                  el.hasAttribute('data-sensitive')
                );
              },
              scale: 0.75, // reduz tamanho da imagem
            });
            screenshotBase64 = canvas.toDataURL('image/jpeg', 0.6);
          }
        } catch {
          // Graceful fallback: continua sem screenshot se a lib falhar
        }
      }

      const result = await ErrorReportingService.submitReport({
        userDescription: description.trim() || undefined,
        error: currentError,
        moduleName,
        tenantId,
        userId,
        userRole,
        screenshotBase64,
        screenshotConsent: includeScreenshot,
      });

      if (result.success) {
        setSubmittedReportId(result.reportId);
      } else {
        setErrorMessage(result.error || 'Não foi possível enviar o relatório. Tente novamente.');
      }
    } catch {
      setErrorMessage('Ocorreu uma falha ao enviar o relatório. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="error-report-modal fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <h2 id="report-modal-title" className="text-lg font-bold font-montserrat text-white">
              {submittedReportId ? 'Relatório Enviado' : 'Reportar um Problema'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedReportId ? (
            /* Sucesso */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
                ✓
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  Seu relatório foi registrado com sucesso!
                </h3>
                <p className="text-sm text-slate-400">
                  Nossa equipe técnica analisará as informações coletadas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm inline-block">
                <span className="text-slate-400">Identificador: </span>
                <strong className="text-emerald-400 font-bold tracking-wider">{submittedReportId}</strong>
              </div>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Guarde este identificador caso precise informar o suporte da Legis Connect.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors shadow-lg shadow-primary/20"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            /* Formulário */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="problem-desc" className="block text-sm font-medium text-slate-200">
                  O que aconteceu? <span className="text-slate-400 text-xs">(opcional)</span>
                </label>
                <textarea
                  id="problem-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva brevemente o que você estava fazendo quando o problema ocorreu..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Informações Coletadas & LGPD */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>🔒</span> Coleta técnica automática (LGPD Conforme):
                </div>
                <p>
                  Coletamos rota, navegador, versão e logs técnicos necessários para diagnóstico. Senhas, tokens e dados jurídicos sensíveis são automaticamente mascarados.
                </p>
              </div>

              {/* Checkbox Screenshot */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeScreenshot}
                  onChange={(e) => setIncludeScreenshot(e.target.checked)}
                  className="mt-1 rounded bg-slate-950 border-slate-700 text-primary focus:ring-primary focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Autorizo o envio de uma <strong>captura visual da tela</strong> para auxiliar na identificação do erro (campos de senha são automaticamente ocultados).
                </span>
              </label>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin text-xs">⏳</span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Relatório</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
