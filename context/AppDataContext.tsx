/**
 * AppDataContext.tsx
 *
 * Camada de dados compartilhada entre o site principal e o painel
 * administrativo do Legis Connect.
 *
 * Centraliza o estado de:
 *  - Advogados (Lawyer[])
 *  - Clientes (MockClient[])
 *  - Estagiários (MockIntern[])
 *  - Secretárias (MockSecretary[])
 *  - Serviços de eficiência (EfficiencyService[], EfficiencyServiceGroup[])
 *
 * Persiste mudanças no localStorage para que alterações feitas pelo admin
 * reflitam nas páginas públicas (busca de advogados, etc.).
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Lawyer, EfficiencyService, EfficiencyServiceGroup } from '../types';
import { mockLawyers } from '../services/mockLawyerService';
import {
  mockClients,
  mockInterns,
  mockSecretaries,
  mockEfficiencyServices,
  mockEfficiencyServiceGroups,
} from '../services/mockDataService';
import type { MockClient, MockIntern, MockSecretary } from '../services/mockDataService';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEYS = {
  lawyers:       'legis_lawyers',
  clients:       'legis_clients',
  interns:       'legis_interns',
  secretaries:   'legis_secretaries',
  services:      'legis_services',
  serviceGroups: 'legis_serviceGroups',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── Context interface ────────────────────────────────────────────────────────
export interface AppDataContextValue {
  // ── Estado ──
  lawyers:       Lawyer[];
  clients:       MockClient[];
  interns:       MockIntern[];
  secretaries:   MockSecretary[];
  services:      EfficiencyService[];
  serviceGroups: EfficiencyServiceGroup[];

  // ── Mutações de Advogados ──
  updateLawyer:  (updated: Lawyer) => void;
  addLawyer:     (lawyer: Lawyer) => void;
  setLawyers:    (lawyers: Lawyer[]) => void;

  // ── Mutações de Clientes ──
  updateClient:  (updated: MockClient) => void;

  // ── Mutações de Estagiários ──
  updateIntern:  (updated: MockIntern) => void;

  // ── Mutações de Secretárias ──
  updateSecretary: (updated: MockSecretary) => void;

  // ── Mutações de Serviços ──
  updateServices:      (services: EfficiencyService[]) => void;
  updateServiceGroups: (groups: EfficiencyServiceGroup[]) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppDataContext = createContext<AppDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lawyers, setLawyersState] = useState<Lawyer[]>(() =>
    loadFromStorage<Lawyer>(KEYS.lawyers, mockLawyers)
  );
  const [clients, setClientsState] = useState<MockClient[]>(() =>
    loadFromStorage<MockClient>(KEYS.clients, mockClients)
  );
  const [interns, setInternsState] = useState<MockIntern[]>(() =>
    loadFromStorage<MockIntern>(KEYS.interns, mockInterns)
  );
  const [secretaries, setSecretariesState] = useState<MockSecretary[]>(() =>
    loadFromStorage<MockSecretary>(KEYS.secretaries, mockSecretaries)
  );
  const [services, setServicesState] = useState<EfficiencyService[]>(() =>
    loadFromStorage<EfficiencyService>(KEYS.services, mockEfficiencyServices)
  );
  const [serviceGroups, setServiceGroupsState] = useState<EfficiencyServiceGroup[]>(() =>
    loadFromStorage<EfficiencyServiceGroup>(KEYS.serviceGroups, mockEfficiencyServiceGroups)
  );

  // Sincronizar quando outra aba/janela mudar o localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEYS.lawyers && e.newValue) {
        try { setLawyersState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
      if (e.key === KEYS.services && e.newValue) {
        try { setServicesState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
      if (e.key === KEYS.serviceGroups && e.newValue) {
        try { setServiceGroupsState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Mutações de Advogados ────────────────────────────────────────────────
  const updateLawyer = useCallback((updated: Lawyer) => {
    setLawyersState(prev => {
      const next = prev.map(l => l.id === updated.id ? updated : l);
      saveToStorage(KEYS.lawyers, next);
      return next;
    });
  }, []);

  const addLawyer = useCallback((lawyer: Lawyer) => {
    setLawyersState(prev => {
      const deduped = prev.filter(l => l.id !== lawyer.id);
      const next = [...deduped, lawyer];
      saveToStorage(KEYS.lawyers, next);
      return next;
    });
  }, []);

  const setLawyers = useCallback((newLawyers: Lawyer[]) => {
    setLawyersState(newLawyers);
    saveToStorage(KEYS.lawyers, newLawyers);
  }, []);

  // ── Mutações de Clientes ─────────────────────────────────────────────────
  const updateClient = useCallback((updated: MockClient) => {
    setClientsState(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c);
      saveToStorage(KEYS.clients, next);
      return next;
    });
  }, []);

  // ── Mutações de Estagiários ──────────────────────────────────────────────
  const updateIntern = useCallback((updated: MockIntern) => {
    setInternsState(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      saveToStorage(KEYS.interns, next);
      return next;
    });
  }, []);

  // ── Mutações de Secretárias ──────────────────────────────────────────────
  const updateSecretary = useCallback((updated: MockSecretary) => {
    setSecretariesState(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      saveToStorage(KEYS.secretaries, next);
      return next;
    });
  }, []);

  // ── Mutações de Serviços ─────────────────────────────────────────────────
  const updateServices = useCallback((newServices: EfficiencyService[]) => {
    setServicesState(newServices);
    saveToStorage(KEYS.services, newServices);
  }, []);

  const updateServiceGroups = useCallback((groups: EfficiencyServiceGroup[]) => {
    setServiceGroupsState(groups);
    saveToStorage(KEYS.serviceGroups, groups);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        lawyers, clients, interns, secretaries, services, serviceGroups,
        updateLawyer, addLawyer, setLawyers,
        updateClient,
        updateIntern,
        updateSecretary,
        updateServices, updateServiceGroups,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAppData = (): AppDataContextValue => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
};
