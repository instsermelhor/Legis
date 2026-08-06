import React, { useState } from 'react';

interface Question {
  id: number;
  subject: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Ética Profissional OAB',
    questionText: 'O advogado Carlos foi contratado para defender Maria em ação cível. No decorrer do processo, Carlos descobre fato grave sobre a cliente que afeta a confiança recíproca. Segundo o Código de Ética e Estatuto da OAB, Carlos deve:',
    options: [
      'A) Revelar publicamente o segredo em juízo para se eximir de responsabilidade.',
      'B) Renunciar ao mandato sem necessidade de mencionar o motivo, mantendo o segredo profissional.',
      'C) Abandonar a causa imediatamente sem notificar a cliente.',
      'D) Transferir a causa para outro advogado sem consentimento da cliente.',
    ],
    correctIndex: 1,
    explanation: 'Conforme o Art. 16 do Código de Ética e Disciplina da OAB, a renúncia ao mandato deve ser feita sem necessidade de menção do motivo que a determinou, devendo o advogado manter o segredo profissional.',
  },
  {
    id: 2,
    subject: 'Direito Constitucional',
    questionText: 'A respeito do Mandado de Segurança coletivo, assinale a alternativa correta segundo a Constituição Federal de 1988:',
    options: [
      'A) Pode ser impetrado por qualquer cidadão no gozo dos direitos políticos.',
      'B) Pode ser impetrado por partido político representado no Congresso Nacional.',
      'C) Não exige representação parlamentar para partidos políticos.',
      'D) Impede a concessão de liminar em qualquer hipótese.',
    ],
    correctIndex: 1,
    explanation: 'O Art. 5º, LXX, "a" da CF/88 estabelece que o Mandado de Segurança coletivo pode ser impetrado por partido político com representação no Congresso Nacional.',
  },
  {
    id: 3,
    subject: 'Direito Penal',
    questionText: 'No tocante às causas de exclusão da ilicitude previstas no Código Penal Brasileiro, constitui causa justificante:',
    options: [
      'A) Inimputabilidade por menoridade penal.',
      'B) Estrito cumprimento do dever legal e legítima defesa.',
      'C) Coação moral irresistível.',
      'D) Obediência hierárquica a ordem manifestamente ilegal.',
    ],
    correctIndex: 1,
    explanation: 'O Art. 23 do CP lista as causas excludentes de ilicitude: estado de necessidade, legítima defesa, estrito cumprimento do dever legal e exercício regular de direito.',
  },
];

interface OabSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OabSimulatorModal: React.FC<OabSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!isOpen) return null;

  const currentQ = MOCK_QUESTIONS[currentIdx];

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return; // já respondeu
    setSelectedOption(optionIdx);
    setShowExplanation(true);
    const isRight = optionIdx === currentQ.correctIndex;
    setScore(prev => ({
      correct: prev.correct + (isRight ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentIdx(prev => (prev + 1) % MOCK_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-500/10 via-primary/10 to-indigo-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 4 — Simulador OAB 1ª Fase
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Simulado Oficial OAB com Correção por IA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Scoreboard Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#141126] border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Questão {currentIdx + 1} de {MOCK_QUESTIONS.length}
            </span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
              {currentQ.subject}
            </span>
          </div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            Acertos: {score.correct} / {score.total} {score.total > 0 && `(${Math.round((score.correct / score.total) * 100)}%)`}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
            {currentQ.questionText}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-gray-50 dark:bg-[#201C3D] border-gray-200 dark:border-[#2A2545] text-gray-800 dark:text-gray-200 hover:border-primary/50';
              
              if (selectedOption !== null) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* AI Explanation Box */}
          {showExplanation && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs mb-1">
                <span>🤖 Fundamentação da Resposta (Gemini IA):</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-gray-50 dark:bg-[#141126] border-t border-gray-200 dark:border-[#2A2545] flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
          >
            Próxima Questão →
          </button>
        </div>
      </div>
    </div>
  );
};
