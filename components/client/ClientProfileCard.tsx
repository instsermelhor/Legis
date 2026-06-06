import React, { useState } from 'react';
import type { User } from '../../types';
import { UserCircleIcon, MailIcon, PhoneIcon, LocationMarkerIcon } from '../common/IconComponents';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';

interface ClientProfileCardProps {
    user: User;
    onUpdateProfile?: (updates: Partial<User>) => void;
    onUpdateEmail?: (newEmail: string) => void;
}

export const ClientProfileCard: React.FC<ClientProfileCardProps> = ({ user, onUpdateProfile, onUpdateEmail }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    const [saved, setSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const handleSave = () => {
        if (onUpdateProfile) onUpdateProfile(form);
        setSaved(true);
        setTimeout(() => { setSaved(false); setIsEditing(false); }, 2000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Meu Perfil</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        ✏️ Editar
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome</label>
                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Telefone</label>
                        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Endereço</label>
                        <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Rua, Nº, Bairro, Cidade - UF" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                            {saved ? '✓ Salvo!' : 'Salvar'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-center">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                        <span>{user.name}</span>
                    </div>
                    <div className="flex items-center">
                        <MailIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                        <span>{user.email}</span>
                    </div>
                    {user.phone && (
                        <div className="flex items-center">
                            <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                    {user.address && (
                        <div className="flex items-center">
                            <LocationMarkerIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                            <span>{user.address}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Security Section */}
            <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔐 Segurança</p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-left text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors"
                    >
                        🔑 Alterar Senha
                    </button>
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className="text-left text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
                    >
                        📧 Alterar E-mail de Acesso
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <ChangePasswordModal
                    onClose={() => setShowPasswordModal(false)}
                    onSave={(cur, _next) => cur.length >= 4}
                />
            )}
            {showEmailModal && (
                <ChangeEmailModal
                    currentEmail={user.email}
                    onClose={() => setShowEmailModal(false)}
                    onSave={(pwd, newEmail) => {
                        if (pwd.length < 4) return false;
                        if (onUpdateEmail) onUpdateEmail(newEmail);
                        return true;
                    }}
                />
            )}
        </div>
    );
};
