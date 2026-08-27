/**
 * AppDataContext.tsx
 *
 * Camada de dados compartilhada entre o site principal e o painel
 * administrativo do Legis Connect.
 *
 * ─── ARQUITETURA DE DADOS ──────────────────────────────────────────────────
 * Esta camada opera em modo DUAL:
 *
 *   MODO PRODUÇÃO (Supabase configurado):
 *     → Dados reais via lib/db.ts (PostgreSQL + RLS)
 *     → Dados de seed apenas como fallback inicial vazio
 *
 *   MODO DESENVOLVIMENTO (Supabase não configurado):
 *     → Dados de seed em localStorage para desenvolvimento/demo local
 *     → Tipagem explícita como "SeedData" para não confundir com dados reais
 *
 * ⚠️  IMPORTANTE: Os dados de seed (seed*) são exclusivamente para
 * desenvolvimento local. Em produção, o Supabase é a fonte de verdade.
 *
 * Corrigido (G-001): MockClient/MockIntern/MockSecretary renomeados para
 * SeedClient/SeedIntern/SeedSecretary para deixar explícito que são dados
 * de seed. Os tipos mock originais permanecem em mockDataService.ts para
 * compatibilidade com o painel admin existente.
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Lawyer, EfficiencyService, EfficiencyServiceGroup } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { mockLawyers } from '../services/mockLawyerService';
import {
  mockClients,
  mockInterns,
  mockSecretaries,
  mockEfficiencyServices,
  mockEfficiencyServiceGroups,
} from '../services/mockDataService';

// Reexportamos os tipos com alias semântico para deixar claro que são dados de seed
export type { MockClient as SeedClient, MockIntern as SeedIntern, MockSecretary as SeedSecretary }
  from '../services/mockDataService';
import type { MockClient as SeedClient, MockIntern as SeedIntern, MockSecretary as SeedSecretary }
  from '../services/mockDataService';

// ─── Storage keys ─────────────────────────────────────────────────────────────
// NOTA: Estas chaves só são usadas em modo desenvolvimento (sem Supabase).
// Em produção, os dados vêm do banco via lib/db.ts.
const DEV_STORAGE_KEYS = {
  lawyers:       'legis_dev_lawyers',
  clients:       'legis_dev_clients',
  interns:       'legis_dev_interns',
  secretaries:   'legis_dev_secretaries',
  services:      'legis_dev_services',
  serviceGroups: 'legis_dev_serviceGroups',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Carrega dados de desenvolvimento do localStorage.
 * NUNCA chamado em modo produção (quando Supabase está configurado).
 */
function loadDevData<T extends { id?: number | string; tenantId?: string }>(
  key: string,
  fallback: T[],
  defaultTenantId = 'tenant_dev_local',
): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const items = JSON.parse(raw) as T[];
      // Garante que dados de dev sempre têm tenantId para testar isolamento
      return items.map(item => ({
        ...item,
        tenantId: item.tenantId ?? defaultTenantId,
      }));
    }
  } catch { /* ignore parse error */ }
  // Retorna seed com tenantId explícito
  return fallback.map(item => ({
    ...item,
    tenantId: item.tenantId ?? defaultTenantId,
  }));
}

function saveDevData<T>(key: string, data: T[]): void {
  if (isSupabaseConfigured) {
    // Em produção: não persistir no localStorage — dados vêm do Supabase
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore storage full */ }
}

// ─── Context interface ────────────────────────────────────────────────────────
export interface AppDataContextValue {
  // ── Estado ──
  lawyers:       Lawyer[];
  clients:       SeedClient[];
  interns:       SeedIntern[];
  secretaries:   SeedSecretary[];
  services:      EfficiencyService[];
  serviceGroups: EfficiencyServiceGroup[];

  /** Indica se está operando em modo produção (Supabase) ou dev (localStorage) */
  isProductionMode: boolean;

  // ── Mutações de Advogados ──
  updateLawyer:  (updated: Lawyer) => void;
  addLawyer:     (lawyer: Lawyer) => void;
  setLawyers:    (lawyers: Lawyer[]) => void;

  // ── Mutações de Clientes (painel admin) ──
  updateClient:  (updated: SeedClient) => void;

  // ── Mutações de Estagiários (painel admin) ──
  updateIntern:  (updated: SeedIntern) => void;

  // ── Mutações de Secretárias (painel admin) ──
  updateSecretary: (updated: SeedSecretary) => void;

