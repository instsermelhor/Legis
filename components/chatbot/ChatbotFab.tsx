import React from 'react';

interface ChatbotFabProps {
  onClick: () => void;
}

export const ChatbotFab: React.FC<ChatbotFabProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 tooltip-trigger">
      {/* Tooltip for desktop hover */}
      <div className="tooltip-content absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/90 text-white text-xs font-medium backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap">
        <span>🤖</span>
        <span>Assistente Jurídico IA</span>
      </div>

      {/* Pulse ring animation around button */}
      <div className="absolute inset-0 rounded-full fab-pulse-ring pointer-events-none" />

      {/* Main button */}
      <button
        onClick={onClick}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0F0D1A]"
        aria-label="Abrir assistente virtual inteligente"
      >
        {/* IA Badge */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[9px] font-black tracking-wider text-gray-950 uppercase shadow-md shadow-amber-500/30">
          IA
        </span>

        {/* Sparkle icon / Chat */}
        <svg 
          className="w-7 h-7 transform group-hover:rotate-6 transition-transform duration-300" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={1.8}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.84-.84 4.54 4.54 0 00.99-2.316C4.015 16.326 3 14.28 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
          />
        </svg>
      </button>
    </div>
  );
};

