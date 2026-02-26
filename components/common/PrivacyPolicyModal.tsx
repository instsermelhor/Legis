import React from 'react';
import { XIcon } from './IconComponents';

interface ModalProps {
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ onClose }) => {
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
                    <h2 className="text-xl font-bold text-gray-800">Política de Privacidade</h2>
                    <button
                        onClick={onClose}
                        className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                     <h3 className="font-bold mb-2">1. Coleta de Informações</h3>
                    <p className="mb-4 text-gray-600">Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.</p>
                    <h3 className="font-bold mb-2">2. Uso das Informações</h3>
                    <p className="mb-4 text-gray-600">Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat.</p>
                    <h3 className="font-bold mb-2">3. Compartilhamento de Informações</h3>
                    <p className="mb-4 text-gray-600">Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.</p>
                    <h3 className="font-bold mb-2">4. Seus Direitos</h3>
                    <p className="text-gray-600">Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.</p>
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
