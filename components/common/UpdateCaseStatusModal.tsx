import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for local module.
import type { Case } from '../../types';
import { XIcon } from './IconComponents';

interface UpdateCaseStatusModalProps {
    caseToUpdate: Case;
    onClose: () => void;
    onUpdateStatus: (caseId: string, newCurrentStageName: string) => void;
}

export const UpdateCaseStatusModal: React.FC<UpdateCaseStatusModalProps> = ({ caseToUpdate, onClose, onUpdateStatus }) => {
    const currentStage = useMemo(
        () => caseToUpdate.stages.find(s => s.status === 'current'),
        [caseToUpdate.stages]
    );

    const [selectedStageName, setSelectedStageName] = useState(currentStage?.name || '');

    const handleSave = () => {
        if (selectedStageName) {
            onUpdateStatus(caseToUpdate.id, selectedStageName);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                     <div className="flex items-start justify-between">
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">Atualizar Andamento do Caso</h2>
                             <p className="text-sm text-gray-500 mt-1">{caseToUpdate.title} - {caseToUpdate.clientName}</p>
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
                        <p className="text-sm font-medium text-gray-700 mb-3">Selecione a nova etapa atual:</p>
                        <div className="space-y-2">
                            {caseToUpdate.stages.map(stage => (
                                <label 
                                    key={stage.name} 
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedStageName === stage.name ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="case-stage"
                                        value={stage.name}
                                        checked={selectedStageName === stage.name}
                                        onChange={() => setSelectedStageName(stage.name)}
                                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-800">{stage.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end items-center space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedStageName || selectedStageName === currentStage?.name}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};
