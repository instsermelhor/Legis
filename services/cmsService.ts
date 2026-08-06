/**
 * cmsService.ts — ISS-013
 *
 * Serviço CMS (Content Management System) do site institucional.
 * SINGLE SOURCE OF TRUTH: todo o conteúdo exibido no site público
 * tem origem, gestão, versionamento e controlo no Painel Administrativo.
 *
 * Modelo de dados CMS:
 *  - hero: Banner principal
 *  - stats: Estatísticas dinâmicas (advogados, clientes, casos)
 *  - about: Seção Sobre
 *  - contact: Dados de contacto e redes sociais
 *  - seo: Metadados de SEO por página
 *
 * Persiste em localStorage para o MVP.
 * Migrar para Supabase tabela `cms_content` (Sprint 5).
 */

const STORAGE_KEY = 'legis_cms_content';
const SCHEMA_VERSION = 1;

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface CmsHero {
  headline: string;
  subheadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryTarget: string; // view name ou URL externo
  ctaSecondaryLabel: string;
  ctaSecondaryTarget: string;
  badgeText: string;
}

export interface CmsStat {
  id: string;
  label: string;
  /** Valor fixo (override manual). Se null, usa valor calculado dinamicamente. */
  valueOverride: number | null;
  suffix: string; // ex: "+", "%", ""
  icon: string;   // emoji ou nome de ícone
}

export interface CmsAbout {
  title: string;
  body: string; // texto rico (HTML seguro via DOMPurify)
  imageAlt: string;
}

export interface CmsContact {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  address: string;
}

export interface CmsSeoPage {
  id: string; // ex: 'landing', 'for-lawyers', 'search'
  title: string;
  description: string;
  keywords: string;
}

export interface CmsContent {
  _version: number;
  _updatedAt: string;
  _updatedBy: string;
  hero: CmsHero;
  stats: CmsStat[];
  about: CmsAbout;
  contact: CmsContact;
  seo: CmsSeoPage[];
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_CMS: CmsContent = {
  _version: SCHEMA_VERSION,
  _updatedAt: new Date().toISOString(),
  _updatedBy: 'system',
  hero: {
    headline: 'Conectando Clientes a Advogados de Confiança',
    subheadline: 'Encontre o profissional jurídico ideal para o seu caso com rapidez, segurança e transparência.',
    ctaPrimaryLabel: 'Encontrar Advogado',
    ctaPrimaryTarget: 'search',
    ctaSecondaryLabel: 'Sou Advogado',
    ctaSecondaryTarget: 'forLawyers',
    badgeText: '🏛️ Plataforma Jurídica Certificada OAB',
  },
  stats: [
    { id: 'lawyers',     label: 'Advogados',          valueOverride: null, suffix: '+', icon: '⚖️' },
    { id: 'clients',     label: 'Clientes Atendidos', valueOverride: null, suffix: '+', icon: '👥' },
    { id: 'cases',       label: 'Casos Resolvidos',   valueOverride: null, suffix: '+', icon: '✅' },
    { id: 'satisfaction',label: 'Satisfação',          valueOverride: 98,  suffix: '%', icon: '⭐' },
  ],
  about: {
    title: 'Sobre a Legis Connect',
    body: '<p>A Legis Connect é uma plataforma jurídica digital que une clientes a advogados qualificados e devidamente registados na OAB.</p>',
    imageAlt: 'Equipa Legis Connect',
  },
  contact: {
    email: 'contato@legisconnect.com.br',
    phone: '',
    whatsapp: '',
    instagram: '',
    linkedin: '',
    address: 'Brasil',
  },
  seo: [
    {
      id: 'landing',
      title: 'Legis Connect — Plataforma Jurídica Online',
      description: 'Encontre advogados qualificados, agende consultas e resolva seus problemas jurídicos com segurança.',
      keywords: 'advogado, consultoria jurídica, OAB, processo, direito',
    },
    {
      id: 'forLawyers',
      title: 'Para Advogados — Legis Connect',
      description: 'Expanda sua carteira de clientes com a Legis Connect. Gestão integrada de agenda, casos e finanças.',
      keywords: 'advogado, cadastro OAB, captação de clientes, gestão jurídica',
    },
    {
      id: 'search',
      title: 'Encontrar Advogado — Legis Connect',
      description: 'Pesquise advogados por área de atuação, localização e avaliação. Consulta online disponível.',
      keywords: 'encontrar advogado, busca advogado, área jurídica',
    },
  ],
};

// ── Service ───────────────────────────────────────────────────────────────────

/** Carrega o conteúdo CMS (localStorage → default) */
export function getCmsContent(): CmsContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CMS;
    const parsed = JSON.parse(raw) as CmsContent;
    // Migração de schema: se versão antiga, merge com defaults
    if (!parsed._version || parsed._version < SCHEMA_VERSION) {
      return { ...DEFAULT_CMS, ...parsed, _version: SCHEMA_VERSION };
    }
    return parsed;
  } catch {
    return DEFAULT_CMS;
  }
}

/** Persiste o conteúdo CMS com auditoria de quem alterou */
export function saveCmsContent(
  updates: Partial<Omit<CmsContent, '_version' | '_updatedAt' | '_updatedBy'>>,
  actorId: string,
): CmsContent {
  const current = getCmsContent();
  const next: CmsContent = {
    ...current,
    ...updates,
    _version: SCHEMA_VERSION,
    _updatedAt: new Date().toISOString(),
    _updatedBy: actorId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Repõe os valores padrão do CMS */
export function resetCmsContent(actorId: string): CmsContent {
  const reset: CmsContent = {
    ...DEFAULT_CMS,
    _updatedAt: new Date().toISOString(),
    _updatedBy: actorId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
  return reset;
}

/** Actualiza apenas uma stat pelo id */
export function updateCmsStat(
  statId: string,
  valueOverride: number | null,
  actorId: string,
): CmsContent {
  const current = getCmsContent();
  const stats = current.stats.map((s) =>
    s.id === statId ? { ...s, valueOverride } : s,
  );
  return saveCmsContent({ stats }, actorId);
}
