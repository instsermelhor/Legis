/**
 * SecretaryEfficiency.tsx
 * Serviços de Eficiência & Automações — Painel do Secret./Assist. Jurídico
 * Régua de notificação automática, gerador de link de autocadastro, histórico de disparos.
 */
import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationRule {
  id: string;
  name: string;
  trigger: string; // '48h' | '24h' | '2h' | 'custom'
  channel: 'whatsapp' | 'email' | 'sms';
  template: string;
  active: boolean;
  sentCount: number;
}

interface DispatchLog {
  id: string;
  rule: string;
  client: string;
  channel: 'whatsapp' | 'email' | 'sms';
  sentAt: string;
  status: 'enviado' | 'falhou' | 'pendente';
  event: string;
}

interface AutoRegLink {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
  status: 'ativo' | 'usado' | 'expirado';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RULES: NotificationRule[] = [
  { id: 'r1', name: 'Lembrete 48h antes da audiência', trigger: '48h', channel: 'whatsapp', template: 'Olá {cliente}! Lembramos que sua audiência está marcada para {data} às {hora}. Compareça pontualmente. Dvd: {advogado}', active: true, sentCount: 34 },
  { id: 'r2', name: 'Lembrete 24h antes da audiência', trigger: '24h', channel: 'whatsapp', template: 'Atenção, {cliente}! Sua audiência é AMANHÃ, {data} às {hora}. Não esqueça de levar os documentos solicitados.', active: true, sentCount: 28 },
  { id: 'r3', name: 'Lembrete 2h antes da consulta', trigger: '2h', channel: 'email', template: 'Prezado(a) {cliente}, sua consulta com Dr(a). {advogado} começa em 2 horas ({hora}). Local: {local}.', active: false, sentCount: 12 },
  { id: 'r4', name: 'Confirmação de agendamento', trigger: 'imediato', channel: 'whatsapp', template: 'Agendamento confirmado, {cliente}! Data: {data} | Hora: {hora} | Advogado: {advogado}', active: true, sentCount: 67 },
];

const MOCK_LOGS: DispatchLog[] = [
  { id: 'l1', rule: 'Lembrete 48h antes da audiência', client: 'Ana Paula Mendes', channel: 'whatsapp', sentAt: '10/06 08:00', status: 'enviado', event: 'Audiência 12/06 às 14h' },
  { id: 'l2', rule: 'Lembrete 24h antes da audiência', client: 'João Carvalho', channel: 'whatsapp', sentAt: '11/06 09:00', status: 'enviado', event: 'Audiência 12/06 às 09h' },
  { id: 'l3', rule: 'Lembrete 2h antes da consulta', client: 'Carlos Andrade', channel: 'email', sentAt: '12/06 07:30', status: 'falhou', event: 'Consulta 12/06 às 09h30' },
  { id: 'l4', rule: 'Confirmação de agendamento', client: 'Maria da Costa', channel: 'whatsapp', sentAt: '12/06 11:45', status: 'enviado', event: 'Consulta 13/06 às 14h' },
  { id: 'l5', rule: 'Lembrete 24h antes da audiência', client: 'Pedro Henrique', channel: 'whatsapp', sentAt: '12/06 09:00', status: 'pendente', event: 'Audiência 13/06 às 10h' },
];

const MOCK_LINKS: AutoRegLink[] = [
  { id: 'lk1', token: 'LEGIS-A1B2C3', createdAt: '10/06/2025 14:32', expiresAt: '17/06/2025', status: 'ativo' },
  { id: 'lk2', token: 'LEGIS-D4E5F6', createdAt: '08/06/2025 09:15', expiresAt: '15/06/2025', usedBy: 'Fernanda Lima', status: 'usado' },
  { id: 'lk3', token: 'LEGIS-G7H8I9', createdAt: '01/06/2025 16:00', expiresAt: '08/06/2025', status: 'expirado' },
];

const CHANNEL_META = {
  whatsapp: { icon: '💬', label: 'WhatsApp', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  email:    { icon: '📧', label: 'E-mail',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  sms:      { icon: '📱', label: 'SMS',      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' },
};

const STATUS_LOG = {
  enviado:  'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  falhou:   'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  pendente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

// ─── Notification Rules Section ───────────────────────────────────────────────

const NotificationRulesSection: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>(MOCK_RULES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', trigger: '24h', channel: 'whatsapp' as NotificationRule['channel'], template: '' });
  const [saved, setSaved] = useState(false);

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));

  const handleSaveNew = () => {
    if (!newRule.name.trim() || !newRule.template.trim()) return;
    setSaved(true);
    setTimeout(() => {
      setRules(prev => [...prev, { ...newRule, id: `r_${Date.now()}`, active: true, sentCount: 0 }]);
      setShowNew(false);
      setSaved(false);
      setNewRule({ name: '', trigger: '24h', channel: 'whatsapp', template: '' });
    }, 800);
  };

  const inputCls = 'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-purple-400 dark:placeholder-gray-500';

  const activeCount = rules.filter(r => r.active).length;

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🔔 Régua de Notificação Automática
            <span className="text-[9px] font-black px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">{activeCount} ativa(s)</span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Configure disparos automáticos de lembretes para os clientes</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="px-3 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
          ➕ Nova Regra
        </button>
      </div>

      {/* New rule form */}
      {showNew && (
        <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Nova Regra de Notificação</p>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome da Regra</label>
            <input value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} placeholder="Ex: Lembrete de Consulta 12h antes" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Quando disparar</label>
              <select value={newRule.trigger} onChange={e => setNewRule(r => ({ ...r, trigger: e.target.value }))} className={inputCls}>
                <option value="imediato">Imediato</option>
                <option value="2h">2h antes</option>
                <option value="12h">12h antes</option>
                <option value="24h">24h antes</option>
                <option value="48h">48h antes</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Canal</label>
              <select value={newRule.channel} onChange={e => setNewRule(r => ({ ...r, channel: e.target.value as NotificationRule['channel'] }))} className={inputCls}>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Template da Mensagem</label>
            <textarea value={newRule.template} onChange={e => setNewRule(r => ({ ...r, template: e.target.value }))}
              rows={3} placeholder="Use {cliente}, {data}, {hora}, {advogado} como variáveis..." className={inputCls} />
            <p className="text-[9px] text-gray-400 mt-1">Variáveis: {'{cliente}'}, {'{data}'}, {'{hora}'}, {'{advogado}'}, {'{local}'}</p>
          </div>
          {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl px-3 py-2">✅ Regra criada com sucesso!</div>}
          <div className="flex gap-2">
            <button onClick={() => setShowNew(false)} className="flex-1 py-2 text-xs font-bold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSaveNew} disabled={!newRule.name.trim() || !newRule.template.trim() || saved}
              className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all">
              {saved ? '✅ Salvo!' : '💾 Salvar Regra'}
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {rules.map(rule => {
          const ch = CHANNEL_META[rule.channel];
          const isExpanded = expandedId === rule.id;
          return (
            <div key={rule.id} className={`border rounded-2xl transition-all overflow-hidden ${rule.active ? 'border-green-200 dark:border-green-900/30' : 'border-gray-200 dark:border-[#2A2545] opacity-60'}`}>
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative w-10 h-6 rounded-full transition-all shrink-0 ${rule.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${rule.active ? 'translate-x-4' : ''}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-gray-800 dark:text-white">{rule.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ch.color}`}>{ch.icon} {ch.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Disparar: {rule.trigger} · {rule.sentCount} envio(s)</p>
                </div>
                <button onClick={() => setExpandedId(isExpanded ? null : rule.id)} className="shrink-0 text-gray-400 hover:text-gray-600 px-2">
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-[#2A2545] px-4 pb-4 pt-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">Template</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-black/20 rounded-xl p-3 font-mono">{rule.template}</p>
                  <button className="mt-3 px-3 py-1.5 text-[10px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">✏️ Editar Template</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Auto-Registration Link Generator ────────────────────────────────────────

const AutoRegLinkSection: React.FC = () => {
  const [links, setLinks] = useState<AutoRegLink[]>(MOCK_LINKS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateLink = () => {
    setGenerating(true);
    setTimeout(() => {
      const token = `LEGIS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date();
      const exp = new Date(now);
      exp.setDate(exp.getDate() + 7);
      const newLink: AutoRegLink = {
        id: `lk_${Date.now()}`, token,
        createdAt: now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        expiresAt: exp.toLocaleDateString('pt-BR'),
        status: 'ativo',
      };
      setLinks(prev => [newLink, ...prev]);
      setGenerating(false);
    }, 1200);
  };

  const copyLink = (token: string, id: string) => {
    navigator.clipboard.writeText(`https://legisconnect.com.br/autocadastro/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareWhatsApp = (token: string) => {
    const url = `https://wa.me/?text=Olá! Por favor, preencha seu pré-cadastro em nosso sistema pelo link: https://legisconnect.com.br/autocadastro/${token}`;
    window.open(url, '_blank');
  };

  const STATUS_LINK = {
    ativo:    'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30',
    usado:    'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
    expirado: 'bg-gray-100 dark:bg-black/20 text-gray-500 border-gray-200 dark:border-[#2A2545]',
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-white">🔗 Gerador de Link de Autocadastro</h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Gere um link único para novos clientes preencherem seus dados automaticamente</p>
      </div>

      {/* Generate button */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
        <p className="text-sm font-bold mb-1">Novo Link de Triagem</p>
        <p className="text-xs text-white/80 mb-4">O cliente preenche nome, contato, área de interesse e breve descrição do caso. Validade: 7 dias.</p>
        <button onClick={generateLink} disabled={generating}
          className="bg-white text-purple-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-60 flex items-center gap-2">
          {generating ? <><span className="w-4 h-4 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />Gerando...</> : '🔗 Gerar Link Agora'}
        </button>
      </div>

      {/* Links list */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Histórico de Links</p>
        {links.map(link => (
          <div key={link.id} className={`border rounded-2xl p-4 ${STATUS_LINK[link.status]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-gray-800 dark:text-white font-mono">{link.token}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_LINK[link.status]}`}>
                    {link.status === 'ativo' ? '● Ativo' : link.status === 'usado' ? '✓ Usado' : '✕ Expirado'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Criado: {link.createdAt} · Expira: {link.expiresAt}</p>
                {link.usedBy && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Usado por: {link.usedBy}</p>}
                <p className="text-[10px] text-gray-400 font-mono truncate">legisconnect.com.br/autocadastro/{link.token}</p>
              </div>
              {link.status === 'ativo' && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => copyLink(link.token, link.id)}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-purple-600 bg-white dark:bg-black/20 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap">
                    {copiedId === link.id ? '✓ Copiado!' : '📋 Copiar'}
                  </button>
                  <button onClick={() => shareWhatsApp(link.token)}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-[#25D366] rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap">
                    💬 WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Dispatch History ─────────────────────────────────────────────────────────

const DispatchHistory: React.FC = () => {
  const [filter, setFilter] = useState<'todos' | DispatchLog['status']>('todos');
  const filtered = filter === 'todos' ? MOCK_LOGS : MOCK_LOGS.filter(l => l.status === filter);
  const failedCount = MOCK_LOGS.filter(l => l.status === 'falhou').length;

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">📊 Histórico de Disparos</h4>
          {failedCount > 0 && <p className="text-[10px] text-red-500">{failedCount} disparo(s) com falha</p>}
        </div>
        <div className="flex gap-1.5">
          {(['todos', 'enviado', 'pendente', 'falhou'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-black/20 text-gray-500 hover:bg-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(log => {
          const ch = CHANNEL_META[log.channel];
          return (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-black/10 hover:bg-gray-100 dark:hover:bg-black/20 transition-all">
              <span className="text-base">{ch.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{log.client}</p>
                <p className="text-[10px] text-gray-400 truncate">{log.rule} · {log.event}</p>
                <p className="text-[9px] text-gray-400">{log.sentAt}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_LOG[log.status]}`}>
                {log.status === 'enviado' ? '✓ Enviado' : log.status === 'falhou' ? '✕ Falha' : '⏳ Pendente'}
              </span>
              {log.status === 'falhou' && (
                <button className="shrink-0 px-2 py-1 text-[9px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap">
                  ↺ Reenviar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecretaryEfficiency: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">💼 Serviços de Eficiência</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automações de atendimento para ganho de escala e redução de inadimplência</p>
      </div>
      <NotificationRulesSection />
      <AutoRegLinkSection />
      <DispatchHistory />
    </div>
  );
};
