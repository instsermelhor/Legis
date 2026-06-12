import React, { useState, useRef, useMemo } from 'react';
import type { Secretary, Case } from '../../types';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { LawyerInfoPopup } from '../common/LawyerInfoPopup';
import { mockLawyers } from '../../services/mockLawyerService';
import { XIcon } from '../common/IconComponents';
import SocialLinksEditor from '../common/SocialLinksEditor';
import type { SocialLink } from '../common/SocialLinksEditor';
import { SecretaryOverview } from './sections/SecretaryOverview';
import { SecretaryScheduler } from './sections/SecretaryScheduler';
import { SecretaryDocuments } from './sections/SecretaryDocuments';
import { SecretaryApis } from './sections/SecretaryApis';
import { SecretaryAi } from './sections/SecretaryAi';
import { SecretaryEfficiency } from './sections/SecretaryEfficiency';


interface SecretariadoDashboardProps {
  secretary: Secretary;
  userEmail?: string;
  onUpdateSecretary?: (updates: Partial<Secretary>) => void;
  onUpdateEmail?: (newEmail: string) => void;
  onLogout?: () => void;
}

type ActiveTab = 'overview' | 'perfil' | 'agenda' | 'documentos' | 'apis' | 'iaTools' | 'efficiency_services';


const AREAS_CONHECIMENTO = [
  'Atendimento ao Cliente', 'Gestão de Agenda', 'Protocolo Judicial',
  'Organização Documental', 'Redação Jurídica', 'Diários Oficiais',
  'Controle Financeiro', 'Triagem de Clientes', 'Gestão de Escritório',
  'Suporte Administrativo', 'PJe / e-SAJ', 'Arquivo e Digitalização',
];

const DOC_TYPES_PERSONAL = [
  'RG', 'CPF', 'CNH', 'Carteira de Trabalho', 'Passaporte',
  'Comprovante de Residência', 'Certidão de Nascimento', 'Certificado / Diploma',
  'Contrato de Trabalho', 'Outro',
];

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_LABEL = 'PDF, JPG, JPEG ou PNG';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalDoc {
  name: string;
  fileType: 'PDF' | 'Imagem';
  size: string;
  date: string;
  docType: string; // user-described type (e.g. "RG", "Passaporte")
}

interface ProcessDoc {
  name: string;
  fileType: 'PDF' | 'Imagem';
  size: string;
  date: string;
  processNumber: string;
  oab: string;
  lawyerName: string;
}

// ─── Personal Doc Upload Modal ────────────────────────────────────────────────

interface PersonalDocModalProps {
  onClose: () => void;
  onConfirm: (doc: PersonalDoc) => void;
}

