import React from 'react';
// FIX: Corrected import path for local module.
import type { CaseStage } from '../../types';
import { BadgeCheckIcon } from './IconComponents';

interface CaseProgressTrackerProps {
  stages: CaseStage[];
}

const Stage: React.FC<{ stage: CaseStage; isLast?: boolean }> = ({ stage, isLast = false }) => {
  const getStatusStyles = () => {
    switch (stage.status) {
      case 'completed':
        return {
          circle: 'bg-primary border-primary',
          icon: <BadgeCheckIcon className="w-5 h-5 text-white" />,
          line: 'bg-primary',
          text: 'text-primary font-semibold',
        };
      case 'current':
        return {
          circle: 'bg-white border-primary border-2 ring-4 ring-primary/20',
          icon: <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>,
          line: 'bg-gray-200',
          text: 'text-primary font-bold',
        };
      case 'upcoming':
      default:
        return {
          circle: 'bg-white border-gray-300 border-2',
          icon: null,
          line: 'bg-gray-200',
          text: 'text-gray-500',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="flex-1 flex items-start">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.circle} transition-all duration-300`}>
          {styles.icon}
        </div>
        <p className={`mt-2 text-xs sm:text-sm text-center ${styles.text}`}>{stage.name}</p>
      </div>
      {!isLast && <div className={`flex-auto h-0.5 mt-4 ${styles.line}`}></div>}
    </div>
  );
};

export const CaseProgressTracker: React.FC<CaseProgressTrackerProps> = ({ stages }) => {
  return (
    <div className="flex items-start w-full">
      {stages.map((stage, index) => (
        <Stage key={stage.name} stage={stage} isLast={index === stages.length - 1} />
      ))}
    </div>
  );
};
