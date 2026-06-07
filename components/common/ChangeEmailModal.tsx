import React, { useState } from 'react';

interface ChangeEmailModalProps {
  currentEmail: string;
  onClose: () => void;
  onSave: (password: string, newEmail: string) => boolean;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ currentEmail, onClose, onSave }) => {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !newEmail || !confirmEmail) { setError('Preencha todos os campos.'); return; }
    if (!/\S+@\S+\.\S+/.test(newEmail)) { setError('O novo e-mail não é válido.'); return; }
    if (newEmail !== confirmEmail) { setError('Os e-mails não coincidem.'); return; }
    if (newEmail === currentEmail) { setError('O novo e-mail é igual ao atual.'); return; }
    const ok = onSave(password, newEmail);
    if (!ok) { setError('Senha incorreta. Confirme sua senha atual para alterar o e-mail.'); return; }
    setSuccess(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">📧 Alterar E-mail</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
            <span className="font-semibold">E-mail atual:</span> {currentEmail}
          </div>

          {success ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-semibold text-green-700">E-mail alterado com sucesso!</p>
              <p className="text-xs text-gray-500 mt-1">Seu novo e-mail de acesso é: <strong>{newEmail}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirme sua Senha Atual *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="Sua senha de acesso"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Novo E-mail *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="novo@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirmar Novo E-mail *</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                  placeholder="Repita o novo e-mail"
                />
              </div>
              {error && <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                  Alterar E-mail
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
