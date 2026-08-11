/**
 * tests/unit/legisMultiAgentEngine.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — MULTI-AGENT & RAG TEST SUITE
 * Testes unitários para a Base de Conhecimento RAG e os 4 Agentes Autônomos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { legalRagKnowledgeBase } from '../../lib/legalRagKnowledgeBase';
import { legisMultiAgentEngine, type AgentRole } from '../../services/legisMultiAgentEngine';

export interface AiTestResult {
  suite: string;
  testName: string;
  passed: boolean;
  details: string;
}

export async function runLegisMultiAgentEngineTests(): Promise<{
  passed: boolean;
  total: number;
  results: AiTestResult[];
}> {
  const results: AiTestResult[] = [];

  // TEST 1: RAG Knowledge Base — Busca semântica por CPC Art. 219 (Prazos)
  (() => {
    const searchRes = legalRagKnowledgeBase.search('contagem de prazos em dias uteis cpc', 3);
    const hasArt219 = searchRes.some(r => r.article.id === 'cpc_art_219');
    const hasScore = searchRes.length > 0 && searchRes[0].relevanceScore > 0;

    const passed = hasArt219 && hasScore;
    results.push({
      suite: 'RAG KnowledgeBase',
      testName: 'Busca semântica por prazos no CPC (Art. 219)',
      passed,
      details: `found:${searchRes.length}, topScore:${searchRes[0]?.relevanceScore ?? 0}`,
    });
  })();

  // TEST 2: RAG Knowledge Base — Busca por Direitos do Titular LGPD (Art. 18)
  (() => {
    const searchRes = legalRagKnowledgeBase.search('direitos do titular eliminacao dados lgpd', 3);
    const hasLgpd = searchRes.some(r => r.article.id === 'lgpd_art_18');

    const passed = hasLgpd;
    results.push({
      suite: 'RAG KnowledgeBase',
      testName: 'Busca semântica por Direitos do Titular na LGPD (Art. 18)',
      passed,
      details: `foundLgpd:${hasLgpd}`,
    });
  })();

  // TEST 3: Multi-Agent Engine — Execução do Agente Analista (analyst)
  await (async () => {
    const response = await legisMultiAgentEngine.executeAgent({
      agentRole: 'analyst',
      prompt: 'Analise o risco de uma ação trabalhista por horas extras acumuladas',
      useRag: true,
    });

    const passed = Boolean(response.content.length > 0 && response.agentRole === 'analyst' && response.executionTimeMs >= 0);
    results.push({
      suite: 'MultiAgentEngine',
      testName: 'Execução do Agente Analista com injeção RAG',
      passed,
      details: `agent:${response.agentName}, time:${response.executionTimeMs}ms, ragUsed:${response.ragContextUsed?.length ?? 0}`,
    });
  })();

  // TEST 4: Multi-Agent Engine — Execução dos 4 Agentes (analyst, researcher, draftsman, auditor)
  await (async () => {
    const roles: AgentRole[] = ['analyst', 'researcher', 'draftsman', 'auditor'];
    let allOk = true;

    for (const role of roles) {
      const res = await legisMultiAgentEngine.executeAgent({
        agentRole: role,
        prompt: 'Solicitação de teste E2E para validação de agente',
        useRag: true,
      });
      if (!res.content || res.agentRole !== role) {
        allOk = false;
      }
    }

    results.push({
      suite: 'MultiAgentEngine',
      testName: 'Validação de execução dos 4 Agentes Especializados',
      passed: allOk,
      details: `executedRoles: ${roles.join(', ')}`,
    });
  })();

  const allPassed = results.every(r => r.passed);
  return {
    passed: allPassed,
    total: results.length,
    results,
  };
}
