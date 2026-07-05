/**
 * Seed de DESENVOLVIMENTO — cria contas e dados de demonstração passando
 * pelos fluxos reais da API (registro, vínculos, processos, financeiro,
 * chat, agenda, contrato). Requer a API rodando em localhost:4000.
 *
 * Uso: npx tsx server/seed-dev.ts
 */

const BASE = process.env.API_URL ?? 'http://localhost:4000/api';

async function chamar(metodo: string, caminho: string, corpo?: unknown, token?: string) {
  const r = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${metodo} ${caminho} → ${r.status}: ${JSON.stringify(dados)}`);
  return dados;
}

async function main() {
  // ── Admin ──
  const admin = await chamar('POST', '/auth/login', { email: 'admin@legisconnect.com.br', senha: '[senha-removida]' });

  // ── Escritório 1: Dr. Carlos Andrade ──
  const carlos = await chamar('POST', '/auth/registrar', {
    tipo: 'advogado', nome: 'Dr. Carlos Andrade', email: 'carlos.andrade@legisconnect.com',
    senha: 'teste', telefone: '(11) 99999-1111', cidade: 'São Paulo', estado: 'SP',
    perfil: { oab: 'SP-123456', especialidades: ['Direito Civil', 'Direito de Família'], bio: 'Especialista em direito civil e de família, 15 anos de atuação.' },
  });
  await chamar('PUT', `/advogados/${carlos.pessoa.id}`, { status: 'verificado' }, admin.token);

  // ── Escritório 2: Dra. Beatriz Lima (para provar o isolamento) ──
  const beatriz = await chamar('POST', '/auth/registrar', {
    tipo: 'advogado', nome: 'Dra. Beatriz Lima', email: 'beatriz.lima@legisconnect.com',
    senha: 'teste', telefone: '(21) 98888-2222', cidade: 'Rio de Janeiro', estado: 'RJ',
    perfil: { oab: 'RJ-654321', especialidades: ['Direito Trabalhista'], bio: 'Advogada trabalhista com foco em contencioso empresarial.' },
  });
  await chamar('PUT', `/advogados/${beatriz.pessoa.id}`, { status: 'verificado' }, admin.token);

  // ── Cliente, bacharel e secretária ──
  const ana = await chamar('POST', '/auth/registrar', {
    tipo: 'cliente', nome: 'Ana Rodrigues', email: 'ana.rodrigues@email.com',
    senha: 'teste', telefone: '(11) 91234-5678', cidade: 'São Paulo', estado: 'SP',
  });
  const henrique = await chamar('POST', '/auth/registrar', {
    tipo: 'bacharel', nome: 'Henrique Alves', email: 'henrique.alves@uni.edu.br',
    senha: 'teste', cidade: 'São Paulo', estado: 'SP',
    perfil: { universidade: 'PUC-SP', semestre: '7º ao 9º semestre', interesse: 'Direito Civil' },
  });
  const clara = await chamar('POST', '/auth/registrar', {
    tipo: 'secretario', nome: 'Clara Souza', email: 'clara.souza@legisconnect.com',
    senha: 'teste', cidade: 'São Paulo', estado: 'SP',
    perfil: { experiencia_anos: 4, disponibilidade: 'integral' },
  });

  // Vínculos → entram no tenant do escritório do Carlos.
  await chamar('PUT', `/bachareis/${henrique.pessoa.id}`, { supervisor_id: carlos.pessoa.id }, carlos.token);
  await chamar('PUT', `/secretarios/${clara.pessoa.id}`, { advogado_id: carlos.pessoa.id }, carlos.token);

  // ── Processos do escritório do Carlos ──
  const proc1 = await chamar('POST', '/processos', {
    numero: '1005234-12.2026.8.26.0100', nome: 'Divórcio Consensual — Ana Rodrigues',
    tipo_processo_id: 4, cliente_id: ana.pessoa.id,
  }, carlos.token);
  await chamar('POST', '/processos', {
    numero: '0012556-44.2026.8.26.0002', nome: 'Inventário e Partilha de Bens',
    tipo_processo_id: 1, cliente_id: ana.pessoa.id,
  }, carlos.token);

  // Processo do escritório da Beatriz (outro tenant).
  await chamar('POST', '/processos', {
    numero: '0089123-11.2026.5.01.0023', nome: 'Reclamação Trabalhista — Silva vs. Empresa X',
    tipo_processo_id: 2,
  }, beatriz.token);

  // ── Financeiro do processo 1 ──
  const fin = await chamar('POST', `/processos/${proc1.id}/financeiro`, { data_inicio: '2026-07-01' }, carlos.token);
  await chamar('POST', `/financeiro/${fin.id}/fcontas`, { descricao: 'Honorários iniciais', valor: 2500, status: 'recebido' }, carlos.token);
  await chamar('POST', `/financeiro/${fin.id}/fcontas`, { descricao: 'Custas processuais', valor: 480, status: 'pendente' }, carlos.token);

  // ── Chat cliente ↔ advogado ──
  const chat = await chamar('POST', '/chats', { destinatario_id: carlos.pessoa.id }, ana.token);
  await chamar('POST', `/chats/${chat.id}/mensagens`, { texto: 'Bom dia, doutor! Anexei o comprovante de residência.' }, ana.token);
  await chamar('POST', `/chats/${chat.id}/mensagens`, { texto: 'Recebido, Ana. Vou protocolar ainda hoje.' }, carlos.token);

  // ── Agenda do Carlos ──
  const hoje = new Date();
  const em = (dias: number, hora: number) => {
    const d = new Date(hoje); d.setDate(d.getDate() + dias); d.setHours(hora, 0, 0, 0);
    return d.toISOString();
  };
  await chamar('POST', '/agenda', { titulo: 'Audiência de Conciliação', inicio: em(0, 9), tipo: 'audiencia', local: 'TJSP — 3ª Vara Cível', processo_id: proc1.id }, carlos.token);
  await chamar('POST', '/agenda', { titulo: 'Consulta Inicial — Marcos Vieira', inicio: em(0, 11), tipo: 'consulta', local: 'Videochamada' }, carlos.token);
  await chamar('POST', '/agenda', { titulo: 'Prazo: Contestação', inicio: em(2, 17), tipo: 'prazo', processo_id: proc1.id }, carlos.token);

  // ── Contrato da Ana com o Carlos ──
  await chamar('POST', '/contratos', { advogado_id: carlos.pessoa.id, servico_id: 1 }, ana.token);

  console.log('[seed-dev] concluído. Contas (senha "teste"):');
  console.log('  advogado:   carlos.andrade@legisconnect.com (tenant do escritório 1)');
  console.log('  advogado:   beatriz.lima@legisconnect.com   (tenant do escritório 2)');
  console.log('  cliente:    ana.rodrigues@email.com');
  console.log('  bacharel:   henrique.alves@uni.edu.br  (equipe do Carlos)');
  console.log('  secretária: clara.souza@legisconnect.com (equipe do Carlos)');
}

main().catch(erro => { console.error('[seed-dev] falhou:', erro.message); process.exit(1); });
