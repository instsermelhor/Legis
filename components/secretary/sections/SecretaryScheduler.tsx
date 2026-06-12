/**
 * SecretaryScheduler.tsx
 * Central Multi-Agenda dos Advogados — Painel do Secret./Assist. Jurídico
 * Visualização multi-advogado, agendamento com Meet/Teams, reserva de salas.
 */
import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  lawyerId: number;
  title: string;
  client: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  type: 'consulta' | 'reuniao' | 'audiencia' | 'online';
  room: string;
  meetLink?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  notes?: string;
}

interface MockLawyer {
  id: number;
  name: string;
  oab: string;
  photo: string;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LAWYERS: MockLawyer[] = [
  { id: 1, name: 'Dr. Carlos Mendonça',  oab: 'SP 58.234', photo: 'https://randomuser.me/api/portraits/men/45.jpg', color: '#6366f1' },
  { id: 2, name: 'Dra. Beatriz Fontana', oab: 'RJ 89.123', photo: 'https://randomuser.me/api/portraits/women/33.jpg', color: '#ec4899' },
  { id: 3, name: 'Dr. Ricardo Alves',    oab: 'MG 23.456', photo: 'https://randomuser.me/api/portraits/men/71.jpg', color: '#f59e0b' },
];

const TODAY = new Date().toISOString().split('T')[0];
const getDay = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', lawyerId: 1, title: 'Consulta Inicial', client: 'Ana Paula Mendes', date: TODAY, startTime: '09:00', endTime: '09:30', type: 'consulta', room: 'Sala A', status: 'confirmado' },
  { id: 'a2', lawyerId: 2, title: 'Reunião de Estratégia', client: 'Empresa ABC Ltda', date: TODAY, startTime: '10:00', endTime: '11:00', type: 'reuniao', room: 'Sala B', status: 'confirmado' },
  { id: 'a3', lawyerId: 1, title: 'Audiência TRT', client: 'João Silva vs. XYZ Corp', date: TODAY, startTime: '14:00', endTime: '15:30', type: 'audiencia', room: 'TRT 15ª Região', status: 'confirmado' },
  { id: 'a4', lawyerId: 3, title: 'Videoconferência', client: 'Pedro Henrique', date: TODAY, startTime: '15:00', endTime: '15:30', type: 'online', room: 'Online', meetLink: 'https://meet.google.com/abc-def', status: 'pendente' },
  { id: 'a5', lawyerId: 2, title: 'Consulta — Dir. Família', client: 'Maria da Costa', date: getDay(1), startTime: '09:00', endTime: '09:30', type: 'consulta', room: 'Sala A', status: 'confirmado' },
  { id: 'a6', lawyerId: 1, title: 'Assinatura de Contrato', client: 'Carlos Andrade', date: getDay(1), startTime: '11:00', endTime: '11:30', type: 'reuniao', room: 'Sala B', status: 'pendente' },
  { id: 'a7', lawyerId: 3, title: 'Revisão de Petição', client: 'Fernanda Lima', date: getDay(2), startTime: '14:00', endTime: '15:00', type: 'consulta', room: 'Sala A', status: 'confirmado' },
];

const ROOMS = ['Sala A', 'Sala B', 'Sala de Reuniões', 'Online (Meet)', 'Online (Teams)', 'Externo'];

