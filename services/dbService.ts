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

// ─── Cloud Sync Helpers ───────────────────────────────────────────────────────
function toFirestoreValue(val: unknown): unknown {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { doubleValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (val && typeof val === 'object') {
    const fields: Record<string, unknown> = {};
    const obj = val as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      fields[k] = toFirestoreValue(obj[k]);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function fromFirestoreValue(val: unknown): unknown {
  if (!val) return null;
  const fv = val as Record<string, unknown>;
  if ('stringValue' in fv) return fv.stringValue;
  if ('booleanValue' in fv) return fv.booleanValue;
  if ('integerValue' in fv && typeof fv.integerValue === 'string') return parseInt(fv.integerValue, 10);
  if ('doubleValue' in fv) return fv.doubleValue;
  if ('arrayValue' in fv && fv.arrayValue && typeof fv.arrayValue === 'object') {
    const arr = fv.arrayValue as { values?: unknown[] };
    const values = arr.values || [];
    return values.map(fromFirestoreValue);
  }
  if ('mapValue' in fv && fv.mapValue && typeof fv.mapValue === 'object') {
    const mapVal = fv.mapValue as { fields?: Record<string, unknown> };
    const fields = mapVal.fields || {};
    const res: Record<string, unknown> = {};
    for (const k of Object.keys(fields)) {
      res[k] = fromFirestoreValue(fields[k]);
    }
    return res;
  }
  if ('nullValue' in fv) return null;
  return val;
}

export const dbCloud = {
  async testConnection(provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<boolean> {
    if (provider === 'firebase') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/__test_connection__?key=${apiKey}`;
        const res = await fetch(url);
        return res.status === 200 || res.status === 404;
      } catch {
        return false;
      }
    } else {
      try {
        const url = `${projectId}/rest/v1/`;
        const res = await fetch(url, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
          }
        });
        return res.status === 200 || res.status === 204;
      } catch {
        return false;
      }
    }
  },

  async saveDocument(collection: string, docId: string, data: Record<string, unknown>, provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<void> {
    if (provider === 'firebase') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
        const fields: Record<string, unknown> = {};
        for (const k of Object.keys(data)) {
          if (k === 'id') continue;
          fields[k] = toFirestoreValue(data[k]);
        }
        await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        });
      } catch (e) {
        console.warn(`[dbCloud] Failed to save document to Firebase: ${collection}/${docId}`, e);
      }
    } else {
      try {
        const url = `${projectId}/rest/v1/${collection}?id=eq.${docId}`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ id: docId, ...data })
        });
      } catch (e) {
        console.warn(`[dbCloud] Failed to save document to Supabase: ${collection}/${docId}`, e);
      }
    }
  },

  async getDocument<T>(collection: string, docId: string, provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<T | null> {
    if (provider === 'firebase') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
        const res = await fetch(url);
        if (res.status === 404) return null;
        const json = await res.json();
        if (json && json.fields) {
          const data = fromFirestoreValue({ mapValue: { fields: json.fields } });
          return { id: docId, ...data } as T;
        }
        return null;
      } catch (e) {
        console.warn(`[dbCloud] Failed to fetch document from Firebase: ${collection}/${docId}`, e);
        return null;
      }
    } else {
      try {
        const url = `${projectId}/rest/v1/${collection}?id=eq.${docId}&select=*`;
        const res = await fetch(url, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
          }
        });
        const list = await res.json();
        return list && list[0] ? (list[0] as T) : null;
      } catch (e) {
        console.warn(`[dbCloud] Failed to fetch document from Supabase: ${collection}/${docId}`, e);
        return null;
      }
    }
  },

  async deleteDocument(collection: string, docId: string, provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<void> {
    if (provider === 'firebase') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
        await fetch(url, { method: 'DELETE' });
      } catch (e) {
        console.warn(`[dbCloud] Failed to delete document from Firebase: ${collection}/${docId}`, e);
      }
    } else {
      try {
        const url = `${projectId}/rest/v1/${collection}?id=eq.${docId}`;
        await fetch(url, {
          method: 'DELETE',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
          }
        });
      } catch (e) {
        console.warn(`[dbCloud] Failed to delete document from Supabase: ${collection}/${docId}`, e);
      }
    }
  },

  async saveList(collection: string, list: Record<string, unknown>[], provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<void> {
    for (const item of list) {
      if (item && item.id) {
        await this.saveDocument(collection, String(item.id), item, provider, apiKey, projectId);
      }
    }
  },

  async getList<T>(collection: string, provider: 'firebase' | 'supabase', apiKey: string, projectId: string): Promise<T[] | null> {
    if (provider === 'firebase') {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`;
        const res = await fetch(url);
        if (res.status === 404) return null;
        const json = await res.json();
        if (json && json.documents) {
          interface FirestoreDoc {
            name: string;
            fields?: Record<string, unknown>;
          }
          return (json.documents as FirestoreDoc[]).map((doc) => {
            const docId = doc.name.split('/').pop();
            const data = fromFirestoreValue({ mapValue: { fields: doc.fields } });
            return { id: docId, ...(data as Record<string, unknown>) };
          }) as T[];
        }
        return null;
      } catch (e) {
        console.warn(`[dbCloud] Failed to fetch collection from Firebase: ${collection}`, e);
        return null;
      }
    } else {
      try {
        const url = `${projectId}/rest/v1/${collection}?select=*`;
        const res = await fetch(url, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`
          }
        });
        return (await res.json()) as T[];
      } catch (e) {
        console.warn(`[dbCloud] Failed to fetch collection from Supabase: ${collection}`, e);
        return null;
      }
    }
  }
};

// ─── App Config ───────────────────────────────────────────────────────────────
export const dbConfig = {
  get(): AppConfig {
    return load<AppConfig>(KEYS.config, DEFAULT_CONFIG);
  },
  set(config: Partial<AppConfig>): AppConfig {
    const current = dbConfig.get();
    const updated = { ...current, ...config, updatedAt: new Date().toISOString() };
    save(KEYS.config, updated);
    if (updated.dbType === 'cloud' && updated.dbProjectUrl && updated.dbApiKey) {
      dbCloud.saveDocument('config', 'app', updated, updated.dbCloudProvider || 'firebase', updated.dbApiKey, updated.dbProjectUrl);
    }
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
    const config = dbConfig.get();
    if (config.dbType === 'cloud' && config.dbProjectUrl && config.dbApiKey) {
      dbCloud.saveDocument('receivedDocs', doc.id, doc, config.dbCloudProvider || 'firebase', config.dbApiKey, config.dbProjectUrl);
    }
  },
  remove(id: string): void {
    const all = dbDocuments.getAll();
    save(KEYS.receivedDocs, all.filter(d => d.id !== id));
    const config = dbConfig.get();
    if (config.dbType === 'cloud' && config.dbProjectUrl && config.dbApiKey) {
      dbCloud.deleteDocument('receivedDocs', id, config.dbCloudProvider || 'firebase', config.dbApiKey, config.dbProjectUrl);
    }
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAll(lawyerId?: number): FinancialTransaction[] {
    const stored = load<FinancialTransaction[]>(KEYS.financialTx, []);
    if (stored.length === 0) {
      save(KEYS.financialTx, MOCK_TRANSACTIONS);
      return MOCK_TRANSACTIONS;
    }
    return stored;
  },
  update(id: string, changes: Partial<FinancialTransaction>): void {
    const all = dbFinancial.getAll();
    const updated = all.map(t => t.id === id ? { ...t, ...changes } : t);
    save(KEYS.financialTx, updated);
    const tx = updated.find(t => t.id === id);
    if (tx) {
      const config = dbConfig.get();
      if (config.dbType === 'cloud' && config.dbProjectUrl && config.dbApiKey) {
        dbCloud.saveDocument('financialTx', id, tx, config.dbCloudProvider || 'firebase', config.dbApiKey, config.dbProjectUrl);
      }
    }
  },
};

// ─── Legal Codes ──────────────────────────────────────────────────────────────
// ─── Legal Codes ──────────────────────────────────────────────────────────────
export interface CodeVersion {
  id: string;
  name: string;
  content: string;
  fileName?: string;
  fileDataUrl?: string; // base64 data url
  fileType?: 'pdf' | 'text';
  lastUpdated: string;
}

export interface LegalCode {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  fileName?: string;
  versions?: CodeVersion[];
  activeVersionId?: string;
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
    const codes = stored.length === 0 ? DEFAULT_CODES : stored;
    
    // Auto-migrate: ensure every code has versions array and activeVersionId
    let migrated = false;
    const updatedCodes = codes.map(c => {
      if (!c.versions || c.versions.length === 0) {
        migrated = true;
        const defaultVersion: CodeVersion = {
          id: `ver-default-${c.id}`,
          name: 'Versão Inicial',
          content: c.content,
          fileName: c.fileName,
          fileType: c.fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text',
          lastUpdated: c.lastUpdated
        };
        return {
          ...c,
          versions: [defaultVersion],
          activeVersionId: defaultVersion.id
        };
      }
      return c;
    });

    if (migrated || stored.length === 0) {
      save(KEYS.codes, updatedCodes);
      return updatedCodes;
    }
    return codes;
  },
  saveAll(codes: LegalCode[]): void {
    save(KEYS.codes, codes);
    const config = dbConfig.get();
    if (config.dbType === 'cloud' && config.dbProjectUrl && config.dbApiKey) {
      dbCloud.saveList('legalCodes', codes, config.dbCloudProvider || 'firebase', config.dbApiKey, config.dbProjectUrl);
    }
  },
  update(id: string, content: string, fileName?: string): LegalCode[] {
    const all = this.getAll();
    const updated = all.map(c => {
      if (c.id === id) {
        let versions = c.versions || [];
        const activeVerId = c.activeVersionId;
        if (activeVerId && versions.length > 0) {
          versions = versions.map(v => v.id === activeVerId ? { ...v, content, fileName, lastUpdated: new Date().toISOString().split('T')[0] } : v);
        }
        return {
          ...c,
          content,
          fileName,
          lastUpdated: new Date().toISOString().split('T')[0],
          versions
        };
      }
      return c;
    });
    this.saveAll(updated);
    return updated;
  },
  addVersion(codeId: string, versionName: string, content: string, fileName?: string, fileDataUrl?: string, fileType?: 'pdf' | 'text'): LegalCode[] {
    const all = this.getAll();
    const updated = all.map(c => {
      if (c.id === codeId) {
        const newVer: CodeVersion = {
          id: `ver-${Date.now()}`,
          name: versionName,
          content,
          fileName,
          fileDataUrl,
          fileType: fileType || (fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text'),
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        const versions = [...(c.versions || []), newVer];
        return {
          ...c,
          versions,
          activeVersionId: newVer.id,
          content: newVer.content,
          fileName: newVer.fileName,
          lastUpdated: newVer.lastUpdated
        };
      }
      return c;
    });
    this.saveAll(updated);
    return updated;
  },
  deleteVersion(codeId: string, versionId: string): LegalCode[] {
    const all = this.getAll();
    const updated = all.map(c => {
      if (c.id === codeId) {
        const versions = (c.versions || []).filter(v => v.id !== versionId);
        let activeId = c.activeVersionId;
        if (activeId === versionId) {
          activeId = versions[0]?.id || '';
        }
        const activeVer = versions.find(v => v.id === activeId);
        return {
          ...c,
          versions,
          activeVersionId: activeId,
          content: activeVer?.content || '',
          fileName: activeVer?.fileName || '',
          lastUpdated: activeVer?.lastUpdated || new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });
    this.saveAll(updated);
    return updated;
  },
  activateVersion(codeId: string, versionId: string): LegalCode[] {
    const all = this.getAll();
    const updated = all.map(c => {
      if (c.id === codeId) {
        const activeVer = (c.versions || []).find(v => v.id === versionId);
        if (activeVer) {
          return {
            ...c,
            activeVersionId: versionId,
            content: activeVer.content,
            fileName: activeVer.fileName,
            lastUpdated: activeVer.lastUpdated
          };
        }
      }
      return c;
    });
    this.saveAll(updated);
    return updated;
  },
  reset(): LegalCode[] {
    save(KEYS.codes, DEFAULT_CODES);
    return DEFAULT_CODES;
  }
};
