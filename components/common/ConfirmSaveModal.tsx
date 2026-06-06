import React, { useState } from 'react';

export interface ConfirmSaveField {
  label: string;
  oldValue: string;
  newValue: string;
}

interface ConfirmSaveModalProps {
  title: string;
  userName: string;
  userEmail: string;
  fields: ConfirmSaveField[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSaveModal: React.FC<ConfirmSaveModalProps> = ({
  title, userName, userEmail, fields, onConfirm, onCancel
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // The admin password is hardcoded for demo purposes (in production this would be a real auth check)
  const ADMIN_PASSWORD = 'legisadmin';

  const changedFields = fields.filter(f => f.oldValue !== f.newValue);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminPassword) { setError('Digite sua senha de administrador para confirmar.'); return; }
    if (adminPassword !== ADMIN_PASSWORD) { setError('Senha de administrador incorreta.'); return; }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🔒 Confirmação de Segurança
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Revise as alterações antes de salvar</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
          </div>

          {/* User info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-1">
            <p className="font-bold text-blue-900">{title}</p>
            <p className="text-blue-700"><span className="font-semibold">Usuário:</span> {userName}</p>
            <p className="text-blue-700"><span className="font-semibold">E-mail:</span> {userEmail}</p>
          </div>

          {/* Changed fields */}
          {changedFields.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campos Alterados ({changedFields.length})</p>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {changedFields.map((f, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-gray-700 mb-1">{f.label}</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-red-600 line-through">Antes: {f.oldValue || '(vazio)'}</p>
                      <p className="text-green-700 font-semibold">Depois: {f.newValue || '(vazio)'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
              Nenhuma alteração detectada.
            </div>
          )}

          {/* Admin password confirmation */}
          <form onSubmit={handleConfirm} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                🛡️ Senha do Administrador *
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Confirme com sua senha admin"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={changedFields.length === 0}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Confirmar e Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
