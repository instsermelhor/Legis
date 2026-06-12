/**
 * ClientProfile.tsx
 * Componente "Meu Perfil + Triagem Inteligente com IA" do Painel do Cliente — Legis Connect.
 *
 * Seções:
 *   A) Dados Pessoais (KYC) — formulário com máscaras e busca de CEP simulada
 *   B) Documentos Pessoais — upload / listagem / remoção
 *   C) Redes Sociais — SocialLinksEditor
 *   D) Triagem Inteligente com IA — classifica o problema e recomenda advogados
 *   E) Segurança — alterar senha / e-mail
 */

import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../../types';
import { BRAZILIAN_STATES } from '../../../constants';
import { ChangePasswordModal } from '../../common/ChangePasswordModal';
import { ChangeEmailModal } from '../../common/ChangeEmailModal';
import SocialLinksEditor from '../../common/SocialLinksEditor';
import type { SocialLink } from '../../common/SocialLinksEditor';
import { classifyLegalProblem } from '../../../utils/legalTermTranslator';
import type { LegalAreaClassification } from '../../../utils/legalTermTranslator';
import { mockLawyers } from '../../../services/mockLawyerService';
import type { Lawyer } from '../../../types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ClientProfileProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
  userEmail: string;
  onUpdateEmail: (newEmail: string) => void;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface UploadedDoc {
  id: string;
  name: string;
  docType: string;
  size: number;
  uploadedAt: string;
  file: File;
}

interface TriageResult {
  classification: LegalAreaClassification;
  recommendedLawyers: Lawyer[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Aplica máscara de CPF: 000.000.000-00 */
function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Aplica máscara de Telefone: (00) 00000-0000 */
function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** Aplica máscara de CEP: 00000-000 */
function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/** Mascara o e-mail exibido: pri***@domain.com */
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, 3);
  return `${visible}***@${domain}`;
}

/** Formata tamanho de arquivo em KB / MB */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Dados de endereço mock indexados por CEP parcial */
const CEP_MOCK_DATA: Record<string, { logradouro: string; bairro: string; municipio: string; estado: string }> = {
  '01': { logradouro: 'Av. Paulista', bairro: 'Bela Vista', municipio: 'São Paulo', estado: 'SP' },
  '20': { logradouro: 'Av. Rio Branco', bairro: 'Centro', municipio: 'Rio de Janeiro', estado: 'RJ' },
  '30': { logradouro: 'Av. Afonso Pena', bairro: 'Centro', municipio: 'Belo Horizonte', estado: 'MG' },
  '40': { logradouro: 'Av. Sete de Setembro', bairro: 'Centro', municipio: 'Salvador', estado: 'BA' },
  '60': { logradouro: 'Av. Domingos Olímpio', bairro: 'Aldeota', municipio: 'Fortaleza', estado: 'CE' },
  '80': { logradouro: 'Rua XV de Novembro', bairro: 'Centro', municipio: 'Curitiba', estado: 'PR' },
  '90': { logradouro: 'Av. Borges de Medeiros', bairro: 'Centro Histórico', municipio: 'Porto Alegre', estado: 'RS' },
};

function getMockAddressFromCEP(cep: string) {
  const digits = cep.replace(/\D/g, '');
  const prefix = digits.slice(0, 2);
  return (
    CEP_MOCK_DATA[prefix] ?? {
      logradouro: 'Rua das Flores',
      bairro: 'Jardim Primavera',
      municipio: 'São Paulo',
      estado: 'SP',
    }
  );
}

