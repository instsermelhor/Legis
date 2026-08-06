import React, { useState } from 'react';

export interface WaitingClient {
  id: string;
  clientName: string;
  lawyerName: string;
  arrivalTime: string;
  appointmentTime: string;
  status: 'aguardando' | 'em_atendimento' | 'concluido';
  serviceType: string;
}

const INITIAL_WAITING: WaitingClient[] = [
  {
    id: 'w-1',
    clientName: 'Maria Oliveira Santos',
    lawyerName: 'Dr. Carlos Silva',
    arrivalTime: '13:45',
    appointmentTime: '14:00',
    status: 'aguardando',
    serviceType: 'Consulta Inicial — Divórcio',
  },
  {
    id: 'w-2',
    clientName: 'João Ferreira Filho',
    lawyerName: 'Dra. Ana Beatriz Santos',
    arrivalTime: '14:10',
    appointmentTime: '14:30',
    status: 'em_atendimento',
    serviceType: 'Revisão Contratual',
  },
];

interface WaitingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [waitingList, setWaitingList] = useState<WaitingClient[]>(INITIAL_WAITING);
  const [newClientName, setNewClientName] = useState('');
  const [lawyerName, setLawyerName] = useState('Dr. Carlos Silva');

  if (!isOpen) return null;

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: WaitingClient = {
      id: `w-${Date.now()}`,
      clientName: newClientName.trim(),
      lawyerName,
      arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      appointmentTime: 'Agora',
      status: 'aguardando',
      serviceType: 'Atendimento Recepção',
    };

    setWaitingList(prev => [newClient, ...prev]);
    setNewClientName('');
  };

  const updateStatus = (id: string, status: WaitingClient['status']) => {
    setWaitingList(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 via-primary/10 to-indigo-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 5 — Sala de Espera Virtual
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Check-in de Clientes & Recepção do Escritório
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Check-in Form */}
        <form onSubmit={handleCheckIn} className="p-4 bg-gray-50 dark:bg-[#141126] border-b border-gray-200 dark:border-[#2A2545] flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newClientName}
            onChange={e => setNewClientName(e.target.value)}
            placeholder="Nome do cliente que acabou de chegar..."
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          />
          <select
            value={lawyerName}
            onChange={e => setLawyerName(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white"
          >
            <option>Dr. Carlos Silva</option>
            <option>Dra. Ana Beatriz Santos</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow"
          >
            ✓ Confirmar Chegada
          </button>
        </form>

        {/* Waiting Stream List */}
        <div className="p-6 overflow-y-auto divide-y divide-gray-100 dark:divide-[#252040] flex-1 space-y-3">
          {waitingList.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>👤 {c.clientName}</span>
                  <span className="text-[10px] font-normal text-gray-400">
                    (Chegou às {c.arrivalTime})
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Advogado: <span className="font-semibold">{c.lawyerName}</span> • Servico: {c.serviceType}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {c.status === 'aguardando' && (
                  <button
                    onClick={() => updateStatus(c.id, 'em_atendimento')}
                    className="px-3 py-1.5 bg-blue-500 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-600 transition-all"
                  >
                    Chamar p/ Atendimento
                  </button>
                )}
                {c.status === 'em_atendimento' && (
                  <button
                    onClick={() => updateStatus(c.id, 'concluido')}
                    className="px-3 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-600 transition-all"
                  >
                    ✓ Finalizar Consulta
                  </button>
                )}
                {c.status === 'concluido' && (
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl">
                    ✓ Concluído
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
