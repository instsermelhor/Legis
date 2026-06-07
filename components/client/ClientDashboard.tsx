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
}

const lawyer = mockLawyers[0];

const initialMessages: Message[] = [
    { id: 1, sender: 'lawyer', text: 'Olá! Recebi os detalhes do seu caso. Para começarmos, poderia me enviar a documentação que mencionei?', timestamp: '10:30', avatarUrl: lawyer.photoUrl },
    { id: 2, sender: 'client', text: 'Bom dia, Dr. Carlos. Sim, já estou com os documentos. Enviando em anexo.', timestamp: '10:32', avatarUrl: 'https://i.pravatar.cc/40?u=client' },
    { id: 3, sender: 'lawyer', text: 'Perfeito, recebi aqui. Vou analisar e te retorno em breve com os próximos passos.', timestamp: '10:35', avatarUrl: lawyer.photoUrl },
];

interface ReviewModalProps {
    caseToReview: Case;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Avaliar Serviço</h2>
                                <p className="text-sm text-gray-500 mt-1">Advogado(a): {caseToReview.lawyerName}</p>
                            </div>
                            <button type="button" onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors"><XIcon className="w-6 h-6 text-gray-600" /></button>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Sua nota para o serviço prestado</p>
                            <div className="flex justify-center"><StarRating rating={rating} onRatingChange={setRating} /></div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comentário (opcional)</label>
                            <textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Descreva sua experiência..." />
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                        <button type="submit" disabled={rating === 0 || isLoading} className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark disabled:bg-primary/50">
                            {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Action card for the lawyer communication panel
const ActionCard: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    onClick: () => void;
    badge?: string;
}> = ({ icon, title, subtitle, color, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`relative w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100 ${color}`}
    >
        <span className="text-3xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">{title}</p>
            <p className="text-xs opacity-75 mt-0.5 truncate">{subtitle}</p>
        </div>
        {badge && (
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/40">{badge}</span>
        )}
        <svg className="w-4 h-4 opacity-50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

interface UploadedDoc { name: string; type: string; size: string; date: string; }

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onUpdateLawyerReview }) => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'advogado' | 'casos'>('advogado');
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [caseToReview, setCaseToReview] = useState<Case | null>(null);
    const [filterProcesso, setFilterProcesso] = useState('');
    const [filterOABCliente, setFilterOABCliente] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [showNotifMsg, setShowNotifMsg] = useState(false);

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user.name || '',
        cpf: '',
        rg: '',
        dataNasc: '',
        estadoCivil: '',
        phone: user.phone || '',
        email: user.email || '',
        cep: '',
        street: user.address || '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const [profileSaved, setProfileSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const activeCase = user.caseHistory?.find(c => c.status === 'Ativo');

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

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const message: Message = {
            id: messages.length + 1, sender: 'client', text: newMessage,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            avatarUrl: 'https://i.pravatar.cc/40?u=client',
        };
        setMessages([...messages, message]);
        setNewMessage('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        Array.from(files as FileList).forEach((f: File) => {
            if (!allowed.includes(f.type)) { alert(`Arquivo ${f.name} não permitido. Use PDF, JPG ou PNG.`); return; }
            const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
            setUploadedDocs(prev => [...prev, {
                name: f.name,
                type: f.type.includes('pdf') ? 'PDF' : 'Imagem',
                size: `${sizeMB} MB`,
                date: new Date().toLocaleDateString('pt-BR'),
            }]);
        });
        e.target.value = '';
    };

    const tabBtn = (id: typeof activeTab, label: string, emoji: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
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

                {/* Tab Nav */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex overflow-x-auto">
                        {tabBtn('advogado', 'Meu Advogado', '⚖️')}
                        {tabBtn('casos', 'Meus Casos', '📋')}
                        {tabBtn('perfil', 'Meu Perfil', '👤')}
                    </nav>
                </div>

                {/* ─── ABA MEU ADVOGADO ─── */}
                {activeTab === 'advogado' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Lawyer card */}
                        {activeCase && (
                            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg">
                                <img src={lawyer.photoUrl} alt={lawyer.name} className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shrink-0" />
                                <div className="text-center sm:text-left flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Seu Advogado</p>
                                    <h2 className="text-xl font-bold mt-1">{lawyer.name}</h2>
                                    <p className="text-sm text-white/80 mt-0.5">OAB {lawyer.oab} · {lawyer.location.city}/{lawyer.location.state}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                        {lawyer.specialties.slice(0, 2).map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex">
                                        {[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(lawyer.rating) ? 'text-yellow-300' : 'text-white/30'}>★</span>)}
                                    </div>
                                    <span className="text-xs text-white/70">{lawyer.reviewCount} avaliações</span>
                                </div>
                            </div>
                        )}

                        {/* Quick action cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Video Conference */}
                            <ActionCard
                                icon="📹"
                                title="Entrar na Videochamada"
                                subtitle={upcomingAppointment
                                    ? `${new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' })} às ${upcomingAppointment.time}`
                                    : 'Nenhuma consulta agendada'}
                                color="border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                                onClick={() => upcomingAppointment
                                    ? alert(`🎥 Abrindo videochamada:\n${upcomingAppointment.consultationLink || 'https://meet.legisconnect.com.br/consulta'}`)
                                    : alert('Nenhuma consulta agendada.')}
                                badge={upcomingAppointment ? 'Confirmada' : undefined}
                            />

                            {/* Chat */}
                            <ActionCard
                                icon="💬"
                                title="Mensagem para o Advogado"
                                subtitle={activeCase ? `Dr(a). ${activeCase.lawyerName}` : 'Sem caso ativo'}
                                color="border-primary/30 bg-primary/5 text-primary-dark hover:bg-primary/10"
                                onClick={() => setShowChat(v => !v)}
                            />

                            {/* WhatsApp */}
                            <ActionCard
                                icon="💚"
                                title="WhatsApp do Advogado"
                                subtitle={lawyer.contact.phone || '(11) 99999-0000'}
                                color="border-green-200 bg-green-50 text-green-900 hover:bg-green-100"
                                onClick={() => {
                                    const phone = lawyer.contact.phone?.replace(/\D/g, '') || '5511999990000';
                                    const msg = encodeURIComponent(`Olá, Dr(a). ${lawyer.name}! Sou cliente na plataforma Legis Connect.`);
                                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                }}
                            />

                            {/* Agenda / Notification */}
                            <ActionCard
                                icon="📅"
                                title="Próxima Consulta"
                                subtitle={upcomingAppointment
                                    ? `${new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })} · ${upcomingAppointment.time}`
                                    : 'Nenhuma consulta agendada'}
                                color="border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                onClick={() => {
                                    if (upcomingAppointment) {
                                        setShowNotifMsg(true);
                                        setTimeout(() => setShowNotifMsg(false), 4000);
                                    } else {
                                        alert('Nenhuma consulta agendada no momento.');
                                    }
                                }}
                                badge={upcomingAppointment ? '🔔' : undefined}
                            />
                        </div>

                        {/* Notification confirmation */}
                        {showNotifMsg && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-800 text-sm font-semibold flex items-center gap-3">
                                <span className="text-xl">🔔</span>
                                Notificação ativada! Você receberá um lembrete da sua consulta.
                            </div>
                        )}

                        {/* Upcoming appointment detail */}
                        {upcomingAppointment && activeCase && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>📋</span> Detalhes da Próxima Consulta
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Advogado</p>
                                        <p className="font-bold text-gray-800 mt-1">{activeCase.lawyerName}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Data</p>
                                        <p className="font-bold text-gray-800 mt-1">{new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Horário</p>
                                        <p className="font-bold text-gray-800 mt-1">{upcomingAppointment.time}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => alert(`🎥 Abrindo videochamada: ${upcomingAppointment.consultationLink || 'https://meet.legisconnect.com.br/consulta'}`)}
                                    className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-md"
                                >
                                    <VideoCameraIcon className="w-5 h-5" />
                                    Entrar na Videochamada
                                </button>
                            </div>
                        )}

                        {/* Chat section */}
                        {showChat && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[60vh]">
                                <div className="flex items-center justify-between px-5 py-4 border-b">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <img src={lawyer.photoUrl} className="w-8 h-8 rounded-full" alt="" />
                                        Chat com {lawyer.name}
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
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Digite sua mensagem..."
                                            rows={2}
                                            className="flex-grow p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-transparent resize-none text-sm"
                                        />
                                        <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:bg-primary/40">
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* No active case */}
                        {!activeCase && (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
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
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Meus Casos</h2>
                                {/* Filters */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Número do Processo</label>
                                            <input type="text" value={filterProcesso} onChange={e => setFilterProcesso(e.target.value)} placeholder="Ex: case001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Advogado</label>
                                            <input type="text" value={filterOABCliente} onChange={e => setFilterOABCliente(e.target.value)} placeholder="Ex: Dr. Carlos" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button onClick={() => { setFilterProcesso(''); setFilterOABCliente(''); }} className="text-xs text-primary hover:underline">Limpar Filtros</button>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {filteredClientCases.map(c => (
                                        <div key={c.id} className="border-t pt-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{c.title}</h3>
                                                    <p className="text-sm text-gray-600">Advogado: <span className="font-semibold text-primary">{c.lawyerName}</span></p>
                                                </div>
                                                <span className={`${c.status === 'Ativo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs font-medium px-3 py-1 rounded-full`}>{c.status}</span>
                                            </div>
                                            <div className="mb-4">
                                                <h4 className="text-md font-semibold text-gray-700 mb-3">Andamento</h4>
                                                <CaseProgressTracker stages={c.stages} />
                                            </div>
                                            {c.status === 'Concluído' && (
                                                <div className="mt-4 text-right">
                                                    {c.reviewSubmitted ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg">
                                                            <BadgeCheckIcon className="w-5 h-5 text-green-600" /> Avaliação Enviada
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { setCaseToReview(c); setIsReviewModalOpen(true); }} className="px-4 py-2 bg-secondary text-gray-900 text-sm font-semibold rounded-lg hover:brightness-110">Avaliar Serviço</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {filteredClientCases.length === 0 && (
                                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Nenhum caso encontrado.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
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
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                            <h3 className="text-base font-bold text-gray-800 border-b pb-2">📋 Dados Cadastrais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">CPF</label>
                                    <input value={profileForm.cpf} onChange={e => setProfileForm(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RG</label>
                                    <input value={profileForm.rg} onChange={e => setProfileForm(p => ({ ...p, rg: e.target.value }))} placeholder="00.000.000-0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Data de Nascimento</label>
                                    <input type="date" value={profileForm.dataNasc} onChange={e => setProfileForm(p => ({ ...p, dataNasc: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado Civil</label>
                                    <select value={profileForm.estadoCivil} onChange={e => setProfileForm(p => ({ ...p, estadoCivil: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                        <option value="">Selecione...</option>
                                        {['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map(v => <option key={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label>
                                    <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="pt-4 border-t space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">🏠 Endereço</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                                        <input value={profileForm.cep} onChange={e => setProfileForm(p => ({ ...p, cep: e.target.value }))} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Logradouro</label>
                                        <input value={profileForm.street} onChange={e => setProfileForm(p => ({ ...p, street: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                                        <input value={profileForm.number} onChange={e => setProfileForm(p => ({ ...p, number: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
                                        <input value={profileForm.complement} onChange={e => setProfileForm(p => ({ ...p, complement: e.target.value }))} placeholder="Apto, Bloco..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                                        <input value={profileForm.neighborhood} onChange={e => setProfileForm(p => ({ ...p, neighborhood: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                                        <input value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Estado (UF)</label>
                                        <select value={profileForm.state} onChange={e => setProfileForm(p => ({ ...p, state: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                                            <option value="">Selecione...</option>
                                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500); }}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow"
                            >
                                {profileSaved ? '✓ Salvo!' : '💾 Salvar Alterações'}
                            </button>
                        </div>

                        {/* Upload de Documentos */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-gray-800">📎 Documentos Pessoais</h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                                >
                                    ➕ Adicionar Documento
                                </button>
                                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleFileUpload} />
                            </div>
                            <p className="text-xs text-gray-400">Formatos aceitos: PDF, JPG, JPEG, PNG</p>
                            {uploadedDocs.length === 0 ? (
                                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                    <p className="text-3xl mb-2">📁</p>
                                    <p className="text-sm">Clique para enviar documentos</p>
                                    <p className="text-xs mt-1">PDF, JPG, JPEG ou PNG</p>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    {uploadedDocs.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{d.type === 'PDF' ? '📄' : '🖼️'}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{d.name}</p>
                                                    <p className="text-xs text-gray-400">{d.type} · {d.size} · {d.date}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setUploadedDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs font-medium ml-4">✕ Remover</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Segurança */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
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

            {isReviewModalOpen && caseToReview && (
                <ReviewModal caseToReview={caseToReview} onClose={() => setIsReviewModalOpen(false)} onSubmit={(rating, comment) => { if (caseToReview) onUpdateLawyerReview(caseToReview.lawyerId, caseToReview.id, rating, comment); }} />
            )}
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={(cur) => cur.length >= 4} />}
            {showEmailModal && (
                <ChangeEmailModal currentEmail={user.email} onClose={() => setShowEmailModal(false)} onSave={(pwd, _newEmail) => pwd.length >= 4} />
            )}
        </>
    );
};