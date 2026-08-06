import React, { useState } from 'react';
import {
  MOCK_HEARINGS,
  generateHearingMinutes,
  type HearingSession,
  type TranscriptSnippet,
} from '../../lib/virtualHearingEngine';

interface VirtualHearingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'live_room' | 'transcription' | 'minutes' | 'scheduled';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const VirtualHearingModal: React.FC<VirtualHearingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('live_room');
  const [currentSession, setCurrentSession] = useState<HearingSession>(MOCK_HEARINGS[0]);
  const [transcripts, setTranscripts] = useState<TranscriptSnippet[]>(MOCK_HEARINGS[0].transcripts);
  const [newSimulatedText, setNewSimulatedText] = useState('');
  const [copiedMinutes, setCopiedMinutes] = useState(false);

  if (!isOpen) return null;

  const handleAddLiveTranscript = () => {
    if (!newSimulatedText.trim()) return;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newSnippet: TranscriptSnippet = {
      id: `TR-${Date.now()}`,
      speaker: { name: 'Dr. Roberto Almeida (Advogado)', role: 'advogado_autor' },
      timestamp: nowStr,
      text: newSimulatedText,
      flaggedAlert: newSimulatedText.toLowerCase().includes('acordo') || newSimulatedText.toLowerCase().includes('aceito'),
    };
    setTranscripts((prev) => [...prev, newSnippet]);
    setNewSimulatedText('');
  };

  const minutesText = generateHearingMinutes({ ...currentSession, transcripts });

  const handleCopyMinutes = () => {
    navigator.clipboard.writeText(minutesText);
    setCopiedMinutes(true);
    setTimeout(() => setCopiedMinutes(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-4xl bg-gray-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-900 via-rose-900 to-indigo-950 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">🎥 Audiência Virtual Live & Gravação IA</h2>
              <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] bg-rose-500/30 text-rose-200 font-bold px-2 py-0.5 rounded-full uppercase border border-rose-400/30">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-0.5">
              {currentSession.processNumber} • {currentSession.court} — {currentSession.organ}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {[
            { id: 'live_room', label: '🎥 Transmissão Ao Vivo', icon: '🔴' },
            { id: 'transcription', label: '🎙️ Transcrição por IA', icon: '📝' },
            { id: 'minutes', label: '✍️ Minuta de Ata Automatizada', icon: '📜' },
            { id: 'scheduled', label: '📅 Pauta de Audiências', icon: '📆' },
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
          {/* TAB 1: Transmissão Ao Vivo */}
          {activeTab === 'live_room' && (
            <div className="space-y-4">
              {/* Simulador de Sala de Vídeo */}
              <div className="relative bg-gray-950 rounded-2xl aspect-video overflow-hidden shadow-2xl flex flex-col justify-between p-4 border border-gray-800">
                <div className="flex justify-between items-center z-10">
                  <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Sessão Virtual — {currentSession.court}
                  </span>
                  <a
                    href={currentSession.virtualRoomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors shadow-lg"
                  >
                    🔗 Entrar no Teams / Zoom Oficial
                  </a>
                </div>

                {/* Grade de Participantes da Audiência */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto z-10">
                  {currentSession.speakers.map((s, idx) => (
                    <div key={idx} className="bg-gray-900/80 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 space-y-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center mx-auto text-sm shadow-md">
                        {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <p className="font-bold text-white text-xs truncate">{s.name.split(' ')[0]} {s.name.split(' ')[1] || ''}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{s.role.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>

                {/* Barra Inferior da Sala */}
                <div className="flex justify-between items-center bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 z-10">
                  <span className="text-[11px] text-gray-300 font-mono">🔴 Gravação com IA Ativa • 00:14:32</span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 text-xs">🎤 Mute</button>
                    <button className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 text-xs">📹 Vídeo</button>
                    <button className="p-2 rounded-lg bg-red-600 text-white font-bold text-xs">📞 Sair</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Transcrição em Tempo Real */}
          {activeTab === 'transcription' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-gray-500">🎙️ Feed de Transcrição Contínua por IA</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 font-bold px-2 py-0.5 rounded-full">
                    Whisper AI Active
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        t.flaggedAlert
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700'
                          : 'bg-gray-50 dark:bg-gray-700/40'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200">
                        <span>{t.speaker.name} ({t.speaker.role.toUpperCase()})</span>
                        <span className="text-gray-400 font-mono text-[10px]">{t.timestamp}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-serif">"{t.text}"</p>
                      {t.flaggedAlert && (
                        <span className="inline-block text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                          ⚡ Ponto Relevante Detectado pela IA
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inserção Simulada de Voz */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newSimulatedText}
                    onChange={(e) => setNewSimulatedText(e.target.value)}
                    placeholder="Simular novo trecho dito na audiência..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddLiveTranscript}
                    className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Minuta de Ata Automatizada */}
          {activeTab === 'minutes' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">📜 Minuta Oficial da Ata de Audiência</h4>
                  <button
                    onClick={handleCopyMinutes}
                    className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {copiedMinutes ? '✅ Ata Copiada!' : '📋 Copiar Ata Completa'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={12}
                  value={minutesText}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Pauta de Audiências */}
          {activeTab === 'scheduled' && (
            <div className="space-y-3">
              {MOCK_HEARINGS.map((h) => (
                <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{h.processNumber}</p>
                      <p className="text-xs text-gray-400">{h.court} • {h.organ}</p>
                    </div>
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                      {h.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                    <span>📅 {new Date(h.scheduledDate).toLocaleDateString('pt-BR')} às {h.scheduledTime}h</span>
                    <button
                      onClick={() => {
                        setCurrentSession(h);
                        setTranscripts(h.transcripts);
                        setActiveTab('live_room');
                      }}
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg font-bold transition-colors"
                    >
                      🎥 Entrar na Sala
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 text-center">
          <p className="text-xs text-gray-400">
            Legis Connect — Audiências Virtuais com Criptografia E2E & Transcrição por IA
          </p>
        </div>
      </div>
    </div>
  );
};
