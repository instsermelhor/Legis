import React from 'react';
import { XIcon } from './IconComponents';

interface ModalProps {
    onClose: () => void;
}

export const TermsOfServiceModal: React.FC<ModalProps> = ({ onClose }) => {
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
                    <h2 className="text-xl font-bold text-gray-800">Termos de Serviço</h2>
                    <button
                        onClick={onClose}
                        className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <h3 className="font-bold mb-2">1. Aceitação dos Termos</h3>
                    <p className="mb-4 text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.</p>
                    <h3 className="font-bold mb-2">2. Descrição do Serviço</h3>
                    <p className="mb-4 text-gray-600">Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
                    <h3 className="font-bold mb-2">3. Responsabilidades do Usuário</h3>
                    <p className="mb-4 text-gray-600">Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.</p>
                    <h3 className="font-bold mb-2">4. Limitação de Responsabilidade</h3>
                    <p className="text-gray-600">Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit.</p>
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
