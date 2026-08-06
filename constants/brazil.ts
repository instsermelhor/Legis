/**
 * constants/brazil.ts
 * Constantes geográficas do Brasil centralizadas.
 */

export const BRAZIL_STATES = [
  'Todos',
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type BrazilState = typeof BRAZIL_STATES[number];
