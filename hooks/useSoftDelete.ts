import { useState, useCallback } from 'react';
import { softDelete, softRestore, filterActive, SoftDeletable } from '../utils/softDelete';

/**
 * useSoftDelete — ISS-049
 *
 * Hook React para gerenciar exclusão lógica em listas de itens.
 *
 * Uso:
 *   const { items, remove, restore } = useSoftDelete(initialList);
 */
export function useSoftDelete<T extends SoftDeletable & { id: string | number }>(
  initialList: T[],
) {
  const [list, setList] = useState<T[]>(initialList);

  /** Remove logicamente um item pelo id */
  const remove = useCallback((id: T['id'], actorId: string) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === id ? softDelete(item, actorId) : item,
      ),
    );
  }, []);

  /** Restaura um item previamente excluído pelo id */
  const restore = useCallback((id: T['id']) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === id ? softRestore(item) : item,
      ),
    );
  }, []);

  /** Lista filtrada sem itens excluídos */
  const activeItems = filterActive(list);

  return { items: list, activeItems, remove, restore };
}
