import React, { useState } from 'react';
import { BRAZILIAN_STATES } from '../../constants';

// ─── Secretary Signup Data ─────────────────────────────────────────────────────
export interface SecretarySignupData {
  name: string;
  cpf: string;
  rg?: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  address?: string;
  experience: number;
  areasOfKnowledge: string[];
  availability: 'integral' | 'meio-periodo' | 'freelancer';
  bio?: string;
  // Foreigner
  isForeigner: boolean;
  foreignerDocument?: string;
  countryOfOrigin?: string;
  timeInBrazil?: string;
  socialLinks?: { provider: string; url: string }[];
}

interface SecretariadoSignupFormProps {
  onSignup: (data: SecretarySignupData) => void;
  onCancel: () => void;
}

const AREAS_CONHECIMENTO = [
  'Atendimento ao Cliente',
  'Gestão de Agenda',
  'Protocolo Judicial',
  'Organização Documental',
  'Redação Jurídica',
  'Diários Oficiais',
  'Controle Financeiro',
  'Triagem de Clientes',
  'Gestão de Escritório',
  'Suporte Administrativo',
  'PJe / e-SAJ',
  'Arquivo e Digitalização',
];

export const SecretariadoSignupForm: React.FC<SecretariadoSignupFormProps> = ({ onSignup, onCancel }) => {
  const [step, setStep] = useState(1);

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

  const [data, setData] = useState<SecretarySignupData>({
    name: '',
    cpf: '',
    rg: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    experience: 0,
    areasOfKnowledge: [],
    availability: 'integral',
    bio: '',
    isForeigner: false,
    foreignerDocument: '',
    countryOfOrigin: '',
    timeInBrazil: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SecretarySignupData | 'confirm', string>>>({});
  const [confirmPassword, setConfirmPassword] = useState('');

  const f = (field: keyof SecretarySignupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData(d => ({ ...d, [field]: e.target.value }));

  const toggleArea = (area: string) => {
    setData(d => ({
      ...d,
      areasOfKnowledge: d.areasOfKnowledge.includes(area)
        ? d.areasOfKnowledge.filter(a => a !== area)
        : [...d.areasOfKnowledge, area],
    }));
  };

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!data.name.trim()) e.name = 'Nome é obrigatório.';
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'E-mail inválido.';
    if (!data.password || data.password.length < 6) e.password = 'Senha mínima de 6 caracteres.';
    if (data.password !== confirmPassword) e.confirm = 'As senhas não coincidem.';
    if (!data.phone.trim()) e.phone = 'Telefone obrigatório.';
    if (!data.cpf.trim()) e.cpf = 'CPF obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!data.city.trim()) e.city = 'Cidade obrigatória.';
    if (!data.state.trim()) e.state = 'Estado obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({
      ...data,
      socialLinks: socialLinks.filter(l => l.url.trim().length > 0)
    });
  };

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:placeholder-gray-500 dark:caret-purple-500 ${err ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500' : 'border-gray-300 dark:border-[#2A2545]'}`;

  const progressBars = ['Dados Pessoais', 'Endereço', 'Experiência'];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-[#1A1730] dark:border-[#2A2545]">
      {/* Progress */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-5">
        <h2 className="text-lg font-bold text-white mb-3">Cadastro de Secret./Assist. Jurídico</h2>
        <div className="flex items-center gap-2">
          {progressBars.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step > i + 1 ? 'bg-white text-purple-600 border-white' : step === i + 1 ? 'bg-white text-purple-600 border-white' : 'bg-transparent text-white border-white/50'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${step === i + 1 ? 'text-white' : 'text-white/60'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-white' : 'bg-white/30'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* ─── STEP 1: Dados Pessoais ─── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Dados Pessoais</h3>

            {/* Foreigner toggle */}
            <label className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors">
              <input type="checkbox" checked={data.isForeigner} onChange={e => setData(d => ({ ...d, isForeigner: e.target.checked }))} className="rounded" />
              <span className="text-sm font-semibold text-orange-700">🌍 Estrangeiro(a)</span>
            </label>

            {data.isForeigner && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Documento de Estrangeiro</label>
                  <input value={data.foreignerDocument || ''} onChange={f('foreignerDocument')} className={inputCls()} placeholder="RNE / RNM" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">País de Origem</label>
                  <input value={data.countryOfOrigin || ''} onChange={f('countryOfOrigin')} className={inputCls()} placeholder="Ex: Portugal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tempo no Brasil</label>
                  <input value={data.timeInBrazil || ''} onChange={f('timeInBrazil')} className={inputCls()} placeholder="Ex: 3 anos" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome Completo *</label>
                <input value={data.name} onChange={f('name')} className={inputCls(errors.name)} />
                {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF *</label>
                <input value={data.cpf} onChange={f('cpf')} placeholder="000.000.000-00" className={inputCls(errors.cpf)} />
                {errors.cpf && <p className="text-xs text-red-600 mt-0.5">{errors.cpf}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">RG</label>
                <input value={data.rg || ''} onChange={f('rg')} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone *</label>
                <input value={data.phone} onChange={f('phone')} placeholder="(11) 99999-9999" className={inputCls(errors.phone)} />
                {errors.phone && <p className="text-xs text-red-600 mt-0.5">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail *</label>
                <input type="email" value={data.email} onChange={f('email')} className={inputCls(errors.email)} />
                {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha *</label>
                <input type="password" value={data.password} onChange={f('password')} className={inputCls(errors.password)} />
                {errors.password && <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar Senha *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls(errors.confirm)} />
                {errors.confirm && <p className="text-xs text-red-600 mt-0.5">{errors.confirm}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Endereço ─── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Endereço Residencial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Endereço Completo</label>
                <input value={data.address || ''} onChange={f('address')} placeholder="Rua, Número, Complemento, Bairro, CEP" className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cidade *</label>
                <input value={data.city} onChange={f('city')} className={inputCls(errors.city)} />
                {errors.city && <p className="text-xs text-red-600 mt-0.5">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF) *</label>
                <select value={data.state} onChange={f('state')} className={`${inputCls(errors.state)} bg-white text-gray-900`}>
                  <option value="">Selecione...</option>
                  {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                </select>
                {errors.state && <p className="text-xs text-red-600 mt-0.5">{errors.state}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Experiência ─── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Experiência Profissional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Anos de Experiência</label>
                <input type="number" min="0" value={data.experience} onChange={e => setData(d => ({ ...d, experience: Number(e.target.value) }))} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilidade</label>
                <select value={data.availability} onChange={f('availability')} className={`${inputCls()} bg-white text-gray-900`}>
                  <option value="integral">Tempo Integral</option>
                  <option value="meio-periodo">Meio Período</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Apresentação / Bio</label>
                <textarea value={data.bio || ''} onChange={f('bio')} rows={3} placeholder="Descreva sua experiência, habilidades e diferenciais profissionais..." className={inputCls()} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Áreas de Conhecimento</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AREAS_CONHECIMENTO.map(area => {
                  const selected = data.areasOfKnowledge.includes(area);
                  return (
                    <label key={area} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${selected ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleArea(area)} className="rounded" />
                      {area}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Redes Sociais (Opcional - Máx. 4)</h3>
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
                                className="block w-1/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary text-xs p-1 dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white"
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
                                className="block flex-1 px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-xs text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeSocialLink(index)}
                                className="p-2 text-red-500 hover:text-red-700 transition-colors text-xs"
                                title="Remover"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-2 border-t">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
              ← Voltar
            </button>
          )}
          <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
          {step < 3 ? (
            <button type="button" onClick={handleNext} className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
              Próximo →
            </button>
          ) : (
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
              ✓ Finalizar Cadastro
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
