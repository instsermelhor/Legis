import React, { useState } from 'react';
import type { Intern } from '../../types';
import { BRAZILIAN_STATES } from '../../constants';

export interface InternSignupData extends Partial<Intern> {
    password?: string;
}

interface InternSignupFormProps {
    onSignup: (data: InternSignupData) => boolean;
    onShowTerms: () => void;
}

export const InternSignupForm: React.FC<InternSignupFormProps> = ({ onSignup, onShowTerms }) => {
    const [formData, setFormData] = useState<InternSignupData>({
        name: '',
        email: '',
        password: '',
        cpf: '',
        university: '',
        semester: '',
        specialtyInterest: '',
        contact: { phone: '', email: '' },
        isForeigner: false,
        foreignerDocument: '',
        countryOfOrigin: '',
        timeInBrazil: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const [error, setError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'email') {
            setFormData(prev => ({
                ...prev,
                contact: { ...prev.contact, [name]: value } as { phone: string; email: string; }
            }));
            if (name === 'email') {
                setFormData(prev => ({ ...prev, email: value })); // keep top-level email in sync for simplicity
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreedToTerms) {
            setError('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
            return;
        }

        if (!formData.name || !formData.email || !formData.password || !formData.cpf || !formData.university) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Address validation (required if not empty, but we set them as required in inputs)
        if (!formData.cep || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
            setError('Por favor, preencha todos os campos do endereço residencial.');
            return;
        }

        const finalData = { 
            ...formData,
            address: `${formData.street}, ${formData.number}${formData.complement ? ` - ${formData.complement}` : ''}, ${formData.neighborhood}, ${formData.city} - ${formData.state}, CEP: ${formData.cep}`,
            socialLinks: socialLinks.filter(l => l.url.trim().length > 0)
        };

        // Default contact email to top-level email if empty
        if (!finalData.contact?.email) {
            finalData.contact = { ...finalData.contact, email: finalData.email as string } as { phone: string; email: string; };
        }

        const success = onSignup(finalData);
        if (!success) {
            setError('Um erro ocorreu. Este e-mail pode já estar em uso.');
        }
    };

    return (
        <div className="bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cadastro de Bacharelando/Estagiário</h2>

            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                        <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF *</label>
                        <input type="text" name="cpf" required value={formData.cpf || ''} onChange={handleChange} placeholder="000.000.000-00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                    </div>
                </div>

                {/* Se Estrangeiro */}
                <div className="pt-2">
                    <div className="flex items-center">
                        <input
                            id="isForeigner"
                            name="isForeigner"
                            type="checkbox"
                            checked={formData.isForeigner || false}
                            onChange={(e) => setFormData(prev => ({ ...prev, isForeigner: e.target.checked }))}
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                        <label htmlFor="isForeigner" className="ml-2 block text-sm font-medium text-gray-700">
                            Se Estrangeiro
                        </label>
                    </div>

                    {formData.isForeigner && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Documento de Estrangeiro *</label>
                                <input type="text" name="foreignerDocument" required value={formData.foreignerDocument || ''} onChange={handleChange} placeholder="RNE ou Passaporte" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">País de Origem *</label>
                                <input type="text" name="countryOfOrigin" required value={formData.countryOfOrigin || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tempo no Brasil *</label>
                                <input type="text" name="timeInBrazil" required value={formData.timeInBrazil || ''} onChange={handleChange} placeholder="Ex: 2 anos" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail *</label>
                        <input type="email" name="email" required value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone (WhatsApp)</label>
                        <input type="tel" name="phone" value={formData.contact?.phone || ''} onChange={handleChange} placeholder="(00) 00000-0000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha *</label>
                        <input type="password" name="password" required value={formData.password || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                    </div>
                </div>

                {/* Endereço Residencial */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço Residencial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CEP *</label>
                            <input type="text" name="cep" required value={formData.cep || ''} onChange={handleChange} placeholder="00000-000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Logradouro (Rua, Avenida...) *</label>
                            <input type="text" name="street" required value={formData.street || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número *</label>
                            <input type="text" name="number" required value={formData.number || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Complemento</label>
                            <input type="text" name="complement" value={formData.complement || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bairro *</label>
                            <input type="text" name="neighborhood" required value={formData.neighborhood || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cidade *</label>
                            <input type="text" name="city" required value={formData.city || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado (UF) *</label>
                            <select name="state" required value={formData.state || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border">
                                <option value="">Selecione...</option>
                                {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Acadêmicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Universidade / Instituição de Ensino *</label>
                            <input type="text" name="university" required value={formData.university || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Semestre Atual</label>
                            <select name="semester" value={formData.semester || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border">
                                <option value="">Selecione...</option>
                                <option value="1 a 3">1º ao 3º semestre</option>
                                <option value="4 a 6">4º ao 6º semestre</option>
                                <option value="7 a 8">7º ao 8º semestre</option>
                                <option value="9 a 10">9º ao 10º semestre</option>
                                <option value="Formado/Bacharel">Formado / Bacharel</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Área de Maior Interesse</label>
                            <select name="specialtyInterest" value={formData.specialtyInterest || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2 border">
                                <option value="">Selecione...</option>
                                <option value="Direito Civil">Direito Civil</option>
                                <option value="Direito Penal">Direito Penal</option>
                                <option value="Direito Trabalhista">Direito Trabalhista</option>
                                <option value="Direito de Família e Sucessões">Direito de Família e Sucessões</option>
                                <option value="Direito Tributário">Direito Tributário</option>
                                <option value="Direito Digital">Direito Digital</option>
                                <option value="Direito Internacional">Direito Internacional</option>
                                <option value="Outras">Outras Áreas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Redes Sociais (Opcional - Máx. 4)</h3>
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
                    <div className="space-y-3">
                        {socialLinks.map((link, index) => (
                            <div key={index} className="flex gap-2 items-center animate-fade-in">
                                <select
                                    value={link.provider}
                                    onChange={e => updateSocialLink(index, 'provider', e.target.value)}
                                    className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm p-2 border"
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
                                    className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm p-2 border"
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
                </div>

                <div className="flex items-start pt-4">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-gray-500">
                            Eu concordo com os{' '}
                            <button type="button" onClick={onShowTerms} className="text-primary hover:underline">
                                Termos de Serviço e Política de Privacidade
                            </button>
                            .
                        </label>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Criar Conta de Bacharelando
                    </button>
                </div>
            </form>
        </div>
    );
};
