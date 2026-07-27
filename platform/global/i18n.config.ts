/**
 * Legis Connect — Enterprise Internationalization (i18n) Framework
 * Especificação e Utilitários de Internacionalização e Moedas
 * Padrão: Internationalization Architecture (Prompt 230 - Etapa 8)
 */

export const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-LA', 'fr-FR', 'de-DE', 'zh-CN'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export function formatCurrency(amount: number, locale: SupportedLocale, currency: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(date: Date, locale: SupportedLocale, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone,
  }).format(date);
}

export function getLegalTerm(termKey: string, locale: SupportedLocale): string {
  const dictionary: Record<SupportedLocale, Record<string, string>> = {
    'pt-BR': { case: 'Processo Judicial', lawyer: 'Advogado', court: 'Tribunal' },
    'en-US': { case: 'Lawsuit', lawyer: 'Attorney at Law', court: 'District Court' },
    'es-LA': { case: 'Juicio', lawyer: 'Abogado', court: 'Juzgado' },
    'fr-FR': { case: 'Procès', lawyer: 'Avocat', court: 'Tribunal' },
    'de-DE': { case: 'Rechtsstreit', lawyer: 'Rechtsanwalt', court: 'Gericht' },
    'zh-CN': { case: '诉讼案件', lawyer: '律师', court: '法院' },
  };

  return dictionary[locale]?.[termKey] || termKey;
}
