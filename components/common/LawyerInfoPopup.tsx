import React, { useState } from 'react';
import type { Lawyer } from '../../types';

interface LawyerInfoPopupProps {
  lawyer: Lawyer;
  message: string;
  onClose: () => void;
  /** If provided, shows "Aceitar" and "Recusar" action buttons */
  onAccept?: () => void;
  onReject?: () => void;
}

export const LawyerInfoPopup: React.FC<LawyerInfoPopupProps> = ({ lawyer, message, onClose, onAccept, onReject }) => {
  const [confirmed, setConfirmed] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = () => {
    setConfirmed('accept');
    if (onAccept) onAccept();
    setTimeout(() => { onClose(); }, 1200);
  };

  const handleReject = () => {
    setConfirmed('reject');
    if (onReject) onReject();
    setTimeout(() => { onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top gradient banner */}
        <div className="bg-gradient-to-r from-primary to-primary/70 p-6 text-white text-center">
          <p className="text-3xl mb-2">🎉</p>
          <h2 className="text-lg font-bold leading-snug">{message}</h2>
          <p className="text-xs text-white/80 mt-1">Veja abaixo as informações do profissional responsável</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Lawyer Photo + Name */}
          <div className="flex items-center gap-4">
            <img src={lawyer.photoUrl} alt={lawyer.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30" />
            <div>
              <p className="font-bold text-gray-900 text-base">{lawyer.name}</p>
              <p className="text-xs text-primary font-semibold">OAB {lawyer.oab}{lawyer.oabUF ? `/${lawyer.oabUF}` : ''}</p>
              {lawyer.status === 'verificado' && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold mt-0.5">
                  ✓ Verificado
                </span>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <InfoRow icon="📍" label="Localização" value={`${lawyer.location.city} / ${lawyer.location.state}`} />
            <InfoRow icon="📞" label="Telefone" value={lawyer.contact.phone} />
            <InfoRow icon="📧" label="E-mail" value={lawyer.contact.email} />
            {lawyer.commercialAddress && (
              <InfoRow icon="🏛️" label="Escritório" value={lawyer.commercialAddress} />
            )}
            {lawyer.specialties.length > 0 && (
              <div className="flex gap-2 items-start">
                <span className="text-base shrink-0">⚖️</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Especialidades</p>
                  <p className="text-gray-700 text-xs">{lawyer.specialties.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center bg-blue-50 rounded-lg p-3 border border-blue-100">
            💡 Entre em contato pelo telefone ou e-mail para combinar os detalhes da colaboração.
          </p>

          {/* Confirmation feedback */}
          {confirmed === 'accept' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-green-700">✅ Proposta aceita! O advogado será notificado.</p>
            </div>
          )}
          {confirmed === 'reject' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-bold text-red-700">❌ Proposta recusada. O advogado será notificado.</p>
            </div>
          )}

          {/* Action buttons */}
          {onAccept && onReject && !confirmed ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReject}
                className="py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
              >
                ✕ Recusar
              </button>
              <button
                onClick={handleAccept}
                className="py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                ✓ Aceitar
              </button>
            </div>
          ) : (
            !confirmed && (
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
              >
                Entendido — Fechar
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-base shrink-0">{icon}</span>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="text-gray-700">{value}</p>
    </div>
  </div>
);
