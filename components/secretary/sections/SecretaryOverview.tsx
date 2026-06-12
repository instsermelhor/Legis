/**
 * SecretaryOverview.tsx
 * Visão Geral — Painel do Secret./Assist. Jurídico
 * Hub de controle de tráfego de demandas e atendimentos do dia.
 * KPIs operacionais, Timeline de atividades e widget de compromissos dos sócios.
 */
import React, { useState } from 'react';
import type { Secretary } from '../../../types';
import type { Lawyer } from '../../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  time: string;
  icon: string;
  title: string;
  description: string;
  type: 'doc' | 'lead' | 'message' | 'appointment' | 'alert';
  urgent?: boolean;
}

interface LawyerAppointment {
  id: string;
  lawyerName: string;
  lawyerPhoto: string;
  lawyerOab: string;
  title: string;
  client?: string;
  startTime: string;
  endTime: string;
  type: 'reuniao' | 'audiencia' | 'consulta' | 'online';
  location?: string;
  inProgress?: boolean;
}

interface LeadQueueItem {
  id: string;
  name: string;
  phone: string;
  area: string;
  receivedAt: string;
  source: 'whatsapp' | 'site' | 'indicacao' | 'ligacao';
  priority: 'alta' | 'media' | 'baixa';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOW_HOUR = new Date().getHours();
const PAD = (n: number) => String(n).padStart(2, '0');
const T = (h: number, m = 0) => `${PAD(h)}:${PAD(m)}`;

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', time: T(NOW_HOUR - 1, 15), icon: '📎', title: 'Cliente enviou documentos', description: 'Ana Paula Mendes anexou CNH e Comprovante de Residência ao caso #0042.', type: 'doc' },
  { id: 'a2', time: T(NOW_HOUR - 1, 0), icon: '👤', title: 'Novo lead na fila de triagem', description: 'João Carvalho solicitou atendimento via WhatsApp — Direito Trabalhista.', type: 'lead', urgent: true },
  { id: 'a3', time: T(NOW_HOUR - 0, 30), icon: '⚠️', title: 'Mensagem não respondida há 45min', description: 'Cliente Maria da Silva enviou mensagem às 09:15 aguardando retorno.', type: 'alert', urgent: true },
  { id: 'a4', time: T(NOW_HOUR, 0), icon: '✅', title: 'Contrato de honorários assinado', description: 'Carlos Andrade assinou eletronicamente via Clicksign o contrato de honorários.', type: 'doc' },
  { id: 'a5', time: T(NOW_HOUR, 10), icon: '📅', title: 'Consulta confirmada para amanhã', description: 'Dr. Fábio Resende confirmou a consulta de Marcos Oliveira para às 14h.', type: 'appointment' },
  { id: 'a6', time: T(NOW_HOUR - 2, 45), icon: '📄', title: 'Petição enviada pelo tribunal', description: 'Despacho judicial recebido para o processo nº 0012345-67.2024.8.26.0100.', type: 'doc' },
];

const MOCK_APPOINTMENTS: LawyerAppointment[] = [
  {
    id: 'ap1', lawyerName: 'Dr. Carlos Mendonça', lawyerPhoto: 'https://randomuser.me/api/portraits/men/45.jpg', lawyerOab: 'SP 58.234',
    title: 'Reunião de Estratégia', client: 'Empresa ABC Ltda', startTime: T(NOW_HOUR, 30), endTime: T(NOW_HOUR + 1, 0), type: 'reuniao', location: 'Sala A',
  },
  {
    id: 'ap2', lawyerName: 'Dra. Beatriz Fontana', lawyerPhoto: 'https://randomuser.me/api/portraits/women/33.jpg', lawyerOab: 'RJ 89.123',
    title: 'Audiência de Instrução', client: 'Silva vs. Empresa XYZ', startTime: T(NOW_HOUR + 1, 0), endTime: T(NOW_HOUR + 2, 30), type: 'audiencia', location: 'TRT 15ª Região', inProgress: true,
  },
  {
    id: 'ap3', lawyerName: 'Dr. Ricardo Alves', lawyerPhoto: 'https://randomuser.me/api/portraits/men/71.jpg', lawyerOab: 'MG 23.456',
    title: 'Consulta — Primeiro Atendimento', client: 'Pedro Henrique Souza', startTime: T(NOW_HOUR + 2, 0), endTime: T(NOW_HOUR + 2, 30), type: 'consulta', location: 'Online (Meet)',
  },
];

