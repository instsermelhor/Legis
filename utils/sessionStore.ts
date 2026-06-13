// ─────────────────────────────────────────────────────────────────────────────
// utils/sessionStore.ts
// Anonymous session state — persists data across navigation without auth
// Equivalent to Zustand sessionStorage store described in the prompt
// ─────────────────────────────────────────────────────────────────────────────

export interface CaseIntent {
  description: string;
  city: string;
  timestamp: number;
}

export interface ServiceIntent {
  serviceId: string;
  title: string;
  price: number;
  category: string;
  timestamp: number;
}

export interface SearchIntent {
  query: string;
  unlocked: boolean;
  timestamp: number;
}

const KEYS = {
  CASE: 'legis_case_intent',
  SERVICE: 'legis_service_intent',
  SEARCH: 'legis_search_intent',
  LEADS: 'legis_public_leads',
} as const;

// ─── Case Intent ──────────────────────────────────────────────────────────────
export const CaseStore = {
  set(data: Omit<CaseIntent, 'timestamp'>): void {
    const payload: CaseIntent = { ...data, timestamp: Date.now() };
    sessionStorage.setItem(KEYS.CASE, JSON.stringify(payload));
  },

  get(): CaseIntent | null {
    try {
      const raw = sessionStorage.getItem(KEYS.CASE);
      if (!raw) return null;
      const parsed: CaseIntent = JSON.parse(raw);
      // Expire after 60 minutes
      if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
        CaseStore.clear();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clear(): void {
    sessionStorage.removeItem(KEYS.CASE);
  },
};

// ─── Service Intent ───────────────────────────────────────────────────────────
export const ServiceStore = {
  set(data: Omit<ServiceIntent, 'timestamp'>): void {
    const payload: ServiceIntent = { ...data, timestamp: Date.now() };
    sessionStorage.setItem(KEYS.SERVICE, JSON.stringify(payload));
  },

  get(): ServiceIntent | null {
    try {
      const raw = sessionStorage.getItem(KEYS.SERVICE);
      if (!raw) return null;
      const parsed: ServiceIntent = JSON.parse(raw);
      // Expire after 30 minutes
      if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
        ServiceStore.clear();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clear(): void {
    sessionStorage.removeItem(KEYS.SERVICE);
  },
};

// ─── Search Unlock Intent ─────────────────────────────────────────────────────
export const SearchStore = {
  set(data: Omit<SearchIntent, 'timestamp'>): void {
    const payload: SearchIntent = { ...data, timestamp: Date.now() };
    sessionStorage.setItem(KEYS.SEARCH, JSON.stringify(payload));
  },

  get(): SearchIntent | null {
    try {
      const raw = sessionStorage.getItem(KEYS.SEARCH);
      if (!raw) return null;
      const parsed: SearchIntent = JSON.parse(raw);
      // Expire after 24 hours
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        SearchStore.clear();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  isUnlocked(): boolean {
    return SearchStore.get()?.unlocked === true;
  },

  unlock(query = ''): void {
    SearchStore.set({ query, unlocked: true });
  },

  clear(): void {
    sessionStorage.removeItem(KEYS.SEARCH);
  },
};

// ─── Lead capture (localStorage, persists across sessions) ───────────────────
export interface PublicLead {
  name: string;
  email: string;
  phone?: string;
  source: 'gated_search' | 'service_intent' | 'newsletter';
  timestamp: number;
}

export const LeadStore = {
  add(lead: Omit<PublicLead, 'timestamp'>): void {
    const leads = LeadStore.getAll();
    leads.push({ ...lead, timestamp: Date.now() });
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  getAll(): PublicLead[] {
    try {
      const raw = localStorage.getItem(KEYS.LEADS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
