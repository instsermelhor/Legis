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
  contactEmail?: string;
  contactPhone?: string;
  customFields?: { id: string; key: string; value: string }[];
  dbType?: 'local' | 'cloud';
  dbCloudProvider?: 'firebase' | 'supabase';
  dbApiKey?: string;
  dbProjectUrl?: string;
  dbAuthDomain?: string;
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
  contactEmail: 'contato@legisconnect.com.br',
  contactPhone: '+55 11 948401620',
  customFields: [],
  dbType: 'local',
  dbCloudProvider: 'firebase',
  dbApiKey: '',
  dbProjectUrl: '',
  dbAuthDomain: '',
  updatedAt: new Date().toISOString(),
};

// ─── Local Storage Keys ───────────────────────────────────────────────────────
const KEYS = {
  config: 'legis_app_config',
  receivedDocs: 'legis_received_docs',
  financialTx: 'legis_financial_tx',
  legalDocs: 'legis_legal_docs',
  adminUsers: 'legis_admin_users',
  codes: 'legis_legal_codes',
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

// ─── Legal Codes ──────────────────────────────────────────────────────────────
export interface LegalCode {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  fileName?: string;
}

const DEFAULT_CODES: LegalCode[] = [
  { id: 'cc', title: 'Código Civil', content: 'Lei nº 10.406 de 10 de Janeiro de 2002...\n[Art. 1º] Toda pessoa é capaz de direitos e deveres na ordem civil.', lastUpdated: '2024-01-01' },
  { id: 'cp', title: 'Código Penal', content: 'Decreto-Lei nº 2.848 de 7 de Dezembro de 1940...\n[Art. 1º] Não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal.', lastUpdated: '2024-01-01' },
  { id: 'cpc', title: 'Código de Processo Civil', content: 'Lei nº 13.105 de 16 de Março de 2015...\n[Art. 1º] O processo civil será ordenado, disciplinado e interpretado conforme os valores e as normas fundamentais estabelecidos na Constituição da República Federativa do Brasil.', lastUpdated: '2024-01-01' },
  { id: 'cpp', title: 'Código de Processo Penal', content: 'Decreto-Lei nº 3.689 de 3 de Outubro de 1941...\n[Art. 1º] O processo penal reger-se-á, em todo o território brasileiro, por este Código, ressalvados os tratados e regras de direito internacional.', lastUpdated: '2024-01-01' },
  { id: 'clt', title: 'CLT', content: 'Decreto-Lei nº 5.452 de 1º de Maio de 1943...\n[Art. 1º] Esta Consolidação estatui as normas que regulam as relações individuais e coletivas de trabalho.', lastUpdated: '2024-01-01' },
  { id: 'ctn', title: 'Código Tributário Nacional', content: 'Lei nº 5.172 de 25 de Outubro de 1966...\n[Art. 1º] Este Código regula o sistema tributário nacional e estabelece normas gerais de direito tributário aplicáveis à União, Estados, Distrito Federal e Municípios.', lastUpdated: '2024-01-01' },
  { id: 'cdc', title: 'Código de Defesa do Consumidor', content: 'Lei nº 8.078 de 11 de Setembro de 1990...\n[Art. 1º] O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social.', lastUpdated: '2024-01-01' },
  { id: 'cf88', title: 'CF/88', content: 'Constituição da República Federativa do Brasil de 1988...\n[Art. 1º] A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito.', lastUpdated: '2024-01-01' },
  { id: 'eca', title: 'Estatuto da Criança e Adolescente', content: 'Lei nº 8.069 de 13 de Julho de 1990...\n[Art. 1º] Esta Lei dispõe sobre a proteção integral à criança e ao adolescente.', lastUpdated: '2024-01-01' },
  { id: 'ctb', title: 'Código de Trânsito Brasileiro', content: 'Lei nº 9.503 de 23 de Setembro de 1997...\n[Art. 1º] O trânsito de qualquer natureza nas vias terrestres do território nacional é regido por este Código.', lastUpdated: '2024-01-01' },
];

export const dbCodes = {
  getAll(): LegalCode[] {
    const stored = load<LegalCode[]>(KEYS.codes, []);
    if (stored.length === 0) {
      save(KEYS.codes, DEFAULT_CODES);
      return DEFAULT_CODES;
    }
    return stored;
  },
  saveAll(codes: LegalCode[]): void {
    save(KEYS.codes, codes);
  },
  update(id: string, content: string, fileName?: string): LegalCode[] {
    const all = this.getAll();
    const updated = all.map(c => c.id === id ? { ...c, content, fileName, lastUpdated: new Date().toISOString().split('T')[0] } : c);
    this.saveAll(updated);
    return updated;
  },
  reset(): LegalCode[] {
    save(KEYS.codes, DEFAULT_CODES);
    return DEFAULT_CODES;
  }
};
