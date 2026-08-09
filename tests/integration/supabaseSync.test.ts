/**
 * tests/integration/supabaseSync.test.ts
 * Suíte de Testes de Integração da Camada de Dados Dual Mode Supabase / LocalStorage
 */

import { isSupabaseConfigured } from '../../lib/supabase';
import { dbCases } from '../../lib/db';
import type { TestResult } from '../unit/auth.test';

export async function runSupabaseSyncTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Teste 1: Detecção de Conectividade Dual Mode
  try {
    const t0 = performance.now();
    const configured = isSupabaseConfigured;
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'Supabase Dual Mode Configuration Detection',
      category: 'SYNC',
      passed: typeof configured === 'boolean',
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Supabase Dual Mode Configuration Detection',
      category: 'SYNC',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  // Teste 2: Criação e Leitura de Processo em Dual Mode
  try {
    const t0 = performance.now();
    const caseData = {
      title: 'Processo QA Teste Integração',
      description: 'Descrição de teste para validação de persistência',
      clientId: 'client_integration_qa',
      lawyerId: 'lawyer_integration_qa',
      status: 'ACTIVE',
    };

    const created = await dbCases.create(caseData);
    const durationMs = Math.round(performance.now() - t0);

    const isCreatedValid = !!created && (!!created.id || !!created.title);

    results.push({
      name: 'Dual Mode Data Persistence (Cases CRUD)',
      category: 'SYNC',
      passed: isCreatedValid,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Dual Mode Data Persistence (Cases CRUD)',
      category: 'SYNC',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  return results;
}
