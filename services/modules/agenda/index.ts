/**
 * Módulo AGENDA/CALENDÁRIO — diagrama (whiteboard 1):
 *   Calendário 1—N Processo; sincronização Google Meet/Calendar.
 */

export type TipoEvento = 'audiencia' | 'consulta' | 'reuniao' | 'prazo';

export interface EventoAgenda {
  id: string;
  titulo: string;
  data: string;      // ISO
  hora: string;
  tipo: TipoEvento;
  local?: string;
  processoFk?: string;
  pessoaFk?: string;
}

const KEY = 'legis_agenda_eventos';

function load(): EventoAgenda[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export const agendaService = {
  getAll: (): EventoAgenda[] => load(),
  getByDia: (isoDate: string) => load().filter(e => e.data.startsWith(isoDate)),
  getByProcesso: (processoFk: string) => load().filter(e => e.processoFk === processoFk),
  add(evento: Omit<EventoAgenda, 'id'>): EventoAgenda {
    const ev: EventoAgenda = { ...evento, id: `ev_${Date.now()}` };
    try { localStorage.setItem(KEY, JSON.stringify([...load(), ev])); } catch { /* noop */ }
    return ev;
  },
};
