/**
 * SecretaryApis.tsx
 * Conexões de Comunicação & Telefonia — Painel do Secret./Assist. Jurídico
 * WhatsApp Business status, Logs VoIP com gravações, Sync de E-mail Corporativo.
 */
import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CallLog {
  id: string;
  type: 'recebida' | 'perdida' | 'realizada';
  number: string;
  contact?: string;
  duration?: string; // ex: "3min 42s"
  timestamp: string;
  hasRecording: boolean;
  extension?: string; // ramal
}

interface EmailStatus {
  account: string;
  protocol: 'IMAP' | 'Exchange' | 'POP3';
  server: string;
  connected: boolean;
  lastSync?: string;
  unread: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOW_TIME = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const MOCK_CALLS: CallLog[] = [
  { id: 'c1', type: 'recebida',  number: '(11) 98765-4321', contact: 'Ana Paula Mendes',  duration: '4min 12s', timestamp: '08:34', hasRecording: true, extension: '201' },
  { id: 'c2', type: 'perdida',   number: '(21) 97654-3210', contact: '',                  timestamp: '08:51', hasRecording: false, extension: '201' },
  { id: 'c3', type: 'realizada', number: '(11) 91234-5678', contact: 'João Carvalho',     duration: '7min 05s', timestamp: '09:15', hasRecording: true, extension: '201' },
  { id: 'c4', type: 'recebida',  number: '(31) 98877-6655', contact: 'Tribunal TRT',      duration: '1min 53s', timestamp: '09:42', hasRecording: true, extension: '201' },
  { id: 'c5', type: 'perdida',   number: '(11) 95544-3322', contact: '',                  timestamp: '10:05', hasRecording: false, extension: '201' },
  { id: 'c6', type: 'realizada', number: '(11) 94433-2211', contact: 'Fernanda Lima',     duration: '2min 31s', timestamp: '10:28', hasRecording: true, extension: '202' },
  { id: 'c7', type: 'recebida',  number: '(11) 98765-0000', contact: 'Carlos Andrade',    duration: '5min 18s', timestamp: NOW_TIME, hasRecording: false, extension: '201' },
];

const MOCK_EMAILS: EmailStatus[] = [
  { account: 'recepcao@escritorio.com.br',    protocol: 'Exchange', server: 'mail.escritorio.com.br', connected: true,  lastSync: '2min atrás', unread: 7 },
  { account: 'contato@escritorio.com.br',     protocol: 'IMAP',     server: 'imap.gmail.com',          connected: true,  lastSync: '5min atrás', unread: 12 },
  { account: 'juridico@escritorio.com.br',    protocol: 'Exchange', server: 'mail.escritorio.com.br', connected: false, unread: 0 },
];

const CALL_META = {
  recebida:  { icon: '📲', label: 'Recebida',  color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/20' },
  perdida:   { icon: '📵', label: 'Perdida',   color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/20'   },
  realizada: { icon: '📞', label: 'Realizada', color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-900/20' },
};

// ─── WhatsApp Status Panel ────────────────────────────────────────────────────

const WhatsAppPanel: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [showQr, setShowQr] = useState(false);
  const [messages] = useState([
    { id: 'm1', from: 'Ana Paula M.', text: 'Bom dia! Quando posso agendar?', time: '08:12', unread: true },
    { id: 'm2', from: 'João Carvalho', text: 'Recebi o contrato, assinarei hoje.', time: '09:05', unread: false },
    { id: 'm3', from: '(11) 97654-3210', text: 'Oi, preciso de uma consulta urgente!', time: '09:51', unread: true },
    { id: 'm4', from: 'Carlos Andrade', text: 'Pode me ligar quando tiver?', time: NOW_TIME, unread: true },
  ]);

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2A2545]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white text-xl font-black">W</div>
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">WhatsApp Business</p>
            <p className="text-[10px] text-gray-400">Canal oficial do escritório</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'connected' && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Online</span>}
          {status === 'disconnected' && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/20 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Offline</span>}
          {status === 'connecting' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-2.5 py-1 rounded-full animate-pulse">⟳ Conectando</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-[#2A2545]">
        {[
          { label: 'Não Lidas', value: unreadCount, color: 'text-red-600' },
          { label: 'Conversas Ativas', value: messages.length, color: 'text-green-600' },
          { label: 'Resp. Pendentes', value: 3, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 text-center">
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[9px] text-gray-400 uppercase font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent messages */}
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Mensagens Recentes</p>
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${msg.unread ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
              {msg.from.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{msg.from}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{msg.text}</p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-[9px] text-gray-400">{msg.time}</span>
              {msg.unread && <span className="w-4 h-4 bg-green-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">!</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        {status === 'connected' ? (
          <button onClick={() => { setStatus('disconnected'); setShowQr(false); }}
            className="flex-1 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            🔌 Desconectar
          </button>
        ) : (
          <button onClick={() => { setStatus('connecting'); setShowQr(true); setTimeout(() => setStatus('connected'), 3000); }}
            className="flex-1 py-2 text-xs font-bold text-white bg-[#25D366] rounded-xl hover:bg-green-500 transition-colors">
            📲 Reconectar (QR Code)
          </button>
        )}
        <button className="flex-1 py-2 text-xs font-bold text-[#25D366] border border-[#25D366]/30 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
          💬 Abrir Chat
        </button>
      </div>

      {showQr && (
        <div className="p-4 pt-0">
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 text-center border border-dashed border-gray-300 dark:border-[#2A2545]">
            <div className="w-32 h-32 mx-auto bg-white dark:bg-gray-800 rounded-lg grid grid-cols-8 gap-0.5 p-2 mb-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`${Math.random() > 0.5 ? 'bg-black dark:bg-white' : 'bg-white dark:bg-gray-800'} rounded-[1px]`} />
              ))}
            </div>
            <p className="text-xs text-gray-500">Escaneie o QR Code com o WhatsApp Business</p>
            <p className="text-[10px] text-gray-400 animate-pulse mt-1">Conectando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VoIP Call Logs ───────────────────────────────────────────────────────────

const VoipPanel: React.FC = () => {
  const [filter, setFilter] = useState<'todos' | CallLog['type']>('todos');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = filter === 'todos' ? MOCK_CALLS : MOCK_CALLS.filter(c => c.type === filter);
  const lostCount = MOCK_CALLS.filter(c => c.type === 'perdida').length;

  const handlePlay = (id: string) => {
    setPlayingId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-[#2A2545] flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">📞 Telefonia VoIP</h4>
          {lostCount > 0 && <p className="text-[10px] text-red-500 mt-0.5">{lostCount} chamada(s) perdida(s) hoje</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Ramal 201 — Online
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 p-4 pb-2">
        {(['todos', 'recebida', 'realizada', 'perdida'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 hover:bg-gray-200'}`}>
            {f === 'todos' ? 'Todos' : CALL_META[f].icon + ' ' + CALL_META[f].label + 's'}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
        {filtered.map(call => {
          const meta = CALL_META[call.type];
          const isPlaying = playingId === call.id;
          return (
            <div key={call.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${meta.bg} transition-all`}>
              <span className="text-base shrink-0">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{call.contact || call.number}</p>
                {call.contact && <p className="text-[10px] text-gray-400">{call.number}</p>}
                <p className="text-[10px] text-gray-400">{call.timestamp}{call.duration ? ` · ${call.duration}` : ''}{call.extension ? ` · Ramal ${call.extension}` : ''}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {call.hasRecording && (
                  <button onClick={() => handlePlay(call.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-black/30 text-gray-600 dark:text-gray-300 hover:bg-purple-100'}`}
                    title="Ouvir gravação">
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                )}
                <button className="w-7 h-7 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-all" title="Ligar de volta">
                  📞
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio player mock */}
      {playingId && (
        <div className="mx-4 mb-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl p-3">
          <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 mb-2">🎵 Reproduzindo gravação...</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">0:00</span>
            <div className="flex-1 bg-gray-200 dark:bg-black/20 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '35%' }} />
            </div>
            <span className="text-[10px] text-gray-400">{MOCK_CALLS.find(c => c.id === playingId)?.duration}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Email Sync Panel ─────────────────────────────────────────────────────────

const EmailPanel: React.FC = () => {
  const [emails, setEmails] = useState<EmailStatus[]>(MOCK_EMAILS);

  const toggleConnect = (account: string) => {
    setEmails(prev => prev.map(e => e.account === account ? { ...e, connected: !e.connected, lastSync: e.connected ? undefined : 'Agora' } : e));
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">📧 E-mail Corporativo</h4>
      <div className="space-y-3">
        {emails.map(email => (
          <div key={email.account} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${email.connected ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${email.protocol === 'Exchange' ? 'bg-blue-600' : email.protocol === 'IMAP' ? 'bg-red-500' : 'bg-gray-600'}`}>
              {email.protocol.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{email.account}</p>
              <p className="text-[10px] text-gray-400">{email.protocol} · {email.server}</p>
              {email.connected && (
                <p className="text-[10px] text-green-600 dark:text-green-400">✓ Sincronizado {email.lastSync} · {email.unread} não lida(s)</p>
              )}
              {!email.connected && <p className="text-[10px] text-red-500">✕ Desconectado</p>}
            </div>
            <button onClick={() => toggleConnect(email.account)}
              className={`shrink-0 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${email.connected ? 'text-red-600 border border-red-200 hover:bg-red-100' : 'text-white bg-blue-600 hover:bg-blue-700'}`}>
              {email.connected ? 'Desconectar' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>
      <button className="w-full py-2 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
        ➕ Adicionar Conta de E-mail
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecretaryApis: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">🔌 Central de Comunicações</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monitoramento de canais integrados da secretaria — WhatsApp, VoIP e E-mail Corporativo</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <WhatsAppPanel />
        <VoipPanel />
      </div>

      <EmailPanel />
    </div>
  );
};
