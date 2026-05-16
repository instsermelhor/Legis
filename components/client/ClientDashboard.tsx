import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Message, Case } from '../../types';
import { mockLawyers } from '../../services/mockLawyerService';
import { PaperAirplaneIcon, BriefcaseIcon, VideoCameraIcon, XIcon, BadgeCheckIcon } from '../common/IconComponents';
import { CaseProgressTracker } from '../common/CaseProgressTracker';
import { ClientProfileCard } from './ClientProfileCard';
import { StarRating } from '../common/StarRating';

interface ClientDashboardProps {
  user: User;
  onUpdateLawyerReview: (lawyerId: number, caseId: string, rating: number, comment: string) => void;
}

const lawyer = mockLawyers[0]; // Using Dr. Carlos Andrade for this demo

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
        // Simulate API call
        setTimeout(() => {
            onSubmit(rating, comment);
            setIsLoading(false);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Avaliar Serviço</h2>
                                <p className="text-sm text-gray-500 mt-1">Advogado(a): {caseToReview.lawyerName}</p>
                            </div>
                            <button type="button" onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Close">
                                <XIcon className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Sua nota para o serviço prestado</p>
                            <div className="flex justify-center">
                                <StarRating rating={rating} onRatingChange={setRating} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comentário (opcional)</label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Descreva sua experiência..."
                            />
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


export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onUpdateLawyerReview }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [caseToReview, setCaseToReview] = useState<Case | null>(null);
    const [filterProcesso, setFilterProcesso] = useState('');
    const [filterOABCliente, setFilterOABCliente] = useState('');

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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        return user.appointments
            .filter(apt => apt.status === 'Confirmado' && new Date(apt.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [user.appointments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const message: Message = {
            id: messages.length + 1,
            sender: 'client',
            text: newMessage,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}),
            avatarUrl: 'https://i.pravatar.cc/40?u=client',
        };
        setMessages([...messages, message]);
        setNewMessage('');
    };
    
    const handleOpenReviewModal = (c: Case) => {
        setCaseToReview(c);
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = (rating: number, comment: string) => {
        if (caseToReview) {
            onUpdateLawyerReview(caseToReview.lawyerId, caseToReview.id, rating, comment);
        }
    };
    
  return (
    <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <ClientProfileCard user={user} />

                    {upcomingAppointment && activeCase && (
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Próxima Consulta</h2>
                            <div className="space-y-2 text-sm text-gray-700 border-b pb-3 mb-3">
                                <p><strong>Advogado(a):</strong> {activeCase.lawyerName}</p>
                                <p><strong>Data:</strong> {new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                <p><strong>Horário:</strong> {upcomingAppointment.time}</p>
                            </div>
                            <button 
                                onClick={() => alert(`Abrindo link da videochamada: ${upcomingAppointment.consultationLink}`)}
                                className="w-full mt-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                                <VideoCameraIcon className="w-5 h-5" />
                                Entrar na Videochamada
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {user.caseHistory && user.caseHistory.length > 0 ? (
                        <>
                            {activeCase && (
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col h-[85vh]">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">Mensagens com {activeCase.lawyerName}</h2>
                                    <div className="flex-grow space-y-4 overflow-y-auto pr-4">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'client' ? 'justify-end' : ''}`}>
                                               {msg.sender === 'lawyer' && <img src={msg.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />}
                                               <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'client' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-blue-200' : 'text-gray-500'} text-right`}>{msg.timestamp}</p>
                                               </div>
                                               {msg.sender === 'client' && <img src={msg.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Digite sua mensagem..."
                                                rows={2}
                                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent resize-none"
                                            />
                                            <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:bg-primary/50">
                                                <PaperAirplaneIcon className="w-6 h-6" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Casos</h2>
                                {/* Filter Panel */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros de Busca</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Número do Processo</label>
                                            <input
                                                type="text"
                                                value={filterProcesso}
                                                onChange={e => setFilterProcesso(e.target.value)}
                                                placeholder="Ex: case001"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Nome / OAB do Advogado</label>
                                            <input
                                                type="text"
                                                value={filterOABCliente}
                                                onChange={e => setFilterOABCliente(e.target.value)}
                                                placeholder="Ex: Dr. Carlos"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => { setFilterProcesso(''); setFilterOABCliente(''); }}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Limpar Filtros
                                        </button>
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
                                                            <BadgeCheckIcon className="w-5 h-5 text-green-600"/>
                                                            Avaliação Enviada
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleOpenReviewModal(c)} className="px-4 py-2 bg-secondary text-gray-900 text-sm font-semibold rounded-lg hover:brightness-110 transition-all">
                                                            Avaliar Serviço
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {filteredClientCases.length === 0 && (
                                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Nenhum caso encontrado com os filtros aplicados.</p>
                                    )}
                                </div>

                            </div>
                        </>
                    ) : (
                         <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center flex flex-col justify-center items-center min-h-[40vh]">
                            <BriefcaseIcon className="w-16 h-16 text-primary mb-4" />
                            <h1 className="text-2xl font-bold text-gray-800">Bem-vindo(a) à sua área, {user.name}!</h1>
                            <p className="text-gray-600 mt-2 max-w-md">Você ainda não tem nenhum caso ativo na plataforma. Comece agora a procurar o advogado certo para você.</p>
                            <button 
                                onClick={() => window.location.reload()} // In a real app, this would navigate to the search page
                                className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Encontrar um Advogado
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {isReviewModalOpen && caseToReview && (
            <ReviewModal 
                caseToReview={caseToReview}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
            />
        )}
    </>
  );
};