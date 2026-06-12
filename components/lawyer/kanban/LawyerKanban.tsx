/**
 * LawyerKanban.tsx
 * Quadro Kanban de Tarefas Jurídicas — Painel do Advogado
 * Colunas: A Fazer → Em Produção → Revisão do Advogado → Concluído
 * Cálculo de dias úteis (CPC), badges de urgência, delegação.
 */
import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type KanbanColumn = 'todo' | 'in_progress' | 'review' | 'done';
type TaskType = 'pesquisa' | 'minuta' | 'peticao' | 'recurso' | 'diligencia' | 'outro';
type Priority = 'urgent' | 'high' | 'normal' | 'low';
type AssigneeRole = 'lawyer' | 'intern' | 'secretary';

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  column: KanbanColumn;
  assigneeName: string;
  assigneeRole: AssigneeRole;
  dueDate: string;
  priority: Priority;
  caseRef: string;
  createdAt: string;
  tags?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Brazilian national holidays 2024/2025 (simplified)
const FERIADOS = new Set([
  '2024-01-01','2024-04-21','2024-05-01','2024-09-07','2024-10-12',
  '2024-11-02','2024-11-15','2024-12-25',
  '2025-01-01','2025-04-21','2025-05-01','2025-09-07','2025-10-12',
  '2025-11-02','2025-11-15','2025-12-25',
]);

function calcBusinessDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  let count = 0;
  const cur = new Date(from);
  while (cur <= to) {
    const day = cur.getDay();
    const dateStr = cur.toISOString().split('T')[0];
    if (day !== 0 && day !== 6 && !FERIADOS.has(dateStr)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function businessDaysLeft(dueDate: string): number {
  const today = new Date().toISOString().split('T')[0];
  if (dueDate < today) return -1;
  return calcBusinessDays(today, dueDate);
}

// ─── Mock Initial Data ────────────────────────────────────────────────────────
const INITIAL_TASKS: KanbanTask[] = [
  {
    id: 'k1', title: 'Pesquisa de Jurisprudência — Danos Morais Bancários',
    description: 'Levantar ementas do STJ sobre danos morais por negativação indevida. Priorizar 2023-2024.',
    type: 'pesquisa', column: 'todo', assigneeName: 'João Estagiário', assigneeRole: 'intern',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    priority: 'urgent', caseRef: 'case1', createdAt: new Date().toISOString(), tags: ['STJ', 'Consumidor']
  },
  {
    id: 'k2', title: 'Minuta de Petição Inicial — Reclamação Trabalhista',
    description: 'Elaborar petição inicial com base nos documentos de rescisão e TRCT enviados pelo cliente.',
    type: 'minuta', column: 'in_progress', assigneeName: 'Dr. Carlos Andrade', assigneeRole: 'lawyer',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    priority: 'high', caseRef: 'case2', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), tags: ['CLT', 'Rescisão']
  },
  {
    id: 'k3', title: 'Contestação — Processo de Inventário',
    description: 'Verificar bens declarados e elaborar minuta de contestação com base na escritura.',
    type: 'minuta', column: 'review', assigneeName: 'Maria Estagiária', assigneeRole: 'intern',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'high', caseRef: 'case1', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), tags: ['Família', 'Inventário']
  },
  {
    id: 'k4', title: 'Recurso Ordinário — TRT',
    description: 'Redigir RO contra sentença de improcedência. Teses: vínculo empregatício e horas extras.',
    type: 'recurso', column: 'review', assigneeName: 'Dr. Carlos Andrade', assigneeRole: 'lawyer',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'urgent', caseRef: 'case2', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), tags: ['TRT', 'Recurso']
  },
  {
    id: 'k5', title: 'Agendamento de Perícia Técnica',
    description: 'Contatar perito e agendar data de perícia contábil para o processo societário.',
    type: 'diligencia', column: 'done', assigneeName: 'Ana Secretária', assigneeRole: 'secretary',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    priority: 'normal', caseRef: 'case3', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), tags: ['Perícia']
  },
  {
    id: 'k6', title: 'Levantamento FGTS — Processo Trabalhista',
    description: 'Solicitar extrato FGTS dos últimos 5 anos via CEF e organizar por competência.',
    type: 'pesquisa', column: 'todo', assigneeName: 'João Estagiário', assigneeRole: 'intern',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    priority: 'normal', caseRef: 'case2', createdAt: new Date().toISOString(), tags: ['FGTS', 'CEF']
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS: { id: KanbanColumn; label: string; icon: string; color: string; darkBg: string }[] = [
  { id: 'todo',        label: 'A Fazer',              icon: '📋', color: 'border-t-gray-400',    darkBg: 'bg-gray-50 dark:bg-[#16142A]' },
  { id: 'in_progress', label: 'Em Produção',           icon: '⚙️', color: 'border-t-blue-500',   darkBg: 'bg-blue-50/30 dark:bg-[#14122A]' },
  { id: 'review',      label: 'Revisão do Advogado',   icon: '👁️', color: 'border-t-amber-500',  darkBg: 'bg-amber-50/30 dark:bg-[#191420]' },
  { id: 'done',        label: 'Concluído',             icon: '✅', color: 'border-t-emerald-500', darkBg: 'bg-emerald-50/30 dark:bg-[#12191A]' },
];

const COLUMN_ORDER: KanbanColumn[] = ['todo', 'in_progress', 'review', 'done'];

const TASK_TYPES: Record<TaskType, { label: string; color: string }> = {
  pesquisa:   { label: 'Pesquisa',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  minuta:     { label: 'Minuta',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  peticao:    { label: 'Petição',    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  recurso:    { label: 'Recurso',    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  diligencia: { label: 'Diligência', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  outro:      { label: 'Outro',      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

const PRIORITY_MAP: Record<Priority, { label: string; dot: string; text: string }> = {
  urgent: { label: 'Urgente', dot: 'bg-rose-500 animate-pulse', text: 'text-rose-600 dark:text-rose-400' },
  high:   { label: 'Alta',    dot: 'bg-amber-500',              text: 'text-amber-600 dark:text-amber-400' },
  normal: { label: 'Normal',  dot: 'bg-blue-400',               text: 'text-blue-500 dark:text-blue-400' },
  low:    { label: 'Baixa',   dot: 'bg-gray-300',               text: 'text-gray-400' },
};

const ROLE_ICON: Record<AssigneeRole, string> = { lawyer: '👨‍⚖️', intern: '🎓', secretary: '🗂️' };

// ─── Task Card ────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: KanbanTask;
  onMove: (id: string, direction: 'left' | 'right') => void;
  onDelete: (id: string) => void;
  colIndex: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onDelete, colIndex }) => {
  const daysLeft = businessDaysLeft(task.dueDate);
  const isOverdue = daysLeft < 0;
  const isUrgentDeadline = daysLeft >= 0 && daysLeft <= 3;
  const prio = PRIORITY_MAP[task.priority];
  const typeInfo = TASK_TYPES[task.type];

  return (
    <div className={`bg-white dark:bg-[#1A1730] border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 group ${
      isOverdue ? 'border-rose-300 dark:border-rose-800/60' :
      isUrgentDeadline ? 'border-amber-300 dark:border-amber-800/60' :
      'border-gray-200 dark:border-[#2A2545]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot} inline-block`} />
          <span className={`text-[9px] font-bold ${prio.text}`}>{prio.label}</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-xs font-bold text-gray-800 dark:text-white leading-snug mb-1.5">{task.title}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map(tag => (
            <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-black/20 text-gray-500 dark:text-gray-400 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#2A2545] space-y-2">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <span>{ROLE_ICON[task.assigneeRole]}</span>
          <span className="font-medium">{task.assigneeName}</span>
          <span className="ml-auto font-mono text-gray-400">{task.caseRef}</span>
        </div>

        {/* Deadline */}
        <div className={`flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2 py-1 ${
          isOverdue ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400' :
          isUrgentDeadline ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' :
          'bg-gray-50 dark:bg-black/10 text-gray-500 dark:text-gray-400'
        }`}>
          <span>⏱️</span>
          {isOverdue
            ? `⚠ Vencido há ${Math.abs(daysLeft)} dias úteis`
            : daysLeft === 0
              ? '🔥 Vence hoje!'
              : `${daysLeft} dias úteis (CPC)`
          }
        </div>

        {/* Move buttons */}
        {task.column !== 'done' && (
          <div className="flex gap-1.5 pt-0.5">
            {colIndex > 0 && (
              <button
                onClick={() => onMove(task.id, 'left')}
                className="flex-1 px-2 py-1 text-[9px] font-bold bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-black/30 transition-colors"
              >
                ← Voltar
              </button>
            )}
            <button
              onClick={() => onMove(task.id, 'right')}
              className="flex-1 px-2 py-1 text-[9px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              {task.column === 'review' ? '✅ Aprovar' : 'Avançar →'}
            </button>
          </div>
        )}
        {task.column === 'done' && (
          <div className="flex gap-1.5 pt-0.5">
            <button
              onClick={() => onMove(task.id, 'left')}
              className="flex-1 px-2 py-1 text-[9px] font-bold bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-black/30 transition-colors"
            >
              ← Reabrir
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="px-2 py-1 text-[9px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition-colors"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Add Task Modal ───────────────────────────────────────────────────────────
interface AddTaskModalProps {
  onAdd: (task: Omit<KanbanTask, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('pesquisa');
  const [priority, setPriority] = useState<Priority>('normal');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeRole, setAssigneeRole] = useState<AssigneeRole>('intern');
  const [dueDate, setDueDate] = useState('');
  const [caseRef, setCaseRef] = useState('');
  const [column, setColumn] = useState<KanbanColumn>('todo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeName.trim() || !dueDate) return;
    onAdd({ title, description, type, priority, assigneeName, assigneeRole, dueDate, caseRef, column });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">➕ Nova Tarefa Jurídica</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Título *</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Ex: Pesquisa de jurisprudência..."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Descrição</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Detalhes da tarefa..."
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value as TaskType)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                  {Object.entries(TASK_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Prioridade</label>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                  {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Responsável *</label>
                <input value={assigneeName} onChange={e => setAssigneeName(e.target.value)} required
                  placeholder="Nome do responsável"
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Perfil</label>
                <select value={assigneeRole} onChange={e => setAssigneeRole(e.target.value as AssigneeRole)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                  <option value="lawyer">Advogado</option>
                  <option value="intern">Estagiário</option>
                  <option value="secretary">Secretária</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Prazo *</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Coluna Inicial</label>
                <select value={column} onChange={e => setColumn(e.target.value as KanbanColumn)}
                  className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A]">
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">Referência do Caso</label>
              <input value={caseRef} onChange={e => setCaseRef(e.target.value)}
                placeholder="Ex: case1"
                className="w-full border border-gray-300 dark:border-[#2A2545] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-[#12102A] focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-black/20 rounded-xl hover:bg-gray-200 dark:hover:bg-black/30 transition-colors">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
                ➕ Criar Tarefa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface LawyerKanbanProps {
  lawyerName?: string;
}

export const LawyerKanban: React.FC<LawyerKanbanProps> = ({ lawyerName }) => {
  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    try {
      const saved = localStorage.getItem('legis_kanban_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch { return INITIAL_TASKS; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const saveTasks = (next: KanbanTask[]) => {
    setTasks(next);
    localStorage.setItem('legis_kanban_tasks', JSON.stringify(next));
  };

  const handleMove = (id: string, direction: 'left' | 'right') => {
    saveTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const curIdx = COLUMN_ORDER.indexOf(t.column);
      const nextIdx = direction === 'right' ? curIdx + 1 : curIdx - 1;
      const nextCol = COLUMN_ORDER[Math.max(0, Math.min(COLUMN_ORDER.length - 1, nextIdx))];
      return { ...t, column: nextCol };
    }));
  };

  const handleDelete = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const handleAdd = (newTask: Omit<KanbanTask, 'id' | 'createdAt'>) => {
    const task: KanbanTask = {
      ...newTask,
      id: `k${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveTasks([...tasks, task]);
  };

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  }), [tasks, filterType, filterPriority]);

  const getColumnTasks = (col: KanbanColumn) => filteredTasks.filter(t => t.column === col);

  const urgentCount = tasks.filter(t => {
    const d = businessDaysLeft(t.dueDate);
    return t.column !== 'done' && (d < 0 || d <= 3);
  }).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-[#2A2545] pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🗂️ Kanban de Tarefas Jurídicas
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Workflow: A Fazer → Em Produção → Revisão → Concluído. Prazos em dias úteis (CPC).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full border border-rose-200 dark:border-rose-900/40 animate-pulse">
              ⚠ {urgentCount} tarefa(s) urgente(s)
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            ➕ Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Tipo:</span>
          {(['all', ...Object.keys(TASK_TYPES)] as (TaskType | 'all')[]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterType === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-black/30'
              }`}
            >
              {t === 'all' ? 'Todos' : TASK_TYPES[t as TaskType].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold">Prioridade:</span>
          {(['all', 'urgent', 'high', 'normal', 'low'] as (Priority | 'all')[]).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterPriority === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-black/30'
              }`}
            >
              {p === 'all' ? 'Todas' : PRIORITY_MAP[p as Priority]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map((col, colIndex) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className={`${col.darkBg} border border-gray-200 dark:border-[#2A2545] rounded-2xl p-3 border-t-4 ${col.color} min-h-[300px]`}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-200">{col.label}</span>
                </div>
                <span className="px-2 py-0.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] text-xs font-bold text-gray-600 dark:text-gray-400 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onMove={handleMove}
                    onDelete={handleDelete}
                    colIndex={colIndex}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="text-2xl mb-2 opacity-30">{col.icon}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-600">Nenhuma tarefa aqui</p>
                  </div>
                )}
              </div>

              {/* Add in column */}
              {col.id === 'todo' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full mt-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-600 border border-dashed border-gray-300 dark:border-[#2A2545] rounded-xl hover:border-violet-400 hover:text-violet-500 dark:hover:text-violet-400 transition-all"
                >
                  + Adicionar tarefa
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const count = tasks.filter(t => t.column === col.id).length;
          return (
            <div key={col.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl p-3 text-center">
              <p className="text-xl font-black text-gray-800 dark:text-white">{count}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{col.icon} {col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && <AddTaskModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
