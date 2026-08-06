/**
 * softDelete.ts — ISS-037 / ISS-049
 *
 * Utilitário e hook para exclusão lógica (soft delete).
 * Em vez de remover registros do banco, marca-os com:
 *   - deletedAt: timestamp ISO
 *   - deletedBy: ID do usuário que executou a ação
 *
 * Nunca substitui exclusão física onde exigida por lei (ex: LGPD Art. 16 III).
 */

export interface SoftDeletable {
  deletedAt?: string | null;
  deletedBy?: string | null;
}

/**
 * Marca um objeto como excluído logicamente.
 * @param record   O objeto a marcar
 * @param actorId  ID do utilizador que fez a exclusão
 */
export function softDelete<T extends SoftDeletable>(record: T, actorId: string): T {
  return {
    ...record,
    deletedAt: new Date().toISOString(),
    deletedBy: actorId,
  };
}

/**
 * Restaura um objeto previamente marcado como excluído.
 */
export function softRestore<T extends SoftDeletable>(record: T): T {
  return {
    ...record,
    deletedAt: null,
    deletedBy: null,
  };
}

/**
 * Filtra uma lista para retornar apenas registros não excluídos.
 */
export function filterActive<T extends SoftDeletable>(list: T[]): T[] {
  return list.filter((item) => !item.deletedAt);
}

/**
 * Filtra uma lista para retornar apenas registros excluídos.
 */
export function filterDeleted<T extends SoftDeletable>(list: T[]): T[] {
  return list.filter((item) => !!item.deletedAt);
}
