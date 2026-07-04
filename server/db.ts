/**
 * Conexão PostgreSQL — pool único do servidor.
 * Config local padrão: localhost:5432, user postgres, senha postgres.
 */
import { Pool, type QueryResultRow } from 'pg';

export const CONFIG_PG = {
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? 'postgres',
};

export const NOME_BANCO = process.env.PGDATABASE ?? 'legis';

export const pool = new Pool({ ...CONFIG_PG, database: NOME_BANCO });

/** Atalho para consultas parametrizadas. */
export function q<T extends QueryResultRow = QueryResultRow>(texto: string, params: unknown[] = []) {
  return pool.query<T>(texto, params);
}

/** Executa `fn` dentro de uma transação (BEGIN/COMMIT/ROLLBACK). */
export async function transacao<T>(fn: (cliente: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await fn(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}
