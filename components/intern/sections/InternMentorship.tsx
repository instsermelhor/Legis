/**
 * InternMentorship.tsx
 * Mentorias & Clínicas Jurídicas — Painel do Bacharelando
 * Hub de agendamento com advogados seniores + Núcleo de Prática Jurídica (NPJ)
 */
import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mentor {
  id: string;
  name: string;
  oab: string;
  areas: string[];
  available: boolean;
  photo: string;
  bio: string;
  rating: number;
  sessionsDone: number;
  nextSlot?: string;
}

interface MentoriaSession {
  id: string;
  mentorId: string;
  mentorName: string;
  data: string;
  hora: string;
  area: string;
  tipo: 'online' | 'presencial';
  status: 'agendada' | 'concluida' | 'cancelada';
  notes?: string;
}

interface NpjCase {
  id: string;
  clienteNome: string;
  area: string;
  descricao: string;
  status: 'triagem' | 'em_andamento' | 'encerrado';
  dataEntrada: string;
  hipossuficiente: boolean;
  plantaoDate?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MENTORS: Mentor[] = [
  {
    id: 'mt1', name: 'Dra. Ana Beatriz Fontes', oab: 'SP 198.432',
    areas: ['Direito Civil', 'Família'], available: true,
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: '18 anos de experiência em Direito de Família e Sucessões. Professora universitária e mediadora certificada.',
    rating: 4.9, sessionsDone: 142, nextSlot: '2024-12-10T14:00:00',
  },
  {
    id: 'mt2', name: 'Dr. Fábio Resende', oab: 'RJ 87.654',
    areas: ['Direito Penal', 'Tribunal do Júri'], available: true,
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Defensor criminal com 12 anos de atuação. Especialista em habeas corpus e recursos ao STJ.',
    rating: 4.8, sessionsDone: 98, nextSlot: '2024-12-11T10:00:00',
  },
  {
    id: 'mt3', name: 'Dra. Cláudia Pimentel', oab: 'MG 54.321',
    areas: ['Direito Trabalhista', 'Negociação Coletiva'], available: false,
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Advogada trabalhista com foco em reclamantes. Ex-auditora do Ministério do Trabalho.',
    rating: 4.7, sessionsDone: 213,
  },
  {
    id: 'mt4', name: 'Dr. Gustavo Cavalcanti', oab: 'DF 23.890',
    areas: ['Direito Tributário', 'Planejamento Fiscal'], available: true,
    photo: 'https://randomuser.me/api/portraits/men/71.jpg',
    bio: 'Consultor tributário corporativo. Autor de artigos sobre ICMS e IRPJ publicados na RDDT.',
    rating: 4.6, sessionsDone: 76, nextSlot: '2024-12-13T16:00:00',
  },
];

const MOCK_SESSIONS: MentoriaSession[] = [
  {
    id: 'ms1', mentorId: 'mt1', mentorName: 'Dra. Ana Beatriz Fontes',
    data: '2024-12-10', hora: '14:00', area: 'Direito de Família',
    tipo: 'online', status: 'agendada',
    notes: 'Revisar cálculo de alimentos e apresentar minuta de divórcio litigioso.',
  },
];

const MOCK_NPJ_CASES: NpjCase[] = [
  {
    id: 'npj1', clienteNome: 'Maria da Silva (hipossuficiente)', area: 'Família',
    descricao: 'Pedido de alimentos urgente. Separação de fato há 8 meses. Dois filhos menores.',
    status: 'em_andamento', dataEntrada: '2024-11-20', hipossuficiente: true,
    plantaoDate: '2024-12-10',
  },
  {
    id: 'npj2', clienteNome: 'João Alves', area: 'Trabalhista',
    descricao: 'Reclamação trabalhista por verbas rescisórias não pagas. Dispensa sem justa causa.',
    status: 'triagem', dataEntrada: '2024-12-01', hipossuficiente: true,
  },
  {
    id: 'npj3', clienteNome: 'Ana Paula Mendes', area: 'Consumidor',
    descricao: 'Negativação indevida por contrato já quitado. Dano moral.',
    status: 'encerrado', dataEntrada: '2024-10-15', hipossuficiente: false,
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-xs ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
    ))}
    <span className="text-[10px] text-gray-400 ml-1">{rating}</span>
  </div>
);

