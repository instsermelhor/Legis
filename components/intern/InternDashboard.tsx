import React, { useState, useRef } from 'react';
import type { Intern } from '../../types';
import { AcademicCapIcon, ClipboardListIcon, UsersIcon, ChatBubbleIcon, XIcon } from '../common/IconComponents';
import { AREAS_OF_LAW, BRAZILIAN_STATES } from '../../constants';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { LawyerInfoPopup } from '../common/LawyerInfoPopup';
import { ApiStatusPanel } from '../common/ApiStatusPanel';
import { mockLawyers } from '../../services/mockLawyerService';
import { mockInterns } from '../../services/mockDataService';

interface InternDashboardProps {
    intern: Intern;
    userEmail?: string;
    onUpdateIntern?: (updated: Partial<Intern>) => void;
    onUpdateEmail?: (newEmail: string) => void;
    onLogout?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEMESTER_OPTIONS = [
    '1º ao 3º semestre', '4º ao 6º semestre', '7º ao 9º semestre', '9º ao 10º semestre',
];

const DEFAULT_SEMESTER_CURRICULUM: Record<string, string[]> = {
    '1º Semestre': ['Introdução ao Direito', 'Teoria do Estado', 'Sociologia Jurídica', 'Português Jurídico', 'Filosofia do Direito'],
    '2º Semestre': ['Direito Constitucional I', 'Direito Civil I (Parte Geral)', 'Direito Penal I', 'Direito Romano', 'Metodologia da Pesquisa'],
    '3º Semestre': ['Direito Constitucional II', 'Direito Civil II (Obrigações)', 'Direito Penal II', 'Direito Empresarial I', 'Direito Processual Geral'],
    '4º Semestre': ['Direito Civil III (Contratos)', 'Direito Administrativo I', 'Direito Penal III', 'Direito Empresarial II', 'Direito Processual Civil I'],
    '5º Semestre': ['Direito Civil IV (Responsabilidade Civil)', 'Direito Administrativo II', 'Direito Tributário I', 'Direito do Trabalho I', 'Direito Processual Civil II'],
    '6º Semestre': ['Direito Civil V (Família)', 'Direito Tributário II', 'Direito do Trabalho II', 'Direito Processual Penal I', 'Direito Internacional Público'],
    '7º Semestre': ['Direito Civil VI (Sucessões)', 'Direito Ambiental', 'Direito Processual do Trabalho', 'Direito Processual Penal II', 'Prática Jurídica Civil I'],
    '8º Semestre': ['Direito Eleitoral', 'Direito Digital e Proteção de Dados', 'Direito Previdenciário', 'Prática Jurídica Penal I', 'Prática Jurídica Trabalhista'],
    '9º Semestre': ['TCC I', 'Prática Jurídica Civil II', 'Prática Jurídica Penal II', 'Arbitragem e Mediação', 'Direito do Consumidor'],
    '10º Semestre': ['TCC II', 'Estágio Supervisionado', 'Ética Profissional OAB', 'Simulação de Júri', 'Tópicos Especiais em Direito'],
};

const DETAILED_SEMESTERS = Object.keys(DEFAULT_SEMESTER_CURRICULUM);

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_LABEL = 'PDF, JPG, JPEG ou PNG';

const COURSE_DOC_TYPES = [
    'Histórico Escolar', 'Declaração de Matrícula', 'Atestado de Frequência',
    'Comprovante de Estágio', 'Certificado de Curso', 'Ementa da Disciplina',
    'Grade Curricular', 'Relatório de Estágio', 'Trabalho Acadêmico', 'Outro',
];

const PERSONAL_DOC_TYPES = [
    'RG', 'CPF', 'CNH', 'Carteira de Trabalho', 'Passaporte',
    'Comprovante de Residência', 'Certidão de Nascimento', 'Diploma', 'Outro',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseDoc {
    name: string;
    fileType: 'PDF' | 'Imagem';
    size: string;
    date: string;
    docType: string;
    semester: string;
}

interface PersonalDoc {
    name: string;
    fileType: 'PDF' | 'Imagem';
    size: string;
    date: string;
    docType: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// ─── Course Doc Upload Modal ──────────────────────────────────────────────────

interface CourseDocModalProps {
    semester: string;
    onClose: () => void;
    onConfirm: (doc: CourseDoc) => void;
}

const CourseDocModal: React.FC<CourseDocModalProps> = ({ semester, onClose, onConfirm }) => {
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
            onConfirm({ ...pendingFile, date: new Date().toLocaleDateString('pt-BR'), docType: finalDocType.trim(), semester });
            onClose();
        }, 900);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">📎 Upload — {semester}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Identifique o documento antes de enviar</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">1. Tipo de Documento</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <option value="">Selecione o tipo...</option>
                            {COURSE_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        {docType === 'Outro' && (
                            <input value={customDocType} onChange={e => setCustomDocType(e.target.value)}
                                placeholder="Descreva o tipo de documento"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">2. Selecionar Arquivo</label>
                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
                        {!pendingFile ? (
                            <button onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-primary/30 rounded-xl py-6 text-center hover:bg-primary/5 hover:border-primary/50 transition-colors">
                                <p className="text-2xl mb-1">📁</p>
                                <p className="text-sm font-medium text-gray-600">Clique para selecionar</p>
                                <p className="text-xs text-gray-400 mt-0.5">{ALLOWED_LABEL}</p>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
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
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {sent ? '✅ Enviado!' : '📤 Confirmar Envio'}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                        <p className="text-xs text-gray-500 mt-0.5">Identifique o documento antes de enviar</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">1. Tipo de Documento</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <option value="">Selecione o tipo...</option>
                            {PERSONAL_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        {docType === 'Outro' && (
                            <input value={customDocType} onChange={e => setCustomDocType(e.target.value)}
                                placeholder="Descreva o tipo de documento"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">2. Selecionar Arquivo</label>
                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
                        {!pendingFile ? (
                            <button onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-primary/30 rounded-xl py-6 text-center hover:bg-primary/5 hover:border-primary/50 transition-colors">
                                <p className="text-2xl mb-1">📁</p>
                                <p className="text-sm font-medium text-gray-600">Clique para selecionar</p>
                                <p className="text-xs text-gray-400 mt-0.5">{ALLOWED_LABEL}</p>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                                <span className="text-xl shrink-0">{pendingFile.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{pendingFile.name}</p>
                                    <p className="text-xs text-gray-400">{pendingFile.fileType} · {pendingFile.size}</p>
                                </div>
                                <button onClick={() => setPendingFile(null)} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                            </div>
                        )}
                    </div>
                    {sent && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-800 text-sm font-semibold">✅ Documento pessoal enviado!</div>}
                </div>
                <div className="flex gap-3 px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Cancelar</button>
                    <button onClick={handleSend} disabled={!canSend || sent}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {sent ? '✅ Enviado!' : '📤 Confirmar Envio'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Semester Grade Card ──────────────────────────────────────────────────────

interface SemesterGradeCardProps {
    semester: string;
    subjects: string[];
    grades: Record<string, string>;
    editMode: boolean;
    courseDocs: CourseDoc[];
    onToggleEdit: () => void;
    onSubjectChange: (idx: number, value: string) => void;
    onAddSubject: () => void;
    onRemoveSubject: (idx: number) => void;
    onGradeChange: (subject: string, value: string) => void;
    onSave: () => void;
    onUploadClick: () => void;
    onRemoveDoc: (idx: number) => void;
}

const SemesterGradeCard: React.FC<SemesterGradeCardProps> = ({
    semester, subjects, grades, editMode, courseDocs,
    onToggleEdit, onSubjectChange, onAddSubject, onRemoveSubject,
    onGradeChange, onSave, onUploadClick, onRemoveDoc,
}) => {
    const [docsOpen, setDocsOpen] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
            {/* Semester header */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary/5 border-b border-primary/10">
                <h4 className="font-bold text-primary text-sm flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {semester.split('º')[0]}
                    </span>
                    {semester}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                    {editMode ? (
                        <>
                            <button onClick={onAddSubject} className="text-xs font-semibold text-primary border border-primary/30 bg-white px-2.5 py-1 rounded-lg hover:bg-primary/10 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                + Matéria
                            </button>
                            <button onClick={onSave} className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-lg hover:bg-primary/90">
                                💾 Salvar
                            </button>
                            <button onClick={onToggleEdit} className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200">
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button onClick={onToggleEdit} className="text-xs font-semibold text-gray-600 border border-gray-200 bg-white px-3 py-1 rounded-lg hover:border-primary/40 hover:text-primary dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            ✏️ Editar Grade
                        </button>
                    )}
                </div>
            </div>

            {/* Subject list */}
            <div className="px-5 py-4 space-y-2">
                {subjects.map((subj, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                        {editMode ? (
                            <>
                                <input
                                    value={subj}
                                    onChange={e => onSubjectChange(i, e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <label className="text-xs text-gray-500 whitespace-nowrap">Nota:</label>
                                    <input
                                        type="number" min="0" max="10" step="0.1"
                                        value={grades[subj] ?? ''}
                                        onChange={e => onGradeChange(subj, e.target.value)}
                                        placeholder="—"
                                        className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                                    />
                                </div>
                                <button onClick={() => onRemoveSubject(i)} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold p-1">✕</button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-sm text-gray-700">{subj}</span>
                                {grades[subj] ? (
                                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${Number(grades[subj]) >= 7 ? 'bg-green-100 text-green-700' : Number(grades[subj]) >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {Number(grades[subj]).toFixed(1)}
                                    </span>
                                ) : (
                                    <span className="shrink-0 text-xs text-gray-300 italic">sem nota</span>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {subjects.length === 0 && (
                    <p className="text-sm text-gray-400 italic py-2">Nenhuma matéria. Clique em "Editar Grade" para adicionar.</p>
                )}
            </div>

            {/* Documents accordion */}
            <div className="border-t border-gray-100 px-5 py-3">
                <div className="flex items-center justify-between">
                    <button onClick={() => setDocsOpen(v => !v)}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
                        <span>📎 Documentos do Semestre</span>
                        {courseDocs.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{courseDocs.length}</span>
                        )}
                        <span className="text-gray-400 ml-1">{docsOpen ? '▲' : '▼'}</span>
                    </button>
                    <button onClick={onUploadClick}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                        ➕ Upload
                    </button>
                </div>

                {docsOpen && (
                    <div className="mt-3 space-y-2">
                        {courseDocs.length === 0 ? (
                            <button onClick={onUploadClick}
                                className="w-full border-2 border-dashed border-primary/20 rounded-xl py-5 text-center hover:bg-primary/5 transition-colors">
                                <p className="text-2xl mb-1">📁</p>
                                <p className="text-xs font-medium text-gray-500">Clique para enviar documentos deste semestre</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{ALLOWED_LABEL}</p>
                            </button>
                        ) : (
                            courseDocs.map((d, i) => (
                                <div key={i} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-base shrink-0">{d.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{d.name}</p>
                                            <p className="text-[10px] text-gray-400">{d.fileType} · {d.size} · {d.date}</p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{d.docType}</span>
                                    <button onClick={() => onRemoveDoc(i)} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                                </div>
                            ))
                        )}
                        <p className="text-[11px] text-gray-400 pt-1">Formatos: {ALLOWED_LABEL}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const InternDashboard: React.FC<InternDashboardProps> = ({ intern, userEmail, onUpdateIntern, onUpdateEmail, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'perfil' | 'studies' | 'hours' | 'casos' | 'apis'>('overview');
    const [showLawyerPopup, setShowLawyerPopup] = useState(false);

    const mockInternData = mockInterns.find(i => i.name === intern.name);
    const supervisorLawyerId = intern.supervisorLawyerId !== undefined ? intern.supervisorLawyerId : mockInternData?.supervisorLawyerId;
    const supervisorLawyer = supervisorLawyerId ? mockLawyers.find(l => l.id === supervisorLawyerId) || null : null;

    // Profile
    const [profileData, setProfileData] = useState({
        name: intern.name || '', university: intern.university || '',
        semester: intern.semester || '1º ao 3º semestre',
        specialtyInterest: intern.specialtyInterest || '', phone: intern.contact?.phone || '',
        cep: intern.cep || '', street: intern.street || '', number: intern.number || '',
        complement: intern.complement || '', neighborhood: intern.neighborhood || '',
        city: intern.city || '', state: intern.state || '',
    });
    const [profileSaved, setProfileSaved] = useState(false);
    const [hasOab, setHasOab] = useState(false);
    const [oabNumber, setOabNumber] = useState('');
    const [oabUF, setOabUF] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPersonalDocModal, setShowPersonalDocModal] = useState(false);
    const [personalDocs, setPersonalDocs] = useState<PersonalDoc[]>([]);

    // Semester grade state
    const [customCurriculum, setCustomCurriculum] = useState<Record<string, string[]>>(
        () => Object.fromEntries(DETAILED_SEMESTERS.map(s => [s, [...DEFAULT_SEMESTER_CURRICULUM[s]]]))
    );
    const [editMode, setEditMode] = useState<Record<string, boolean>>({});
    const [tempSubjects, setTempSubjects] = useState<Record<string, string[]>>({});
    // grades[semester][subject] = grade string
    const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});
    // courseDocs[semester] = CourseDoc[]
    const [courseDocs, setCourseDocs] = useState<Record<string, CourseDoc[]>>({});
    const [uploadModalSemester, setUploadModalSemester] = useState<string | null>(null);
    const [selectedDetailSemester, setSelectedDetailSemester] = useState(DETAILED_SEMESTERS[0]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveProfile = () => {
        if (onUpdateIntern) {
            onUpdateIntern({
                name: profileData.name, university: profileData.university,
                semester: profileData.semester, specialtyInterest: profileData.specialtyInterest,
                contact: { ...intern.contact, phone: profileData.phone, email: intern.contact?.email || '' },
                cep: profileData.cep, street: profileData.street, number: profileData.number,
                complement: profileData.complement, neighborhood: profileData.neighborhood,
                city: profileData.city, state: profileData.state,
            });
        }
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
    };

    // Grade card handlers
    const toggleEditMode = (sem: string) => {
        if (editMode[sem]) {
            setEditMode(prev => ({ ...prev, [sem]: false }));
        } else {
            setTempSubjects(prev => ({ ...prev, [sem]: [...customCurriculum[sem]] }));
            setEditMode(prev => ({ ...prev, [sem]: true }));
        }
    };

    const handleSubjectChange = (sem: string, idx: number, value: string) => {
        setTempSubjects(prev => {
            const arr = [...(prev[sem] ?? customCurriculum[sem])];
            arr[idx] = value;
            return { ...prev, [sem]: arr };
        });
    };

    const handleAddSubject = (sem: string) => {
        setTempSubjects(prev => ({ ...prev, [sem]: [...(prev[sem] ?? customCurriculum[sem]), ''] }));
    };

    const handleRemoveSubject = (sem: string, idx: number) => {
        setTempSubjects(prev => {
            const arr = [...(prev[sem] ?? customCurriculum[sem])];
            arr.splice(idx, 1);
            return { ...prev, [sem]: arr };
        });
    };

    const handleSaveSemester = (sem: string) => {
        const subjects = (tempSubjects[sem] ?? customCurriculum[sem]).filter(s => s.trim());
        setCustomCurriculum(prev => ({ ...prev, [sem]: subjects }));
        setEditMode(prev => ({ ...prev, [sem]: false }));
    };

    const handleGradeChange = (sem: string, subject: string, value: string) => {
        setGrades(prev => ({ ...prev, [sem]: { ...(prev[sem] ?? {}), [subject]: value } }));
    };

    const handleCourseDocAdd = (sem: string, doc: CourseDoc) => {
        setCourseDocs(prev => ({ ...prev, [sem]: [...(prev[sem] ?? []), doc] }));
    };

    const handleCourseDocRemove = (sem: string, idx: number) => {
        setCourseDocs(prev => ({ ...prev, [sem]: (prev[sem] ?? []).filter((_, i) => i !== idx) }));
    };

    const tabBtn = (id: typeof activeTab, label: string) => (
        <button onClick={() => setActiveTab(id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {label}
        </button>
    );

    const totalCourseDocs = Object.values(courseDocs).flat().length;
    const totalGradedSubjects = Object.values(grades).flatMap(g => Object.values(g)).filter(v => v.trim()).length;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-neutral-light p-6 sm:p-8 rounded-xl shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mb-4 sm:mb-0">
                        {intern.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Bacharelando</h1>
                        <p className="text-gray-600">Bem-vindo(a), {intern.name}! ({intern.semester} — {intern.university})</p>
                        {supervisorLawyer && (
                            <button onClick={() => setShowLawyerPopup(true)}
                                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full hover:bg-indigo-100 transition-colors">
                                🎓 Estagiando em: {supervisorLawyer.name} — Ver informações
                            </button>
                        )}
                    </div>
                </div>

                {supervisorLawyer && (
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 mb-6 text-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <p className="font-bold text-sm">Você foi escolhido como estagiário!</p>
                                <p className="text-xs text-white/85">Dr(a). {supervisorLawyer.name} — OAB {supervisorLawyer.oab}</p>
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
                        {tabBtn('overview', 'Visão Geral')}
                        {tabBtn('perfil', '👤 Meu Perfil')}
                        {tabBtn('casos', '📋 Meus Casos')}
                        {tabBtn('studies', '📖 Mural de Estudos')}
                        {tabBtn('hours', 'Mentorias e Clínicas')}
                        {tabBtn('apis', '🔌 APIs')}
                        {onLogout && (
                            <button onClick={onLogout}
                                className="py-3 px-1 border-b-2 border-transparent font-medium text-sm text-red-500 hover:text-red-700 hover:border-red-300 transition-colors ml-auto">
                                🚪 Sair
                            </button>
                        )}
                    </nav>
                </div>

                {/* ─── OVERVIEW ─── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            <StatCard icon={<AcademicCapIcon className="w-6 h-6 text-primary" />} label="Horas Complementares" value={`${intern.hoursCompleted} / 200h`} />
                            <StatCard icon={<ClipboardListIcon className="w-6 h-6 text-primary" />} label="Casos Estudados" value={intern.casesStudied?.length || 0} />
                            <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Docs do Curso" value={totalCourseDocs} />
                            <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} label="Notas Lançadas" value={totalGradedSubjects} />
                        </div>

                        {/* Progress bar */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Progresso da Grade Educacional</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${Math.min((intern.hoursCompleted / 200) * 100, 100)}%` }} />
                            </div>
                            <p className="text-sm text-gray-500">
                                {intern.hoursCompleted} horas concluídas de 200h obrigatórias ({Math.round((intern.hoursCompleted / 200) * 100)}%)
                            </p>
                        </div>

                        {/* Quick semester overview (read-only with grades) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">📚 Grade Curricular por Semestre</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg hidden sm:block">Edite em cada semestre ↓</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {DETAILED_SEMESTERS.map(sem => (
                                    <button key={sem} onClick={() => setSelectedDetailSemester(sem)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedDetailSemester === sem ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10'}`}>
                                        {sem}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-primary text-sm">{selectedDetailSemester}</h4>
                                    {courseDocs[selectedDetailSemester]?.length > 0 && (
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            📎 {courseDocs[selectedDetailSemester].length} doc(s)
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-2">
                                    {(customCurriculum[selectedDetailSemester] || []).map((disc, i) => (
                                        <li key={i} className="flex items-center justify-between gap-2 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 flex items-center justify-center bg-primary/20 text-primary rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                                                {disc}
                                            </div>
                                            {grades[selectedDetailSemester]?.[disc] && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${Number(grades[selectedDetailSemester][disc]) >= 7 ? 'bg-green-100 text-green-700' : Number(grades[selectedDetailSemester][disc]) >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                    {Number(grades[selectedDetailSemester][disc]).toFixed(1)}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Editable semester cards */}
                        <div>
                            <h3 className="text-base font-bold text-gray-800 mb-1">✏️ Editar Grade e Notas por Semestre</h3>
                            <p className="text-xs text-gray-500 mb-4">Personalize as disciplinas de acordo com sua universidade e registre suas notas.</p>
                            <div className="space-y-4">
                                {DETAILED_SEMESTERS.map(sem => (
                                    <SemesterGradeCard
                                        key={sem}
                                        semester={sem}
                                        subjects={editMode[sem] ? (tempSubjects[sem] ?? customCurriculum[sem]) : customCurriculum[sem]}
                                        grades={grades[sem] ?? {}}
                                        editMode={!!editMode[sem]}
                                        courseDocs={courseDocs[sem] ?? []}
                                        onToggleEdit={() => toggleEditMode(sem)}
                                        onSubjectChange={(idx, val) => handleSubjectChange(sem, idx, val)}
                                        onAddSubject={() => handleAddSubject(sem)}
                                        onRemoveSubject={idx => handleRemoveSubject(sem, idx)}
                                        onGradeChange={(subj, val) => handleGradeChange(sem, subj, val)}
                                        onSave={() => handleSaveSemester(sem)}
                                        onUploadClick={() => setUploadModalSemester(sem)}
                                        onRemoveDoc={idx => handleCourseDocRemove(sem, idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PERFIL ─── */}
                {activeTab === 'perfil' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <h3 className="text-base font-bold text-gray-800">Dados Pessoais e Acadêmicos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label><input name="name" value={profileData.name} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                <div><label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label><input name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                <div><label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Universidade</label><input name="university" value={profileData.university} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Semestre Atual</label>
                                    <select name="semester" value={profileData.semester} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        {SEMESTER_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Área de Interesse no Direito</label>
                                    <select name="specialtyInterest" value={profileData.specialtyInterest} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        <option value="">Selecione uma área...</option>
                                        {AREAS_OF_LAW.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                                {/* OAB */}
                                <div className="md:col-span-2">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-semibold text-gray-700">⚖️ Possui OAB?</p>
                                            {['Sim', 'Não'].map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="hasOab" checked={opt === 'Sim' ? hasOab : !hasOab} onChange={() => setHasOab(opt === 'Sim')} className="accent-primary" />
                                                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {hasOab && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                                                <div><label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Número OAB</label><input value={oabNumber} onChange={e => setOabNumber(e.target.value)} placeholder="Ex: 123456" className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">UF da Ordem</label>
                                                    <select value={oabUF} onChange={e => setOabUF(e.target.value)} className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                                        <option value="">Selecione...</option>
                                                        {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="pt-4 border-t space-y-3">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Endereço Residencial</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">CEP</label><input name="cep" value={profileData.cep} onChange={handleProfileChange} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label><input name="street" value={profileData.street} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Número</label><input name="number" value={profileData.number} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label><input name="complement" value={profileData.complement} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label><input name="neighborhood" value={profileData.neighborhood} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label><input name="city" value={profileData.city} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" /></div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                        <select name="state" value={profileData.state} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                            <option value="">Selecione...</option>
                                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={handleSaveProfile} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow">
                                    {profileSaved ? '✓ Salvo!' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>

                        {/* Documentos Pessoais */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800">📎 Documentos Pessoais</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">RG, CPF, CNH e outros documentos de identificação</p>
                                </div>
                                <button onClick={() => setShowPersonalDocModal(true)}
                                    className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-1.5">
                                    ➕ Adicionar
                                </button>
                            </div>
                            <p className="text-xs text-gray-400">Formatos aceitos: {ALLOWED_LABEL} · Identifique cada documento ao enviar.</p>
                            {personalDocs.length === 0 ? (
                                <button onClick={() => setShowPersonalDocModal(true)}
                                    className="w-full border-2 border-dashed border-primary/30 rounded-xl py-7 text-center hover:bg-primary/5 hover:border-primary/50 transition-colors">
                                    <p className="text-3xl mb-1">📁</p>
                                    <p className="text-sm font-medium text-gray-500">Clique para adicionar documento pessoal</p>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    {personalDocs.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-xl shrink-0">{d.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                                                    <p className="text-[10px] text-gray-400">{d.fileType} · {d.size} · {d.date}</p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{d.docType}</span>
                                            <button onClick={() => setPersonalDocs(prev => prev.filter((_, idx) => idx !== i))} className="shrink-0 text-red-400 hover:text-red-600 text-xs font-bold p-1">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setShowPersonalDocModal(true)} className="text-xs text-primary hover:underline font-semibold py-1">+ Adicionar mais documentos</button>
                                </div>
                            )}
                        </div>

                        {/* Segurança */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                            <h3 className="text-base font-bold text-gray-800">🔐 Segurança de Acesso</h3>
                            <p className="text-sm text-gray-500">Mantenha seus dados de acesso seguros e atualizados.</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">🔑 Alterar Senha</button>
                                <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">📧 Alterar E-mail</button>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                E-mail atual de acesso: <strong>{userEmail || intern.contact?.email || 'Não definido'}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── MURAL DE ESTUDOS ─── */}
                {activeTab === 'studies' && (
                    <div className="space-y-4 animate-fade-in">
                        {[
                            { title: 'Simulação: Direito Trabalhista #452', desc: 'Análise de petição inicial de acúmulo de função. Valendo 5 horas extracurriculares.' },
                            { title: 'Simulação: Contratos Civis #108', desc: 'Revisão de cláusulas abusivas em contrato de adesão. Valendo 3 horas extracurriculares.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                </div>
                                <button className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition text-sm whitespace-nowrap">Acessar Estudo</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── MENTORIAS ─── */}
                {activeTab === 'hours' && (
                    <div className="text-center bg-gray-50 p-10 rounded-lg border border-dashed border-gray-300 animate-fade-in dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                        <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhuma mentoria agendada.</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">Explore advogados parceiros e envie solicitações de acompanhamento prático e mentoria.</p>
                    </div>
                )}

                {/* ─── MEUS CASOS ─── */}
                {activeTab === 'casos' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">📋 Meus Casos</h3>
                            {supervisorLawyer && (
                                <button onClick={() => setShowLawyerPopup(true)} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                                    👤 Ver Advogado Supervisor
                                </button>
                            )}
                        </div>
                        {supervisorLawyer ? (
                            <>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                                    <img src={supervisorLawyer.photoUrl} alt={supervisorLawyer.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200" />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Supervisionado por: Dr(a). {supervisorLawyer.name}</p>
                                        <p className="text-xs text-indigo-600">OAB {supervisorLawyer.oab} — {supervisorLawyer.specialties.slice(0, 2).join(', ')}</p>
                                    </div>
                                </div>
                                {intern.casesStudied && intern.casesStudied.length > 0 ? (
                                    <div className="space-y-3">
                                        {intern.casesStudied.map(c => (
                                            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{c.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">Cliente: {c.clientName} — Advogado: {c.lawyerName}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'Ativo' ? 'bg-green-50 text-green-700 border border-green-200' : c.status === 'Concluído' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                        <p className="text-3xl mb-2">📂</p>
                                        <p className="text-sm font-semibold text-gray-700">Nenhum caso atribuído ainda</p>
                                        <p className="text-xs text-gray-500 mt-1">Quando seu advogado supervisor atribuir casos, eles aparecerão aqui.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                                <p className="text-3xl mb-2">⏳</p>
                                <h4 className="font-bold text-gray-700">Aguardando vínculo com advogado</h4>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Seus casos de estágio aparecerão aqui quando um advogado vinculá-lo(a) ao seu escritório.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'apis' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">🔌 APIs Habilitadas</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Veja quais integrações estão ativas na plataforma para seu perfil.</p>
                        </div>
                        <ApiStatusPanel />
                    </div>
                )}
            </div>

            {/* ─── Modals ─── */}
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={(pwd, newPwd) => { if (newPwd.length < 4) return false; alert("Senha alterada com sucesso!"); return true; }} />}
            {showEmailModal && <ChangeEmailModal currentEmail={userEmail || intern.contact?.email || ''} onClose={() => setShowEmailModal(false)} onSave={(pwd, email) => { if (pwd.length < 4) return false; if (onUpdateEmail) onUpdateEmail(email); return true; }} />}
            {showLawyerPopup && supervisorLawyer && (
              <LawyerInfoPopup
                lawyer={supervisorLawyer}
                message="Você foi escolhido como Bacharelando deste advogado!"
                onClose={() => setShowLawyerPopup(false)}
                onAccept={() => {
                  if (onUpdateIntern) onUpdateIntern({ supervisorLawyerId });
                  setShowLawyerPopup(false);
                  alert("Você aceitou a supervisão do advogado Dr(a). " + supervisorLawyer.name + "!");
                }}
                onReject={() => {
                  if (onUpdateIntern) onUpdateIntern({ supervisorLawyerId: undefined });
                  setShowLawyerPopup(false);
                  alert("Você recusou a supervisão.");
                }}
              />
            )}
            {showPersonalDocModal && <PersonalDocModal onClose={() => setShowPersonalDocModal(false)} onConfirm={doc => setPersonalDocs(prev => [...prev, doc])} />}
            {uploadModalSemester && (
                <CourseDocModal
                    semester={uploadModalSemester}
                    onClose={() => setUploadModalSemester(null)}
                    onConfirm={doc => { handleCourseDocAdd(uploadModalSemester, doc); }}
                />
            )}
        </div>
    );
};
