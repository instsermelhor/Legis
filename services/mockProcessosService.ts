export interface Processo {
  id_processo: number;
  departamento: 'Cível' | 'Trabalhista' | 'Societário';
  advogado: string;
  gestor: string;
  data_entrada: string;
  data_conclusao?: string | null;
  status: 'Em Andamento' | 'Concluído' | 'Aguardando Documentação';
  valor: number;
  tempo: number; // calculado
}

const INITIAL_PROCESSOS: Omit<Processo, 'tempo'>[] = [
  {
    id_processo: 1001,
    departamento: 'Cível',
    advogado: 'Dr. Carlos Silva',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-01-10',
    data_conclusao: '2025-03-15',
    status: 'Concluído',
    valor: 15000,
  },
  {
    id_processo: 1002,
    departamento: 'Trabalhista',
    advogado: 'Dra. Mariana Costa',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-02-18',
    data_conclusao: '2025-05-20',
    status: 'Concluído',
    valor: 28000,
  },
  {
    id_processo: 1003,
    departamento: 'Societário',
    advogado: 'Dr. Ricardo Santos',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-03-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 45000,
  },
  {
    id_processo: 1004,
    departamento: 'Cível',
    advogado: 'Dra. Ana Oliveira',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-04-12',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 12000,
  },
  {
    id_processo: 1005,
    departamento: 'Trabalhista',
    advogado: 'Dr. Bruno Lima',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-05-01',
    data_conclusao: '2025-07-10',
    status: 'Concluído',
    valor: 35000,
  },
  {
    id_processo: 1006,
    departamento: 'Societário',
    advogado: 'Dr. Carlos Silva',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-06-15',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 62000,
  },
  {
    id_processo: 1007,
    departamento: 'Cível',
    advogado: 'Dra. Mariana Costa',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-07-22',
    data_conclusao: '2025-10-05',
    status: 'Concluído',
    valor: 18000,
  },
  {
    id_processo: 1008,
    departamento: 'Trabalhista',
    advogado: 'Dr. Ricardo Santos',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-08-30',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 22000,
  },
  {
    id_processo: 1009,
    departamento: 'Societário',
    advogado: 'Dra. Ana Oliveira',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-09-10',
    data_conclusao: '2025-12-01',
    status: 'Concluído',
    valor: 50000,
  },
  {
    id_processo: 1010,
    departamento: 'Cível',
    advogado: 'Dr. Bruno Lima',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-10-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 9000,
  },
  {
    id_processo: 1011,
    departamento: 'Trabalhista',
    advogado: 'Dr. Carlos Silva',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-11-20',
    data_conclusao: '2026-02-15',
    status: 'Concluído',
    valor: 42000,
  },
  {
    id_processo: 1012,
    departamento: 'Societário',
    advogado: 'Dra. Mariana Costa',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-12-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 75000,
  },
  {
    id_processo: 1013,
    departamento: 'Cível',
    advogado: 'Dr. Ricardo Santos',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-01-15',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 16000,
  },
  {
    id_processo: 1014,
    departamento: 'Trabalhista',
    advogado: 'Dra. Ana Oliveira',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-02-10',
    data_conclusao: '2026-04-30',
    status: 'Concluído',
    valor: 31000,
  },
  {
    id_processo: 1015,
    departamento: 'Societário',
    advogado: 'Dr. Bruno Lima',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2026-03-01',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 88000,
  },
  {
    id_processo: 1016,
    departamento: 'Cível',
    advogado: 'Dr. Carlos Silva',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-04-18',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 25000,
  },
  {
    id_processo: 1017,
    departamento: 'Trabalhista',
    advogado: 'Dra. Mariana Costa',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-05-02',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 19000,
  },
  {
    id_processo: 1018,
    departamento: 'Societário',
    advogado: 'Dr. Ricardo Santos',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2026-05-15',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 55000,
  },
  {
    id_processo: 1019,
    departamento: 'Cível',
    advogado: 'Dra. Ana Oliveira',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-06-01',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 33000,
  },
  {
    id_processo: 1020,
    departamento: 'Trabalhista',
    advogado: 'Dr. Bruno Lima',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-06-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 14000,
  },
];

export function calcularTempo(dataEntradaStr: string, dataConclusaoStr?: string | null): number {
  if (!dataConclusaoStr) return 0;
  const start = new Date(dataEntradaStr);
  const end = new Date(dataConclusaoStr);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const STORAGE_KEY = 'legis_gestao_processos';

export const mockProcessosService = {
  getProcessos(): Processo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Processo[];
        // Recalculate tempo dynamically to ensure consistency
        return parsed.map(p => ({
          ...p,
          tempo: calcularTempo(p.data_entrada, p.data_conclusao)
        }));
      }
    } catch (e) {
      console.warn('[mockProcessosService] Error loading processes from localStorage, using defaults.', e);
    }

    // Initialize defaults with calculated tempo
    const initialWithTempo = INITIAL_PROCESSOS.map(p => ({
      ...p,
      tempo: calcularTempo(p.data_entrada, p.data_conclusao)
    })) as Processo[];

    this.saveProcessos(initialWithTempo);
    return initialWithTempo;
  },

  saveProcessos(processos: Processo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
    } catch (e) {
      console.warn('[mockProcessosService] Error saving processes to localStorage', e);
    }
  },

  addProcesso(processo: Omit<Processo, 'id_processo' | 'tempo'>): Processo {
    const list = this.getProcessos();
    const nextId = list.length > 0 ? Math.max(...list.map(p => p.id_processo)) + 1 : 1001;
    
    const newProcesso: Processo = {
      ...processo,
      id_processo: nextId,
      tempo: calcularTempo(processo.data_entrada, processo.data_conclusao)
    };

    list.push(newProcesso);
    this.saveProcessos(list);
    return newProcesso;
  },

  updateProcesso(id: number, updates: Partial<Omit<Processo, 'id_processo' | 'tempo'>>): Processo | null {
    const list = this.getProcessos();
    const idx = list.findIndex(p => p.id_processo === id);
    if (idx === -1) return null;

    const merged = { ...list[idx], ...updates };
    merged.tempo = calcularTempo(merged.data_entrada, merged.data_conclusao);

    list[idx] = merged;
    this.saveProcessos(list);
    return merged;
  },

  deleteProcesso(id: number): boolean {
    const list = this.getProcessos();
    const filtered = list.filter(p => p.id_processo !== id);
    if (filtered.length === list.length) return false;
    this.saveProcessos(filtered);
    return true;
  }
};
