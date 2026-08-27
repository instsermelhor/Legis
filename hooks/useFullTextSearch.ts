/**
 * hooks/useFullTextSearch.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook React para busca textual avançada (Full-Text Search) multi-tenant (C-1).
 * Conecta com `dbSearch` em `lib/db.ts`, integrando debounce automático,
 * estados de loading, filtragem por facetas e tratamento de erros.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { dbSearch, type SearchResultItem } from '../lib/db';
import { useDebounce } from './useDebounce';

export interface UseFullTextSearchOptions {
  activeTenantId?: string;
  limit?: number;
  delayMs?: number;
  initialTypeFilter?: SearchResultItem['type'] | 'all';
}

export function useFullTextSearch(options: UseFullTextSearchOptions = {}) {
  const { activeTenantId, limit = 20, delayMs = 300, initialTypeFilter = 'all' } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SearchResultItem['type'] | 'all'>(initialTypeFilter);

  const debouncedQuery = useDebounce(query, delayMs);

  const executeSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.trim().length === 0) {
        setResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const rawResults = await dbSearch.search(searchTerm, activeTenantId, limit);
        setResults(rawResults);
      } catch (err: any) {
        setError(err.message || 'Erro ao realizar busca textual');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTenantId, limit]
  );

  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  const filteredResults = typeFilter === 'all'
    ? results
    : results.filter((r) => r.type === typeFilter);

  return {
    query,
    setQuery,
    results: filteredResults,
    rawResults: results,
    isLoading,
    error,
    typeFilter,
    setTypeFilter,
    totalCount: filteredResults.length,
    refetch: () => executeSearch(query),
  };
}
