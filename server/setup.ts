/**
 * Setup do banco: cria o database `legis` (se não existir), aplica o
 * schema.sql e insere os dados de bootstrap (idempotente).
 *
 * Bootstrap ≠ mock: são os registros mínimos para o sistema operar —
 * conta do administrador, tipos de processo, tipos de documento (com os
 * campos do diagrama, ex.: CNH) e o catálogo público de serviços.
 *
 * Uso: npm run db:setup
 */
import { Client } from 'pg';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG_PG, NOME_BANCO, pool, q } from './db';
import { gerarHash } from './senha';

async function garantirBanco() {
  const cliente = new Client({ ...CONFIG_PG, database: 'postgres' });
  await cliente.connect();
  const existe = await cliente.query('SELECT 1 FROM pg_database WHERE datname = $1', [NOME_BANCO]);
  if (!existe.rowCount) {
    await cliente.query(`CREATE DATABASE ${NOME_BANCO}`);
    console.log(`[setup] database "${NOME_BANCO}" criado.`);
  }
  await cliente.end();
}

async function aplicarSchema() {
  const sql = readFileSync(join(import.meta.dirname, 'schema.sql'), 'utf-8');
  await q(sql);
  console.log('[setup] schema aplicado.');
}

async function inserirBootstrap() {
  // ── Tenant 1: Plataforma (admin e clientes avulsos) ──
  await q(`INSERT INTO tenant (id, nome) VALUES (1, 'Plataforma Legis Connect') ON CONFLICT (id) DO NOTHING`);
  await q(`SELECT setval('tenant_id_seq', GREATEST((SELECT MAX(id) FROM tenant), 1))`);

  // ── Administrador ──
  await q(
    `INSERT INTO pessoa (tenant_id, tipo, nome, email, senha_hash)
     VALUES (1, 'admin', 'Super Admin', 'admin@legisconnect.com.br', $1)
     ON CONFLICT (email) DO NOTHING`,
    [gerarHash('[senha-removida]')]
  );

  // ── Tipos de processo ──
  const tiposProcesso = ['Cível', 'Trabalhista', 'Societário', 'Criminal', 'Família', 'Tributário', 'Empresarial', 'Previdenciário', 'Trânsito'];
  for (const nome of tiposProcesso) {
    await q('INSERT INTO tipo_processo (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING', [nome]);
  }

  // ── Tipos de documento (campos p/ auto-preenchimento — diagrama, ex. CNH) ──
  const tiposDocumento: Array<[string, string[]]> = [
    ['CNH', ['nome', 'tipo', 'dataNascimento', 'validade', 'numeroCnh', 'numEspelho']],
    ['RG', ['nome', 'numero', 'orgaoEmissor', 'dataExpedicao']],
    ['CPF', ['nome', 'numero']],
    ['Contrato', ['partes', 'objeto', 'valor', 'vigencia']],
    ['Procuração', ['outorgante', 'outorgado', 'poderes', 'validade']],
    ['Comprovante de Residência', ['nome', 'endereco', 'dataEmissao']],
  ];
  for (const [nome, campos] of tiposDocumento) {
    await q('INSERT INTO documento_tipo (nome, campos) VALUES ($1, $2) ON CONFLICT (nome) DO NOTHING', [nome, campos]);
  }

  // ── Catálogo público de serviços (preços reais do site) ──
  const servicos: Array<[string, string, number, number]> = [
    ['Consultoria Jurídica Expressa', 'Sessão de 60 minutos com advogado especialista em até 24 horas', 97, 1],
    ['Análise de Contrato de Aluguel', 'Revisão completa de contratos residenciais e comerciais em 48 horas', 147, 2],
    ['Registro de Marca no INPI', 'Proteção completa da sua marca junto ao INPI com acompanhamento integral', 597, 30],
    ['Termos de Uso + Política LGPD', 'Documentos de conformidade com a LGPD personalizados para o seu negócio', 697, 7],
  ];
  for (const [nome, descricao, preco, prazo] of servicos) {
    await q(
      'INSERT INTO servico (nome, descricao, preco, prazo_dias) VALUES ($1, $2, $3, $4) ON CONFLICT (nome) DO NOTHING',
      [nome, descricao, preco, prazo]
    );
  }

  console.log('[setup] bootstrap inserido (admin, tipos, catálogo).');
}

garantirBanco()
  .then(aplicarSchema)
  .then(inserirBootstrap)
  .then(() => pool.end())
  .then(() => console.log('[setup] concluído.'))
  .catch(erro => {
    console.error('[setup] falhou:', erro);
    process.exit(1);
  });
