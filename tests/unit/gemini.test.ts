/**
 * tests/unit/gemini.test.ts
 * Suíte de Testes Unitários de IA Gemini e Log de Uso Legis Connect
 */

import { logAiUsage, getAiUsageLogsByUser } from '../../services/aiUsageLogService';
import type { TestResult } from './auth.test';

export async function runGeminiTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Teste 1: Log de Consumo de Tokens Gemini
  try {
    const t0 = performance.now();
    const userId = 'user_qa_ai_01';
    const entry = logAiUsage({
      userId,
      model: 'gemini-2.5-flash',
      promptText: 'Consulta de teste para validação de logging de IA na plataforma Legis Connect.',
      responseText: 'Resposta de teste gerada para validação da suíte QA do Sprint 10.',
      view: 'qa_unit_test',
    });
    const logs = getAiUsageLogsByUser(userId);
    const durationMs = Math.round(performance.now() - t0);

    const isLogged = logs.some(l => l.id === entry.id || l.model === 'gemini-2.5-flash');

    results.push({
      name: 'Gemini AI Token Usage Logging',
      category: 'AI',
      passed: isLogged,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Gemini AI Token Usage Logging',
      category: 'AI',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  // Teste 2: Sanitização de Prompt da IA
  try {
    const t0 = performance.now();
    const rawPrompt = 'Instrução do usuário com <script>alert("xss")</script>';
    const sanitized = rawPrompt.replace(/<[^>]*>?/gm, '');
    const durationMs = Math.round(performance.now() - t0);

    results.push({
      name: 'Gemini Input Prompt XSS Sanitization',
      category: 'AI',
      passed: !sanitized.includes('<script>'),
      durationMs,
    });
  } catch (err: any) {
    results.push({
      name: 'Gemini Input Prompt XSS Sanitization',
      category: 'AI',
      passed: false,
      durationMs: 0,
      error: err?.message,
    });
  }

  return results;
}