const PersonalDocModal: React.FC<PersonalDocModalProps> = ({ onClose, onConfirm }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; fileType: 'PDF' | 'Imagem'; size: string } | null>(null);
  const [docType, setDocType] = useState('');
  const [customDocType, setCustomDocType] = useState('');
  const [sent, setSent] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { alert(`Formato não permitido. Use ${ALLOWED_LABEL}.`); return; }
    setPendingFile({ name: f.name, fileType: f.type.includes('pdf') ? 'PDF' : 'Imagem', size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
    e.target.value = '';
  };

  const finalDocType = docType === 'Outro' ? customDocType : docType;
  const canSend = !!pendingFile && !!finalDocType.trim();

  const handleSend = () => {
    if (!pendingFile || !finalDocType.trim()) return;
    setSent(true);
    setTimeout(() => {
      onConfirm({ ...pendingFile, date: new Date().toLocaleDateString('pt-BR'), docType: finalDocType.trim() });
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-base font-bold text-gray-800">📎 Upload de Documento Pessoal</h2>
            <p className="text-xs text-gray-500 mt-0.5">Identifique o tipo de documento antes de enviar</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Step 1: type of document */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">1. Tipo de Documento</label>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <option value="">Selecione o tipo...</option>
              {DOC_TYPES_PERSONAL.map(t => <option key={t}>{t}</option>)}
            </select>
            {docType === 'Outro' && (
              <input value={customDocType} onChange={e => setCustomDocType(e.target.value)}
                placeholder="Descreva o tipo de documento"
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
            )}
          </div>
          {/* Step 2: file */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">2. Selecionar Arquivo</label>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
            {!pendingFile ? (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-200 rounded-xl py-6 text-center hover:bg-purple-50 hover:border-purple-400 transition-colors">
                <p className="text-2xl mb-1">📁</p>
                <p className="text-sm font-medium text-gray-600">Clique para selecionar o arquivo</p>
                <p className="text-xs text-gray-400 mt-0.5">{ALLOWED_LABEL}</p>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                <span className="text-xl shrink-0">{pendingFile.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{pendingFile.name}</p>
                  <p className="text-xs text-gray-400">{pendingFile.fileType} · {pendingFile.size}</p>
                </div>
                <button onClick={() => setPendingFile(null)} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
              </div>
            )}
          </div>
          {sent && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-800 text-sm font-semibold">✅ Documento enviado com sucesso!</div>}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Cancelar</button>
          <button onClick={handleSend} disabled={!canSend || sent}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {sent ? '✅ Enviado!' : '📤 Confirmar Envio'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Process Doc Upload Modal ─────────────────────────────────────────────────

interface ProcessDocModalProps {
  onClose: () => void;
  onConfirm: (doc: ProcessDoc) => void;
  delegatedCases: Case[];
}

const ProcessDocModal: React.FC<ProcessDocModalProps> = ({ onClose, onConfirm, delegatedCases }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; fileType: 'PDF' | 'Imagem'; size: string } | null>(null);
  const [processNumber, setProcessNumber] = useState('');
  const [oab, setOab] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [sent, setSent] = useState(false);

  const handleSelectCase = (caseId: string) => {
    setProcessNumber(caseId);
    if (!caseId) {
      setOab('');
      setLawyerName('');
      return;
    }
    const matched = delegatedCases.find(c => c.id === caseId);
    if (matched) {
      const matchedLawyer = mockLawyers.find(l => l.id === matched.lawyerId || l.name === matched.lawyerName);
      setOab(matchedLawyer ? matchedLawyer.oab : 'OAB N/D');
      setLawyerName(matched.lawyerName);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { alert(`Formato não permitido. Use ${ALLOWED_LABEL}.`); return; }
    setPendingFile({ name: f.name, fileType: f.type.includes('pdf') ? 'PDF' : 'Imagem', size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
    e.target.value = '';
  };

  const canSend = !!pendingFile && !!processNumber.trim() && !!oab.trim() && !!lawyerName.trim();

  const handleSend = () => {
    if (!canSend) return;
    setSent(true);
    setTimeout(() => {
      onConfirm({ ...pendingFile!, date: new Date().toLocaleDateString('pt-BR'), processNumber: processNumber.trim(), oab: oab.trim(), lawyerName: lawyerName.trim() });
      onClose();
    }, 900);
  };

  const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2A2545]">
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">📂 Enviar Documento de Processo</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vincule o documento ao processo e ao advogado</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2545]"><XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Process info */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Identificação do Processo</p>
            {delegatedCases.length === 0 ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-900 rounded-lg">
                Nenhum caso foi delegado a você ainda. Não é possível vincular documentos sem casos delegados.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Selecionar Processo Delegado *</label>
                  <select
                    value={processNumber}
                    onChange={e => handleSelectCase(e.target.value)}
                    className={fieldCls}
                  >
                    <option value="" className="text-gray-500">Selecione um processo...</option>
                    {delegatedCases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} (Proc: #{c.id})
                      </option>
                    ))}
                  </select>
                </div>
                {processNumber && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OAB do Advogado</label>
                      <input value={oab} readOnly className={`${fieldCls} bg-gray-50 dark:bg-black/40 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome do Advogado</label>
                      <input value={lawyerName} readOnly className={`${fieldCls} bg-gray-50 dark:bg-black/40 cursor-not-allowed`} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* File */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Arquivo do Documento</label>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
            {!pendingFile ? (
              <button onClick={() => fileInputRef.current?.click()}
                disabled={delegatedCases.length === 0}
                className="w-full border-2 border-dashed border-purple-200 dark:border-purple-900/60 rounded-xl py-5 text-center hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <p className="text-2xl mb-1">📁</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Clique para selecionar o arquivo</p>
                <p className="text-xs text-gray-400 mt-0.5">{ALLOWED_LABEL}</p>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl px-4 py-3">
                <span className="text-xl shrink-0">{pendingFile.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{pendingFile.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">{pendingFile.fileType} · {pendingFile.size}</p>
                </div>
                <button onClick={() => setPendingFile(null)} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
              </div>
            )}
          </div>
          {/* Confirmation summary */}
          {pendingFile && processNumber && oab && lawyerName && !sent && (
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-4 space-y-1 text-xs animate-fade-in">
              <p className="font-bold text-purple-800 dark:text-purple-400 text-sm mb-2">✔ Confirme os dados antes de enviar</p>
              <p><span className="font-semibold text-gray-600 dark:text-gray-400">Arquivo:</span> {pendingFile.name}</p>
              <p><span className="font-semibold text-gray-600 dark:text-gray-400">Processo:</span> {processNumber}</p>
              <p><span className="font-semibold text-gray-600 dark:text-gray-400">OAB:</span> {oab}</p>
              <p><span className="font-semibold text-gray-600 dark:text-gray-400">Advogado:</span> {lawyerName}</p>
            </div>
          )}
          {sent && <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 py-2 text-green-800 dark:text-green-400 text-sm font-semibold">✅ Documento enviado e vinculado ao processo!</div>}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 dark:border-[#2A2545] bg-gray-50 dark:bg-black/20 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Cancelar</button>
          <button onClick={handleSend} disabled={!canSend || sent}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {sent ? '✅ Enviado!' : '📤 Confirmar e Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  };
  return (
    <div className={`${colors[color] || colors.purple} border rounded-xl p-4 text-center`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
};

// ─── Sync Card ────────────────────────────────────────────────────────────────

interface SyncCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  synced: boolean;
  syncedLabel: string;
  unSyncedLabel: string;
  borderColor: string;
  hoverColor: string;
  syncedColor: string;
  onClick: () => void;
}

const SyncCard: React.FC<SyncCardProps> = ({ title, subtitle, icon, synced, syncedLabel, unSyncedLabel, borderColor, hoverColor, syncedColor, onClick }) => (
  <button onClick={onClick}
    className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${synced ? syncedColor : `border-gray-200 bg-white ${hoverColor}`}`}>
    <div className="shrink-0 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="shrink-0">
      {synced
        ? <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">✓ {syncedLabel}</span>
        : <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${borderColor} border rounded-full`}>{unSyncedLabel}</span>}
    </div>
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const SecretariadoDashboard: React.FC<SecretariadoDashboardProps> = ({
  secretary, userEmail, onUpdateSecretary, onUpdateEmail, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const allowedTools = React.useMemo(() => {
    const saved = localStorage.getItem(`legis_perms_secretary_${secretary.id}`);
    return saved ? JSON.parse(saved) : ['pecas', 'pesquisas', 'audios', 'transcricao', 'fundamentacoes', 'revisao', 'jurisprudencia', 'manifestacao'];
  }, [secretary.id]);

  const delegatedCases = useMemo(() => {
    const savedDelegated = localStorage.getItem(`legis_delegated_cases_secretary_${secretary.id}`);
    const delegatedIds: string[] = savedDelegated ? JSON.parse(savedDelegated) : [];
    const savedCases = localStorage.getItem('legis_lawyer_cases');
    const allCases: Case[] = savedCases ? JSON.parse(savedCases) : [];
    return allCases.filter(c => delegatedIds.includes(c.id));
  }, [secretary.id]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLawyerPopup, setShowLawyerPopup] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Doc modals
  const [showPersonalDocModal, setShowPersonalDocModal] = useState(false);
  const [showProcessDocModal, setShowProcessDocModal] = useState(false);

  // Docs
  const [personalDocs, setPersonalDocs] = useState<PersonalDoc[]>([]);
  const [processDocs, setProcessDocs] = useState<ProcessDoc[]>([]);

  // Calendar sync — now separated into professional and personal
  const [calendarSynced, setCalendarSynced] = useState({
    googleProfessional: false,
    googlePersonal: false,
    microsoftProfessional: false,
    microsoftPersonal: false,
  });
  const [syncMsg, setSyncMsg] = useState('');

  // Profile form — mirrors all fields shown in Meu Perfil
    const [profile, setProfile] = useState({
    name: secretary.name || '',
    phone: secretary.phone || '',
    city: secretary.city || '',
    state: secretary.state || '',
    address: secretary.address || '',
    experience: String(secretary.experience || 0),
    availability: secretary.availability || 'integral',
    bio: secretary.bio || '',
    areasOfKnowledge: secretary.areasOfKnowledge || [],
  });
  // Redes Sociais — mesmo padrão do admin (array { provider, url })
  const [secretarySocialLinks, setSecretarySocialLinks] = useState<SocialLink[]>(
    () => (secretary.socialLinks as SocialLink[] | undefined) || []
  );

  const assignedLawyer = secretary.assignedLawyerId
    ? mockLawyers.find(l => l.id === secretary.assignedLawyerId) || null
    : null;

  const handleSaveProfile = () => {
    if (onUpdateSecretary) onUpdateSecretary({
      ...profile,
      experience: Number(profile.experience),
      socialLinks: secretarySocialLinks,
    } as any);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const toggleArea = (area: string) => {
    setProfile(p => ({
      ...p,
      areasOfKnowledge: p.areasOfKnowledge.includes(area)
        ? p.areasOfKnowledge.filter(a => a !== area)
        : [...p.areasOfKnowledge, area],
    }));
  };

  const handleCalendarSync = (key: keyof typeof calendarSynced) => {
    setCalendarSynced(prev => ({ ...prev, [key]: !prev[key] }));
    const labelMap: { [k: string]: string } = {
      googleProfessional: 'Google Calendar (Profissional)',
      googlePersonal: 'Google Calendar (Pessoal)',
      microsoftProfessional: 'Microsoft Outlook (Profissional)',
      microsoftPersonal: 'Microsoft Outlook (Pessoal)',
    };
    const keyStr = key as string;
    const alreadySynced = calendarSynced[key];
    setSyncMsg(alreadySynced ? `🔌 Desconectado de ${labelMap[keyStr]}` : `✅ Sincronizado com ${labelMap[keyStr]}!`);
    setTimeout(() => setSyncMsg(''), 4000);
  };

  const tabBtn = (id: ActiveTab, label: string) => (
    <button onClick={() => setActiveTab(id)}
      className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
      {label}
    </button>
  );

  // ── Overview values that update from profile state ──────────────────────────
  const overviewAvailLabel = profile.availability === 'integral' ? 'Tempo Integral' : profile.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
  const overviewLocation = [profile.city, profile.state].filter(Boolean).join('/') || `${secretary.city}/${secretary.state}`;
  const overviewExperience = profile.experience ? `${profile.experience} anos` : `${secretary.experience} anos`;
  const overviewAreas = profile.areasOfKnowledge.length > 0 ? profile.areasOfKnowledge : secretary.areasOfKnowledge;
  const overviewBio = profile.bio || secretary.bio;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-neutral-light p-6 sm:p-8 rounded-xl shadow-sm">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-bold shrink-0">
            {secretary.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Secret./Assist. Jurídico</h1>
            <p className="text-gray-600">Bem-vindo(a), {profile.name || secretary.name}!</p>
            {assignedLawyer && (
              <button onClick={() => setShowLawyerPopup(true)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full hover:bg-green-100 transition-colors">
                🎉 Vinculado: {assignedLawyer.name} — Ver informações
              </button>
            )}
          </div>
        </div>

        {assignedLawyer && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-sm">Você foi selecionado por um advogado!</p>
                <p className="text-xs text-white/85">Dr(a). {assignedLawyer.name} — OAB {assignedLawyer.oab}</p>
              </div>
            </div>
            <button onClick={() => setShowLawyerPopup(true)} className="shrink-0 px-4 py-2 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              Ver Detalhes
            </button>
          </div>
        )}

        {/* Tab Nav */}
        <div className="border-b border-gray-200 mb-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
          <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-4">
            {tabBtn('overview', '📊 Visão Geral')}
            {tabBtn('perfil', '👤 Meu Perfil')}
            {tabBtn('agenda', '📅 Agenda')}
            {tabBtn('documentos', '📂 Documentos')}
            {tabBtn('apis', '🔌 APIs')}
            {tabBtn('iaTools', '⚡ IA Jurídica')}
            {tabBtn('efficiency_services', '💼 Serviços de Eficiência')}

            {onLogout && (
              <button onClick={onLogout}
                className="py-3 px-2 border-b-2 border-transparent font-medium text-sm text-red-500 hover:text-red-700 hover:border-red-300 transition-colors ml-auto">
                🚪 Sair
              </button>
            )}
          </nav>
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <SecretaryOverview
            secretary={secretary}
            assignedLawyer={assignedLawyer}
            onGoToScheduler={() => setActiveTab('agenda')}
          />
        )}

        {/* ─── PERFIL ─── */}
        {activeTab === 'perfil' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Dados Pessoais e Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cidade</label>
                  <input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado (UF)</label>
                  <input value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} maxLength={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Experiência (anos)</label>
                  <input type="number" min="0" value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Disponibilidade</label>
                  <select value={profile.availability} onChange={e => setProfile(p => ({ ...p, availability: e.target.value as Secretary['availability'] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white select-text-dark">
                    <option value="integral">Tempo Integral</option>
                    <option value="meio-periodo">Meio Período</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Endereço</label>
                  <input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Rua, Número, Bairro, CEP" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Apresentação / Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Descreva sua experiência e diferenciais..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                </div>
              </div>
            </div>

            {/* Areas of Knowledge */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">🎯 Áreas de Conhecimento</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AREAS_CONHECIMENTO.map(area => {
                  const selected = profile.areasOfKnowledge.includes(area);
                  return (
                    <label key={area} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${selected ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleArea(area)} className="rounded" />
                      {area}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-2 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">🌐 Redes Sociais</h3>
              <p className="text-xs text-gray-500 mb-3">Links visíveis para o advogado ao qual você está vinculado.</p>
              <SocialLinksEditor
                value={secretarySocialLinks}
                onChange={setSecretarySocialLinks}
              />
            </div>

            {/* Personal documents upload — with type identification */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">📎 Documentos Pessoais</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Somente para documentos de identificação pessoal (RG, CPF, CNH, etc.)</p>
                </div>
                <button onClick={() => setShowPersonalDocModal(true)}
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  ➕ Adicionar
                </button>
              </div>
              <p className="text-xs text-gray-400">Formatos aceitos: {ALLOWED_LABEL} · Cada arquivo deve ser identificado com seu tipo.</p>
              {personalDocs.length === 0 ? (
                <button onClick={() => setShowPersonalDocModal(true)}
                  className="w-full border-2 border-dashed border-purple-200 rounded-xl py-7 text-center hover:bg-purple-50 hover:border-purple-400 transition-colors">
                  <p className="text-3xl mb-1">📁</p>
                  <p className="text-sm font-medium text-gray-500">Clique para adicionar um documento pessoal</p>
                </button>
              ) : (
                <div className="space-y-2">
                  {personalDocs.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{d.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                          <p className="text-[10px] text-gray-400">{d.fileType} · {d.size} · {d.date}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">{d.docType}</span>
                        </div>
                      </div>
                      <button onClick={() => setPersonalDocs(prev => prev.filter((_, idx) => idx !== i))} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold p-1">✕</button>
                    </div>
                  ))}
                  <button onClick={() => setShowPersonalDocModal(true)} className="text-xs text-purple-600 hover:underline font-semibold py-1">+ Adicionar mais documentos</button>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              <h3 className="text-base font-bold text-gray-800">🔐 Segurança de Acesso</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">🔑 Alterar Senha</button>
                <button onClick={() => setShowEmailModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">📧 Alterar E-mail</button>
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">E-mail atual: <strong>{userEmail || secretary.email}</strong></p>
            </div>

            {/* Save / Reset buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleSaveProfile} className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-md transition-colors">
                {profileSaved ? '✓ Perfil Salvo!' : '💾 Salvar Alterações'}
              </button>
              <button
                onClick={() => setProfile({ name: secretary.name || '', phone: secretary.phone || '', city: secretary.city || '', state: secretary.state || '', address: secretary.address || '', experience: String(secretary.experience || 0), availability: secretary.availability || 'integral', bio: secretary.bio || '', areasOfKnowledge: secretary.areasOfKnowledge || [] })}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                🔄 Atualizar Cadastro
              </button>
            </div>
          </div>
        )}

        {/* ─── AGENDA ─── */}
        {activeTab === 'agenda' && (
          <SecretaryScheduler />
        )}

        {/* ─── DOCUMENTOS ─── */}
        {activeTab === 'documentos' && (
          <SecretaryDocuments />
        )}

        {/* ─── APIs ─── */}
        {activeTab === 'apis' && (
          <SecretaryApis />
        )}

        {/* ─── IA JURÍDICA ─── */}
        {activeTab === 'iaTools' && (
          <SecretaryAi />
        )}

        {/* ─── SERVIÇOS DE EFICIÊNCIA ─── */}
        {activeTab === 'efficiency_services' && (
          <SecretaryEfficiency />
        )}

      </div>

      {/* ─── Modals ─── */}
      {showPersonalDocModal && (
        <PersonalDocModal
          onClose={() => setShowPersonalDocModal(false)}
          onConfirm={doc => setPersonalDocs(prev => [...prev, doc])}
        />
      )}
      {showProcessDocModal && (
        <ProcessDocModal
          onClose={() => setShowProcessDocModal(false)}
          onConfirm={doc => setProcessDocs(prev => [...prev, doc])}
          delegatedCases={delegatedCases}
        />
      )}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={(pwd, newPwd) => { if (newPwd.length < 4) return false; alert("Senha alterada com sucesso!"); return true; }} />}
      {showEmailModal && (
        <ChangeEmailModal
          currentEmail={userEmail || secretary.email}
          onClose={() => setShowEmailModal(false)}
          onSave={(pwd, newEmail) => { if (pwd.length < 4) return false; if (onUpdateEmail) onUpdateEmail(newEmail); return true; }}
        />
      )}
      {showLawyerPopup && assignedLawyer && (
        <LawyerInfoPopup
          lawyer={assignedLawyer}
          message="Você foi selecionado(a) como Secret./Assist. Jurídico deste advogado!"
          onClose={() => setShowLawyerPopup(false)}
          onAccept={() => {
            if (onUpdateSecretary) onUpdateSecretary({ assignedLawyerId: assignedLawyer.id });
            setShowLawyerPopup(false);
            alert("Você aceitou o vínculo com Dr(a). " + assignedLawyer.name + "!");
          }}
          onReject={() => {
            if (onUpdateSecretary) onUpdateSecretary({ assignedLawyerId: undefined });
            setShowLawyerPopup(false);
            alert("Você recusou o vínculo.");
          }}
        />
      )}
    </div>
  );
};