const NpjStatusMap = {
  triagem:      { label: 'Triagem', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🔍' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '⚙️' },
  encerrado:    { label: 'Encerrado', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '✅' },
};

// ─── Schedule Modal ───────────────────────────────────────────────────────────

interface ScheduleModalProps {
  mentor: Mentor;
  onClose: () => void;
  onSchedule: (session: Omit<MentoriaSession, 'id'>) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ mentor, onClose, onSchedule }) => {
  const [data, setData] = useState(mentor.nextSlot ? mentor.nextSlot.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(mentor.nextSlot ? mentor.nextSlot.split('T')[1]?.slice(0, 5) : '10:00');
  const [tipo, setTipo] = useState<'online' | 'presencial'>('online');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      onSchedule({
        mentorId: mentor.id, mentorName: mentor.name,
        data, hora, area: mentor.areas[0], tipo, status: 'agendada', notes,
      });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <img src={mentor.photo} alt={mentor.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Agendar Mentoria</h2>
              <p className="text-xs text-gray-500">{mentor.name}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Data</label>
                <input type="date" value={data} onChange={e => setData(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Hora</label>
                <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Modalidade</label>
              <div className="flex gap-3">
                {(['online', 'presencial'] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={tipo === t} onChange={() => setTipo(t)} className="accent-indigo-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Temas / Objetivos</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="O que você quer aprender nesta sessão?"
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
            {sent && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-emerald-800 text-sm font-semibold">
                ✅ Solicitação enviada! O mentor irá confirmar em breve.
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl">Cancelar</button>
              <button type="submit" disabled={sent}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {sent ? '✅ Agendado!' : '📅 Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type MentorshipSubTab = 'mentorias' | 'npj';

export const InternMentorship: React.FC = () => {
  const [subTab, setSubTab] = useState<MentorshipSubTab>('mentorias');
  const [sessions, setSessions] = useState<MentoriaSession[]>(MOCK_SESSIONS);
  const [npjCases] = useState<NpjCase[]>(MOCK_NPJ_CASES);
  const [schedulingMentor, setSchedulingMentor] = useState<Mentor | null>(null);
  const [searchMentor, setSearchMentor] = useState('');

  const filteredMentors = MOCK_MENTORS.filter(m =>
    m.name.toLowerCase().includes(searchMentor.toLowerCase()) ||
    m.areas.some(a => a.toLowerCase().includes(searchMentor.toLowerCase()))
  );

  const addSession = (session: Omit<MentoriaSession, 'id'>) => {
    setSessions(prev => [{ ...session, id: `ms${Date.now()}` }, ...prev]);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button onClick={() => setSubTab('mentorias')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'mentorias' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}>
          🧑‍🏫 Mentorias
          {sessions.filter(s => s.status === 'agendada').length > 0 && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subTab === 'mentorias' ? 'bg-white/30' : 'bg-indigo-100 text-indigo-700'}`}>
              {sessions.filter(s => s.status === 'agendada').length}
            </span>
          )}
        </button>
        <button onClick={() => setSubTab('npj')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === 'npj' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'}`}>
          🏛️ Clínica Jurídica (NPJ)
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subTab === 'npj' ? 'bg-white/30' : 'bg-indigo-100 text-indigo-700'}`}>
            {npjCases.length}
          </span>
        </button>
      </div>

      {/* ── Mentorias ── */}
      {subTab === 'mentorias' && (
        <div className="space-y-5">
          {/* Sessões Agendadas */}
          {sessions.filter(s => s.status === 'agendada').length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">📅 Sessões Agendadas</h4>
              <div className="space-y-2">
                {sessions.filter(s => s.status === 'agendada').map(s => (
                  <div key={s.id} className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{s.mentorName}</p>
                        <p className="text-xs text-indigo-500">
                          {new Date(s.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {s.hora}
                        </p>
                        <p className="text-xs text-indigo-400">{s.tipo === 'online' ? '💻 Online' : '🏢 Presencial'} · {s.area}</p>
                      </div>
                      <span className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full">Confirmada</span>
                    </div>
                    {s.notes && <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-lg px-3 py-1.5">{s.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentores Disponíveis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mentores Disponíveis</h4>
            </div>
            <input
              value={searchMentor}
              onChange={e => setSearchMentor(e.target.value)}
              placeholder="Buscar por nome ou área de atuação..."
              className="w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 mb-3"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMentors.map(mentor => (
                <div key={mentor.id} className={`bg-white dark:bg-[#1A1730] border ${mentor.available ? 'border-gray-200 dark:border-[#2A2545]' : 'border-gray-100 dark:border-[#2A2545] opacity-70'} rounded-2xl p-4 shadow-sm space-y-3`}>
                  <div className="flex items-center gap-3">
                    <img src={mentor.photo} alt={mentor.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-[#2A2545]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{mentor.name}</p>
                      <p className="text-[10px] text-gray-400">{mentor.oab}</p>
                      <StarRating rating={mentor.rating} />
                    </div>
                    <div className={`text-[9px] font-bold px-2 py-1 rounded-full shrink-0 ${mentor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {mentor.available ? '● Disponível' : '● Indisponível'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mentor.areas.map(a => (
                      <span key={a} className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">{a}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{mentor.bio}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{mentor.sessionsDone} sessões realizadas</span>
                    <button
                      onClick={() => mentor.available && setSchedulingMentor(mentor)}
                      disabled={!mentor.available}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${mentor.available ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {mentor.available ? '📅 Agendar' : 'Indisponível'}
                    </button>
                  </div>
                  {mentor.nextSlot && mentor.available && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✅ Próximo horário: {new Date(mentor.nextSlot).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {new Date(mentor.nextSlot).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NPJ — Clínica Jurídica ── */}
      {subTab === 'npj' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900/30 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-violet-900 dark:text-violet-200 mb-1">🏛️ Núcleo de Prática Jurídica</h4>
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Assistência jurídica gratuita aos hipossuficientes. Atendimentos exigidos pela faculdade para validação do estágio supervisionado.
            </p>
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Total de casos', value: npjCases.length, color: 'text-violet-700 dark:text-violet-300' },
                { label: 'Em andamento', value: npjCases.filter(c => c.status === 'em_andamento').length, color: 'text-blue-700 dark:text-blue-300' },
                { label: 'Encerrados', value: npjCases.filter(c => c.status === 'encerrado').length, color: 'text-emerald-700 dark:text-emerald-300' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {npjCases.map(c => {
              const statusMeta = NpjStatusMap[c.status];
              return (
                <div key={c.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${statusMeta.color}`}>{statusMeta.icon} {statusMeta.label}</span>
                        <span className="text-[9px] font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/30">{c.area}</span>
                        {c.hipossuficiente && <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">Hipossuficiente</span>}
                      </div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{c.clienteNome}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{new Date(c.dataEntrada + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.descricao}</p>
                  {c.plantaoDate && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-1.5">
                      <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400">📅 Plantão agendado: {new Date(c.plantaoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {schedulingMentor && (
        <ScheduleModal mentor={schedulingMentor} onClose={() => setSchedulingMentor(null)} onSchedule={addSession} />
      )}
    </div>
  );
};
