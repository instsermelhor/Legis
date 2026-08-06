import { useState, useCallback, useMemo } from 'react';

/**
 * usePagination — ISS-028
 *
 * Hook genérico para paginação de listas no Admin.
 *
 * Uso:
 *   const { page, pageCount, paginated, goTo, next, prev, reset } = usePagination(items, 20);
 */
export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);

  // Reset para página 1 quando a lista muda (ex: após filtro)
  // Nota: chamada explícita de reset() quando o filtro mudar
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize],
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goTo = useCallback(
    (p: number) => setPage(Math.min(Math.max(1, p), Math.max(1, Math.ceil(items.length / pageSize)))),
    [items.length, pageSize],
  );

  const next = useCallback(() => goTo(page + 1), [goTo, page]);
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const reset = useCallback(() => setPage(1), []);

  return { page, pageCount, paginated, goTo, next, prev, reset, total: items.length };
}