const TYPE_META = {
  consulta:  { label: 'Consulta',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  reuniao:   { label: 'Reunião',   color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
  audiencia: { label: 'Audiência', color: 'bg-red-100 text-red-700 border-red-200',             dot: 'bg-red-500'     },
  online:    { label: 'Online',    color: 'bg-violet-100 text-violet-700 border-violet-200',    dot: 'bg-violet-500'  },
};

const STATUS_META = {
  confirmado: 'bg-green-100 text-green-700',
  pendente:   'bg-amber-100 text-amber-700',
  cancelado:  'bg-red-100 text-red-700',
};

// ─── New Appointment Modal ────────────────────────────────────────────────────

interface NewApptModalProps {
  onClose: () => void;
  onSave: (appt: Appointment) => void;
  lawyers: MockLawyer[];
  preselectedDate?: string;
}

const NewApptModal: React.FC<NewApptModalProps> = ({ onClose, onSave, lawyers, preselectedDate }) => {
  const [form, setForm] = useState({
    lawyerId: lawyers[0]?.id || 1,
    title: '',
    client: '',
    date: preselectedDate || TODAY,
    startTime: '09:00',
    endTime: '09:30',
    type: 'consulta' as Appointment['type'],
    room: 'Sala A',
    meetLink: '',
    notes: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.title.trim() || !form.client.trim()) return;
    setSaved(true);
    setTimeout(() => {
      onSave({
        ...form,
        id: `appt_${Date.now()}`,
        status: 'pendente',
        meetLink: form.room.toLowerCase().includes('online') ? form.meetLink || 'https://meet.google.com/auto-link' : undefined,
      });
      onClose();
    }, 800);
  };

  const inputCls = 'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all';
  const labelCls = 'block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#12102A] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-[#12102A] flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2A2545] z-10">
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">📅 Novo Agendamento</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Preencha os dados e confirme o horário</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2545] text-gray-500">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {/* Advogado */}
          <div>
            <label className={labelCls}>Advogado</label>
            <select value={form.lawyerId} onChange={e => setForm(f => ({ ...f, lawyerId: Number(e.target.value) }))} className={inputCls}>
              {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} — OAB {l.oab}</option>)}
            </select>
          </div>
          {/* Tipo */}
          <div>
            <label className={labelCls}>Tipo de Compromisso</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(TYPE_META) as Appointment['type'][]).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${form.type === t ? TYPE_META[t].color + ' border-current' : 'border-gray-200 dark:border-[#2A2545] text-gray-500 hover:border-gray-300'}`}>
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>
          {/* Título e cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Título / Pauta *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Consulta Inicial" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cliente *</label>
              <input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Nome do cliente" className={inputCls} />
            </div>
          </div>
          {/* Data e horários */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Data</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Início</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Término</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className={inputCls} />
            </div>
          </div>
          {/* Sala */}
          <div>
            <label className={labelCls}>Local / Sala</label>
            <select value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className={inputCls}>
              {ROOMS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {/* Meet link se online */}
          {form.room.toLowerCase().includes('online') && (
            <div>
              <label className={labelCls}>Link da Reunião (Google Meet / Teams)</label>
              <input value={form.meetLink} onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))}
                placeholder="https://meet.google.com/..." className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">Deixe em branco para gerar automaticamente</p>
            </div>
          )}
          {/* Notas */}
          <div>
            <label className={labelCls}>Notas / Observações</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Instruções para o cliente, pauta da reunião..." className={inputCls} />
          </div>
          {saved && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-sm font-semibold rounded-xl px-4 py-2">✅ Agendamento confirmado!</div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-[#2A2545]">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-[#2A2545] rounded-xl hover:bg-gray-50 dark:hover:bg-black/20">Cancelar</button>
          <button onClick={handleSave} disabled={!form.title.trim() || !form.client.trim() || saved}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {saved ? '✅ Agendado!' : '💾 Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

const ApptCard: React.FC<{ appt: Appointment; lawyer: MockLawyer | undefined; onCancel: (id: string) => void }> = ({ appt, lawyer, onCancel }) => {
  const meta = TYPE_META[appt.type];
  const statusMeta = STATUS_META[appt.status];
  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4 space-y-3 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {lawyer && <img src={lawyer.photo} alt={lawyer.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-2" style={{ ringColor: lawyer.color }} />}
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{appt.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{appt.client}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0 items-end">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusMeta}`}>{appt.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">🕐 {appt.startTime}–{appt.endTime}</span>
        <span className="flex items-center gap-1">📍 {appt.room}</span>
        {lawyer && <span className="flex items-center gap-1">👤 {lawyer.name}</span>}
      </div>
      {appt.meetLink && (
        <a href={appt.meetLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
          🔗 Entrar na reunião online
        </a>
      )}
      {appt.notes && <p className="text-[10px] text-gray-400 italic border-t border-gray-100 dark:border-[#2A2545] pt-2">{appt.notes}</p>}
      <div className="flex gap-2 pt-1">
        <button className="flex-1 py-1.5 text-[10px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">✉️ Enviar Lembrete</button>
        {appt.status !== 'cancelado' && (
          <button onClick={() => onCancel(appt.id)} className="flex-1 py-1.5 text-[10px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">✕ Cancelar</button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecretaryScheduler: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<number[]>(MOCK_LAWYERS.map(l => l.id));
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todos' | Appointment['status']>('todos');

  const toggleLawyer = (id: number) => {
    setSelectedLawyerIds(prev => prev.includes(id) ? (prev.length > 1 ? prev.filter(l => l !== id) : prev) : [...prev, id]);
  };

  const filteredAppts = appointments.filter(a =>
    selectedLawyerIds.includes(a.lawyerId) &&
    a.date === selectedDate &&
    (filterStatus === 'todos' || a.status === filterStatus)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const cancelAppt = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' } : a));
  const addAppt = (appt: Appointment) => setAppointments(prev => [...prev, appt]);

  // Generate date tabs (today + next 6 days)
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
    };
  });

  const totalToday = appointments.filter(a => a.date === TODAY).length;
  const totalPending = appointments.filter(a => a.status === 'pendente').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">📅 Central Multi-Agenda</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{totalToday} compromisso(s) hoje · {totalPending} pendente(s)</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-sm transition-all flex items-center gap-2">
          ➕ Novo Agendamento
        </button>
      </div>

      {/* Lawyer filter */}
      <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Filtrar por Advogado</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_LAWYERS.map(lawyer => {
            const selected = selectedLawyerIds.includes(lawyer.id);
            return (
              <button key={lawyer.id} onClick={() => toggleLawyer(lawyer.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${selected ? 'border-current text-white' : 'border-gray-200 dark:border-[#2A2545] text-gray-500 bg-gray-50 dark:bg-black/20'}`}
                style={selected ? { backgroundColor: lawyer.color, borderColor: lawyer.color } : {}}>
                <img src={lawyer.photo} alt={lawyer.name} className="w-5 h-5 rounded-full object-cover" />
                {lawyer.name.split(' ').slice(0, 2).join(' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {dateTabs.map(dt => (
          <button key={dt.value} onClick={() => setSelectedDate(dt.value)}
            className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all ${selectedDate === dt.value ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-purple-300'}`}>
            {dt.label}
          </button>
        ))}
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="shrink-0 px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-[#2A2545] bg-white dark:bg-[#1A1730] text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer" />
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {(['todos', 'confirmado', 'pendente', 'cancelado'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${filterStatus === s ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 hover:bg-gray-200'}`}>
            {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments grid */}
      {filteredAppts.length === 0 ? (
        <div className="bg-gray-50 dark:bg-[#1A1730] border border-dashed border-gray-300 dark:border-[#2A2545] rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <h4 className="font-bold text-gray-700 dark:text-gray-300">Nenhum compromisso neste dia</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Selecione outro dia ou clique em "Novo Agendamento"</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors">
            ➕ Agendar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAppts.map(appt => (
            <ApptCard
              key={appt.id}
              appt={appt}
              lawyer={MOCK_LAWYERS.find(l => l.id === appt.lawyerId)}
              onCancel={cancelAppt}
            />
          ))}
        </div>
      )}

      {/* Room status */}
      <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🏢 Status das Salas — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Sala A', 'Sala B', 'Sala de Reuniões'].map(room => {
            const roomAppts = appointments.filter(a => a.date === selectedDate && a.room === room && a.status !== 'cancelado');
            const isBusy = roomAppts.length > 0;
            return (
              <div key={room} className={`p-3 rounded-xl border-2 transition-all ${isBusy ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30' : 'border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30'}`}>
                <p className="text-xs font-bold text-gray-800 dark:text-white">{room}</p>
                <p className={`text-[10px] font-bold mt-1 ${isBusy ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isBusy ? `● Ocupada (${roomAppts.length}x)` : '● Disponível'}
                </p>
                {isBusy && <p className="text-[9px] text-gray-400 mt-0.5">{roomAppts.map(a => a.startTime).join(', ')}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <NewApptModal
          onClose={() => setShowModal(false)}
          onSave={addAppt}
          lawyers={MOCK_LAWYERS}
          preselectedDate={selectedDate}
        />
      )}
    </div>
  );
};
