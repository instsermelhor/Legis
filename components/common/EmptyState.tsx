import React from 'react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  size = 'md',
  className = '',
}) => {
  const padding = size === 'sm' ? 'py-6' : size === 'lg' ? 'py-16' : 'py-10';
  const iconSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-4xl';
  const titleSize = size === 'sm' ? 'text-sm font-semibold' : 'text-base font-bold';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} ${className}`}>
      {typeof icon === 'string' ? (
        <span className={`${iconSize} mb-3`}>{icon}</span>
      ) : (
        <div className="mb-3 text-gray-400">{icon}</div>
      )}
      <h3 className={`${titleSize} text-gray-700 mb-1`}>{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            action.variant === 'secondary'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
