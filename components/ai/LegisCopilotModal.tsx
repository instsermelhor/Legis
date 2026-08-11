/**
 * components/ai/LegisCopilotModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — LEGIS COPILOT MULTI-AGENT UI MODAL
 * Interface para advogados, estagiários e secretárias interagirem com
 * os 4 Agentes Autônomos de IA e executarem consultas RAG em tempo real.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { legisMultiAgentEngine, type AgentRole, type AgentResponse } from '../../services/legisMultiAgentEngine';

interface LegisCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
  initialRole?: AgentRole;
}

export const LegisCopilotModal: React.FC<LegisCopilotModalProps> = ({
  isOpen,
  onClose,
  defaultPrompt = '',
  initialRole = 'analyst',
}) => {
  const [selectedRole, setSelectedRole] = useState<AgentRole>(initialRole);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [caseContext, setCaseContext] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);

  if (!isOpen) return null;

  const agents = legisMultiAgentEngine.getAvailableAgents();

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await legisMultiAgentEngine.executeAgent({
        agentRole: selectedRole,
        prompt,
        context: caseContext,
        useRag,
      });
      setResponse(res);
    } catch (e) {
      alert('Erro ao executar agente de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      alert('Conteúdo copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#151226] rounded-3xl border border-gray-200 dark:border-[#252040] shadow-2xl overflow-hidden flex flex-col"
        data-testid="legis-copilot-modal"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Legis Copilot — Multi-Agente Jurídico
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono font-bold">
                  RAG Active
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assistentes autônomos com busca integrada na legislação pátria e jurisprudência.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Agent Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
          {agents.map((ag) => (
            <button
              key={ag.role}
              onClick={() => setSelectedRole(ag.role)}
              className={`p-3 text-left transition-colors border-b-2 flex flex-col justify-between ${
                selectedRole === ag.role
                  ? 'border-primary bg-primary/5 text-primary dark:text-white'
                  : 'border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-xs font-bold truncate">{ag.name}</span>
              <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{ag.description}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Solicitação / Objeto de Análise:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex.: Elabore uma petição de ação de alimentos com pedido liminar..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                data-testid="input-copilot-prompt"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRag}
                  onChange={(e) => setUseRag(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Ativar busca RAG de Legislação e Súmulas (CPC/CLT/LGPD/STF)
                </span>
              </label>

              <button
                onClick={handleExecute}
                disabled={isLoading || !prompt.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                data-testid="btn-execute-copilot"
              >
                {isLoading ? '⏳ Executando Agente...' : '🚀 Executar Agente'}
              </button>
            </div>
          </div>

          {/* Response Output */}
          {response && (
            <div className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{response.agentName}</span>
                  <span className="text-[10px] text-gray-400 font-mono">({response.executionTimeMs}ms)</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 rounded-lg text-xs font-semibold"
                >
                  📋 Copiar Texto
                </button>
              </div>

              {/* RAG Context Badges */}
              {response.ragContextUsed && response.ragContextUsed.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-400 block mb-1">📚 Fundamentação RAG Injetada:</span>
                  <div className="flex flex-wrap gap-1">
                    {response.ragContextUsed.map((r) => (
                      <span key={r.article.id} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-mono">
                        {r.article.articleOrSumula}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Body */}
              <div className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                {response.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
