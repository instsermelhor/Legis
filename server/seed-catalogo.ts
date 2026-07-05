/**
 * Migra o catálogo de Serviços de Eficiência (conteúdo real de produto,
 * antes hardcoded no frontend) para a tabela `servico` do PostgreSQL.
 * Idempotente (ON CONFLICT por nome). Uso: npx tsx server/seed-catalogo.ts
 */
import { q, pool } from './db';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../services/mockDataService';

async function main() {
  const nomeDoGrupo = new Map(mockEfficiencyServiceGroups.map(g => [g.id, g.name]));

  let inseridos = 0;
  for (const s of mockEfficiencyServices) {
    const r = await q(
      `INSERT INTO servico (nome, descricao, grupo, preco)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (nome) DO UPDATE SET descricao = $2, grupo = $3, preco = $4
       RETURNING id`,
      [s.name, s.description, nomeDoGrupo.get(s.groupId) ?? null, s.price]
    );
    if (r.rowCount) inseridos++;
  }
  console.log(`[seed-catalogo] ${inseridos} serviços de eficiência no banco.`);
  await pool.end();
}

main().catch(erro => { console.error('[seed-catalogo] falhou:', erro); process.exit(1); });
