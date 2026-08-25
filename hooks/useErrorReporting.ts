/**
 * hooks/useErrorReporting.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook React para acionamento do fluxo de reporte de erro, controle de modal
 * e captura assíncrona.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from 'react';
import { ErrorReportingService, SubmitReportInput } from '../services/errorReportingService';
import { SystemRole } from '../security/rbac';

export function useErrorReporting() {
  const [isReporting, setIsReporting] = useState(false);
  const [lastReportId, setLastReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentError, setCurrentError] = useState<unknown>(null);

  const openReportModal = useCallback((error?: unknown) => {
    setCurrentError(error || null);
    setIsModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentError(null);
  }, []);

  const submitReport = useCallback(async (input: SubmitReportInput) => {
    setIsReporting(true);
    try {
      const res = await ErrorReportingService.submitReport({
        ...input,
        error: input.error || currentError,
      });

      if (res.success) {
        setLastReportId(res.reportId);
      }
      return res;
    } finally {
      setIsReporting(false);
    }
  }, [currentError]);

  return {
    isReporting,
    lastReportId,
    isModalOpen,
    openReportModal,
    closeReportModal,
    submitReport,
  };
}
