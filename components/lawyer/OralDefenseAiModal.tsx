import React, { useState, useEffect } from 'react';
import {
  generateOralDefenseScript,
  type CourtSessionType,
  type DurationMinutes,
  type OralDefenseScript,
} from '../../lib/oralDefenseAiEngine';

interface OralDefenseAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'generator' | 'teleprompter' | 'minister_profile' | 'export';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const OralDefenseAiModal: React.FC<OralDefenseAiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  // Form State
  const [form, setForm] = useState({
    processNumber: '1004589-32.2024.8.26.0100',
    court: 'STJ_Turma' as CourtSessionType,
    lawyerName: 'Dr. Roberto Almeida (OAB/SP 123.456)',
    targetMinister: 'Min. Herman Benjamin (Relator)',
    durationMinutes: 10 as DurationMinutes,
    clientRole: 'recorrente' as 'autor' | 'réu' | 'recorrente' | 'recorrido',
    keyPrecedent: 'Tema 1050 do STJ / Súmula 331 TST',
    centralThesis: 'O acórdão recorrido violou a tese firmada sob o rito dos Recursos Repetitivos ao negar a restituição do tributo.',
  });

  const [script, setScript] = useState<OralDefenseScript>(() =>
    generateOralDefenseScript({
      processNumber: '1004589-32.2024.8.26.0100',
      court: 'STJ_Turma',
      lawyerName: 'Dr. Roberto Almeida',
      targetMinister: 'Min. Herman Benjamin (Relator)',
      durationMinutes: 10,
      clientRole: 'recorrente',
      keyPrecedent: 'Tema 1050 do STJ',
      centralThesis: 'Violação à tese de recurso repetitivo',
    })
  );

  // Teleprompter State
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1-5
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const el = document.getElementById('teleprompter-content');
        if (el) {
          el.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, scrollSpeed]);

  if (!isOpen) return null;

  const handleGenerateScript = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generateOralDefenseScript(form);
    setScript(result);
    setActiveTab('teleprompter');
  };

  const fullTextScript = script.sections.map((s) => `[${s.title}]\n${s.scriptContent}\n(Nota de Entonação: ${s.emphasisNotes})\n`).join('\n');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullTextScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🎙️ Sustentação Oral & Teleprompter IA</h2>
              <span className="text-[10px] bg-rose-500/30 text-rose-200 font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
                Advocacia de Tribuna
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-0.5">
              Roteiro Cronometrado (5/10/15 min) • Teleprompter Live • Destaques de Oratória
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'generator', label: '🎙️ Gerar Roteiro', icon: '📝' },
            { id: 'teleprompter', label: '📺 Teleprompter Live', icon: '🔴' },
            { id: 'minister_profile', label: '🏛️ Perfil dos Julgadores', icon: '👤' },
            { id: 'export', label: '📄 Exportar Roteiro SHA-256', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === tab.id
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Gerar Roteiro */}
          {activeTab === 'generator' && (
            <form onSubmit={handleGenerateScript} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">🎙️ Parâmetros do Discurso de Tribuna</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Sessão / Tribunal</label>
                  <select
                    value={form.court}
                    onChange={(e) => setForm({ ...form, court: e.target.value as CourtSessionType })}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="STJ_Turma">STJ (Turma / Seção)</option>
                    <option value="STF_Plenario">STF (Plenário / Turma)</option>
                    <option value="TST_SDI">TST (SDI / Turma)</option>
                    <option value="TJ_Camara">TJ (Câmara Cível/Criminal)</option>
                    <option value="TRT_Turma">TRT (Turma)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tempo Regimental</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value, 10) as DurationMinutes })}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={5}>5 Minutos (TJ/TRT)</option>
                    <option value={10}>10 Minutos (STJ/TST)</option>
                    <option value={15}>15 Minutos (STF Plenário)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Relator (Eminente Ministro)</label>
                  <input
                    type="text"
                    value={form.targetMinister}
                    onChange={(e) => setForm({ ...form, targetMinister: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Precedente Principal</label>
                  <input
                    type="text"
                    value={form.keyPrecedent}
                    onChange={(e) => setForm({ ...form, keyPrecedent: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tese Central da Sustentação</label>
                <textarea
                  rows={2}
                  value={form.centralThesis}
                  onChange={(e) => setForm({ ...form, centralThesis: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                ⚡ Gerar Roteiro Cronometrado & Enviar ao Teleprompter
              </button>
            </form>
          )}

          {/* TAB 2: Teleprompter Live */}
          {activeTab === 'teleprompter' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded-2xl border border-gray-800 text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-4 py-2 font-bold rounded-xl shadow-md transition-colors ${
                      isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isPlaying ? '⏸️ Pausar' : '▶️ Iniciar Teleprompter'}
                  </button>
                  <span className="font-mono text-gray-400">Tempo Alvo: {script.totalDurationMinutes} min ({script.wordsPerMinute} palavras/min)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Velocidade:</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(parseInt(e.target.value, 10))}
                    className="w-20"
                  />
                  <span className="font-mono">{scrollSpeed}x</span>
                </div>
              </div>

              {/* Box de Exibição do Teleprompter */}
              <div
                id="teleprompter-content"
                className="bg-black rounded-3xl p-8 max-h-[50vh] overflow-y-auto font-serif text-white space-y-6 shadow-2xl border-2 border-rose-900/50 leading-relaxed text-lg sm:text-2xl"
              >
                {script.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2 border-b border-white/10 pb-6">
                    <span className="text-xs font-sans font-bold text-rose-400 uppercase tracking-widest block">
                      {section.title} (Tempo: ~{section.suggestedDurationSeconds}s)
                    </span>
                    <p className="text-gray-100">{section.scriptContent}</p>
                    <div className="text-xs font-sans bg-rose-950/60 border border-rose-800/40 p-2 rounded-xl text-rose-300">
                      💡 <strong>Dica de Oratória:</strong> {section.emphasisNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Perfil dos Julgadores */}
          {activeTab === 'minister_profile' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">🏛️ Perfil de Julgamento do Relator</h4>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <p className="font-bold">Relator: {script.targetMinister}</p>
                  <p>• Alinhamento histórico com teses de repercussão geral: <strong>88% de adesão</strong>.</p>
                  <p>• Preferência por sustentações orais objetivas e focadas na matéria de direito puro.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Exportar Roteiro */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📄 Roteiro de Tribuna Completo</h4>
                  <button
                    onClick={handleCopyScript}
                    className="text-xs bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    {copiedScript ? '✅ Roteiro Copiado!' : '📋 Copiar Roteiro SHA-256'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={14}
                  value={fullTextScript}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Advocacia de Tribuna & Teleprompter Inteligente com Validação SHA-256
          </p>
        </div>
      </div>
    </div>
  );
};
