import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Message, Case } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { PaperAirplaneIcon, BriefcaseIcon, VideoCameraIcon, XIcon, BadgeCheckIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { StarRating } from '../common/StarRating';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { BRAZILIAN_STATES } from '../../constants';

interface ClientDashboardProps {
  user: User;
  onUpdateLawyerReview: (lawyerId: number, caseId: string, rating: number, comment: string) => void;
  onNavigate?: (view: any) => void;
  onLogout?: () => void;
}

// lawyer is resolved dynamically inside the component based on user's active case
// const lawyer = mockLawyers[0]; // REMOVED — was hardcoded, see resolvedLawyer below

const FALLBACK_LAWYER = mockLawyers[0];

const initialMessages: Message[] = [
    { id: 1, sender: 'lawyer', text: 'Olá! Recebi os detalhes do seu caso. Para começarmos, poderia me enviar a documentação que mencionei?', timestamp: '10:30', avatarUrl: FALLBACK_LAWYER.photoUrl },
    { id: 2, sender: 'client', text: 'Bom dia, Dr. Carlos. Sim, já estou com os documentos. Enviando em anexo.', timestamp: '10:32', avatarUrl: 'https://i.pravatar.cc/40?u=client' },
    { id: 3, sender: 'lawyer', text: 'Perfeito, recebi aqui. Vou analisar e te retorno em breve com os próximos passos.', timestamp: '10:35', avatarUrl: FALLBACK_LAWYER.photoUrl },
];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UploadedDoc {
    name: string;
    type: 'PDF' | 'Imagem';
    size: string;
    date: string;
    caseId?: string;
    lawyerName?: string;
}

interface ReviewModalProps {
    caseToReview: Case;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXT_LABEL = 'PDF, JPG, JPEG ou PNG';

function parseFiles(files: FileList | null, onDoc: (d: UploadedDoc) => void) {
    if (!files) return;
    Array.from(files).forEach((f) => {
        if (!ALLOWED_TYPES.includes(f.type)) {
            alert(`Arquivo "${f.name}" não permitido.\nFormatos aceitos: ${ALLOWED_EXT_LABEL}`);
            return;
        }
        const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
        onDoc({
            name: f.name,
            type: f.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${sizeMB} MB`,
            date: new Date().toLocaleDateString('pt-BR'),
        });
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Chip showing an uploaded document with a remove button */
const DocChip: React.FC<{ doc: UploadedDoc; onRemove: () => void }> = ({ doc, onRemove }) => (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 gap-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">{doc.type === 'PDF' ? '📄' : '🖼️'}</span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.type} · {doc.size} · {doc.date}</p>
                {doc.lawyerName && <p className="text-xs text-primary font-medium">Para: {doc.lawyerName}</p>}
                {doc.caseId && <p className="text-xs text-indigo-500 font-medium">Processo: {doc.caseId}</p>}
            </div>
        </div>
        <button
            onClick={onRemove}
            className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold p-1 rounded-lg hover:bg-red-50 transition-colors"
            aria-label="Remover"
        >
            ✕
        </button>
    </div>
);

/** Drop-zone / upload trigger area */
const UploadZone: React.FC<{ onUpload: () => void }> = ({ onUpload }) => (
    <button
        onClick={onUpload}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 text-center text-gray-400 hover:border-primary/50 hover:bg-primary/5 transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
    >
        <p className="text-3xl mb-1">📁</p>
        <p className="text-sm font-medium">Clique para enviar documentos</p>
        <p className="text-xs mt-1 text-gray-300">{ALLOWED_EXT_LABEL}</p>
    </button>
);

// ─── Review Modal ─────────────────────────────────────────────────────────────

const ReviewModal: React.FC<ReviewModalProps> = ({ caseToReview, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        setIsLoading(true);
        setTimeout(() => { onSubmit(rating, comment); setIsLoading(false); onClose(); }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Avaliar Serviço</h2>
                                <p className="text-sm text-gray-500 mt-1">Advogado(a): {caseToReview.lawyerName}</p>
                            </div>
                            <button type="button" onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200">
                                <XIcon className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Sua nota para o serviço prestado</p>
                            <div className="flex justify-center"><StarRating rating={rating} onRatingChange={setRating} /></div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="rev-comment" className="block text-sm font-medium text-gray-700">Comentário (opcional)</label>
                            <textarea id="rev-comment" rows={4} value={comment} onChange={e => setComment(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                placeholder="Descreva sua experiência..." />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                        <button type="submit" disabled={rating === 0 || isLoading}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark disabled:bg-primary/50">
                            {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Upload-to-Lawyer Modal ───────────────────────────────────────────────────

interface UploadToLawyerModalProps {
    cases: Case[];
    onClose: () => void;
    onConfirm: (selectedCaseId: string, lawyerName: string, docs: UploadedDoc[]) => void;
}

const UploadToLawyerModal: React.FC<UploadToLawyerModalProps> = ({ cases, onClose, onConfirm }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id ?? '');
    const [pendingDocs, setPendingDocs] = useState<UploadedDoc[]>([]);
    const [sent, setSent] = useState(false);

    const activeCases = cases.filter(c => c.status !== 'Concluído');
    const selectedCase = activeCases.find(c => c.id === selectedCaseId) ?? activeCases[0];

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        parseFiles(e.target.files, d => setPendingDocs(prev => [...prev, d]));
        e.target.value = '';
    };

    const handleSend = () => {
        if (!selectedCase || pendingDocs.length === 0) return;
        setSent(true);
        setTimeout(() => {
            onConfirm(selectedCase.id, selectedCase.lawyerName, pendingDocs);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">📤 Enviar Documentos ao Advogado</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Selecione o processo e faça upload dos documentos</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Destination selector */}
                    {activeCases.length > 1 ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                Para qual processo / advogado?
                            </label>
                            <div className="space-y-2">
                                {activeCases.map(c => (
                                    <label key={c.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCaseId === c.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/30'}`}>
                                        <input type="radio" name="dest-case" value={c.id}
                                            checked={selectedCaseId === c.id}
                                            onChange={() => setSelectedCaseId(c.id)}
                                            className="accent-primary" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                                            <p className="text-xs text-gray-500">Advogado: <span className="font-medium text-primary">{c.lawyerName}</span></p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Destinatário</p>
                            <p className="font-bold text-gray-800">{selectedCase?.lawyerName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Processo: {selectedCase?.title}</p>
                        </div>
                    )}

                    {/* Upload zone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Documentos</label>
                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleFiles} />
                        {pendingDocs.length === 0 ? (
                            <UploadZone onUpload={() => fileInputRef.current?.click()} />
                        ) : (
                            <div className="space-y-2">
                                {pendingDocs.map((d, i) => (
                                    <DocChip key={i} doc={d} onRemove={() => setPendingDocs(prev => prev.filter((_, idx) => idx !== i))} />
                                ))}
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="w-full text-xs text-primary hover:underline font-semibold py-2">
                                    + Adicionar mais arquivos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sent confirmation */}
                    {sent && (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm font-semibold flex items-center gap-2">
                            ✅ Documentos enviados com sucesso!
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={pendingDocs.length === 0 || sent}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sent ? '✅ Enviado!' : `📤 Enviar${pendingDocs.length > 0 ? ` (${pendingDocs.length} arquivo${pendingDocs.length > 1 ? 's' : ''})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Case Upload Panel ────────────────────────────────────────────────────────

interface CaseUploadPanelProps {
    caseId: string;
    docs: UploadedDoc[];
    onAdd: (doc: UploadedDoc) => void;
    onRemove: (idx: number) => void;
}

const CaseUploadPanel: React.FC<CaseUploadPanelProps> = ({ caseId, docs, onAdd, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        parseFiles(e.target.files, d => onAdd({ ...d, caseId }));
        e.target.value = '';
    };

    return (
        <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">📎</span>
                    <p className="text-sm font-semibold text-gray-700">
                        Documentos do Processo
                        {docs.length > 0 && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{docs.length}</span>}
                    </p>
                </div>
                <button
                    onClick={() => setOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                >
                    {open ? '▲ Fechar' : '▼ Gerenciar'}
                </button>
            </div>

            {open && (
                <div className="space-y-3">
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleFiles} />

                    {docs.length === 0 ? (
                        <UploadZone onUpload={() => fileInputRef.current?.click()} />
                    ) : (
                        <>
                            <div className="space-y-2">
                                {docs.map((d, i) => (
                                    <DocChip key={i} doc={d} onRemove={() => onRemove(i)} />
                                ))}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                ➕ Adicionar mais documentos
                            </button>
                        </>
                    )}

                    <p className="text-[11px] text-gray-400">Formatos aceitos: {ALLOWED_EXT_LABEL} · Os documentos são específicos para este processo.</p>
                </div>
            )}
        </div>
    );
};

// ─── Action Card ──────────────────────────────────────────────────────────────

const ActionCard: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    onClick: () => void;
    badge?: string;
}> = ({ icon, title, subtitle, color, onClick, badge }) => (
    <button onClick={onClick}
        className={`relative w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100 ${color}`}>
        <span className="text-3xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">{title}</p>
            <p className="text-xs opacity-75 mt-0.5 truncate">{subtitle}</p>
        </div>
        {badge && <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/40 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">{badge}</span>}
        <svg className="w-4 h-4 opacity-50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onUpdateLawyerReview, onNavigate, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'advogado' | 'casos'>('advogado');
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [caseToReview, setCaseToReview] = useState<Case | null>(null);
    const [filterProcesso, setFilterProcesso] = useState('');
    const [filterOABCliente, setFilterOABCliente] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [showNotifMsg, setShowNotifMsg] = useState(false);

    // Upload to lawyer modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    // Docs sent to lawyer (from the "Meu Advogado" tab)
    const [lawyerDocs, setLawyerDocs] = useState<UploadedDoc[]>([]);
    // Docs per case (keyed by caseId) for "Meus Casos" tab
    const [caseDocs, setCaseDocs] = useState<Record<string, UploadedDoc[]>>({});

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user.name || '', cpf: '', rg: '', dataNasc: '', estadoCivil: '',
        phone: user.phone || '', email: user.email || '',
        cep: '', street: user.address || '', number: '', complement: '', neighborhood: '', city: '', state: '',
    });
    const [profileSaved, setProfileSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [profileDocs, setProfileDocs] = useState<UploadedDoc[]>([]);
    const profileFileRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const activeCase = user.caseHistory?.find(c => c.status === 'Ativo');
    const activeCases = useMemo(() => (user.caseHistory ?? []).filter(c => c.status !== 'Concluído'), [user.caseHistory]);

    const filteredClientCases = useMemo(() => {
        if (!user.caseHistory) return [];
        return user.caseHistory.filter(c => {
            const matchesProcesso = !filterProcesso || c.id.toLowerCase().includes(filterProcesso.toLowerCase());
            const matchesOAB = !filterOABCliente || c.lawyerName.toLowerCase().includes(filterOABCliente.toLowerCase());
            return matchesProcesso && matchesOAB;
        });
    }, [user.caseHistory, filterProcesso, filterOABCliente]);

    const upcomingAppointment = useMemo(() => {
        if (!user.appointments) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return user.appointments
            .filter(apt => apt.status === 'Confirmado' && new Date(apt.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [user.appointments]);

    // Resolve the actual assigned lawyer from user's active case (instead of hardcoded index)
    const resolvedLawyer = useMemo(() => {
        if (activeCase?.lawyerId) {
            return mockLawyers.find(l => l.id === activeCase.lawyerId) || FALLBACK_LAWYER;
        }
        return FALLBACK_LAWYER;
    }, [activeCase]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msg: Message = {
            id: messages.length + 1, sender: 'client', text: newMessage,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            avatarUrl: 'https://i.pravatar.cc/40?u=client',
        };
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    const handleLawyerUploadConfirm = (caseId: string, lawyerName: string, docs: UploadedDoc[]) => {
        const tagged = docs.map(d => ({ ...d, caseId, lawyerName }));
        setLawyerDocs(prev => [...prev, ...tagged]);
    };

    const handleCaseDocAdd = (caseId: string, doc: UploadedDoc) => {
        setCaseDocs(prev => ({ ...prev, [caseId]: [...(prev[caseId] ?? []), doc] }));
    };

    const handleCaseDocRemove = (caseId: string, idx: number) => {
        setCaseDocs(prev => ({ ...prev, [caseId]: (prev[caseId] ?? []).filter((_, i) => i !== idx) }));
    };

    const tabBtn = (id: typeof activeTab, label: string, emoji: string) => (
        <button onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            <span>{emoji}</span> {label}
        </button>
    );

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                        {user.name?.charAt(0) || 'C'}
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Cliente</h1>
                        <p className="text-gray-600">Bem-vindo(a), {user.name}!</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                    <nav className="-mb-px flex overflow-x-auto">
                        {tabBtn('advogado', 'Meu Advogado', '⚖️')}
                        {tabBtn('casos', 'Meus Casos', '📋')}
                        {tabBtn('perfil', 'Meu Perfil', '👤')}
                        {onLogout && (
                            <button onClick={onLogout}
                                className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent font-semibold text-sm text-red-500 hover:text-red-700 hover:border-red-300 transition-colors ml-auto">
                                <span>🚪</span> Sair
                            </button>
                        )}
                    </nav>
                </div>

                {/* ─── ABA MEU ADVOGADO ─── */}
                {activeTab === 'advogado' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Lawyer card */}
                        {activeCase && (
                            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg">
                                <img src={resolvedLawyer.photoUrl} alt={resolvedLawyer.name} className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shrink-0" />
                                <div className="text-center sm:text-left flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Seu Advogado</p>
                                    <h2 className="text-xl font-bold mt-1">{resolvedLawyer.name}</h2>
                                    <p className="text-sm text-white/80 mt-0.5">OAB {resolvedLawyer.oab} · {resolvedLawyer.location.city}/{resolvedLawyer.location.state}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                        {resolvedLawyer.specialties.slice(0, 2).map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-white/20 rounded-full text-xs dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex">{[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(resolvedLawyer.rating) ? 'text-yellow-300' : 'text-white/30'}>★</span>)}</div>
                                    <span className="text-xs text-white/70">{resolvedLawyer.reviewCount} avaliações</span>
                                </div>
                            </div>
                        )}

                        {/* Action cards grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ActionCard icon="📹" title="Entrar na Videochamada"
                                subtitle={upcomingAppointment ? `${new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' })} às ${upcomingAppointment.time}` : 'Nenhuma consulta agendada'}
                                color="border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                                onClick={() => {
                                    const link = upcomingAppointment?.consultationLink || 'https://meet.legisconnect.com.br/consulta';
                                    if (upcomingAppointment) window.open(link, '_blank');
                                    else alert('Nenhuma consulta agendada.');
                                }}
                                badge={upcomingAppointment ? 'Confirmada' : undefined}
                            />
                            <ActionCard icon="💬" title="Mensagem para o Advogado"
                                subtitle={activeCase ? `Dr(a). ${activeCase.lawyerName}` : 'Sem caso ativo'}
                                color="border-primary/30 bg-primary/5 text-primary-dark hover:bg-primary/10"
                                onClick={() => setShowChat(v => !v)}
                            />
                            <ActionCard icon="💚" title="WhatsApp do Advogado"
                                subtitle={resolvedLawyer.contact.phone || '(11) 99999-0000'}
                                color="border-green-200 bg-green-50 text-green-900 hover:bg-green-100"
                                onClick={() => {
                                    const phone = resolvedLawyer.contact.phone?.replace(/\D/g, '') || '5511999990000';
                                    const msg = encodeURIComponent(`Olá, Dr(a). ${resolvedLawyer.name}! Sou cliente na plataforma Legis Connect.`);
                                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                }}
                            />
                            <ActionCard icon="📅" title="Próxima Consulta"
                                subtitle={upcomingAppointment ? `${new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })} · ${upcomingAppointment.time}` : 'Nenhuma consulta agendada'}
                                color="border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                onClick={() => { if (upcomingAppointment) { setShowNotifMsg(true); setTimeout(() => setShowNotifMsg(false), 4000); } else alert('Nenhuma consulta agendada.'); }}
                                badge={upcomingAppointment ? '🔔' : undefined}
                            />
                            {/* Upload card — always shown in Meu Advogado */}
                            <ActionCard icon="📤" title="Enviar Documentos ao Advogado"
                                subtitle={lawyerDocs.length > 0 ? `${lawyerDocs.length} documento(s) enviado(s)` : 'PDF, JPG, JPEG ou PNG'}
                                color="border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
                                onClick={() => setShowUploadModal(true)}
                                badge={lawyerDocs.length > 0 ? `${lawyerDocs.length}` : undefined}
                            />
                        </div>

                        {/* Notification banner */}
                        {showNotifMsg && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-800 text-sm font-semibold flex items-center gap-3">
                                <span className="text-xl">🔔</span>
                                Notificação ativada! Você receberá um lembrete da sua consulta.
                            </div>
                        )}

                        {/* Docs sent to lawyer list */}
                        {lawyerDocs.length > 0 && (
                            <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-6 space-y-3 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">📤 Documentos Enviados ao Advogado</h3>
                                {lawyerDocs.map((d, i) => (
                                    <DocChip key={i} doc={d} onRemove={() => setLawyerDocs(prev => prev.filter((_, idx) => idx !== i))} />
                                ))}
                            </div>
                        )}

                        {/* Upcoming appointment detail */}
                        {upcomingAppointment && activeCase && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📋</span> Detalhes da Próxima Consulta</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase font-semibold">Advogado</p><p className="font-bold text-gray-800 mt-1">{activeCase.lawyerName}</p></div>
                                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase font-semibold">Data</p><p className="font-bold text-gray-800 mt-1">{new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
                                    <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase font-semibold">Horário</p><p className="font-bold text-gray-800 mt-1">{upcomingAppointment.time}</p></div>
                                </div>
                                <button onClick={() => {
                                    const link = upcomingAppointment?.consultationLink || 'https://meet.legisconnect.com.br/consulta';
                                    if (upcomingAppointment) window.open(link, '_blank');
                                }}
                                    className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-md">
                                    <VideoCameraIcon className="w-5 h-5" /> Entrar na Videochamada
                                </button>
                            </div>
                        )}

                        {/* Chat panel */}
                        {showChat && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[60vh] dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <div className="flex items-center justify-between px-5 py-4 border-b">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <img src={resolvedLawyer.photoUrl} className="w-8 h-8 rounded-full" alt="" />
                                        Chat com {resolvedLawyer.name}
                                    </h3>
                                    <button onClick={() => setShowChat(false)} className="p-1 rounded-lg hover:bg-gray-100"><XIcon className="w-5 h-5 text-gray-500" /></button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'client' ? 'justify-end' : ''}`}>
                                            {msg.sender === 'lawyer' && <img src={msg.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full shrink-0" />}
                                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl text-sm ${msg.sender === 'client' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-xs mt-1 text-right ${msg.sender === 'client' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                                            </div>
                                            {msg.sender === 'client' && <img src={msg.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full shrink-0" />}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." rows={2}
                                            className="flex-grow p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-transparent resize-none text-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:bg-primary/40">
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* No active case */}
                        {!activeCase && (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-600">Nenhum caso ativo</h3>
                                <p className="text-sm text-gray-400 mt-1">Quando você contratar um advogado, o perfil dele aparecerá aqui.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ABA MEUS CASOS ─── */}
                {activeTab === 'casos' && (
                    <div className="space-y-6 animate-fade-in">
                        {user.caseHistory && user.caseHistory.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Meus Casos</h2>
                                {/* Filters */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Número do Processo</label>
                                            <input type="text" value={filterProcesso} onChange={e => setFilterProcesso(e.target.value)} placeholder="Ex: case001"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Advogado</label>
                                            <input type="text" value={filterOABCliente} onChange={e => setFilterOABCliente(e.target.value)} placeholder="Ex: Dr. Carlos"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button onClick={() => { setFilterProcesso(''); setFilterOABCliente(''); }} className="text-xs text-primary hover:underline">Limpar Filtros</button>
                                    </div>
                                </div>

                                {/* Case list */}
                                <div className="space-y-6">
                                    {filteredClientCases.map(c => {
                                        const isConcluded = c.status === 'Concluído';
                                        const cDocs = caseDocs[c.id] ?? [];
                                        return (
                                            <div key={c.id} className="border rounded-2xl p-5 space-y-4">
                                                {/* Case header */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                                        <p className="text-sm text-gray-600">Advogado: <span className="font-semibold text-primary">{c.lawyerName}</span></p>
                                                    </div>
                                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${isConcluded ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>

                                                {/* Progress */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Andamento</h4>
                                                    <CaseProgressTracker stages={c.stages} />
                                                </div>

                                                {/* Document upload — only for active cases */}
                                                {!isConcluded && (
                                                    <CaseUploadPanel
                                                        caseId={c.id}
                                                        docs={cDocs}
                                                        onAdd={doc => handleCaseDocAdd(c.id, doc)}
                                                        onRemove={idx => handleCaseDocRemove(c.id, idx)}
                                                    />
                                                )}

                                                {/* Concluded state */}
                                                {isConcluded && (
                                                    <div className="border-t pt-4">
                                                        {/* Show uploaded docs (read-only) if any were uploaded before conclusion */}
                                                        {cDocs.length > 0 && (
                                                            <div className="mb-3 space-y-2">
                                                                <p className="text-xs font-semibold text-gray-500 uppercase">📎 Documentos enviados</p>
                                                                {cDocs.map((d, i) => (
                                                                    <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                                                        <span className="text-lg">{d.type === 'PDF' ? '📄' : '🖼️'}</span>
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-gray-700 truncate">{d.name}</p>
                                                                            <p className="text-xs text-gray-400">{d.type} · {d.size} · {d.date}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                                                                🔒 Upload encerrado · processo concluído
                                                            </div>
                                                            {c.reviewSubmitted ? (
                                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg">
                                                                    <BadgeCheckIcon className="w-5 h-5 text-green-600" /> Avaliação Enviada
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => { setCaseToReview(c); setIsReviewModalOpen(true); }}
                                                                    className="px-4 py-2 bg-secondary text-gray-900 text-sm font-semibold rounded-lg hover:brightness-110">
                                                                    Avaliar Serviço
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredClientCases.length === 0 && (
                                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">Nenhum caso encontrado com os filtros aplicados.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <BriefcaseIcon className="w-14 h-14 text-primary mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-800">Nenhum caso ativo</h2>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">Você ainda não tem nenhum caso na plataforma.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ABA MEU PERFIL ─── */}
                {activeTab === 'perfil' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Dados Cadastrais */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <h3 className="text-base font-bold text-gray-800 border-b pb-2">📋 Dados Cadastrais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {([
                                    { label: 'Nome Completo', key: 'name', placeholder: '' },
                                    { label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' },
                                    { label: 'RG', key: 'rg', placeholder: '00.000.000-0' },
                                    { label: 'Telefone', key: 'phone', placeholder: '(11) 99999-9999' },
                                ] as { label: string; key: keyof typeof profileForm; placeholder: string }[]).map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{f.label}</label>
                                        <input value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Data de Nascimento</label>
                                    <input type="date" value={profileForm.dataNasc} onChange={e => setProfileForm(p => ({ ...p, dataNasc: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado Civil</label>
                                    <select value={profileForm.estadoCivil} onChange={e => setProfileForm(p => ({ ...p, estadoCivil: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        <option value="">Selecione...</option>
                                        {['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map(v => <option key={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="pt-4 border-t space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏠 Endereço</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">CEP</label><input value={profileForm.cep} onChange={e => setProfileForm(p => ({ ...p, cep: e.target.value }))} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label><input value={profileForm.street} onChange={e => setProfileForm(p => ({ ...p, street: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Número</label><input value={profileForm.number} onChange={e => setProfileForm(p => ({ ...p, number: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label><input value={profileForm.complement} onChange={e => setProfileForm(p => ({ ...p, complement: e.target.value }))} placeholder="Apto, Bloco..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label><input value={profileForm.neighborhood} onChange={e => setProfileForm(p => ({ ...p, neighborhood: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label><input value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                        <select value={profileForm.state} onChange={e => setProfileForm(p => ({ ...p, state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <option value="">Selecione...</option>
                                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => {
                                // Persist profile form to localStorage
                                try {
                                    const saved = localStorage.getItem('legis_user');
                                    if (saved) {
                                        const u = JSON.parse(saved);
                                        localStorage.setItem('legis_user', JSON.stringify({
                                            ...u,
                                            name: profileForm.name || u.name,
                                            phone: profileForm.phone || u.phone,
                                            address: profileForm.street || u.address,
                                        }));
                                    }
                                } catch {}
                                setProfileSaved(true);
                                setTimeout(() => setProfileSaved(false), 2500);
                            }}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow">
                                {profileSaved ? '✓ Salvo!' : '💾 Salvar Alterações'}
                            </button>
                        </div>

                        {/* Upload de Documentos Pessoais */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800">📎 Documentos Pessoais</h3>
                                <button onClick={() => profileFileRef.current?.click()}
                                    className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
                                    ➕ Adicionar Documento
                                </button>
                                <input ref={profileFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden"
                                    onChange={e => { parseFiles(e.target.files, d => setProfileDocs(prev => [...prev, d])); e.target.value = ''; }} />
                            </div>
                            <p className="text-xs text-gray-400">Formatos aceitos: {ALLOWED_EXT_LABEL}</p>
                            {profileDocs.length === 0 ? (
                                <UploadZone onUpload={() => profileFileRef.current?.click()} />
                            ) : (
                                <div className="space-y-2">
                                    {profileDocs.map((d, i) => (
                                        <DocChip key={i} doc={d} onRemove={() => setProfileDocs(prev => prev.filter((_, idx) => idx !== i))} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Segurança */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <h3 className="text-base font-bold text-gray-800">🔐 Segurança de Acesso</h3>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">🔑 Alterar Senha</button>
                                <button onClick={() => setShowEmailModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">📧 Alterar E-mail</button>
                            </div>
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">E-mail atual: <strong>{user.email}</strong></p>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Modais ─── */}
            {showUploadModal && (
                <UploadToLawyerModal
                    cases={activeCases.length > 0 ? activeCases : (user.caseHistory ?? [])}
                    onClose={() => setShowUploadModal(false)}
                    onConfirm={handleLawyerUploadConfirm}
                />
            )}
            {isReviewModalOpen && caseToReview && (
                <ReviewModal
                    caseToReview={caseToReview}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={(rating, comment) => { if (caseToReview) onUpdateLawyerReview(caseToReview.lawyerId, caseToReview.id, rating, comment); }}
                />
            )}
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={cur => cur.length >= 4} />}
            {showEmailModal && <ChangeEmailModal currentEmail={user.email} onClose={() => setShowEmailModal(false)} onSave={(pwd, _) => pwd.length >= 4} />}
        </>
    );
};