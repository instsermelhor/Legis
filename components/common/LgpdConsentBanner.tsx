/**
 * components/common/LgpdConsentBanner.tsx
 * Banner de Consentimento de Cookies e Privacidade (Art. 8 LGPD - ISS-034)
 */

import React, { useState, useEffect } from 'react';
import { LgpdConsentService } from '../../services/lgpdConsentService';

export const LgpdConsentBanner: React.FC<{ onOpenPrivacy?: () => void }> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!LgpdConsentService.hasAcceptedCookies()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    LgpdConsentService.acceptAllCookies();
    setIsVisible(false);
  };

  const handleDeclineOptional = () => {
    LgpdConsentService.saveConsent('cookies', false, '1.0');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl text-white space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl shrink-0">
            🛡️
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-sm text-white mb-1">
              Privacidade & Privacidade de Dados (LGPD)
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Utilizamos cookies essenciais para garantir o funcionamento seguro da plataforma e personalizar sua experiência em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="text-xs text-primary hover:underline font-medium"
            >
              Política de Privacidade
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDeclineOptional}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-gray-300 font-medium transition-all"
            >
              Essenciais apenas
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-xs text-white font-semibold shadow-md transition-all"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
