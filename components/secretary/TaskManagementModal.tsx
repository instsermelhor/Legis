import React, { useState } from 'react';

export interface TaskItem {
  id: string;
  title: string;
  assignedLawyer: string;
  priority: 'alta' | 'media' | 'baixa';
  dueDate: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  category: 'protocolo' | 'atendimento' | 'documentacao' | 'agenda';
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Organizar documentos pessoais do cliente João Ferreira (RG/CPF/Residência)',
    assignedLawyer: 'Dr. Carlos Silva',
    priority: 'alta',
    dueDate: 'Hoje às 17:00',
    status: 'em_andamento',
    category: 'documentacao',
  },
  {
    id: 't-2',
    title: 'Confirmar presença na audiência de conciliação das 14h via WhatsApp',
    assignedLawyer: 'Dra. Ana Beatriz Santos',
    priority: 'alta',
    dueDate: 'Amanhã às 10:00',
    status: 'pendente',
    category: 'agenda',
  },
  {
    id: 't-3',
    title: 'Fazer pré-triagem das mensagens recebidas pelo site',
    assignedLawyer: 'Geral Escritório',
    priority: 'media',
    dueDate: 'Hoje às 18:00',
    status: 'concluido',
    category: 'atendimento',
  },
];

interface TaskManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskManagementModal: React.FC<TaskManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [assignedLawyer, setAssignedLawyer] = useState('Dr. Carlos Silva');
  const [priority, setPriority] = useState<'alta' | 'media' | 'baixa'>('media');

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedLawyer,
      priority,
      dueDate: 'Hoje',
      status: 'pendente',
      category: 'atendimento',
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'pendente' ? 'em_andamento' : t.status === 'em_andamento' ? 'concluido' : 'pendente';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-indigo-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 5 — Módulo de Secretariado
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Gestão de Tarefas & Apoio Operacional
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Add New Task Bar */}
        <form onSubmit={handleAddTask} className="p-4 bg-gray-50 dark:bg-[#141126] border-b border-gray-200 dark:border-[#2A2545] flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Nova tarefa de secretariado ou apoio jurídico..."
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          />
          <select
            value={assignedLawyer}
            onChange={e => setAssignedLawyer(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white"
          >
            <option>Dr. Carlos Silva</option>
            <option>Dra. Ana Beatriz Santos</option>
            <option>Geral Escritório</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow"
          >
            + Criar Tarefa
          </button>
        </form>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto divide-y divide-gray-100 dark:divide-[#252040] flex-1 space-y-3">
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleStatus(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                t.status === 'concluido'
                  ? 'bg-gray-50 dark:bg-[#151226]/50 border-gray-200 dark:border-[#252040] opacity-60 line-through'
                  : t.priority === 'alta'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30'
                    : 'bg-white dark:bg-[#1A1730] border-gray-200 dark:border-[#2A2545] hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  t.status === 'concluido' ? 'bg-emerald-500 text-white' : 'border border-gray-400 text-transparent'
                }`}>
                  ✓
                </span>
                <div>
                  <div className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Advogado: <span className="font-semibold">{t.assignedLawyer}</span> • Prazo: {t.dueDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  t.priority === 'alta' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {t.priority}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  t.status === 'concluido' ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
