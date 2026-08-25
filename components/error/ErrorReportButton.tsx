/**
 * components/error/ErrorReportButton.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Botão Global de "Reportar Erro" — Legis Connect
 * 
 * Posicionado de forma consistente, acessível via teclado e adaptado para
 * desktop e mobile, disparando o modal de coleta com transparência técnica.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { ErrorReportModal } from './ErrorReportModal';
import { SystemRole } from '../../security/rbac';

interface ErrorReportButtonProps {
  tenantId?: string;
  userId?: string;
  userRole?: SystemRole;
  moduleName?: string;
}

export const ErrorReportButton: React.FC<ErrorReportButtonProps> = ({
  tenantId,
  userId,
  userRole,
  moduleName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Reportar um problema encontrado na plataforma"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg hover:shadow-xl backdrop-blur-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        >
          <span className="text-amber-400 text-sm group-hover:scale-110 transition-transform">
            🛠️
          </span>
          <span className="font-montserrat">Reportar erro</span>
        </button>
      </div>

      <ErrorReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantId={tenantId}
        userId={userId}
        userRole={userRole}
        moduleName={moduleName}
      />
    </>
  );
};