/** Cor de badge para área jurídica */
function areaColorClasses(color: string): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    amber:  { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-800 dark:text-amber-300',  border: 'border-amber-300 dark:border-amber-700' },
    rose:   { bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-800 dark:text-rose-300',    border: 'border-rose-300 dark:border-rose-700'   },
    blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-800 dark:text-blue-300',    border: 'border-blue-300 dark:border-blue-700'   },
    red:    { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-800 dark:text-red-300',      border: 'border-red-300 dark:border-red-700'     },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30',text: 'text-purple-800 dark:text-purple-300',border: 'border-purple-300 dark:border-purple-700'},
    green:  { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-800 dark:text-green-300',  border: 'border-green-300 dark:border-green-700' },
    teal:   { bg: 'bg-teal-100 dark:bg-teal-900/30',    text: 'text-teal-800 dark:text-teal-300',    border: 'border-teal-300 dark:border-teal-700'   },
  };
  return map[color] ?? map['purple'];
}

/** Renderiza estrelas de avaliação */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Avaliação: ${rating} estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.176c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.624 9.394c-.783-.57-.38-1.81.588-1.81h4.176a1 1 0 00.951-.69l1.286-3.967z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Tipos de documentos aceitos ──────────────────────────────────────────────

const DOC_TYPES = ['RG', 'CPF', 'Comprovante de Residência', 'Comprovante de Renda'];

// ─── Estágios da triagem ──────────────────────────────────────────────────────

const TRIAGE_STAGES = [
  { icon: '📖', label: 'Lendo sua situação...' },
  { icon: '🧠', label: 'Identificando área jurídica...' },
  { icon: '🔍', label: 'Buscando advogados compatíveis...' },
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export const ClientProfile: React.FC<ClientProfileProps> = ({
  user,
  onUpdateProfile,
  userEmail,
  onUpdateEmail,
}) => {
  // ── Lê dados salvos em localStorage ──────────────────────────────────────
  const savedUser = (() => {
    try {
      const raw = localStorage.getItem('legis_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // ── Estado: Formulário KYC ────────────────────────────────────────────────
  const [form, setForm] = useState({
    nome:         savedUser?.name       ?? user.name        ?? '',
    cpf:          savedUser?.cpf        ?? '',
    rg:           savedUser?.rg         ?? '',
    dataNasc:     savedUser?.dataNasc   ?? '',
    estadoCivil:  savedUser?.estadoCivil ?? '',
    telefone:     savedUser?.phone      ?? user.phone       ?? '',
    cep:          savedUser?.cep        ?? '',
    logradouro:   savedUser?.logradouro  ?? '',
    numero:       savedUser?.numero      ?? '',
    complemento:  savedUser?.complemento ?? '',
    bairro:       savedUser?.bairro      ?? '',
    municipio:    savedUser?.municipio   ?? '',
    estado:       savedUser?.estado      ?? '',
  });
  const [formSaved, setFormSaved] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // ── Estado: Documentos ────────────────────────────────────────────────────
  const [profileDocs, setProfileDocs] = useState<UploadedDoc[]>([]);
  const [newDocType, setNewDocType] = useState(DOC_TYPES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Estado: Redes Sociais ─────────────────────────────────────────────────
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    (savedUser?.socialLinks ?? user.socialLinks ?? []) as SocialLink[]
  );

  // ── Estado: Modais de segurança ───────────────────────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // ── Estado: Triagem IA ────────────────────────────────────────────────────
  const [triageText, setTriageText] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageStage, setTriageStage] = useState(0); // 0=idle, 1..3=estágios
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // ── Limpa o feedback de "salvo" após 2s ──────────────────────────────────
  useEffect(() => {
    if (!formSaved) return;
    const t = setTimeout(() => setFormSaved(false), 2000);
    return () => clearTimeout(t);
  }, [formSaved]);

  // ─── Handlers: Formulário KYC ────────────────────────────────────────────

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'cpf')     maskedValue = maskCPF(value);
    if (name === 'telefone') maskedValue = maskPhone(value);
    if (name === 'cep')     maskedValue = maskCEP(value);
    setForm((prev) => ({ ...prev, [name]: maskedValue }));
  };

  /** Simula busca de endereço pelo CEP (timeout 800ms) */
  const handleBuscarCEP = () => {
    const digits = form.cep.replace(/\D/g, '');
    if (digits.length < 8) return;
    setCepLoading(true);
    setTimeout(() => {
      const addr = getMockAddressFromCEP(digits);
      setForm((prev) => ({
        ...prev,
        logradouro:  addr.logradouro,
        bairro:      addr.bairro,
        municipio:   addr.municipio,
        estado:      addr.estado,
      }));
      setCepLoading(false);
    }, 800);
  };

  /** Persiste no localStorage e notifica o pai */
  const handleSaveForm = () => {
    const updates: Partial<User> = {
      name:  form.nome,
      phone: form.telefone,
      address: `${form.logradouro}, ${form.numero} - ${form.bairro}, ${form.municipio}/${form.estado}`,
      socialLinks,
    };
    onUpdateProfile(updates);

    const stored = {
      ...updates,
      cpf: form.cpf,
      rg: form.rg,
      dataNasc: form.dataNasc,
      estadoCivil: form.estadoCivil,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      municipio: form.municipio,
      estado: form.estado,
      socialLinks,
    };
    localStorage.setItem('legis_user', JSON.stringify(stored));
    setFormSaved(true);
  };

  // ─── Handlers: Documentos ────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [] as File[]) as File[];
    const newDocs: UploadedDoc[] = files.map((file: File) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      docType: newDocType,
      size: file.size,
      uploadedAt: new Date().toLocaleDateString('pt-BR'),
      file,
    }));
    setProfileDocs((prev) => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDoc = (id: string) => {
    setProfileDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // ─── Handlers: Segurança ─────────────────────────────────────────────────

  const handleSavePassword = (_currentPw: string, _newPw: string): boolean => {
    // Simulação: sempre retorna true (sem backend real)
    return true;
  };

  const handleSaveEmail = (_password: string, newEmail: string): boolean => {
    onUpdateEmail(newEmail);
    return true;
  };

  // ─── Handlers: Triagem IA ────────────────────────────────────────────────

  const handleRunTriage = async () => {
    if (triageText.trim().length < 20) return;
    setTriageLoading(true);
    setTriageStage(1);

    // Estágio 1 → 2 → 3 com 1s cada
    await new Promise((r) => setTimeout(r, 1000));
    setTriageStage(2);
    await new Promise((r) => setTimeout(r, 1000));
    setTriageStage(3);
    await new Promise((r) => setTimeout(r, 1000));

    // Classifica
    const classification = classifyLegalProblem(triageText);

    // Filtra advogados pela área jurídica detectada
    const areaLower = classification.area.toLowerCase();
    const matched = mockLawyers.filter((l) =>
      l.specialties.some((s) => s.toLowerCase().includes(areaLower) || areaLower.includes(s.toLowerCase()))
    );
    const recommendedLawyers = matched.length >= 3
      ? matched.slice(0, 3)
      : [...matched, ...mockLawyers.filter((l) => !matched.includes(l))].slice(0, 3);

    setTriageResult({ classification, recommendedLawyers });
    setTriageLoading(false);
    setTriageStage(0);
  };

  const handleResetTriage = () => {
    setTriageResult(null);
    setTriageText('');
  };

  // ─── Classe base para inputs ──────────────────────────────────────────────
  const inputCls =
    'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm ' +
    'bg-white text-gray-900 dark:bg-[#1A1730] dark:text-white ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow placeholder-gray-400 dark:placeholder-gray-500';

  const selectCls =
    'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm ' +
    'bg-white text-gray-900 dark:bg-[#1A1730] dark:text-white ' +
    'focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow';

  const labelCls =
    'block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5';

  const sectionCardCls =
    'bg-white dark:bg-[#13112A] border border-gray-200 dark:border-[#1E1B38] rounded-2xl shadow-sm p-6';

  const sectionTitleCls =
    'text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5';

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO A — Dados Pessoais (KYC)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={sectionCardCls}>
        <h2 className={sectionTitleCls}>
          <span className="text-2xl">🪪</span> Dados Pessoais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome completo */}
          <div className="md:col-span-2">
            <label className={labelCls}>Nome Completo</label>
            <input
              type="text"
              name="nome"
              id="kyc-nome"
              value={form.nome}
              onChange={handleFormChange}
              placeholder="Seu nome completo"
              className={inputCls}
            />
          </div>

          {/* CPF */}
          <div>
            <label className={labelCls}>CPF</label>
            <input
              type="text"
              name="cpf"
              id="kyc-cpf"
              value={form.cpf}
              onChange={handleFormChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className={inputCls}
            />
          </div>

          {/* RG */}
          <div>
            <label className={labelCls}>RG</label>
            <input
              type="text"
              name="rg"
              id="kyc-rg"
              value={form.rg}
              onChange={handleFormChange}
              placeholder="00.000.000-0"
              className={inputCls}
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className={labelCls}>Data de Nascimento</label>
            <input
              type="date"
              name="dataNasc"
              id="kyc-dataNasc"
              value={form.dataNasc}
              onChange={handleFormChange}
              className={inputCls}
            />
          </div>

          {/* Estado Civil */}
          <div>
            <label className={labelCls}>Estado Civil</label>
            <select
              name="estadoCivil"
              id="kyc-estadoCivil"
              value={form.estadoCivil}
              onChange={handleFormChange}
              className={selectCls}
            >
              <option value="">Selecione...</option>
              {['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Telefone */}
          <div>
            <label className={labelCls}>Telefone / WhatsApp</label>
            <input
              type="text"
              name="telefone"
              id="kyc-telefone"
              value={form.telefone}
              onChange={handleFormChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className={inputCls}
            />
          </div>

          {/* CEP + botão busca */}
          <div>
            <label className={labelCls}>CEP</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="cep"
                id="kyc-cep"
                value={form.cep}
                onChange={handleFormChange}
                placeholder="00000-000"
                maxLength={9}
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                id="kyc-btn-buscar-cep"
                onClick={handleBuscarCEP}
                disabled={cepLoading || form.cep.replace(/\D/g, '').length < 8}
                className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5"
              >
                {cepLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : '🔍'}
                {cepLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Logradouro */}
          <div className="md:col-span-2">
            <label className={labelCls}>Logradouro</label>
            <input
              type="text"
              name="logradouro"
              id="kyc-logradouro"
              value={form.logradouro}
              onChange={handleFormChange}
              placeholder="Rua, Avenida..."
              className={inputCls}
            />
          </div>

          {/* Número */}
          <div>
            <label className={labelCls}>Número</label>
            <input
              type="text"
              name="numero"
              id="kyc-numero"
              value={form.numero}
              onChange={handleFormChange}
              placeholder="Ex: 123"
              className={inputCls}
            />
          </div>

          {/* Complemento */}
          <div>
            <label className={labelCls}>Complemento</label>
            <input
              type="text"
              name="complemento"
              id="kyc-complemento"
              value={form.complemento}
              onChange={handleFormChange}
              placeholder="Apto, Bloco..."
              className={inputCls}
            />
          </div>

          {/* Bairro */}
          <div>
            <label className={labelCls}>Bairro</label>
            <input
              type="text"
              name="bairro"
              id="kyc-bairro"
              value={form.bairro}
              onChange={handleFormChange}
              placeholder="Bairro"
              className={inputCls}
            />
          </div>

          {/* Município */}
          <div>
            <label className={labelCls}>Município</label>
            <input
              type="text"
              name="municipio"
              id="kyc-municipio"
              value={form.municipio}
              onChange={handleFormChange}
              placeholder="Cidade"
              className={inputCls}
            />
          </div>

          {/* Estado */}
          <div>
            <label className={labelCls}>Estado</label>
            <select
              name="estado"
              id="kyc-estado"
              value={form.estado}
              onChange={handleFormChange}
              className={selectCls}
            >
              <option value="">Selecione...</option>
              {BRAZILIAN_STATES.map((s) => (
                <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="mt-6 flex items-center gap-4">
          <button
            id="kyc-btn-salvar"
            type="button"
            onClick={handleSaveForm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-purple-500/20"
          >
            💾 Salvar Dados
          </button>
          {formSaved && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvo com sucesso!
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO B — Documentos Pessoais
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={sectionCardCls}>
        <h2 className={sectionTitleCls}>
          <span className="text-2xl">📁</span> Documentos Pessoais
        </h2>

        {/* Controles de envio */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            id="doc-tipo-select"
            value={newDocType}
            onChange={(e) => setNewDocType(e.target.value)}
            className={`${selectCls} max-w-xs`}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            id="doc-file-input"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            id="doc-btn-enviar"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-purple-500/20"
          >
            📎 Enviar Documentos
          </button>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Aceito: PDF, JPG, JPEG, PNG
          </span>
        </div>

        {/* Lista de documentos */}
        {profileDocs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-[#2A2545] rounded-xl">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum documento enviado ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {profileDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">
                    {doc.name.endsWith('.pdf') ? '📑' : '🖼️'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.docType} · {formatFileSize(doc.size)} · {doc.uploadedAt}
                    </p>
                  </div>
                </div>
                <button
                  id={`doc-btn-remover-${doc.id}`}
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="shrink-0 text-red-500 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO C — Redes Sociais
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={sectionCardCls}>
        <h2 className={sectionTitleCls}>
          <span className="text-2xl">🌐</span> Redes Sociais
        </h2>
        <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO D — Triagem Inteligente com IA  ⭐ Seção Principal
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl shadow-lg overflow-hidden">
        {/* Borda gradiente roxa/azul */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-600 p-[2px] pointer-events-none" aria-hidden="true" />
        <div className="relative bg-white dark:bg-[#13112A] rounded-2xl ring-2 ring-purple-500/30 p-6">

          {/* Cabeçalho */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
                🤖
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Triagem com Inteligência Artificial
                </h2>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Powered by Legis Connect AI
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              Descreva seu problema com suas próprias palavras —{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">sem juridiquês</span>.
              Nossa IA identifica a área jurídica e recomenda os melhores advogados para o seu caso.
            </p>
          </div>

          {/* ── RESULTADO DA TRIAGEM ── */}
          {triageResult && !triageLoading ? (
            <TriageResultView result={triageResult} onReset={handleResetTriage} />
          ) : (
            <>
              {/* Textarea */}
              <div className="relative mb-4">
                <textarea
                  id="triage-textarea"
                  value={triageText}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setTriageText(e.target.value);
                  }}
                  disabled={triageLoading}
                  rows={5}
                  placeholder="Ex: Fui demitido e não recebi meu FGTS e as verbas rescisórias. Trabalhei por 3 anos na empresa sem assinar carteira..."
                  className={
                    'w-full resize-none border border-gray-300 dark:border-[#2A2545] rounded-xl px-4 py-3 text-sm ' +
                    'bg-white text-gray-900 dark:bg-[#1A1730] dark:text-white ' +
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow ' +
                    'placeholder-gray-400 dark:placeholder-gray-500 ' +
                    (triageLoading ? 'opacity-60 cursor-not-allowed' : '')
                  }
                  style={{ minHeight: 140 }}
                />
                {/* Contador de caracteres */}
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 select-none">
                  <span className={triageText.length < 20 ? 'text-red-400' : 'text-green-500'}>
                    {triageText.length}
                  </span>
                  /500
                </div>
              </div>

              {/* Aviso mínimo */}
              {triageText.length > 0 && triageText.length < 20 && (
                <p className="text-xs text-red-500 mb-3">
                  ⚠️ Descreva mais detalhes (mínimo 20 caracteres).
                </p>
              )}

              {/* ── LOADING / ESTÁGIOS ── */}
              {triageLoading && (
                <div className="mb-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl p-5">
                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-5 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${(triageStage / 3) * 100}%` }}
                    />
                  </div>

                  {/* Lista de estágios */}
                  <div className="space-y-3">
                    {TRIAGE_STAGES.map((stage, idx) => {
                      const stageNum = idx + 1;
                      const isDone = triageStage > stageNum;
                      const isCurrent = triageStage === stageNum;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 transition-opacity duration-300 ${
                            stageNum > triageStage ? 'opacity-30' : 'opacity-100'
                          }`}
                        >
                          {/* Ícone de status */}
                          {isDone ? (
                            <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs shrink-0">✓</span>
                          ) : isCurrent ? (
                            <svg className="w-6 h-6 text-purple-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${isCurrent ? 'text-purple-700 dark:text-purple-300' : isDone ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                            {stage.icon} {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botão analisar */}
              <button
                id="triage-btn-analisar"
                type="button"
                onClick={handleRunTriage}
                disabled={triageText.trim().length < 20 || triageLoading}
                className={
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all ' +
                  (triageText.trim().length >= 20 && !triageLoading
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 active:scale-95'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed')
                }
              >
                {triageLoading ? '⏳ Analisando...' : '🔍 Analisar meu caso com IA'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO E — Segurança
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={sectionCardCls}>
        <h2 className={sectionTitleCls}>
          <span className="text-2xl">🛡️</span> Segurança da Conta
        </h2>

        {/* E-mail mascarado */}
        <div className="bg-gray-50 dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <span className="text-xl">📧</span>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-mail de acesso</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{maskEmail(userEmail)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            id="security-btn-senha"
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-95 transition-all"
          >
            🔒 Alterar Senha
          </button>
          <button
            id="security-btn-email"
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all"
          >
            📧 Alterar E-mail
          </button>
        </div>
      </div>

      {/* ── Modais ── */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSave={handleSavePassword}
        />
      )}
      {showEmailModal && (
        <ChangeEmailModal
          currentEmail={userEmail}
          onClose={() => setShowEmailModal(false)}
          onSave={handleSaveEmail}
        />
      )}
    </div>
  );
};

// ─── Sub-componente: Resultado da Triagem ─────────────────────────────────────

interface TriageResultViewProps {
  result: TriageResult;
  onReset: () => void;
}

const TriageResultView: React.FC<TriageResultViewProps> = ({ result, onReset }) => {
  const { classification, recommendedLawyers } = result;
  const colors = areaColorClasses(classification.color);

  const confidenceConfig = {
    alta:  { label: 'Alta',  cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700' },
    média: { label: 'Média', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
    baixa: { label: 'Baixa', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-600' },
  };

  const complexityDot = {
    simples:  'bg-green-500',
    moderada: 'bg-amber-500',
    complexa: 'bg-red-500',
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Badge da área + indicadores ── */}
      <div className={`border rounded-xl p-4 ${colors.bg} ${colors.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{classification.emoji}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Área Detectada</p>
              <p className={`text-base font-bold ${colors.text}`}>{classification.areaSimple}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{classification.area}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Confiança */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${confidenceConfig[classification.confidence].cls}`}>
              Confiança: {confidenceConfig[classification.confidence].label}
            </span>
            {/* Complexidade */}
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${complexityDot[classification.complexity]}`} />
              {classification.complexity.charAt(0).toUpperCase() + classification.complexity.slice(1)}
            </span>
          </div>
        </div>

        {/* Descrição da área */}
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {classification.description}
        </p>

        {/* Keywords detectadas */}
        {classification.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {classification.keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full bg-white/60 dark:bg-black/20 border border-current/20 font-medium capitalize"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Advogados recomendados ── */}
      <div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
          ⚖️ Advogados Recomendados para o seu caso
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-gray-50 dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl p-4 flex flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {/* Foto + nome + OAB */}
              <div className="flex items-center gap-3">
                <img
                  src={lawyer.photoUrl}
                  alt={lawyer.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=7c3aed&color=fff`;
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{lawyer.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">OAB {lawyer.oab}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lawyer.location.city}/{lawyer.location.state}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={lawyer.rating} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {lawyer.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({lawyer.reviewCount} avaliações)</span>
              </div>

              {/* 2 especialidades */}
              <div className="flex flex-wrap gap-1.5">
                {lawyer.specialties.slice(0, 2).map((sp) => (
                  <span
                    key={sp}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold"
                  >
                    {sp}
                  </span>
                ))}
              </div>

              {/* Preço */}
              {lawyer.consultationFee != null && (
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  💰 Consulta a partir de{' '}
                  <span className="text-purple-600 dark:text-purple-400">
                    R$ {lawyer.consultationFee.toLocaleString('pt-BR')}
                  </span>
                </p>
              )}

              {/* Botão agendar */}
              <button
                id={`triage-btn-agendar-${lawyer.id}`}
                type="button"
                onClick={() => alert('Navegando para agendamento...')}
                className="mt-auto w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md shadow-purple-500/20"
              >
                📅 Agendar Consulta
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Botão refazer */}
      <button
        id="triage-btn-refazer"
        type="button"
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
      >
        🔄 Refazer análise
      </button>
    </div>
  );
};
