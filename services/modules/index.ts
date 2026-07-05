/**
 * BACKEND — fachada única do frontend para a API real
 * (Express + PostgreSQL, server/), sem mocks.
 *
 * Entidades conforme os diagramas de arquitetura:
 *   auth       sessões (login/registro/logout)
 *   pessoas    advogados, bachareis, secretários, contas
 *   processos  Processo + tipos
 *   financeiro Financeiro + FContas + resumo agregado
 *   documentos Documento + Tipos (classificação IA = fluxo externo)
 *   chat       Chat + Mensagens
 *   agenda     Calendário (eventos, FK Processo)
 *   contratos  Serviços (catálogo) + Contratos
 *   ia         análise de caso / chat assistido (Gemini)
 *
 * Uso: import { backend } from '../services/modules';
 *      await backend.processos.listar();
 */
import { authService } from './auth';
import { pessoasService } from './pessoas';
import { processosService } from './processos';
import { financeiroService } from './financeiro';
import { documentosService } from './documentos';
import { chatService } from './chat';
import { agendaService } from './agenda';
import { contratosService } from './contratos';
import { dadosService } from './dados';
import { adminService } from './admin';
import { iaService } from './ia';

export * from './auth';
export * from './pessoas';
export * from './processos';
export * from './financeiro';
export * from './documentos';
export * from './chat';
export * from './agenda';
export * from './contratos';
export * from './dados';
export * from './admin';

export const backend = {
  auth: authService,
  pessoas: pessoasService,
  processos: processosService,
  financeiro: financeiroService,
  documentos: documentosService,
  chat: chatService,
  agenda: agendaService,
  contratos: contratosService,
  dados: dadosService,
  admin: adminService,
  ia: iaService,
};
