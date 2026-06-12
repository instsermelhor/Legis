/**
 * SecretaryWorkspace.tsx
 * Workspace da Secretária/Assistente Jurídico — Painel do Advogado
 * Triagem de novas demandas, agenda semanal de consultas e painel de recados.
 */
import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'converted' | 'lost';
type LeadArea = 'Civil' | 'Trabalhista' | 'Penal' | 'Família' | 'Previdenciário' | 'Empresarial' | 'Outro';
type UrgencyLevel = 'high' | 'medium' | 'low';
type MessageStatus = 'unread' | 'read' | 'replied';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: LeadArea;
  summary: string;
  urgency: UrgencyLevel;
  status: LeadStatus;
  receivedAt: string;
  secretaryNote?: string;
}

interface AgendaItem {
  id: string;
  date: string;
  time: string;
  clientName: string;
  type: 'consulta' | 'audiencia' | 'reuniao';
  modality: 'presencial' | 'videochamada' | 'telefone';
  location: string;
  duration: number; // minutos
  confirmed: boolean;
}

interface SecretaryMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  sentAt: string;
  status: MessageStatus;
  priority: 'urgent' | 'normal';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LEADS: Lead[] = [
  {
    id: 'l1', name: 'Roberto Almeida', phone: '(11) 99876-5432', email: 'roberto@email.com',
    area: 'Trabalhista', summary: 'Demissão sem justa causa, FGTS não depositado, horas extras não pagas. Trabalhou por 5 anos na empresa.',
    urgency: 'high', status: 'new', receivedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'l2', name: 'Fernanda Souza', phone: '(11) 91234-5678',
    area: 'Família', summary: 'Divórcio litigioso com disputa de guarda de dois filhos menores. Patrimônio a partilhar inclui imóvel e veículo.',
    urgency: 'medium', status: 'contacted', receivedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    secretaryNote: 'Cliente preferirá horário à tarde. Aguardando documentos por WhatsApp.',
  },
  {
    id: 'l3', name: 'Carlos Mendes', phone: '(21) 98765-4321',
    area: 'Empresarial', summary: 'Necessita constituição de holding familiar para planejamento patrimonial e sucessório.',
    urgency: 'low', status: 'scheduled', receivedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    secretaryNote: 'Consulta agendada para 15/06/2025 às 15h.',
  },
  {
    id: 'l4', name: 'Patrícia Lima', phone: '(31) 97654-3210',
    area: 'Previdenciário', summary: 'Aposentadoria por invalidez negada pelo INSS. Quer recorrer administrativamente.',
    urgency: 'high', status: 'new', receivedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

const MOCK_AGENDA: AgendaItem[] = [
  {
    id: 'ag1', date: new Date().toISOString().split('T')[0], time: '09:00',
    clientName: 'Ana Clara Dias', type: 'consulta', modality: 'presencial',
    location: 'Escritório — Sala 1', duration: 60, confirmed: true,
  },
  {
    id: 'ag2', date: new Date().toISOString().split('T')[0], time: '11:30',
    clientName: 'Roberto Almeida', type: 'consulta', modality: 'videochamada',
    location: 'Google Meet — link enviado', duration: 45, confirmed: false,
  },
  {
    id: 'ag3',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00',
    clientName: 'Fernanda Souza', type: 'consulta', modality: 'presencial',
    location: 'Escritório — Sala 2', duration: 90, confirmed: true,
  },
  {
    id: 'ag4',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], time: '10:00',
    clientName: 'Carlos Mendes', type: 'reuniao', modality: 'presencial',
    location: 'Sala de Reuniões', duration: 120, confirmed: true,
  },
];

const MOCK_MESSAGES: SecretaryMessage[] = [
  {
    id: 'm1', from: 'Ana Secretária', subject: 'Documentos de Roberto Almeida recebidos',
    body: 'Dr. Carlos, os documentos trabalhistas do Sr. Roberto Almeida foram recebidos via WhatsApp (CTPS, holerites e carta demissão). Arquivei na pasta do caso. Confirmar consulta às 11h?',
    sentAt: new Date(Date.now() - 1 * 3600000).toISOString(), status: 'unread', priority: 'normal',
  },
  {
    id: 'm2', from: 'Ana Secretária', subject: '⚠️ URGENTE — Prazo de contestação amanhã',
    body: 'Dr. Carlos, o prazo para contestar o processo 0089123-11.2024 vence AMANHÃ. Preciso de sua orientação para protocolar. O prazo é às 23:59 via PJe.',
    sentAt: new Date(Date.now() - 30 * 60000).toISOString(), status: 'unread', priority: 'urgent',
  },
  {
    id: 'm3', from: 'Ana Secretária', subject: 'Lembrete — Reunião com perito amanhã às 10h',
    body: 'Confirmando reunião com Dr. Paulo Henrique (perito contábil) amanhã às 10h no escritório. O perito confirmou presença.',
    sentAt: new Date(Date.now() - 3 * 3600000).toISOString(), status: 'read', priority: 'normal',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_STATUS_MAP: Record<LeadStatus, { label: string; color: string; icon: string }> = {
  new:       { label: 'Nova',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',     icon: '🆕' },
  contacted: { label: 'Contatado',  color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', icon: '📞' },
  scheduled: { label: 'Agendado',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',     icon: '📅' },
  converted: { label: 'Cliente',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: '✅' },
  lost:      { label: 'Perdido',    color: 'bg-gray-100 text-gray-500 dark:bg-gray-700/30 dark:text-gray-400',     icon: '❌' },
};

const URGENCY_MAP: Record<UrgencyLevel, { label: string; color: string }> = {
  high:   { label: 'Alta',   color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  medium: { label: 'Média',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  low:    { label: 'Baixa',  color: 'bg-gray-100 text-gray-500 dark:bg-gray-700/30 dark:text-gray-400' },
};

const MODALITY_ICON: Record<string, string> = { presencial: '🏢', videochamada: '💻', telefone: '📞' };

// ─── Lead Triage Card ─────────────────────────────────────────────────────────
const LeadCard: React.FC<{
  lead: Lead;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdateNote: (id: string, note: string) => void;
}> = ({ lead, onUpdateStatus, onUpdateNote }) => {
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState(lead.secretaryNote || '');
  const statusInfo = LEAD_STATUS_MAP[lead.status];
  const urgencyInfo = URGENCY_MAP[lead.urgency];

  const timeAgo = (() => {
    const diff = Date.now() - new Date(lead.receivedAt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `há ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h}h`;
    return `há ${Math.floor(h / 24)}d`;
  })();

  return (
    <div className={`bg-white dark:bg-[#1A1730] border rounded-2xl p-4 shadow-sm ${lead.urgency === 'high' ? 'border-rose-200 dark:border-rose-900/40' : 'border-gray-200 dark:border-[#2A2545]'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white">{lead.name}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{lead.phone} · {timeAgo}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${urgencyInfo.color}`}>{urgencyInfo.label}</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.icon} {statusInfo.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="px-2 py-0.5 text-[9px] font-bold bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 rounded-full">⚖️ {lead.area}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{lead.summary}</p>

      {/* Secretary Note */}
      {editingNote ? (
        <div className="mt-3">
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="Anotação interna..."
            className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white dark:bg-[#12102A] resize-none"
          />
          <div className="flex gap-2 mt-1.5">
            <button onClick={() => { onUpdateNote(lead.id, note); setEditingNote(false); }}
              className="px-2 py-1 bg-violet-600 text-white text-[9px] font-bold rounded-lg">Salvar</button>
            <button onClick={() => setEditingNote(false)}
              className="px-2 py-1 bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-300 text-[9px] font-bold rounded-lg">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditingNote(true)}
          className="mt-2 text-[9px] font-bold text-violet-600 dark:text-violet-400 hover:underline">
          {lead.secretaryNote ? `📝 ${lead.secretaryNote}` : '+ Adicionar anotação'}
        </button>
      )}

      {/* Status actions */}
      <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-gray-100 dark:border-[#2A2545]">
        {(['contacted', 'scheduled', 'converted', 'lost'] as LeadStatus[])
          .filter(s => s !== lead.status)
          .map(s => (
            <button key={s} onClick={() => onUpdateStatus(lead.id, s)}
              className="flex-1 py-1 text-[8px] font-bold rounded-lg bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-black/30 transition-colors">
              {LEAD_STATUS_MAP[s].icon} {LEAD_STATUS_MAP[s].label}
            </button>
          ))
        }
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
type WorkspaceTab = 'triage' | 'agenda' | 'messages';

export const SecretaryWorkspace: React.FC = () => {
  const [tab, setTab] = useState<WorkspaceTab>('triage');
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('legis_leads');
      return saved ? JSON.parse(saved) : MOCK_LEADS;
    } catch { return MOCK_LEADS; }
  });
  const [agenda] = useState<AgendaItem[]>(MOCK_AGENDA);
  const [messages, setMessages] = useState<SecretaryMessage[]>(MOCK_MESSAGES);
  const [leadFilter, setLeadFilter] = useState<LeadStatus | 'all'>('all');

  const saveLeads = (next: Lead[]) => {
    setLeads(next);
    localStorage.setItem('legis_leads', JSON.stringify(next));
  };

  const handleUpdateLeadStatus = (id: string, status: LeadStatus) => {
    saveLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleUpdateLeadNote = (id: string, note: string) => {
    saveLeads(leads.map(l => l.id === id ? { ...l, secretaryNote: note } : l));
  };

  const handleReadMessage = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: 'read' } : m));
  };

  const filteredLeads = useMemo(() =>
    leadFilter === 'all' ? leads : leads.filter(l => l.status === leadFilter),
    [leads, leadFilter]
  );

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  // Group agenda by date
  const groupedAgenda = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    agenda.forEach(item => {
      const existing = map.get(item.date) || [];
      map.set(item.date, [...existing, item].sort((a, b) => a.time.localeCompare(b.time)));
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [agenda]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#2A2545] pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">🗂️ Central da Secretária / Assist. Jurídico</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">Triagem de demandas, agenda do escritório e comunicados internos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-[#2A2545]">
        {([
          { id: 'triage', label: '🚦 Triagem de Demandas', count: newLeadsCount },
          { id: 'agenda', label: '📅 Agenda do Escritório', count: agenda.length },
          { id: 'messages', label: '💬 Recados', count: unreadCount },
        ] as { id: WorkspaceTab; label: string; count: number }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all ${
              tab === t.id
                ? 'border-violet-600 text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-violet-600'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${
                tab === t.id ? 'bg-violet-600 text-white' :
                t.id === 'messages' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Triagem Tab ── */}
      {tab === 'triage' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'new', 'contacted', 'scheduled', 'converted', 'lost'] as (LeadStatus | 'all')[]).map(s => (
              <button key={s} onClick={() => setLeadFilter(s)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  leadFilter === s ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400'
                }`}>
                {s === 'all' ? `Todas (${leads.length})` : `${LEAD_STATUS_MAP[s as LeadStatus].icon} ${LEAD_STATUS_MAP[s as LeadStatus].label} (${leads.filter(l => l.status === s).length})`}
              </button>
            ))}
          </div>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-600">
              <span className="text-4xl block mb-2">🚦</span>
              <p className="text-sm">Nenhuma demanda nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onUpdateStatus={handleUpdateLeadStatus}
                  onUpdateNote={handleUpdateLeadNote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Agenda Tab ── */}
      {tab === 'agenda' && (
        <div className="space-y-5">
          {groupedAgenda.map(([date, items]) => {
            const dateObj = new Date(date + 'T00:00:00');
            const today = new Date();
            const isToday = dateObj.toDateString() === today.toDateString();
            const isTomorrow = dateObj.toDateString() === new Date(today.getTime() + 86400000).toDateString();
            const label = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isToday ? '📌 ' : ''}{label}
                  </h3>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-[#2A2545]" />
                  <span className="text-[9px] font-bold text-gray-400">{items.length} compromisso{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-center gap-4 bg-white dark:bg-[#1A1730] border rounded-xl px-4 py-3 ${item.confirmed ? 'border-gray-200 dark:border-[#2A2545]' : 'border-amber-200 dark:border-amber-900/40'}`}>
                      <div className="text-center shrink-0 w-12">
                        <p className="text-sm font-black text-gray-800 dark:text-white">{item.time}</p>
                        <p className="text-[9px] text-gray-400">{item.duration}min</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2545]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{item.clientName}</p>
                          {!item.confirmed && <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full animate-pulse">Não confirmado</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {MODALITY_ICON[item.modality]} {item.modality} · {item.location}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'consulta' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' :
                        item.type === 'audiencia' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Messages Tab ── */}
      {tab === 'messages' && (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => handleReadMessage(msg.id)}
              className={`bg-white dark:bg-[#1A1730] border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                msg.priority === 'urgent' ? 'border-rose-200 dark:border-rose-900/40' :
                msg.status === 'unread' ? 'border-violet-200 dark:border-violet-900/40' :
                'border-gray-200 dark:border-[#2A2545] opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {msg.status === 'unread' && (
                    <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">{msg.subject}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{msg.from}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {msg.priority === 'urgent' && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 bg-rose-600 text-white rounded-full animate-pulse">URGENTE</span>
                  )}
                  <p className="text-[9px] text-gray-400">
                    {new Date(msg.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{msg.body}</p>
              {msg.status === 'read' && (
                <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-2">✓ Lido</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
