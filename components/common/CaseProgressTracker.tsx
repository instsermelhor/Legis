import React from 'react';
import type { CaseStage } from '../../types';

/**
 * CaseProgressTracker — componente ÚNICO de linha do tempo de processo.
 * Identidade do UI kit: concluído = emerald ✓, atual = violet pulsante,
 * pendente = cinza. Usado por Advogado, Cliente e demais módulos.
 */

interface CaseProgressTrackerProps {
  stages: CaseStage[];
  /** exibe legenda Concluído / Em andamento / Pendente */
  showLegend?: boolean;
}

const Stage: React.FC<{ stage: CaseStage; isLast?: boolean }> = ({ stage, isLast = false }) => (
  <div className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
    <div className="flex flex-col items-center gap-2">
      {stage.status === 'completed' && (
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}
      {stage.status === 'current' && (
        <div className="relative w-9 h-9 shrink-0">
          <div className="absolute inset-0 rounded-full bg-violet-600 animate-ping opacity-30" />
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shadow-sm relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>
      )}
      {(stage.status !== 'completed' && stage.status !== 'current') && (
        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2A2545] border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      )}
      <span
        className={`text-xs text-center font-medium w-16 leading-tight ${
          stage.status === 'completed'
            ? 'text-emerald-600 dark:text-emerald-400'
            : stage.status === 'current'
            ? 'text-violet-600 dark:text-violet-300'
            : 'text-gray-400 dark:text-gray-600'
        }`}
      >
        {stage.name}
      </span>
    </div>
    {!isLast && (
      <div
        className={`flex-auto h-0.5 mt-[18px] mx-1 rounded-full ${
          stage.status === 'completed' ? 'bg-emerald-500/60' : 'bg-gray-200 dark:bg-[#2A2545]'
        }`}
      />
    )}
  </div>
);

export const CaseProgressTracker: React.FC<CaseProgressTrackerProps> = ({ stages, showLegend = false }) => (
  <div>
    <div className="overflow-x-auto pb-1">
      <div className="flex items-start w-full min-w-max sm:min-w-0">
        {stages.map((stage, index) => (
          <Stage key={stage.name} stage={stage} isLast={index === stages.length - 1} />
        ))}
      </div>
    </div>
    {showLegend && (
      <div className="flex items-center gap-4 mt-4 pt-3 flex-wrap border-t border-gray-100 dark:border-[#2A2545]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Concluído</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-600" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Em andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-[#2A2545] border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Pendente</span>
        </div>
      </div>
    )}
  </div>
);
