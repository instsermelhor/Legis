import React, { useState } from 'react';
import type { Lawyer } from '../../types';
import { BRAZILIAN_STATES, AREAS_OF_LAW } from '../../constants';

interface LawyerSignupFormProps {
    onSignup: (lawyerData: Partial<Lawyer>) => boolean;
    onShowTerms: () => void;
}

export const LawyerSignupForm: React.FC<LawyerSignupFormProps> = ({ onSignup, onShowTerms }) => {
    const [formData, setFormData] = useState<Partial<Lawyer> & { password?: string; confirmPassword?: string; termsAccepted?: boolean; }>({
        name: '',
        cpf: '',
        rg: '',
        oab: '',
        oabUF: 'SP',
        registrationType: 'active',
        specialties: [],
        address: '',
        commercialAddress: '',
        contact: { email: '', phone: '' },
        password: '',
        confirmPassword: '',
        termsAccepted: false,
        isForeigner: false,
        foreignerDocument: '',
        countryOfOrigin: '',
        timeInBrazil: '',
        primarySpecialties: [],
        secondarySpecialties: [],
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'email' || name === 'phone') {
            setFormData(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
    }

    const handleSpecialtyToggle = (area: string) => {
        const primaries = formData.primarySpecialties || [];
        const secondaries = formData.secondarySpecialties || [];
        const isPrimary = primaries.includes(area);
        const isSecondary = secondaries.includes(area);

        if (isPrimary || isSecondary) {
            // Uncheck: remove from both
            setFormData(prev => ({
                ...prev,
                primarySpecialties: (prev.primarySpecialties || []).filter(a => a !== area),
                secondarySpecialties: (prev.secondarySpecialties || []).filter(a => a !== area),
            }));
        } else {
            // Check: add to primary if less than 3, otherwise to secondary
            if (primaries.length < 3) {
                setFormData(prev => ({
                    ...prev,
                    primarySpecialties: [...(prev.primarySpecialties || []), area],
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    secondarySpecialties: [...(prev.secondarySpecialties || []), area],
                }));
            }
        }
    };

    const handleSpecialtyTypeChange = (area: string, type: 'primary' | 'secondary') => {
        const primaries = formData.primarySpecialties || [];
        if (type === 'primary') {
            if (primaries.length >= 3) {
                alert('Você pode selecionar no máximo 3 especialidades principais.');
                return;
            }
            setFormData(prev => ({
                ...prev,
                primarySpecialties: [...(prev.primarySpecialties || []), area],
                secondarySpecialties: (prev.secondarySpecialties || []).filter(a => a !== area),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                primarySpecialties: (prev.primarySpecialties || []).filter(a => a !== area),
                secondarySpecialties: [...(prev.secondarySpecialties || []), area],
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!/^\d+$/.test(formData.oab || '')) {
            setError('O número da OAB deve conter apenas dígitos.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!formData.termsAccepted) {
            setError('Você deve aceitar os Termos de Serviço.');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const lawyerData = {
                ...formData,
                specialties: [
                    ...(formData.primarySpecialties || []),
                    ...(formData.secondarySpecialties || [])
                ],
                oab: `${formData.oabUF}${formData.oab}`,
            };
            const success = onSignup(lawyerData);
            if (!success) {
                setError('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="max-w-4xl w-full mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200 animate-fade-in">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                Cadastre-se como Advogado
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <fieldset className="space-y-4 p-4 border rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Informações Pessoais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required />
                        <InputField label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required />
                        <InputField label="RG" name="rg" value={formData.rg} onChange={handleChange} required />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                            <input
                                id="isForeigner"
                                name="isForeigner"
                                type="checkbox"
                                checked={formData.isForeigner || false}
                                onChange={handleCheckboxChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            />
                            <label htmlFor="isForeigner" className="ml-2 block text-sm font-medium text-gray-700">
                                Se Estrangeiro
                            </label>
                        </div>

                        {formData.isForeigner && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
                                <InputField
                                    label="Documento de Estrangeiro"
                                    name="foreignerDocument"
                                    value={formData.foreignerDocument || ''}
                                    onChange={handleChange}
                                    required
                                    placeholder="RNE ou Passaporte"
                                />
                                <InputField
                                    label="País de Origem"
                                    name="countryOfOrigin"
                                    value={formData.countryOfOrigin || ''}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label="Tempo no Brasil"
                                    name="timeInBrazil"
                                    value={formData.timeInBrazil || ''}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: 2 anos"
                                />
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* Professional Info */}
                <fieldset className="space-y-4 p-4 border rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Informações Profissionais</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nº da OAB" name="oab" value={formData.oab} onChange={handleChange} required placeholder="Apenas números" />
                        <SelectField label="UF da OAB" name="oabUF" value={formData.oabUF} onChange={handleChange} options={BRAZILIAN_STATES.map(s => ({ value: s.uf, label: s.uf }))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Inscrição</label>
                        <div className="mt-2 flex gap-4">
                            <RadioOption name="registrationType" value="active" checked={formData.registrationType === 'active'} onChange={handleChange} label="Ativa" />
                            <RadioOption name="registrationType" value="intern" checked={formData.registrationType === 'intern'} onChange={handleChange} label="Estagiário" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de Especialidade (Selecione até 3 Principais, as outras serão Secundárias)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                            {AREAS_OF_LAW.map(area => {
                                const isPrimary = formData.primarySpecialties?.includes(area) || false;
                                const isSecondary = formData.secondarySpecialties?.includes(area) || false;
                                const isChecked = isPrimary || isSecondary;

                                return (
                                    <div key={area} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors gap-2 shadow-sm">
                                        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleSpecialtyToggle(area)}
                                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                            />
                                            {area}
                                        </label>

                                        {isChecked && (
                                            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg border text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSpecialtyTypeChange(area, 'primary')}
                                                    disabled={!isPrimary && (formData.primarySpecialties?.length || 0) >= 3}
                                                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                                                        isPrimary
                                                            ? 'bg-primary text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                                                    }`}
                                                >
                                                    Principal
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSpecialtyTypeChange(area, 'secondary')}
                                                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                                                        isSecondary
                                                            ? 'bg-gray-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    Secundária
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </fieldset>

                {/* Address Info */}
                <fieldset className="space-y-4 p-4 border rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Endereço</legend>
                    <InputField label="Endereço Residencial" name="address" value={formData.address} onChange={handleChange} required />
                    <InputField label="Endereço Comercial (Opcional)" name="commercialAddress" value={formData.commercialAddress} onChange={handleChange} />
                </fieldset>

                {/* Contact & Access */}
                <fieldset className="space-y-4 p-4 border rounded-md">
                    <legend className="text-lg font-medium text-gray-900 px-2">Contato e Acesso</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="E-mail" name="email" type="email" value={formData.contact?.email} onChange={handleChange} required />
                        <InputField label="Telefone" name="phone" type="tel" value={formData.contact?.phone} onChange={handleChange} required />
                        <InputField label="Senha" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <InputField label="Confirmar Senha" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                </fieldset>

                {error && <p className="text-sm text-center text-red-600">{error}</p>}

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleCheckboxChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="termsAccepted" className="font-medium text-gray-700">Eu li e aceito os <a href="#" onClick={(e) => { e.preventDefault(); onShowTerms(); }} className="text-primary hover:underline">Termos de Serviço</a></label>
                    </div>
                </div>

                <button type="submit" disabled={isLoading || !formData.termsAccepted} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed">
                    {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                </button>
            </form>
        </div>
    );
};

// Helper components for form fields
const InputField: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, placeholder?: string }> =
    ({ label, name, value, onChange, type = 'text', required = false, placeholder }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary p-2 border" />
        </div>
    );

const SelectField: React.FC<{ label: string, name: string, value?: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[] }> =
    ({ label, name, value, onChange, options }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary p-2 border">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

const RadioOption: React.FC<{ name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }> =
    ({ name, value, checked, onChange, label }) => (
        <label className="flex items-center">
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
        </label>
    );
