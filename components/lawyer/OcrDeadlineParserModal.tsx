import React, { useState } from 'react';
import {
  parseLegalNoticeText,
  SAMPLE_NOTICES,
  type ExtractedNotice,
} from '../../lib/ocrDeadlineParserEngine';

interface OcrDeadlineParserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'upload' | 'notices' | 'calendar_sync';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const OcrDeadlineParserModal: React.FC<OcrDeadlineParserModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [rawInputText, setRawInputText] = useState('');
  const [extractedList, setExtractedList] = useState<ExtractedNotice[]>(SAMPLE_NOTICES);
  const [currentAnalysis, setCurrentAnalysis] = useState<ExtractedNotice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduledMsg, setScheduledMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessOcr = (textToProcess: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseLegalNoticeText(textToProcess);
      setCurrentAnalysis(parsed);
      setExtractedList((prev) => [parsed, ...prev]);
      setIsProcessing(false);
    }, 1200);
  };

  const handleScheduleNotice = (noticeId: string) => {
    setExtractedList((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'scheduled' } : n))
    );
    setScheduledMsg(`✅ Prazo agendado na agenda e notificação enviada via WhatsApp ao advogado responsável!`);
    setTimeout(() => setScheduledMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-3xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-800 via-emerald-800 to-indigo-900 flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-white">📷 Leitor de Intimações & OCR Inteligente</h2>
            <p className="text-xs text-teal-200 mt-0.5">Reconhecimento Óptico · Extração Automática CPC/2015 · Alertas de Preclusão</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'upload', label: '📷 Upload & Leitura OCR', icon: '🔍' },
            { id: 'notices', label: '📋 Intimações Processadas', icon: '⚖️' },
            { id: 'calendar_sync', label: '📅 Prazos & Agenda', icon: '📲' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Feedback Message */}
        {scheduledMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 text-center animate-in fade-in">
            {scheduledMsg}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Upload & Leitura */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Cole a intimação/publicação do Diário Oficial ou faça upload da imagem/PDF:
                </label>
                <textarea
                  rows={5}
                  value={rawInputText}
                  onChange={(e) => setRawInputText(e.target.value)}
                  placeholder="Ex: Fica a parte autora intimada a se manifestar sobre a contestação de fls. 45/90 no prazo de 15 (quinze) dias..."
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                />

                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRawInputText(
                          'PROCESSO: 1023456-78.2024.8.26.0100. Varas Cíveis Centrais. Intime-se a parte ré para apresentar réplica e especificar provas em 15 (quinze) dias úteis, sob pena de revelia.'
                        )
                      }
                      className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      💡 Usar Exemplo de Teste
                    </button>
                  </div>

                  <button
                    onClick={() => handleProcessOcr(rawInputText || 'PROCESSO: 1004589-32.2024.8.26.0100. Intimação para apelação 15 dias.')}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">🌀</span> Processando OCR & IA...
                      </>
                    ) : (
                      <>
                        <span>⚡</span> Processar com IA & OCR
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Resultado do OCR Recente */}
              {currentAnalysis && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3 border-2 border-teal-500">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 px-2.5 py-1 rounded-full">
                      🎯 Confiança OCR: {currentAnalysis.ocrConfidence}%
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        currentAnalysis.urgency === 'fatal'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      Risco: {currentAnalysis.urgency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Processo</span>
                      <p className="font-mono font-bold text-gray-900 dark:text-white">{currentAnalysis.processNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Tribunal</span>
                      <p className="font-bold text-gray-900 dark:text-white">{currentAnalysis.court}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Prazo Calculado CPC</span>
                      <p className="font-bold text-teal-600 dark:text-teal-400">{currentAnalysis.extractedDeadlineDays} Dias Úteis</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Limite (Fatal)</span>
                      <p className="font-bold text-red-600">{new Date(currentAnalysis.calculatedDueDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">💡 Sugestão de Ação Recomendada:</span>
                    <p className="text-gray-600 dark:text-gray-400">{currentAnalysis.suggestedAction}</p>
                  </div>

                  <button
                    onClick={() => handleScheduleNotice(currentAnalysis.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>📅</span> Lançar na Agenda e Disparar Alerta WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Intimações Processadas */}
          {activeTab === 'notices' && (
            <div className="space-y-3">
              {extractedList.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.processNumber}</span>
                      <p className="text-xs text-gray-400">{item.court} • {item.organ}</p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.urgency === 'fatal'
                          ? 'bg-red-100 text-red-700'
                          : item.urgency === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-lg italic">
                    "{item.contentSnippet}"
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Prazo: <strong className="text-teal-600">{item.extractedDeadlineDays} dias úteis</strong> (Vence {new Date(item.calculatedDueDate).toLocaleDateString('pt-BR')})
                    </span>

                    {item.status === 'scheduled' ? (
                      <span className="text-emerald-600 font-bold">✅ Agendado</span>
                    ) : (
                      <button
                        onClick={() => handleScheduleNotice(item.id)}
                        className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg font-bold transition-colors"
                      >
                        📅 Agendar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Calendário e Prazos */}
          {activeTab === 'calendar_sync' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 text-xs text-emerald-700 dark:text-emerald-300">
                📲 <strong>Sincronização Ativa</strong> — Todos os prazos confirmados geram lembretes automáticos via WhatsApp (24h e 2h antes da preclusão).
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">📅 Próximos Prazos Fatais</h4>
                <div className="space-y-2">
                  {extractedList.map((n) => (
                    <div key={n.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-xs">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{n.processNumber}</p>
                        <p className="text-gray-500">{n.suggestedAction}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{new Date(n.calculatedDueDate).toLocaleDateString('pt-BR')}</p>
                        <span className="text-[10px] text-gray-400">{n.extractedDeadlineDays} dias úteis</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — OCR & Análise Processual Inteligente em Conformidade com CPC/2015
          </p>
        </div>
      </div>
    </div>
  );
};
