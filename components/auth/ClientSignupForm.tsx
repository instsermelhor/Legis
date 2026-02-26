import React, { useState } from 'react';

export interface ClientSignupData {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
}

interface ClientSignupFormProps {
    onSignup: (data: ClientSignupData) => void;
    onShowTerms: () => void;
}

export const ClientSignupForm: React.FC<ClientSignupFormProps> = ({ onSignup, onShowTerms }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!termsAccepted) {
            setError('Você deve aceitar os Termos de Serviço.');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onSignup({ name, email, password, phone, address });
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-fade-in">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Crie sua conta de Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="client-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input id="client-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-email" className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input id="client-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="client-phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input id="client-phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-address" className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <input id="client-address" name="address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-password" className="block text-sm font-medium text-gray-700">Senha</label>
                    <input id="client-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <input id="client-confirm-password" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>

                {error && <p className="text-sm text-center text-red-600">{error}</p>}

                <div className="flex items-start pt-2">
                    <div className="flex items-center h-5">
                        <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">Eu li e aceito os <a href="#" onClick={(e) => { e.preventDefault(); onShowTerms(); }} className="text-primary hover:underline">Termos de Serviço</a></label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !termsAccepted} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-150">
                    {isLoading ? 'Criando conta...' : 'Cadastrar'}
                </button>
            </form>
        </div>
    );
};
