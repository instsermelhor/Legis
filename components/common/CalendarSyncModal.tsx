import React, { useState } from 'react';
import type { Lawyer } from '../../types';
import { XIcon } from './IconComponents';

interface CalendarSyncModalProps {
    lawyer: Lawyer;
    onClose: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ lawyer, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copiar Link');
    const syncUrl = lawyer.calendarSyncUrl || `https://api.legisconnect.com/calendar/v1/subscribe?token=${lawyer.id}-fallback-secret`;

    const handleCopy = () => {
        navigator.clipboard.writeText(syncUrl);
        setCopyButtonText('Copiado!');
        setTimeout(() => setCopyButtonText('Copiar Link'), 2000);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                     <div className="flex items-start justify-between">
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">Sincronizar com seu Calendário</h2>
                             <p className="text-sm text-gray-500 mt-1">Veja seus agendamentos do Legis Connect em seu calendário pessoal.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <XIcon className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">Seu link de assinatura de calendário:</p>
                        <div className="flex space-x-2">
                             <input 
                                type="text"
                                readOnly
                                value={syncUrl}
                                className="flex-grow bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none"
                             />
                             <button
                                onClick={handleCopy}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-32 transition-all duration-150"
                             >
                                {copyButtonText}
                             </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Este link é privado. Não o compartilhe com outras pessoas.</p>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Como usar:</h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <p className="font-semibold text-gray-800">No Google Calendar:</p>
                                <ol className="list-decimal list-inside space-y-1 pl-2">
                                    <li>Vá em "Outras agendas" e clique no ícone "+".</li>
                                    <li>Selecione "Do URL".</li>
                                    <li>Cole o link acima e clique em "Adicionar agenda".</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">No Outlook ou Apple Calendar:</p>
                                <ol className="list-decimal list-inside space-y-1 pl-2">
                                    <li>Procure a opção "Adicionar Assinatura de Calendário" ou "Nova Assinatura".</li>
                                    <li>Cole o link acima quando solicitado.</li>
                                    <li>Siga as instruções para concluir.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Concluído
                    </button>
                </div>
            </div>
        </div>
    );
};
