/**
 * LEGIS CONNECT — API HTTP (Express + PostgreSQL).
 * Porta 4000. O Vite (frontend) faz proxy de /api e /uploads para cá.
 */
import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'node:fs';
import { rotasAuth } from './auth';
import { rotasPessoas } from './rotas/pessoas';
import { rotasProcessos } from './rotas/processos';
import { rotasFinanceiro } from './rotas/financeiro';
import { rotasDocumentos, DIRETORIO_UPLOADS } from './rotas/documentos';
import { rotasChats } from './rotas/chats';
import { rotasAgenda } from './rotas/agenda';
import { rotasContratos } from './rotas/contratos';

const PORTA = Number(process.env.PORTA_API ?? 4000);

mkdirSync(DIRETORIO_UPLOADS, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // uploads de documento em base64
app.use('/uploads', express.static(DIRETORIO_UPLOADS));

app.get('/api/saude', (_req, res) => res.json({ ok: true, servico: 'legis-api' }));

app.use('/api/auth', rotasAuth);
app.use('/api', rotasPessoas);
app.use('/api', rotasProcessos);
app.use('/api', rotasFinanceiro);
app.use('/api', rotasDocumentos);
app.use('/api', rotasChats);
app.use('/api', rotasAgenda);
app.use('/api', rotasContratos);

app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Erros não tratados nas rotas caem aqui.
app.use((erro: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[legis-api]', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORTA, () => {
  console.log(`[legis-api] rodando em http://localhost:${PORTA}`);
});
