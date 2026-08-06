import React, { useState } from 'react';
import { Icon } from './IconComponents';

interface ProfileChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionText: string;
  points: number;
}

interface ProfileCompletionBarProps {
  userRole?: string;
  userName?: string;
}

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({
  userRole = 'advogado',
  userName = 'Doutor(a)',
}) => {
  const [items, setItems] = useState<ProfileChecklistItem[]>([
    { id: '1', label: 'Cadastrar número da OAB e UF', completed: true, actionText: 'Concluído', points: 25 },
    { id: '2', label: 'Adicionar especialidades jurídicas', completed: true, actionText: 'Concluído', points: 25 },
    { id: '3', label: 'Conectar chave da API Gemini IA', completed: true, actionText: 'Concluído', points: 25 },
    { id: '4', label: 'Cadastrar primeiro cliente ou processo', completed: false, actionText: 'Cadastrar agora', points: 25 },
  ]);

  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const totalPoints = items.reduce((acc, curr) => acc + curr.points, 0);
  const earnedPoints = items.reduce((acc, curr) => acc + (curr.completed ? curr.points : 0), 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-4 md:p-5 mb-6 relative overflow-hidden shadow-sm">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs p-1"
        title="Ocultar widget"
      >
        ✕
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
              Complete seu perfil profissional, {userName}!
            </h4>
            <span className="bg-primary text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {percentage}% Concluído
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Perfis com 100% de conclusão recebem **3x mais destaques** no marketplace de advogados.
          </p>
        </div>

        {/* Gamified progress bar */}
        <div className="w-full md:w-48 bg-gray-200 dark:bg-[#2A2545] rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-gray-200/50 dark:border-[#2A2545]/50">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
              item.completed
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-[#1A1730] border-gray-200 dark:border-[#2A2545] text-gray-700 dark:text-gray-300 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.completed ? 'bg-emerald-500 text-white' : 'border border-gray-400 text-transparent'
              }`}>
                ✓
              </span>
              <span className="truncate">{item.label}</span>
            </div>
            <span className="text-[10px] font-semibold text-primary underline flex-shrink-0">
              {item.completed ? '✓' : item.actionText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
