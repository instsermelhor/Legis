/**
 * utils/formatters.ts
 * Utilitários padronizados de formatação (ISS-044)
 */

/** Formata valores numéricos para moeda brasileira (BRL) */
export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Formata número de CPF com máscara 000.000.000-00 (ISS-036) */
export function formatCPF(cpf: string | undefined | null): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/** Máscara de anonimização de CPF para exibição segura (Art. 46 LGPD - ISS-036) */
export function maskCPF(cpf: string | undefined | null): string {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

/** Formata data ISO ou string para formato brasileiro (DD/MM/AAAA) */
export function formatDateBR(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return dateString;
  }
}
