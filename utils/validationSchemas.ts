/**
 * validationSchemas.ts — ISS-050
 *
 * Esquemas de validação para todos os formulários da plataforma.
 * Implementação em TypeScript puro (sem dependência Zod) para manter
 * o bundle enxuto. API inspirada em Zod para facilitar migração futura.
 *
 * Padrão:
 *   validate(schema, data) → { ok: true } | { ok: false; errors: Record<string, string> }
 */

// ── Tipos base ────────────────────────────────────────────────────────────────

export type ValidationRule<T> = (value: T, data?: Record<string, unknown>) => string | null;

export type SchemaField<T> = {
  rules: ValidationRule<T>[];
  label: string;
};

export type Schema = Record<string, SchemaField<unknown>>;

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> };

// ── Regras reutilizáveis ──────────────────────────────────────────────────────

export const rules = {
  required: (label = 'Campo'): ValidationRule<unknown> =>
    (v) => (!v && v !== 0 ? `${label} é obrigatório.` : null),

  minLength: (min: number): ValidationRule<string> =>
    (v) => (typeof v === 'string' && v.length < min ? `Mínimo ${min} caracteres.` : null),

  maxLength: (max: number): ValidationRule<string> =>
    (v) => (typeof v === 'string' && v.length > max ? `Máximo ${max} caracteres.` : null),

  email: (): ValidationRule<string> =>
    (v) => (typeof v === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'E-mail inválido.' : null),

  cpf: (): ValidationRule<string> =>
    (v) => {
      if (typeof v !== 'string') return null;
      const d = v.replace(/\D/g, '');
      if (d.length !== 11 || /^(\d)\1+$/.test(d)) return 'CPF inválido.';
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
      let r = (sum * 10) % 11;
      if (r === 10 || r === 11) r = 0;
      if (r !== parseInt(d[9])) return 'CPF inválido.';
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
      r = (sum * 10) % 11;
      if (r === 10 || r === 11) r = 0;
      if (r !== parseInt(d[10])) return 'CPF inválido.';
      return null;
    },

  oab: (): ValidationRule<string> =>
    (v) => (typeof v === 'string' && !/^\d{4,7}\/[A-Z]{2}$/i.test(v.trim()) ? 'OAB inválida (ex: 123456/SP).' : null),

  phone: (): ValidationRule<string> =>
    (v) => (typeof v === 'string' && v.replace(/\D/g, '').length < 10 ? 'Telefone inválido.' : null),

  cep: (): ValidationRule<string> =>
    (v) => (typeof v === 'string' && v.replace(/\D/g, '').length !== 8 ? 'CEP inválido.' : null),

  url: (): ValidationRule<string> =>
    (v) => {
      if (!v || typeof v !== 'string') return null;
      try { new URL(v); return null; } catch { return 'URL inválida.'; }
    },

  match: (field: string, fieldLabel: string): ValidationRule<string> =>
    (v, data) => (data && v !== data[field] ? `Deve ser igual a ${fieldLabel}.` : null),

  positiveNumber: (): ValidationRule<number> =>
    (v) => (typeof v === 'number' && v <= 0 ? 'Deve ser um número positivo.' : null),

  minValue: (min: number): ValidationRule<number> =>
    (v) => (typeof v === 'number' && v < min ? `Valor mínimo: ${min}.` : null),
};

// ── Executor de validação ─────────────────────────────────────────────────────

export function validate(
  schema: Schema,
  data: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, def] of Object.entries(schema)) {
    const value = data[field];
    for (const rule of def.rules) {
      const error = rule(value as never, data);
      if (error) {
        errors[field] = error;
        break; // primeira falha por campo
      }
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

// ── Schemas prontos da plataforma ─────────────────────────────────────────────

/** Cadastro de cliente */
export const clientSignupSchema: Schema = {
  name:     { label: 'Nome',     rules: [rules.required('Nome'),     rules.minLength(3)] },
  email:    { label: 'E-mail',   rules: [rules.required('E-mail'),   rules.email()] },
  cpf:      { label: 'CPF',      rules: [rules.required('CPF'),      rules.cpf()] },
  phone:    { label: 'Telefone', rules: [rules.required('Telefone'), rules.phone()] },
  password: { label: 'Senha',    rules: [rules.required('Senha'),    rules.minLength(8)] },
};

/** Cadastro de advogado */
export const lawyerSignupSchema: Schema = {
  name:        { label: 'Nome',          rules: [rules.required('Nome'),          rules.minLength(3)] },
  email:       { label: 'E-mail',        rules: [rules.required('E-mail'),        rules.email()] },
  oabNumber:   { label: 'Nº OAB',        rules: [rules.required('Nº OAB'),        rules.oab()] },
  phone:       { label: 'Telefone',      rules: [rules.required('Telefone'),      rules.phone()] },
  password:    { label: 'Senha',         rules: [rules.required('Senha'),         rules.minLength(8)] },
  specialty:   { label: 'Especialidade', rules: [rules.required('Especialidade')] },
};

/** Cadastro de estagiário */
export const internSignupSchema: Schema = {
  name:         { label: 'Nome',               rules: [rules.required('Nome'),               rules.minLength(3)] },
  email:        { label: 'E-mail',             rules: [rules.required('E-mail'),             rules.email()] },
  cpf:          { label: 'CPF',                rules: [rules.required('CPF'),                rules.cpf()] },
  institution:  { label: 'Instituição de Ensino', rules: [rules.required('Instituição de Ensino')] },
  password:     { label: 'Senha',              rules: [rules.required('Senha'),              rules.minLength(8)] },
};

/** Login genérico */
export const loginSchema: Schema = {
  email:    { label: 'E-mail', rules: [rules.required('E-mail'), rules.email()] },
  password: { label: 'Senha',  rules: [rules.required('Senha'),  rules.minLength(4)] },
};

/** Criação de serviço no Admin */
export const serviceSchema: Schema = {
  name:        { label: 'Nome do serviço', rules: [rules.required('Nome do serviço'), rules.minLength(3)] },
  description: { label: 'Descrição',       rules: [rules.required('Descrição'),       rules.minLength(10)] },
  price:       { label: 'Preço',           rules: [rules.required('Preço'),           rules.positiveNumber()] },
};

/** Criação de pacote de planos no Admin */
export const planPackageSchema: Schema = {
  name:  { label: 'Nome do plano', rules: [rules.required('Nome do plano'), rules.minLength(3)] },
  price: { label: 'Preço',         rules: [rules.required('Preço'),         rules.positiveNumber()] },
  role:  { label: 'Perfil',        rules: [rules.required('Perfil')] },
};
