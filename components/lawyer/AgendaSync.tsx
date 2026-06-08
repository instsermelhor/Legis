/**
 * AgendaSync.tsx
 * Agenda integrada com botões de sincronização:
 * Google Calendar, Microsoft Outlook/Teams, Zoom, Google Meet.
 */
import React, { useState } from 'react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'consulta' | 'reuniao' | 'audiencia' | 'outro';
  platform?: string;
  client?: string;
  confirmed: boolean;
}

const MOCK_EVENTS: AgendaEvent[] = [
  { id: 'ev1', title: 'Consulta — Ana Clara Dias', date: '2026-06-09', time: '10:00', type: 'consulta', platform: 'Google Meet', client: 'Ana Clara Dias', confirmed: true },
  { id: 'ev2', title: 'Audiência — Reclamação Trabalhista', date: '2026-06-10', time: '14:00', type: 'audiencia', platform: 'Presencial', client: 'Roberto Martins', confirmed: true },
  { id: 'ev3', title: 'Reunião de Equipe', date: '2026-06-11', time: '09:00', type: 'reuniao', platform: 'Microsoft Teams', confirmed: true },
  { id: 'ev4', title: 'Consulta — Sofia Pereira', date: '2026-06-12', time: '15:30', type: 'consulta', platform: 'Zoom', client: 'Sofia Pereira', confirmed: false },
];

const TYPE_COLOR: Record<AgendaEvent['type'], string> = {
  consulta: 'bg-blue-100 text-blue-800',
  reuniao: 'bg-purple-100 text-purple-800',
  audiencia: 'bg-red-100 text-red-800',
  outro: 'bg-gray-100 text-gray-700',
};

const PLATFORM_ICON: Record<string, string> = {
  'Google Meet': '🟢',
  'Microsoft Teams': '🔵',
  'Zoom': '🟦',
  'Presencial': '🏛️',
};

// ─── Sync Card ────────────────────────────────────────────────────────────────
interface SyncOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const SYNC_OPTIONS: SyncOption[] = [
  { id: 'google', name: 'Google Calendar', icon: '📅', color: 'border-blue-300 hover:bg-blue-50', description: 'Sincronize agendamentos com Google Calendar e crie Meet links automaticamente.' },
  { id: 'outlook', name: 'Microsoft Outlook', icon: '📧', color: 'border-blue-400 hover:bg-blue-50', description: 'Integre com Outlook e agende reuniões Teams com um clique.' },
  { id: 'zoom', name: 'Zoom', icon: '🎥', color: 'border-blue-500 hover:bg-blue-50', description: 'Gere links de reunião Zoom para cada consulta marcada.' },
  { id: 'meet', name: 'Google Meet', icon: '🟢', color: 'border-green-400 hover:bg-green-50', description: 'Crie videoconferências Google Meet vinculadas à agenda.' },
];

const ConnectModal: React.FC<{ option: SyncOption; onClose: () => void }> = ({ option, onClose }) => {
  const [step, setStep] = useState<'info' | 'connecting' | 'done'>('info');
  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => setStep('done'), 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{option.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Conectar {option.name}</h3>
            <p className="text-sm text-gray-500">{option.description}</p>
          </div>
        </div>

        {step === 'info' && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>Integração via OAuth 2.0.</strong> Clique em "Conectar" para iniciar o fluxo de autorização.
              Em produção, você será redirecionado para a página de login da {option.name.split(' ')[0]}.
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>✓ Sincronização bidirecional de eventos</p>
              <p>✓ Criação automática de links de reunião</p>
              <p>✓ Notificações e lembretes integrados</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleConnect} className="flex-1 py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90">Conectar</button>
              <button onClick={onClose} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
            </div>
          </>
        )}

        {step === 'connecting' && (
          <div className="text-center py-4 space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-600">Conectando com {option.name}...</p>
          </div>
        )}

        {step === 'done' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="font-semibold text-green-800">{option.name} conectado!</p>
              <p className="text-xs text-green-600 mt-1">Seus eventos serão sincronizados automaticamente.</p>
            </div>
            <button onClick={onClose} className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90">Fechar</button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AgendaSync: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>(MOCK_EVENTS);
  const [syncOption, setSyncOption] = useState<SyncOption | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'consulta' as AgendaEvent['type'], client: '', platform: 'Google Meet' });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    setEvents(prev => [...prev, { ...newEvent, id: `ev-${Date.now()}`, confirmed: false }]);
    setNewEvent({ title: '', date: '', time: '', type: 'consulta', client: '', platform: 'Google Meet' });
    setShowAddForm(false);
  };

  const handleModalClose = (success?: boolean) => {
    // Only mark as connected when the modal reports success (not on cancel)
    if (success && syncOption) setConnected(prev => [...prev.filter(c => c !== syncOption.id), syncOption.id]);
    setSyncOption(null);
  };

  const sorted = [...events].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-700">Agenda & Sincronização</h2>

      {/* Sync Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SYNC_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSyncOption(opt)}
            className={`flex flex-col items-center gap-2 p-4 bg-white border-2 rounded-xl transition-colors shadow-sm ${opt.color} ${connected.includes(opt.id) ? 'border-green-400 bg-green-50' : ''}`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{opt.name}</span>
            {connected.includes(opt.id) && <span className="text-xs text-green-600 font-medium">✓ Conectado</span>}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <p className="font-semibold text-gray-800 text-sm">Próximos Eventos</p>
          <button onClick={() => setShowAddForm(f => !f)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
            + Novo Evento
          </button>
        </div>

        {showAddForm && (
          <div className="p-4 border-b bg-blue-50 space-y-3">
            <h4 className="text-sm font-semibold text-blue-900">Adicionar Evento</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Título', key: 'title', type: 'text', placeholder: 'Ex: Consulta com cliente' },
                { label: 'Cliente (opcional)', key: 'client', type: 'text', placeholder: 'Nome do cliente' },
                { label: 'Data', key: 'date', type: 'date', placeholder: '' },
                { label: 'Hora', key: 'time', type: 'time', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newEvent as any)[f.key]}
                    onChange={e => setNewEvent(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value as AgendaEvent['type'] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <option value="consulta">Consulta</option>
                  <option value="reuniao">Reunião</option>
                  <option value="audiencia">Audiência</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Plataforma</label>
                <select value={newEvent.platform} onChange={e => setNewEvent(p => ({ ...p, platform: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <option>Google Meet</option>
                  <option>Microsoft Teams</option>
                  <option>Zoom</option>
                  <option>Presencial</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddEvent} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Salvar Evento</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            </div>
          </div>
        )}

        <div className="divide-y">
          {sorted.map(ev => (
            <div key={ev.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
              <div className="text-center min-w-[48px]">
                <p className="text-xs text-gray-500">{MONTHS[new Date(ev.date).getMonth()]}</p>
                <p className="text-xl font-bold text-gray-800">{new Date(ev.date).getUTCDate()}</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
                <p className="text-xs text-gray-500">{ev.time} {ev.platform && `· ${PLATFORM_ICON[ev.platform] || '📍'} ${ev.platform}`}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold hidden sm:inline ${TYPE_COLOR[ev.type]}`}>
                {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
              </span>
              {ev.confirmed && ev.platform !== 'Presencial' && (
                <button
                  onClick={() => {
                    const meetLink = 'https://meet.google.com/new';
                    window.open(meetLink, '_blank');
                  }}
                  className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
                >Entrar</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {syncOption && <ConnectModal option={syncOption} onClose={handleModalClose} />}
    </div>
  );
};
