import { TenantService, PLATFORM_TENANT_ID, DEFAULT_TENANT_ID } from './tenantService';

export interface Processo {
  id_processo: number;
  tenantId?: string;
  numero?: string;
  departamento: 'Cível' | 'Trabalhista' | 'Societário';
  advogado: string;
  gestor: string;
  data_entrada: string;
  data_conclusao?: string | null;
  status: 'Em Andamento' | 'Concluído' | 'Aguardando Documentação';
  valor: number;
  tempo: number; // calculated
  clientName?: string;
  clientCpf?: string;
}

const INITIAL_PROCESSOS: Omit<Processo, 'tempo'>[] = [
  {
    id_processo: 1001,
    departamento: 'Cível',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-01-10',
    data_conclusao: '2025-03-15',
    status: 'Concluído',
    valor: 15000,
    clientName: 'Ana Rodrigues',
    clientCpf: '111.222.333-01',
  },
  {
    id_processo: 1002,
    departamento: 'Trabalhista',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-02-18',
    data_conclusao: '2025-05-20',
    status: 'Concluído',
    valor: 28000,
    clientName: 'Bruno Ferreira',
    clientCpf: '222.333.444-02',
  },
  {
    id_processo: 1003,
    departamento: 'Societário',
    advogado: 'Dr. Ricardo Mendes',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-03-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 45000,
    clientName: 'Carla Mendes',
    clientCpf: '333.444.555-03',
  },
  {
    id_processo: 1004,
    departamento: 'Cível',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-04-12',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 12000,
    clientName: 'Daniel Sousa',
    clientCpf: '444.555.666-04',
  },
  {
    id_processo: 1005,
    departamento: 'Trabalhista',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-05-01',
    data_conclusao: '2025-07-10',
    status: 'Concluído',
    valor: 35000,
    clientName: 'Eliane Costa',
    clientCpf: '555.666.777-05',
  },
  {
    id_processo: 1006,
    departamento: 'Societário',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-06-15',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 62000,
    clientName: 'Fábio Lima',
    clientCpf: '666.777.888-06',
  },
  {
    id_processo: 1007,
    departamento: 'Cível',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-07-22',
    data_conclusao: '2025-10-05',
    status: 'Concluído',
    valor: 18000,
    clientName: 'Gabriela Oliveira',
    clientCpf: '777.888.999-07',
  },
  {
    id_processo: 1008,
    departamento: 'Trabalhista',
    advogado: 'Dr. Ricardo Mendes',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-08-30',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 22000,
    clientName: 'Ana Rodrigues',
    clientCpf: '111.222.333-01',
  },
  {
    id_processo: 1009,
    departamento: 'Societário',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-09-10',
    data_conclusao: '2025-12-01',
    status: 'Concluído',
    valor: 50000,
    clientName: 'Bruno Ferreira',
    clientCpf: '222.333.444-02',
  },
  {
    id_processo: 1010,
    departamento: 'Cível',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2025-10-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 9000,
    clientName: 'Carla Mendes',
    clientCpf: '333.444.555-03',
  },
  {
    id_processo: 1011,
    departamento: 'Trabalhista',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2025-11-20',
    data_conclusao: '2026-02-15',
    status: 'Concluído',
    valor: 42000,
    clientName: 'Daniel Sousa',
    clientCpf: '444.555.666-04',
  },
  {
    id_processo: 1012,
    departamento: 'Societário',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2025-12-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 75000,
    clientName: 'Eliane Costa',
    clientCpf: '555.666.777-05',
  },
  {
    id_processo: 1013,
    departamento: 'Cível',
    advogado: 'Dr. Ricardo Mendes',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-01-15',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 16000,
    clientName: 'Fábio Lima',
    clientCpf: '666.777.888-06',
  },
  {
    id_processo: 1014,
    departamento: 'Trabalhista',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-02-10',
    data_conclusao: '2026-04-30',
    status: 'Concluído',
    valor: 31000,
    clientName: 'Gabriela Oliveira',
    clientCpf: '777.888.999-07',
  },
  {
    id_processo: 1015,
    departamento: 'Societário',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2026-03-01',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 88000,
    clientName: 'Ana Rodrigues',
    clientCpf: '111.222.333-01',
  },
  {
    id_processo: 1016,
    departamento: 'Cível',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-04-18',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 25000,
    clientName: 'Bruno Ferreira',
    clientCpf: '222.333.444-02',
  },
  {
    id_processo: 1017,
    departamento: 'Trabalhista',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-05-02',
    data_conclusao: null,
    status: 'Aguardando Documentação',
    valor: 19000,
    clientName: 'Carla Mendes',
    clientCpf: '333.444.555-03',
  },
  {
    id_processo: 1018,
    departamento: 'Societário',
    advogado: 'Dr. Ricardo Mendes',
    gestor: 'Dra. Beatriz Reis',
    data_entrada: '2026-05-15',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 55000,
    clientName: 'Daniel Sousa',
    clientCpf: '444.555.666-04',
  },
  {
    id_processo: 1019,
    departamento: 'Cível',
    advogado: 'Dra. Beatriz Lima',
    gestor: 'Dra. Patrícia Souza',
    data_entrada: '2026-06-01',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 33000,
    clientName: 'Eliane Costa',
    clientCpf: '555.666.777-05',
  },
  {
    id_processo: 1020,
    departamento: 'Trabalhista',
    advogado: 'Dr. Carlos Andrade',
    gestor: 'Dr. Fernando Rocha',
    data_entrada: '2026-06-05',
    data_conclusao: null,
    status: 'Em Andamento',
    valor: 14000,
    clientName: 'Fábio Lima',
    clientCpf: '666.777.888-06',
  },
];

