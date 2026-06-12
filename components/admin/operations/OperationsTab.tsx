import React, { useState } from 'react';
import { RobotMonitor } from './RobotMonitor';
import { AiTelemetry }  from './AiTelemetry';
import { JobQueue }     from './JobQueue';

// ─── Sub-tab type ─────────────────────────────────────────────────────────────
type OpsTab = 'robots' | 'ai' | 'queue';

const OPS_TABS: { id: OpsTab; label: string; icon: string; badge?: string }[] = [
  { id: 'robots', label: 'Monitor de Robôs',   icon: '🤖' },
  { id: 'ai',     label: 'Telemetria de IA',   icon: '🧠' },
  { id: 'queue',  label: 'Fila de Jobs',        icon: '⚙️', badge: 'novo' },
];

// ─── Operations Tab ───────────────────────────────────────────────────────────
export const OperationsTab: React.FC = () => {
  const [tab, setTab] = useState<OpsTab>('robots');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Controle de Serviços de Eficiência
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Monitor de robôs, telemetria de IA e fila de processamento em tempo real.
        </p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-[#2A2545] pb-0">
        {OPS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
              tab === t.id
                ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:bg-gray-50 dark:hover:bg-[#1A1730]'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-violet-600 text-white rounded-full uppercase">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {tab === 'robots' && <RobotMonitor />}
        {tab === 'ai'     && <AiTelemetry />}
        {tab === 'queue'  && <JobQueue />}
      </div>
    </div>
  );
};
