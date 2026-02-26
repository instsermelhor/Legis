import React, { useState } from 'react';
import { mockLawyers } from '../../services/mockLawyerService';

export interface Credentials {
    email: string;
    password?: string;
}

interface LoginFormProps {
    onLogin: (credentials: Credentials) => boolean;
}

const ADMIN_EMAIL = 'admin@legisconnect.com';

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [userType, setUserType] = useState<'admin' | 'lawyer' | 'client' | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        
        const lowerEmail = newEmail.toLowerCase().trim();

        if (!lowerEmail || !/^\S+@\S+\.\S+$/.test(lowerEmail)) {
            setUserType(null);
            setIsPasswordVisible(false);
            return;
        }

        setIsPasswordVisible(true);

        if (lowerEmail === ADMIN_EMAIL) {
            setUserType('admin');
        } else if (mockLawyers.some(l => l.contact.email.toLowerCase() === lowerEmail)) {
            setUserType('lawyer');
        } else {
            setUserType('client');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const success = onLogin({ email, password });
            if (!success) {
                setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.');
            }
            setIsLoading(false);
        }, 500);
    };

    const getEmailInputBorderClass = () => {
        if (!isPasswordVisible) return "rounded-md";
        return "rounded-none rounded-t-md";
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Acesse sua conta
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                     {isPasswordVisible && (
                        <div className="text-center -mb-2 animate-fade-in">
                            {userType === 'admin' && <p className="text-sm font-medium text-primary">Login de Administrador</p>}
                            {userType === 'lawyer' && <p className="text-sm font-medium text-green-600">Login de Advogado</p>}
                            {userType === 'client' && <p className="text-sm font-medium text-gray-600">Login de Cliente</p>}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className={`appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${getEmailInputBorderClass()}`}
                                placeholder="Digite seu e-mail"
                            />
                        </div>
                        {isPasswordVisible && (
                             <div className="animate-fade-in">
                                <label htmlFor="password" className="sr-only">Senha</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-none rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Senha"
                                />
                            </div>
                        )}
                    </div>
                    
                    {error && (
                        <div className="text-center">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !isPasswordVisible}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
