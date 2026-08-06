import React, { useState } from 'react';

interface MentorshipSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MentorshipSchedulerModal: React.FC<MentorshipSchedulerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedLawyer, setSelectedLawyer] = useState('Dr. Carlos Silva (OAB/SP 123456)');
  const [date, setDate] = useState('2026-08-12');
  const [time, setTime] = useState('14:00');
  const [topic, setTopic] = useState('Revisão de Peça Prática — Habeas Corpus');
  const [scheduled, setScheduled] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduled(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 via-primary/10 to-indigo-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 4 — Programa de Mentoria
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Agendamento de Mentoria 1-on-1 com Advogado Tutor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {scheduled ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                📅
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Mentoria Confirmada!
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-sm mx-auto">
                Sessão agendada com **{selectedLawyer}** para o dia **{date} às {time}**. O link da sala virtual Google Meet / Zoom foi enviado para seu e-mail.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
              >
                Voltar ao Painel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Selecione o Advogado Tutor / Mentor
                </label>
                <select
                  value={selectedLawyer}
                  onChange={e => setSelectedLawyer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option>Dr. Carlos Silva (OAB/SP 123456) — Direito Penal & Processual</option>
                  <option>Dra. Ana Beatriz Santos (OAB/RJ 654321) — Direito Trabalhista</option>
                  <option>Dr. Roberto Mendes (OAB/MG 987654) — Direito Civil & Família</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Data da Mentoria
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tópico / Dúvida Principal
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Ex: Orientação sobre carreira e tese defensiva"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                🎓 Cada mentoria concluída contabiliza **2 horas de prática jurídica acadêmica** no seu relatório de horas de estágio.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
              >
                Confirmar Agendamento de Mentoria
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
