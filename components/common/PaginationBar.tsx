import React from 'react';

interface PaginationBarProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onGoTo: (p: number) => void;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}

/**
 * PaginationBar — ISS-028
 * Barra de paginação reutilizável para todas as listas do Admin.
 */
export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageCount,
  total,
  pageSize,
  onGoTo,
  onNext,
  onPrev,
  className = '',
}) => {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  // Gera array de páginas com ellipsis
  const pages: (number | '…')[] = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) pages.push(i);
    if (page < pageCount - 2) pages.push('…');
    pages.push(pageCount);
  }

  return (
    <div className={`flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      {/* Contagem */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-700 dark:text-gray-200">{start}–{end}</span> de{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> registros
      </p>

      {/* Botões */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page === 1}
          aria-label="Página anterior"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onGoTo(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={page === pageCount}
          aria-label="Próxima página"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
};
