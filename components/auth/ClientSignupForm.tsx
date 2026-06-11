import React, { useState } from 'react';

export interface ClientSignupData {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    isForeigner?: boolean;
    foreignerDocument?: string;
    countryOfOrigin?: string;
    timeInBrazil?: string;
    socialLinks?: { provider: string; url: string }[];
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

    // Foreigner fields
    const [isForeigner, setIsForeigner] = useState(false);
    const [foreignerDocument, setForeignerDocument] = useState('');
    const [countryOfOrigin, setCountryOfOrigin] = useState('');
    const [timeInBrazil, setTimeInBrazil] = useState('');

    // Social Links
    const [socialLinks, setSocialLinks] = useState<{ provider: string; url: string }[]>([]);

    const addSocialLink = () => {
        if (socialLinks.length < 4) {
            setSocialLinks(prev => [...prev, { provider: 'LinkedIn', url: '' }]);
        }
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks(prev => prev.filter((_, i) => i !== index));
    };

    const updateSocialLink = (index: number, field: 'provider' | 'url', value: string) => {
        setSocialLinks(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

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
            onSignup({ 
                name, 
                email, 
                password, 
                phone, 
                address,
                isForeigner,
                foreignerDocument: isForeigner ? foreignerDocument : undefined,
                countryOfOrigin: isForeigner ? countryOfOrigin : undefined,
                timeInBrazil: isForeigner ? timeInBrazil : undefined,
                socialLinks: socialLinks.filter(l => l.url.trim().length > 0),
            });
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-fade-in">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Crie sua conta de Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="client-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input id="client-name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-email" className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input id="client-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="client-phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input id="client-phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-address" className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                    <input id="client-address" name="address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                </div>

                {/* Se Estrangeiro */}
                <div className="pt-2">
                    <div className="flex items-center">
                        <input
                            id="isForeigner"
                            name="isForeigner"
                            type="checkbox"
                            checked={isForeigner}
                            onChange={(e) => setIsForeigner(e.target.checked)}
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                        <label htmlFor="isForeigner" className="ml-2 block text-sm font-medium text-gray-700">
                            Se Estrangeiro
                        </label>
                    </div>

                    {isForeigner && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
                            <div>
                                <label htmlFor="foreigner-document" className="block text-sm font-medium text-gray-700">Documento de Estrangeiro *</label>
                                <input id="foreigner-document" type="text" required value={foreignerDocument} onChange={e => setForeignerDocument(e.target.value)} placeholder="RNE ou Passaporte" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="country-of-origin" className="block text-sm font-medium text-gray-700">País de Origem *</label>
                                <input id="country-of-origin" type="text" required value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="time-in-brazil" className="block text-sm font-medium text-gray-700">Tempo no Brasil *</label>
                                <input id="time-in-brazil" type="text" required value={timeInBrazil} onChange={e => setTimeInBrazil(e.target.value)} placeholder="Ex: 2 anos" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Media Links */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Redes Sociais (Opcional - Máx. 4)</label>
                        {socialLinks.length < 4 && (
                            <button
                                type="button"
                                onClick={addSocialLink}
                                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                                ➕ Adicionar Rede Social
                            </button>
                        )}
                    </div>
                    {socialLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 items-center animate-fade-in">
                            <select
                                value={link.provider}
                                onChange={e => updateSocialLink(index, 'provider', e.target.value)}
                                className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Instagram">Instagram</option>
                                <option value="X">X (Twitter)</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Facebook">Facebook</option>
                                <option value="YouTube">YouTube</option>
                                <option value="Outro">Outro</option>
                            </select>
                            <input
                                type="url"
                                value={link.url}
                                onChange={e => updateSocialLink(index, 'url', e.target.value)}
                                placeholder="https://link-da-rede-social.com/seu-perfil"
                                className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeSocialLink(index)}
                                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                title="Remover"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                <div>
                    <label htmlFor="client-password" className="block text-sm font-medium text-gray-700">Senha</label>
                    <input id="client-password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="client-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <input id="client-confirm-password" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-gray-900 sm:text-sm" />
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
