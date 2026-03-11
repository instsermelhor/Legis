import React from 'react';
import { XIcon } from './IconComponents';

interface ModalProps {
    onClose: () => void;
}

export const EticaOABModal: React.FC<ModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] relative animate-slide-up flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Código de Ética da OAB</h2>
                    <button
                        onClick={onClose}
                        className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                     <h3 className="font-bold mb-2">Código de Ética e Disciplina da OAB</h3>
                    <p className="mb-4 text-gray-600">
                        O advogado é indispensável à administração da justiça, sendo defensor do estado democrático de direito, da cidadania, da moralidade pública, da Justiça e da paz social, subordinando a atividade do seu Ministério Privado à elevada função pública que exerce.
                    </p>
                    <p className="mb-4 text-gray-600">
                        Constitui dever do advogado pautar sua conduta com os princípios de: (I) independência, (II) decoro, (III) lealdade, (IV) dignidade, (V) boa-fé, (VI) respeito ao próximo e (VII) valorização de sua profissão.
                    </p>
                    <p className="mb-4 text-gray-600">
                        Este é um resumo ilustrativo para constar no aplicativo. Para o Código de Ética e Disciplina completo, consulte os canais oficiais da Ordem dos Advogados do Brasil (OAB).
                    </p>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
