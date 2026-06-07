import React, { useState } from 'react';
import type { User } from '../../types';
import { MailIcon } from '../common/IconComponents';

interface CompleteProfilePageProps {
  user: User;
  onUpdateProfile: (data: { name: string; phone: string; address: string; }) => void;
}

export const CompleteProfilePage: React.FC<CompleteProfilePageProps> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !address.trim()) {
        setError('Todos os campos são obrigatórios.');
        return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        onUpdateProfile({ name, phone, address });
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Complete seu perfil para continuar</h1>
        <p className="text-center text-gray-600 mt-2">Para acessar seu painel e utilizar todos os recursos da Legis Connect, precisamos de mais algumas informações.</p>
        
        <div className="mt-6 bg-gray-50 p-3 rounded-md flex items-center justify-center space-x-2">
            <MailIcon className="w-5 h-5 text-gray-400"/>
            <p className="text-sm text-gray-700 font-medium">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
                <label htmlFor="complete-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input id="complete-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
            </div>
            <div>
                <label htmlFor="complete-phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input id="complete-phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
            </div>
            <div>
                <label htmlFor="complete-address" className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                <input id="complete-address" name="address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
            </div>

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <div className="pt-2">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-150">
                    {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
