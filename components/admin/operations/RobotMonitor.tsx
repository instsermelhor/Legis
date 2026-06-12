import React, { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type RobotStatus = 'online' | 'degraded' | 'offline';

interface RobotNode {
  id: string;
  name: string;
  system: string;
  status: RobotStatus;
  responseMs: number;
  successRate: number; // %
  lastCheck: string;
  requestsToday: number;
  errorMsg?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ROBOTS: RobotNode[] = [
  { id: 'pje-sp',      name: 'PJe — SP',           system: 'PJe',     status: 'online',   responseMs: 312,  successRate: 99.1, lastCheck: '2 min atrás',  requestsToday: 4820 },
  { id: 'pje-rj',      name: 'PJe — RJ',           system: 'PJe',     status: 'online',   responseMs: 428,  successRate: 98.4, lastCheck: '1 min atrás',  requestsToday: 2910 },
  { id: 'pje-mg',      name: 'PJe — MG',           system: 'PJe',     status: 'degraded', responseMs: 2840, successRate: 84.2, lastCheck: '3 min atrás',  requestsToday: 1640, errorMsg: 'Timeout elevado — verificar proxy' },
  { id: 'esaj-sp',     name: 'e-SAJ — TJSP',       system: 'e-SAJ',   status: 'online',   responseMs: 521,  successRate: 97.8, lastCheck: '2 min atrás',  requestsToday: 3180 },
  { id: 'esaj-ba',     name: 'e-SAJ — TJBA',       system: 'e-SAJ',   status: 'online',   responseMs: 648,  successRate: 96.5, lastCheck: '4 min atrás',  requestsToday: 980 },
  { id: 'projudi',     name: 'Projudi — PR',        system: 'Projudi', status: 'offline',  responseMs: 0,    successRate: 0,    lastCheck: '12 min atrás', requestsToday: 0, errorMsg: 'Tribunal em manutenção — indisponível' },
  { id: 'tjdft',       name: 'TJDFT — DF',          system: 'Legado',  status: 'online',   responseMs: 782,  successRate: 95.1, lastCheck: '1 min atrás',  requestsToday: 620 },
  { id: 'diario-sp',   name: 'Diário Oficial — SP', system: 'Scraper', status: 'online',   responseMs: 410,  successRate: 99.7, lastCheck: 'agora',        requestsToday: 8240 },
  { id: 'diario-fed',  name: 'D.O. Federal',        system: 'Scraper', status: 'online',   responseMs: 395,  successRate: 99.5, lastCheck: 'agora',        requestsToday: 6810 },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: RobotStatus }> = ({ status }) => {
  const cfg = {
    online:   { dot: 'bg-emerald-400 animate-pulse', label: 'Online',   bg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    degraded: { dot: 'bg-amber-400   animate-pulse', label: 'Degraded', bg: 'bg-amber-50   dark:bg-amber-900/30   text-amber-700   dark:text-amber-300'   },
    offline:  { dot: 'bg-rose-500',                  label: 'Offline',  bg: 'bg-rose-50    dark:bg-rose-900/30    text-rose-700    dark:text-rose-300'     },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Response Time Bar ────────────────────────────────────────────────────────
const ResponseBar: React.FC<{ ms: number }> = ({ ms }) => {
  if (ms === 0) return <span className="text-xs text-gray-400">—</span>;
  const color = ms < 500 ? 'bg-emerald-400' : ms < 1500 ? 'bg-amber-400' : 'bg-rose-400';
  const pct = Math.min(100, (ms / 3000) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{ms}ms</span>
    </div>
  );
};

// ─── Robot Monitor ────────────────────────────────────────────────────────────
export const RobotMonitor: React.FC = () => {
  const [robots, setRobots] = useState(MOCK_ROBOTS);
  const [filter, setFilter] = useState<RobotStatus | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate live refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setRobots((prev) =>
        prev.map((r) => ({
          ...r,
          responseMs: r.status === 'offline' ? 0 : Math.max(200, r.responseMs + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 80)),
          requestsToday: r.status !== 'offline' ? r.requestsToday + Math.floor(Math.random() * 5) : 0,
          lastCheck: 'agora',
        }))
      );
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const counts = {
    online:   robots.filter((r) => r.status === 'online').length,
    degraded: robots.filter((r) => r.status === 'degraded').length,
    offline:  robots.filter((r) => r.status === 'offline').length,
  };
  const visible = filter === 'all' ? robots : robots.filter((r) => r.status === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
            Monitor de Robôs & Scrapers
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            {' '}— Atualização automática a cada 10s
          </p>
        </div>
        {/* Summary dots */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {counts.online} Online
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> {counts.degraded} Degradado
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {counts.offline} Offline
          </span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'online', 'degraded', 'offline'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-violet-600 text-white shadow'
                : 'bg-gray-100 dark:bg-[#1A1730] text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
            }`}
          >
            {f === 'all' ? `Todos (${robots.length})` : f === 'online' ? `Online (${counts.online})` : f === 'degraded' ? `Degradado (${counts.degraded})` : `Offline (${counts.offline})`}
          </button>
        ))}
      </div>

      {/* Offline alert */}
      {counts.offline > 0 && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl">
          <span className="text-xl mt-0.5">🚨</span>
          <div>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
              {counts.offline} tribunal(is) indisponível(eis)
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-500 mt-0.5">
              Advogados que monitoram processos nesses tribunais podem estar sem atualizações.
            </p>
          </div>
        </div>
      )}

      {/* Robot Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#2A2545]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#1A1730] text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Robô / Tribunal</th>
              <th className="px-4 py-3 text-left">Sistema</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">Tempo Resp.</th>
              <th className="px-4 py-3 text-right">Taxa Sucesso</th>
              <th className="px-4 py-3 text-right">Req. Hoje</th>
              <th className="px-4 py-3 text-left">Última Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#2A2545]">
            {visible.map((robot) => (
              <React.Fragment key={robot.id}>
                <tr className={`hover:bg-gray-50 dark:hover:bg-[#1A1730]/60 transition-colors ${robot.status === 'offline' ? 'bg-rose-50/50 dark:bg-rose-900/10' : robot.status === 'degraded' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{robot.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#2A2545] text-gray-600 dark:text-gray-400 rounded-md text-xs font-mono">
                      {robot.system}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={robot.status} /></td>
                  <td className="px-4 py-3"><ResponseBar ms={robot.responseMs} /></td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-xs ${robot.successRate >= 95 ? 'text-emerald-600 dark:text-emerald-400' : robot.successRate > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                      {robot.successRate > 0 ? `${robot.successRate}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    {robot.requestsToday > 0 ? robot.requestsToday.toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">{robot.lastCheck}</td>
                </tr>
                {robot.errorMsg && (
                  <tr>
                    <td colSpan={7} className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10">
                      <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <span>⚠️</span> {robot.errorMsg}
                      </p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