export function calcularTempo(dataEntradaStr: string, dataConclusaoStr?: string | null): number {
  const start = new Date(dataEntradaStr);
  const end = dataConclusaoStr ? new Date(dataConclusaoStr) : new Date();
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const STORAGE_KEY = 'legis_gestao_processos';

export const mockProcessosService = {
  getProcessos(activeTenantId?: string, maskSensitivePii: boolean = false): Processo[] {
    let allProcessos: Processo[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Processo[];
        allProcessos = parsed.map((p, idx) => ({
          ...p,
          tenantId: p.tenantId || (idx % 3 === 0 ? 'tenant_lawfirm_alpha' : idx % 3 === 1 ? 'tenant_lawfirm_beta' : 'tenant_independent_gamma'),
          tempo: calcularTempo(p.data_entrada, p.data_conclusao)
        }));
      } else {
        allProcessos = INITIAL_PROCESSOS.map((p, idx) => ({
          ...p,
          tenantId: idx % 3 === 0 ? 'tenant_lawfirm_alpha' : idx % 3 === 1 ? 'tenant_lawfirm_beta' : 'tenant_independent_gamma',
          tempo: calcularTempo(p.data_entrada, p.data_conclusao)
        })) as Processo[];
        this.saveProcessos(allProcessos);
      }
    } catch (e) {
      console.warn('[mockProcessosService] Error loading processes from localStorage, using defaults.', e);
      allProcessos = INITIAL_PROCESSOS.map((p, idx) => ({
        ...p,
        tenantId: idx % 3 === 0 ? 'tenant_lawfirm_alpha' : idx % 3 === 1 ? 'tenant_lawfirm_beta' : 'tenant_independent_gamma',
        tempo: calcularTempo(p.data_entrada, p.data_conclusao)
      })) as Processo[];
    }

    // Filtrar por Tenant se um tenant ativo for informado
    const tenantFiltered = activeTenantId
      ? TenantService.filterByTenant(allProcessos, activeTenantId)
      : allProcessos;

    // Mascarar PII (CPF) se solicitado ou em escopos de terceiros (LGPD)
    if (maskSensitivePii) {
      return tenantFiltered.map(p => ({
        ...p,
        clientCpf: TenantService.maskCpf(p.clientCpf)
      }));
    }

    return tenantFiltered;
  },

  saveProcessos(processos: Processo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
    } catch (e) {
      console.warn('[mockProcessosService] Error saving processes to localStorage', e);
    }
  },

  addProcesso(processo: Omit<Processo, 'id_processo' | 'tempo'>, activeTenantId: string = DEFAULT_TENANT_ID): Processo {
    const list = this.getProcessos();
    const nextId = list.length > 0 ? Math.max(...list.map(p => p.id_processo)) + 1 : 1001;
    
    const newProcesso: Processo = {
      ...processo,
      id_processo: nextId,
      tenantId: processo.tenantId || activeTenantId,
      tempo: calcularTempo(processo.data_entrada, processo.data_conclusao)
    };

    list.push(newProcesso);
    this.saveProcessos(list);
    return newProcesso;
  },

  updateProcesso(id: number, updates: Partial<Omit<Processo, 'id_processo' | 'tempo'>>, activeTenantId?: string): Processo | null {
    const list = this.getProcessos();
    const idx = list.findIndex(p => p.id_processo === id);
    if (idx === -1) return null;

    const existing = list[idx];

    // Validação estrita de isolamento de Tenant (IDOR Protection)
    if (activeTenantId && activeTenantId !== PLATFORM_TENANT_ID) {
      TenantService.assertTenantAccess(activeTenantId, existing.tenantId);
    }

    const merged = { ...existing, ...updates };
    merged.tempo = calcularTempo(merged.data_entrada, merged.data_conclusao);

    list[idx] = merged;
    this.saveProcessos(list);
    return merged;
  },

  deleteProcesso(id: number, activeTenantId?: string): boolean {
    const list = this.getProcessos();
    const existing = list.find(p => p.id_processo === id);
    if (!existing) return false;

    // Validação estrita de isolamento de Tenant (IDOR Protection)
    if (activeTenantId && activeTenantId !== PLATFORM_TENANT_ID) {
      TenantService.assertTenantAccess(activeTenantId, existing.tenantId);
    }

    const filtered = list.filter(p => p.id_processo !== id);
    this.saveProcessos(filtered);
    return true;
  }
};
