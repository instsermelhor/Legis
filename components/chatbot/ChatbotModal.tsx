import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import { XIcon, PaperAirplaneIcon } from '../common/IconComponents';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isLoading, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md h-[85vh] sm:h-[70vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b flex items-center justify-between bg-primary text-white rounded-t-2xl sm:rounded-t-lg">
          <div>
            <h2 className="text-lg font-bold">Legis Connect Assistente</h2>
            <p className="text-xs text-blue-200">Online</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Fechar chat"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-neutral-light">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">IA</div>}
              <div
                className={`max-w-xs md:max-w-sm p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-lg'
                    : 'bg-white text-neutral-dark rounded-bl-lg border'
                }`}
              >
                <p className="text-sm">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">IA</div>
               <div className="max-w-xs md:max-w-sm p-3 rounded-2xl bg-white text-neutral-dark rounded-bl-lg border">
                  <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t bg-white sm:rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-grow p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-light focus:border-transparent"
              aria-label="Mensagem do chat"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed"
              aria-label="Enviar mensagem"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
