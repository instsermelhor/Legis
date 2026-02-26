import React from 'react';
import { ChatBubbleIcon } from '../common/IconComponents';

interface ChatbotFabProps {
  onClick: () => void;
}

export const ChatbotFab: React.FC<ChatbotFabProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all duration-200 transform hover:scale-110 z-40"
      aria-label="Abrir assistente virtual"
    >
      <ChatBubbleIcon className="w-8 h-8" />
    </button>
  );
};
