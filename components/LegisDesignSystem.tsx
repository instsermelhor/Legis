import React from 'react';

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50"
      aria-label={label}
    >
      {isLoading ? 'Processando...' : label}
    </button>
  );
};
