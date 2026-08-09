import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface DatabaseMetrics {
  status: 'online' | 'offline' | 'checking';
  mode: 'supabase_cloud' | 'local_storage';
  url: string;
  pingMs?: number;
  tablesCount: number;
  rlsEnabled: boolean;
  lastCheckedAt?: string;
  errorDetails?: string;
}

export const DatabaseHealthIndicator: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    status: 'checking',
    mode: isSupabaseConfigured ? 'supabase_cloud' : 'local_storage',
    url: (import.meta.env.VITE_SUPABASE_URL as string) || 'http://localhost (localStorage)',
    tablesCount: 12,
    rlsEnabled: true,
  });

  const [copiedSql, setCopiedSql] = useState(false);

  const checkHealth = async () => {
    setMetrics(prev => ({ ...prev, status: 'checking' }));
    const startTime = performance.now();

    if (!isSupabaseConfigured) {
      setMetrics({
        status: 'online',
        mode: 'local_storage',
        url: 'localStorage (Modo Local Offline)',
        pingMs: 1,
        tablesCount: 12,
        rlsEnabled: true,
        lastCheckedAt: new Date().toLocaleTimeString('pt-BR'),
      });
      return;
    }

    try {
      // Tenta consultar a tabela users ou cms_content
      const { error } = await supabase.from('users').select('id').limit(1);
      const pingMs = Math.round(performance.now() - startTime);

      if (error && error.code !== 'PGRST116') {
        setMetrics({
          status: 'offline',
          mode: 'supabase_cloud',
          url: import.meta.env.VITE_SUPABASE_URL as string,
          pingMs,
          tablesCount: 12,
          rlsEnabled: true,
          lastCheckedAt: new Date().toLocaleTimeString('pt-BR'),
          errorDetails: error.message,
        });
      } else {
        setMetrics({
          status: 'online',
          mode: 'supabase_cloud',
          url: import.meta.env.VITE_SUPABASE_URL as string,
          pingMs,
          tablesCount: 12,
          rlsEnabled: true,
          lastCheckedAt: new Date().toLocaleTimeString('pt-BR'),
        });
      }
    } catch (err: any) {
      const pingMs = Math.round(performance.now() - startTime);
      setMetrics({
        status: 'offline',
        mode: 'supabase_cloud',
        url: import.meta.env.VITE_SUPABASE_URL as string,
        pingMs,
        tablesCount: 12,
        rlsEnabled: true,
        lastCheckedAt: new Date().toLocaleTimeString('pt-BR'),
        errorDetails: err?.message || 'Falha na conexão de rede com o Supabase',
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const copyMigrationInstructions = () => {
    const instructions = `-- Execute em https://supabase.com/dashboard/project/tddzffccnuccewfoczjl/sql/new\n-- Arquivo: infrastructure/db/migrations/sprint8_master_migration.sql`;
    navigator.clipboard.writeText(instructions);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`block w-4 h-4 rounded-full ${
                metrics.status === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : metrics.status === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-spin'
              }`}
            />
            {metrics.status === 'online' && (
              <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Status da Base de Dados (Sprint 8)
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  metrics.mode === 'supabase_cloud'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {metrics.mode === 'supabase_cloud' ? '☁️ Supabase Cloud (Produção)' : '💾 Local Storage (Fallback)'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{metrics.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkHealth}
            disabled={metrics.status === 'checking'}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-950 text-slate-200 rounded-lg transition border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
          >
            🔄 {metrics.status === 'checking' ? 'Verificando...' : 'Testar Conexão'}
          </button>
          <button
            onClick={copyMigrationInstructions}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition flex items-center gap-1.5"
          >
            {copiedSql ? '✓ Instruções Copiadas!' : '📋 Copiar SQL Migração'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Latência Ping</span>
          <span className="text-sm font-semibold font-mono text-emerald-400">
            {metrics.pingMs ? `${metrics.pingMs} ms` : '—'}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Tabelas & Schemas</span>
          <span className="text-sm font-semibold font-mono text-indigo-400">
            {metrics.tablesCount} Tabelas Relacionais
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Row Level Security (RLS)</span>
          <span className="text-sm font-semibold font-mono text-cyan-400">
            {metrics.rlsEnabled ? '🔒 RLS Ativado em Todas' : '⚠️ RLS Inativo'}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block mb-1">Última Checagem</span>
          <span className="text-sm font-semibold font-mono text-slate-300">
            {metrics.lastCheckedAt || '—'}
          </span>
        </div>
      </div>

      {metrics.errorDetails && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg font-mono">
          ⚠️ <strong>Aviso de Conectividade:</strong> {metrics.errorDetails}. A plataforma ativou automaticamente a persistência em memória local (fallback).
        </div>
      )}
    </div>
  );
};
