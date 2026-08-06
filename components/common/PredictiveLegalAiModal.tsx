import React, { useState } from 'react';
import { analyzeCasePredictive, PredictiveAnalysisResult } from '../../lib/ragPredictiveAiEngine';

interface PredictiveLegalAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PredictiveLegalAiModal: React.FC<PredictiveLegalAiModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [caseType, setCaseType] = useState('Direito Civil / Consumidor');
  const [factsText, setFactsText] = useState('Cliente teve o nome negativado indevidamente por cobrança de serviço nunca contratado de empresa de telecomunicações. Exige declaração de inexistência de débito e danos morais.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveAnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factsText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeCasePredictive(caseType, factsText);
      setAnalysisResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simula captura de áudio ditado por 3 segundos
      setTimeout(() => {
        setFactsText(prev => prev + ' [Ditado via Áudio]: O autor tentou contato via SAC 4 vezes sem sucesso, requerendo a juntada dos protocolos de atendimento.');
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600/10 via-primary/10 to-indigo-600/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 6 — RAG & Análise Preditiva de Jurisprudência
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Assistente de Inteligência Preditiva STF / STJ (Gemini RAG)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Input Form */}
          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Área / Ramo do Direito
                </label>
                <select
                  value={caseType}
                  onChange={e => setCaseType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white"
                >
                  <option>Direito Civil / Consumidor</option>
                  <option>Direito Trabalhista</option>
                  <option>Direito Tributário</option>
                  <option>Direito Penal & Processual</option>
                  <option>Direito Imobiliário</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span>Resumo dos Fatos da Causa</span>
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    <span>🎙️</span>
                    <span>{isRecording ? 'Gravando Áudio (Ditando...)' : 'Ditar por Áudio'}</span>
                  </button>
                </label>
                <textarea
                  rows={3}
                  value={factsText}
                  onChange={e => setFactsText(e.target.value)}
                  placeholder="Descreva os fatos ou dite por voz para extração automática de teses..."
                  required
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-primary to-indigo-600 text-white font-extrabold rounded-xl text-xs hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>🤖</span>
              <span>{isAnalyzing ? 'Processando RAG & Buscando Precedentes...' : 'Executar Análise Preditiva & Buscar Precedentes STF/STJ'}</span>
            </button>
          </form>

          {/* Results Display */}
          {analysisResult && (
            <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-[#2A2545] animate-in fade-in duration-300">
              
              {/* Gauge & Probability Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-purple-500/10 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Score de Probabilidade de Vitória (IA RAG)
                  </span>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                    {analysisResult.probabilitySuccess}% <span className="text-sm font-semibold text-gray-500">de chance de procedência</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-xl">
                    {analysisResult.recommendedStrategy}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#1A1730] p-4 rounded-xl border border-gray-200 dark:border-[#2A2545] text-center min-w-[140px]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Nível de Risco</div>
                  <div className={`text-lg font-black mt-0.5 ${
                    analysisResult.riskLevel === 'Baixo' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {analysisResult.riskLevel}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">CPC Art. 927 Vinculante</div>
                </div>
              </div>

              {/* Binding Precedents List */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Precedentes Vinculantes Identificados (RAG Vector Search)</span>
                </h4>

                <div className="space-y-3">
                  {analysisResult.matchingPrecedents.map((p, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {p.court}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {p.number} ({p.type})
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {p.relevanceScore}% Relevância
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        "{p.thesis}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Key Arguments */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-purple-700 dark:text-purple-300">
                  💡 Teses & Argumentos Recomendados pela IA para a Petição:
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {analysisResult.keyArguments.map((arg, idx) => (
                    <li key={idx}>{arg}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