const MOCK_LEADS: LeadQueueItem[] = [
  { id: 'l1', name: 'João Ferreira Carvalho', phone: '(11) 98765-4321', area: 'Direito Trabalhista', receivedAt: T(NOW_HOUR - 1, 15), source: 'whatsapp', priority: 'alta' },
  { id: 'l2', name: 'Fernanda Lima', phone: '(21) 91234-5678', area: 'Direito de Família', receivedAt: T(NOW_HOUR - 2, 0), source: 'site', priority: 'media' },
  { id: 'l3', name: 'Roberto Campos', phone: '(31) 97654-3210', area: 'Direito Civil', receivedAt: T(NOW_HOUR - 3, 30), source: 'indicacao', priority: 'baixa' },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
  textClass: string;
  badge?: number;
}> = ({ icon, label, value, sub, colorClass, textClass, badge }) => (
  <div className={`${colorClass} border rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden`}>
    {badge !== undefined && badge > 0 && (
      <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">{badge > 9 ? '9+' : badge}</span>
    )}
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
    </div>
    <p className={`text-2xl font-black ${textClass}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

// ─── Activity Timeline ────────────────────────────────────────────────────────

const ActivityTimeline: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  const [filter, setFilter] = useState<'todos' | ActivityItem['type']>('todos');
  const filtered = filter === 'todos' ? items : items.filter(i => i.type === filter);

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          ⚡ Atividades Recentes
        </h4>
        <div className="flex gap-1 flex-wrap">
          {([
            { v: 'todos', l: 'Todos' },
            { v: 'doc', l: '📎 Docs' },
            { v: 'lead', l: '👤 Leads' },
            { v: 'alert', l: '⚠️ Alertas' },
            { v: 'appointment', l: '📅 Agenda' },
          ] as const).map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v as typeof filter)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${filter === v ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">Nenhuma atividade neste filtro.</div>
        ) : filtered.map(item => (
          <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${item.urgent ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-black/10'}`}>
            <div className="w-8 h-8 flex items-center justify-center text-lg shrink-0 mt-0.5">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-bold truncate ${item.urgent ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>{item.title}</p>
                <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Lawyer Schedule Widget ───────────────────────────────────────────────────

const ApptTypeMap = {
  reuniao:   { label: 'Reunião',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: '💼' },
  audiencia: { label: 'Audiência',  color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',   icon: '⚖️' },
  consulta:  { label: 'Consulta',   color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: '🩺' },
  online:    { label: 'Online',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400', icon: '💻' },
};

const LawyerScheduleWidget: React.FC<{ appointments: LawyerAppointment[] }> = ({ appointments }) => (
  <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">📅 Próximos Compromissos dos Sócios</h4>
    <div className="space-y-2">
      {appointments.map(ap => {
        const typeMeta = ApptTypeMap[ap.type];
        return (
          <div key={ap.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${ap.inProgress ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-100 dark:border-[#2A2545]'}`}>
            <img src={ap.lawyerPhoto} alt={ap.lawyerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-[#2A2545] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{ap.lawyerName}</p>
                {ap.inProgress && <span className="text-[9px] font-black px-1.5 py-0.5 bg-purple-600 text-white rounded-full animate-pulse">● EM CURSO</span>}
              </div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate">{ap.title}{ap.client ? ` — ${ap.client}` : ''}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-gray-400">{ap.startTime}–{ap.endTime}</span>
                {ap.location && <span className="text-[9px] text-gray-400">· {ap.location}</span>}
              </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${typeMeta.color}`}>{typeMeta.icon} {typeMeta.label}</span>
          </div>
        );
      })}
    </div>
    <button className="w-full py-2 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
      Ver agenda completa →
    </button>
  </div>
);

// ─── Lead Queue Widget ────────────────────────────────────────────────────────

const SOURCE_MAP = {
  whatsapp:  { label: 'WhatsApp', color: 'bg-green-100 text-green-700', icon: '💬' },
  site:      { label: 'Site',     color: 'bg-blue-100 text-blue-700',   icon: '🌐' },
  indicacao: { label: 'Indicação',color: 'bg-amber-100 text-amber-700', icon: '🤝' },
  ligacao:   { label: 'Ligação',  color: 'bg-violet-100 text-violet-700',icon: '📞' },
};

const PRIORITY_MAP = {
  alta:  { color: 'border-l-red-500', badge: 'bg-red-100 text-red-700' },
  media: { color: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-700' },
  baixa: { color: 'border-l-gray-300', badge: 'bg-gray-100 text-gray-600' },
};

const LeadQueueWidget: React.FC<{ leads: LeadQueueItem[]; onDismiss: (id: string) => void }> = ({ leads, onDismiss }) => (
  <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        👤 Fila de Triagem
        {leads.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">{leads.length}</span>}
      </h4>
      <span className="text-xs text-gray-400">Novos clientes aguardando</span>
    </div>
    {leads.length === 0 ? (
      <div className="text-center py-6 text-gray-400">
        <p className="text-3xl mb-1">✅</p>
        <p className="text-sm font-semibold">Fila vazia — tudo em dia!</p>
      </div>
    ) : (
      <div className="space-y-2">
        {leads.map(lead => {
          const src = SOURCE_MAP[lead.source];
          const pri = PRIORITY_MAP[lead.priority];
          return (
            <div key={lead.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 bg-gray-50 dark:bg-black/10 border border-gray-100 dark:border-[#2A2545] ${pri.color}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{lead.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${src.color}`}>{src.icon} {src.label}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{lead.phone} · {lead.area}</p>
                <p className="text-[10px] text-gray-400">Recebido às {lead.receivedAt}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button className="px-2.5 py-1 text-[10px] font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">Atender</button>
                <button onClick={() => onDismiss(lead.id)} className="px-2.5 py-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-black/20 rounded-lg hover:bg-gray-200 transition-colors">Arquivar</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface SecretaryOverviewProps {
  secretary: Secretary;
  assignedLawyer: Lawyer | null;
  onGoToScheduler: () => void;
}

export const SecretaryOverview: React.FC<SecretaryOverviewProps> = ({
  secretary, assignedLawyer, onGoToScheduler,
}) => {
  const [leads, setLeads] = useState<LeadQueueItem[]>(MOCK_LEADS);
  const [unreadMessages] = useState(3);
  const [pendingDocs] = useState(5);

  const dismissLead = (id: string) => setLeads(prev => prev.filter(l => l.id !== id));

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 capitalize">{today}</h3>
          <p className="text-xs text-gray-400">Hub de controle de operações do escritório</p>
        </div>
        {assignedLawyer && (
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/30 rounded-xl px-3 py-2">
            <img src={assignedLawyer.photoUrl} alt={assignedLawyer.name} className="w-6 h-6 rounded-full object-cover" />
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400">{assignedLawyer.name}</p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon="📅"
          label="Atendimentos Hoje"
          value={MOCK_APPOINTMENTS.length}
          sub="Consultas & Reuniões"
          colorClass="bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40"
          textClass="text-purple-700 dark:text-purple-400"
        />
        <KpiCard
          icon="✍️"
          label="Docs Pendentes"
          value={pendingDocs}
          sub="Aguardando assinatura"
          colorClass="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40"
          textClass="text-amber-700 dark:text-amber-400"
          badge={pendingDocs}
        />
        <KpiCard
          icon="👤"
          label="Leads na Fila"
          value={leads.length}
          sub="Aguardando triagem"
          colorClass="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40"
          textClass="text-blue-700 dark:text-blue-400"
          badge={leads.length}
        />
        <KpiCard
          icon="💬"
          label="Msgs Não Respondidas"
          value={unreadMessages}
          sub="Canais integrados"
          colorClass="bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40"
          textClass="text-red-700 dark:text-red-400"
          badge={unreadMessages}
        />
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📅', label: 'Novo Agendamento', color: 'bg-purple-600 hover:bg-purple-700', action: onGoToScheduler },
          { icon: '📎', label: 'Receber Documento', color: 'bg-blue-600 hover:bg-blue-700', action: () => {} },
          { icon: '👤', label: 'Cadastrar Lead', color: 'bg-emerald-600 hover:bg-emerald-700', action: () => {} },
        ].map(({ icon, label, color, action }) => (
          <button key={label} onClick={action}
            className={`${color} text-white rounded-xl py-3 text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-sm hover:shadow-md`}>
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActivityTimeline items={MOCK_ACTIVITIES} />
        <div className="space-y-5">
          <LawyerScheduleWidget appointments={MOCK_APPOINTMENTS} />
        </div>
      </div>

      {/* Lead Queue */}
      <LeadQueueWidget leads={leads} onDismiss={dismissLead} />
    </div>
  );
};