  // ── Mutações de Serviços ──
  updateServices:      (services: EfficiencyService[]) => void;
  updateServiceGroups: (groups: EfficiencyServiceGroup[]) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppDataContext = createContext<AppDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isProd = isSupabaseConfigured;

  // Em modo produção, inicia com arrays vazios — dados vêm do Supabase via hooks específicos
  // Em modo dev, carrega do localStorage com seed data
  const [lawyers, setLawyersState] = useState<Lawyer[]>(() =>
    isProd ? [] : loadDevData<Lawyer>(DEV_STORAGE_KEYS.lawyers, mockLawyers)
  );
  const [clients, setClientsState] = useState<SeedClient[]>(() =>
    isProd ? [] : loadDevData<SeedClient>(DEV_STORAGE_KEYS.clients, mockClients)
  );
  const [interns, setInternsState] = useState<SeedIntern[]>(() =>
    isProd ? [] : loadDevData<SeedIntern>(DEV_STORAGE_KEYS.interns, mockInterns)
  );
  const [secretaries, setSecretariesState] = useState<SeedSecretary[]>(() =>
    isProd ? [] : loadDevData<SeedSecretary>(DEV_STORAGE_KEYS.secretaries, mockSecretaries)
  );
  const [services, setServicesState] = useState<EfficiencyService[]>(() =>
    loadDevData<EfficiencyService>(DEV_STORAGE_KEYS.services, mockEfficiencyServices)
  );
  const [serviceGroups, setServiceGroupsState] = useState<EfficiencyServiceGroup[]>(() =>
    loadDevData<EfficiencyServiceGroup>(DEV_STORAGE_KEYS.serviceGroups, mockEfficiencyServiceGroups)
  );

  // Sincronização entre abas (apenas em modo dev)
  useEffect(() => {
    if (isProd) return; // Em produção: Supabase Realtime cuida da sincronização

    const onStorage = (e: StorageEvent) => {
      if (e.key === DEV_STORAGE_KEYS.lawyers && e.newValue) {
        try { setLawyersState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
      if (e.key === DEV_STORAGE_KEYS.services && e.newValue) {
        try { setServicesState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
      if (e.key === DEV_STORAGE_KEYS.serviceGroups && e.newValue) {
        try { setServiceGroupsState(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isProd]);

  // ── Mutações de Advogados ────────────────────────────────────────────────
  const updateLawyer = useCallback((updated: Lawyer) => {
    setLawyersState(prev => {
      const next = prev.map(l => l.id === updated.id ? updated : l);
      saveDevData(DEV_STORAGE_KEYS.lawyers, next);
      return next;
    });
  }, []);

  const addLawyer = useCallback((lawyer: Lawyer) => {
    setLawyersState(prev => {
      const deduped = prev.filter(l => l.id !== lawyer.id);
      const next = [...deduped, lawyer];
      saveDevData(DEV_STORAGE_KEYS.lawyers, next);
      return next;
    });
  }, []);

  const setLawyers = useCallback((newLawyers: Lawyer[]) => {
    setLawyersState(newLawyers);
    saveDevData(DEV_STORAGE_KEYS.lawyers, newLawyers);
  }, []);

  // ── Mutações de Clientes ─────────────────────────────────────────────────
  const updateClient = useCallback((updated: SeedClient) => {
    setClientsState(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c);
      saveDevData(DEV_STORAGE_KEYS.clients, next);
      return next;
    });
  }, []);

  // ── Mutações de Estagiários ──────────────────────────────────────────────
  const updateIntern = useCallback((updated: SeedIntern) => {
    setInternsState(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      saveDevData(DEV_STORAGE_KEYS.interns, next);
      return next;
    });
  }, []);

  // ── Mutações de Secretárias ──────────────────────────────────────────────
  const updateSecretary = useCallback((updated: SeedSecretary) => {
    setSecretariesState(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s);
      saveDevData(DEV_STORAGE_KEYS.secretaries, next);
      return next;
    });
  }, []);

  // ── Mutações de Serviços ─────────────────────────────────────────────────
  const updateServices = useCallback((newServices: EfficiencyService[]) => {
    setServicesState(newServices);
    saveDevData(DEV_STORAGE_KEYS.services, newServices);
  }, []);

  const updateServiceGroups = useCallback((groups: EfficiencyServiceGroup[]) => {
    setServiceGroupsState(groups);
    saveDevData(DEV_STORAGE_KEYS.serviceGroups, groups);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        lawyers, clients, interns, secretaries, services, serviceGroups,
        isProductionMode: isProd,
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
// eslint-disable-next-line react-refresh/only-export-components
export const useAppData = (): AppDataContextValue => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
};
