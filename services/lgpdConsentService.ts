/**
 * services/lgpdConsentService.ts
 * Gestão de Registros de Consentimento LGPD (Art. 8 LGPD - ISS-034)
 */

export interface ConsentRecord {
  id: string;
  type: 'privacy_policy' | 'terms_of_use' | 'cookies' | 'marketing' | 'data_processing';
  version: string;
  accepted: boolean;
  timestamp: string;
  userAgent?: string;
}

const STORAGE_KEY = 'legis_lgpd_consents';

export const LgpdConsentService = {
  getConsents(): ConsentRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  hasAcceptedCookies(): boolean {
    const records = this.getConsents();
    return records.some(r => r.type === 'cookies' && r.accepted);
  },

  saveConsent(type: ConsentRecord['type'], accepted: boolean, version: string = '1.0'): ConsentRecord {
    const records = this.getConsents();
    const newRecord: ConsentRecord = {
      id: `consent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      version,
      accepted,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    const updated = [...records.filter(r => r.type !== type), newRecord];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[LgpdConsentService] Falha ao salvar consentimento:', e);
    }

    return newRecord;
  },

  acceptAllCookies(): void {
    this.saveConsent('cookies', true, '1.0');
    this.saveConsent('data_processing', true, '1.0');
  },
};
