import { Icon } from '@/components/common/IconComponents';
import React, { useState } from 'react';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!current || !next || !confirm) { setError('Preencha todos os campos.'); return; }
    if (next.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (next !== confirm) { setError('A nova senha e a confirmação não coincidem.'); return; }
    const ok = onSave(current, next);
    if (!ok) { setError('Senha atual incorreta.'); return; }
    setSuccess(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative dark:text-white dark:bg-[#1A1730] dark:border dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ scrollbarWidth: 'none' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="🔑" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Alterar Senha</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold leading-none">&times;</button>
          </div>

          {success ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2"><Icon name="✅" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></p>
              <p className="font-semibold text-green-600 dark:text-green-400">Senha alterada com sucesso!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Senha Atual *</label>
                <input
                  type="password"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  className="w-full border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#12102A] dark:placeholder-gray-500"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Nova Senha *</label>
                <input
                  type="password"
                  value={next}
                  onChange={e => setNext(e.target.value)}
                  className="w-full border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#12102A] dark:placeholder-gray-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#12102A] dark:placeholder-gray-500"
                  placeholder="Repita a nova senha"
                />
              </div>
              {error && <p className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                  Alterar Senha
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
