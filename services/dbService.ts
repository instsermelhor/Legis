/**
 * dbService.ts
 * Abstração de banco de dados local (localStorage) e nuvem (stubs).
 *
 * Para conectar à nuvem, substitua as funções stub abaixo pelas chamadas
 * reais do Firebase/Supabase. As interfaces já estão prontas.
 *
 * LOCAL:  localStorage — funciona offline, sem configuração.
 * NUVEM:  Stubs comentados para Firebase Firestore ou Supabase REST.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AppConfig {
  appName: string;
  logoUrl: string | null;          // base64 ou URL
  headerLogoUrl: string | null;
  footerLogoUrl: string | null;
  siteTagline: string;
  footerText: string;
  updatedAt: string;
}

export interface ReceivedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  size: number;
  uploadedAt: string;
  dataUrl: string;            // base64 para sync local
  lawyerId?: number;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  clientName: string;
  description: string;
  amount: number;
  status: 'recebido' | 'pendente' | 'inadimplente';
  caseId?: string;
}

// ─── Default Config ───────────────────────────────────────────────────────────
const DEFAULT_CONFIG: AppConfig = {
  appName: 'Legis Connect',
  logoUrl: null,
  headerLogoUrl: null,
  footerLogoUrl: null,
  siteTagline: 'A solução para seus problemas jurídicos.',
  footerText: `© ${new Date().getFullYear()} Legis Connect. Todos os direitos reservados.`,
  updatedAt: new Date().toISOString(),
};

// ─── Local Storage Keys ───────────────────────────────────────────────────────
const KEYS = {
  config: 'legis_app_config',
  receivedDocs: 'legis_received_docs',
  financialTx: 'legis_financial_tx',
  legalDocs: 'legis_legal_docs',
  adminUsers: 'legis_admin_users',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[dbService] Failed to save to localStorage', e);
  }
}

// ─── App Config ───────────────────────────────────────────────────────────────
export const dbConfig = {
  get(): AppConfig {
    return load<AppConfig>(KEYS.config, DEFAULT_CONFIG);
  },
  set(config: Partial<AppConfig>): AppConfig {
    const current = dbConfig.get();
    const updated = { ...current, ...config, updatedAt: new Date().toISOString() };
    save(KEYS.config, updated);
    // NUVEM STUB: await firestore.collection('config').doc('app').set(updated);
    return updated;
  },
};

// ─── Received Documents ───────────────────────────────────────────────────────
export const dbDocuments = {
  getAll(lawyerId?: number): ReceivedDocument[] {
    const all = load<ReceivedDocument[]>(KEYS.receivedDocs, []);
    return lawyerId !== undefined ? all.filter(d => d.lawyerId === lawyerId) : all;
  },
  add(doc: ReceivedDocument): void {
    const all = dbDocuments.getAll();
    save(KEYS.receivedDocs, [...all, doc]);
    // NUVEM STUB: await firestore.collection('receivedDocs').add(doc);
  },
  remove(id: string): void {
    const all = dbDocuments.getAll();
    save(KEYS.receivedDocs, all.filter(d => d.id !== id));
    // NUVEM STUB: await firestore.collection('receivedDocs').doc(id).delete();
  },
};

// ─── Financial Transactions ───────────────────────────────────────────────────
const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  { id: 'tx1', date: '2025-10-05', clientName: 'Ana Clara Dias', description: 'Consulta inicial — Inventário', amount: 450, status: 'recebido', caseId: 'case1' },
  { id: 'tx2', date: '2025-10-18', clientName: 'Roberto Martins', description: 'Honorários — Fase instrução', amount: 1800, status: 'recebido', caseId: 'case2' },
  { id: 'tx3', date: '2025-11-02', clientName: 'Sofia Pereira', description: 'Consulta preventiva', amount: 380, status: 'pendente' },
  { id: 'tx4', date: '2025-11-15', clientName: 'Lucas Ferreira', description: 'Honorários — Acordo trabalhista', amount: 3200, status: 'recebido' },
  { id: 'tx5', date: '2025-12-01', clientName: 'Mariana Costa', description: 'Honorários mensais', amount: 900, status: 'pendente' },
  { id: 'tx6', date: '2025-12-20', clientName: 'Pedro Almeida', description: 'Honorários — Partilha', amount: 2500, status: 'inadimplente' },
  { id: 'tx7', date: '2026-01-10', clientName: 'Ana Clara Dias', description: 'Honorários — Homologação', amount: 1200, status: 'recebido', caseId: 'case1' },
  { id: 'tx8', date: '2026-02-05', clientName: 'Carlos Souza', description: 'Consulta emergencial', amount: 600, status: 'recebido' },
  { id: 'tx9', date: '2026-03-12', clientName: 'Julia Ramos', description: 'Honorários mensais', amount: 1100, status: 'pendente' },
  { id: 'tx10', date: '2026-03-28', clientName: 'Roberto Martins', description: 'Custas processuais', amount: 450, status: 'recebido', caseId: 'case2' },
];

export const dbFinancial = {
  getAll(lawyerId?: number): FinancialTransaction[] {
    const stored = load<FinancialTransaction[]>(KEYS.financialTx, []);
    if (stored.length === 0) {
      save(KEYS.financialTx, MOCK_TRANSACTIONS);
      return MOCK_TRANSACTIONS;
    }
    return stored;
    // NUVEM STUB: return await firestore.collection('transactions').where('lawyerId','==',lawyerId).get();
  },
  update(id: string, changes: Partial<FinancialTransaction>): void {
    const all = dbFinancial.getAll();
    save(KEYS.financialTx, all.map(t => t.id === id ? { ...t, ...changes } : t));
  },
};
