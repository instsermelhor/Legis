/**
 * Módulo CHAT — Chat {pessoa1, pessoa2} + Mensagens, persistido no
 * PostgreSQL via API.
 */
import { api } from '../../api';

export interface ChatApi {
  id: number;
  pessoa1_id: number;
  pessoa2_id: number;
  criado_em: string;
}

export interface ChatResumoApi {
  id: number;
  criado_em: string;
  interlocutor_id: number;
  interlocutor_nome: string;
  interlocutor_tipo: string;
  ultima_mensagem: string | null;
  ultima_em: string | null;
}

export interface MensagemApi {
  id: number;
  chat_id: number;
  pessoa_id: number;
  pessoa_nome?: string;
  texto: string;
  criado_em: string;
}

export const chatService = {
  /** Obtém (ou cria) o chat com a pessoa destinatária. */
  abrirCom: (destinatarioId: number) =>
    api.post<ChatApi>('/chats', { destinatario_id: destinatarioId }),

  meusChats: () => api.get<ChatResumoApi[]>('/chats'),

  mensagens: (chatId: number) => api.get<MensagemApi[]>(`/chats/${chatId}/mensagens`),

  enviar: (chatId: number, texto: string) =>
    api.post<MensagemApi>(`/chats/${chatId}/mensagens`, { texto }),

  /** Conveniência: abre o chat com a pessoa e envia em uma chamada. */
  async enviarPara(destinatarioId: number, texto: string): Promise<MensagemApi> {
    const chat = await chatService.abrirCom(destinatarioId);
    return chatService.enviar(chat.id, texto);
  },
};
