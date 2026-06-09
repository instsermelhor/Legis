/* eslint-disable react-refresh/only-export-components */
/**
 * AppContext.tsx
 * Contexto global para nome do app, logo e configurações.
 * Persiste automaticamente via dbService (localStorage).
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { dbConfig } from '../services/dbService';
import type { AppConfig } from '../services/dbService';

interface AppContextValue {
  config: AppConfig;
  updateConfig: (changes: Partial<AppConfig>) => void;
  setLogoFromFile: (file: File, target: 'headerLogoUrl' | 'footerLogoUrl' | 'logoUrl') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => dbConfig.get());

  const updateConfig = useCallback((changes: Partial<AppConfig>) => {
    const updated = dbConfig.set(changes);
    setConfig(updated);
  }, []);

  const setLogoFromFile = useCallback((file: File, target: 'headerLogoUrl' | 'footerLogoUrl' | 'logoUrl') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateConfig({ [target]: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [updateConfig]);

  return (
    <AppContext.Provider value={{ config, updateConfig, setLogoFromFile }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppConfig = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppConfig must be used inside AppProvider');
  return ctx;
};
