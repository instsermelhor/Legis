/**
 * BACKEND MODULAR — Legis Connect
 * Estrutura derivada dos diagramas de arquitetura (whiteboards 2026-07-02):
 *
 *   DB Postgres (SSH Azure, servidor mini) → Backend → ENTIDADES:
 *   ┌────────────┬──────────────────────────────────────────────────┐
 *   │ pessoas    │ cliente, advogado, bacharel, secretário (RBAC)   │
 *   │ processos  │ Processo: numero PK, docs[], financeiroFk...     │
 *   │ financeiro │ Financeiro + FContas                             │
 *   │ documentos │ Documento + Tipos + auto-classificação via IA    │
 *   │ chat       │ Chat/Mensagens — Bot Legis via WhatsApp, E2E     │
 *   │ agenda     │ Calendário 1—N Processo (Google Meet)            │
 *   │ ia         │ classificação, análise de caso, chat assistido  │
 *   │ provisioning│ multi-tenant / governança de dados              │
 *   └────────────┴──────────────────────────────────────────────────┘
 *
 * Uso: import { backend } from '../services/modules';
 *      backend.processos.getAll(); backend.chat.enviar(...);
 */
import { pessoasService } from './pessoas';
import { processosService } from './processos';
import { financeiroService } from './financeiro';
import { documentosService } from './documentos';
import { chatService } from './chat';
import { agendaService } from './agenda';
import { iaService } from './ia';
import { ProvisioningService } from '../provisioningService';

export * from './pessoas';
export * from './processos';
export * from './financeiro';
export * from './documentos';
export * from './chat';
export * from './agenda';
export * from './ia';

export const backend = {
  pessoas: pessoasService,
  processos: processosService,
  financeiro: financeiroService,
  documentos: documentosService,
  chat: chatService,
  agenda: agendaService,
  ia: iaService,
  provisioning: ProvisioningService,
};
