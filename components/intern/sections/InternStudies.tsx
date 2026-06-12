/**
 * InternStudies.tsx
 * Mural de Estudos — Painel do Bacharelando
 * Cronograma de Estudos OAB, Banco de Questões por área,
 * Simulador de questões com feedback, Tracker de horas por matéria.
 */
import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OabArea =
  | 'Direito Civil'
  | 'Direito Penal'
  | 'Direito Processual Civil'
  | 'Direito Processual Penal'
  | 'Direito do Trabalho'
  | 'Direito Constitucional'
  | 'Direito Administrativo'
  | 'Direito Tributário'
  | 'Ética Profissional'
  | 'Direito Empresarial';

interface OabQuestion {
  id: string;
  area: OabArea;
  enunciado: string;
  alternativas: string[];
  gabarito: number; // 0-indexed
  explicacao: string;
  exame?: string; // Ex: "OAB XXXVII"
}

interface StudyPlan {
  area: OabArea;
  horasMeta: number;
  horasEstudadas: number;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  ultimoEstudo?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_QUESTIONS: OabQuestion[] = [
  {
    id: 'q1', area: 'Direito Civil', exame: 'OAB XXXVII',
    enunciado: 'Assinale a alternativa que corresponde à definição correta de ato jurídico stricto sensu:',
    alternativas: [
      'É o ato ilícito praticado com dolo ou culpa, gerando dever de indenizar.',
      'É a declaração de vontade destinada a produzir efeitos jurídicos estabelecidos pela lei, sem possibilidade de escolha pelo agente.',
      'É o negócio jurídico unilateral que extingue obrigações.',
      'É sinônimo de negócio jurídico, pois ambos exigem manifestação de vontade.',
    ],
    gabarito: 1,
    explicacao: 'O ato jurídico stricto sensu (art. 185, CC) é a ação humana lícita cujos efeitos são determinados pela lei, independentemente da vontade das partes quanto a esses efeitos. Difere do negócio jurídico, em que as partes modulam os efeitos dentro dos limites legais.',
  },
  {
    id: 'q2', area: 'Direito Penal', exame: 'OAB XXXIX',
    enunciado: 'Acerca do crime impossível (art. 17, CP), é correto afirmar que:',
    alternativas: [
      'Há tentativa punível quando o agente utiliza meio absolutamente ineficaz.',
      'A impropriedade absoluta do objeto e a ineficácia absoluta do meio excluem a tipicidade, não sendo cabível punição.',
      'O crime impossível gera responsabilidade penal atenuada.',
      'Somente a impropriedade absoluta do objeto configura crime impossível.',
    ],
    gabarito: 1,
    explicacao: 'O art. 17 do CP prevê que não se pune a tentativa quando, por ineficácia absoluta do meio ou por impropriedade absoluta do objeto, é impossível consumar-se o crime. Em ambos os casos, o fato é atípico.',
  },
  {
    id: 'q3', area: 'Direito Constitucional', exame: 'OAB XXXVIII',
    enunciado: 'Sobre os direitos e garantias fundamentais, qual das opções é INCORRETA:',
    alternativas: [
      'São cláusulas pétreas e não podem ser objeto de deliberação de Proposta de Emenda Constitucional tendente a aboli-los.',
      'Possuem aplicação imediata, conforme art. 5°, §1°, CF/88.',
      'A enumeração dos direitos fundamentais no art. 5° da CF/88 é taxativa (numerus clausus).',
      'O mandado de segurança protege direito líquido e certo não amparado por habeas corpus ou habeas data.',
    ],
    gabarito: 2,
    explicacao: 'A enumeração dos direitos fundamentais NÃO é taxativa (numerus clausus). O art. 5°, §2°, CF/88 estabelece que os direitos expressos na Constituição não excluem outros decorrentes do regime e dos princípios por ela adotados, ou dos tratados internacionais.',
  },
  {
    id: 'q4', area: 'Ética Profissional', exame: 'OAB XL',
    enunciado: 'Quanto ao sigilo profissional do advogado, é CORRETO afirmar que:',
    alternativas: [
      'O sigilo pode ser quebrado quando o cliente autorizar expressamente, mesmo que o fato possa prejudicar terceiros inocentes.',
      'O dever de sigilo cessa com a morte do cliente.',
      'O sigilo profissional é irrenunciável pelo advogado, mesmo com autorização do cliente.',
      'O advogado pode revelar segredo do cliente para evitar pratica de crime com pena maior que dois anos.',
    ],
    gabarito: 2,
    explicacao: 'O sigilo profissional é dever do advogado e não é renunciável nem mesmo com autorização do cliente. Ele protege a confiança na relação advocatícia e é garantia institucional, não mero interesse pessoal do cliente. (Art. 26, EOAB e art. 7°, CEDOAB).',
  },
  {
    id: 'q5', area: 'Direito do Trabalho', exame: 'OAB XXXVII',
    enunciado: 'Sobre a jornada de trabalho dos empregados, conforme a CLT e a CF/88, é correto afirmar:',
    alternativas: [
      'A duração normal de trabalho não pode exceder 6 horas diárias e 44 horas semanais.',
      'O trabalho em horas extras é ilimitado desde que haja acordo individual com o empregador.',
      'A duração normal não pode exceder 8 horas diárias e 44 horas semanais, salvo acordo ou convenção coletiva.',
      'A compensação de jornada só pode ser feita mediante convenção coletiva de trabalho.',
    ],
    gabarito: 2,
    explicacao: 'Conforme art. 7°, XIII, CF/88, a duração normal do trabalho não pode exceder 8 horas diárias e 44 horas semanais. A flexibilização (banco de horas, compensação) pode ser feita por acordo ou convenção coletiva, mas a jornada máxima de extras é de 2h/dia (art. 59, CLT).',
  },
];

const OAB_AREAS: OabArea[] = [
  'Direito Civil', 'Direito Penal', 'Direito Processual Civil', 'Direito Processual Penal',
  'Direito do Trabalho', 'Direito Constitucional', 'Direito Administrativo',
  'Direito Tributário', 'Ética Profissional', 'Direito Empresarial',
];

const INITIAL_STUDY_PLAN: StudyPlan[] = OAB_AREAS.map(area => ({
  area,
  horasMeta: area === 'Direito Civil' || area === 'Direito Processual Civil' ? 40 : area === 'Ética Profissional' ? 10 : 20,
  horasEstudadas: Math.floor(Math.random() * 15),
  nivel: 'iniciante',
}));

// ─── Study Plan Widget ────────────────────────────────────────────────────────

const StudyPlanWidget: React.FC<{
  plan: StudyPlan[];
  onHorasUpdate: (area: OabArea, delta: number) => void;
}> = ({ plan, onHorasUpdate }) => {
  const totalMeta = plan.reduce((a, p) => a + p.horasMeta, 0);
  const totalEstudado = plan.reduce((a, p) => a + p.horasEstudadas, 0);
  const overallPct = Math.round((totalEstudado / totalMeta) * 100);

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-white/70">Progresso Total OAB</p>
            <p className="text-3xl font-black">{overallPct}%</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{totalEstudado}h</p>
            <p className="text-xs text-white/70">de {totalMeta}h planejadas</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${Math.min(100, overallPct)}%` }} />
        </div>
      </div>

      {/* Per-area breakdown */}
      <div className="space-y-2">
        {plan.map(p => {
          const pct = Math.min(100, Math.round((p.horasEstudadas / p.horasMeta) * 100));
          const color = pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600';
          return (
            <div key={p.area} className="bg-white dark:bg-[#1A1730] border border-gray-100 dark:border-[#2A2545] rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{p.area}</p>
                    <span className="text-[10px] font-bold text-gray-500 shrink-0 ml-2">{p.horasEstudadas}/{p.horasMeta}h</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onHorasUpdate(p.area, -1)}
                    disabled={p.horasEstudadas <= 0}
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 disabled:opacity-30">−</button>
                  <button onClick={() => onHorasUpdate(p.area, 1)}
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200">+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── OAB Question Simulator ───────────────────────────────────────────────────

const OabSimulator: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<OabArea | 'todas'>('todas');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ corretas: 0, total: 0 });

  const questions = useMemo(() =>
    selectedArea === 'todas' ? MOCK_QUESTIONS : MOCK_QUESTIONS.filter(q => q.area === selectedArea),
    [selectedArea]
  );

  const currentQ = questions[currentIdx];

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setScore(prev => ({
      corretas: prev.corretas + (idx === currentQ.gabarito ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentIdx(prev => (prev + 1) % questions.length);
  };

  const resetSimulator = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ corretas: 0, total: 0 });
  };

  if (!currentQ) return (
    <div className="text-center py-10 text-gray-400">
      <p className="text-3xl mb-2">📚</p>
      <p className="text-sm">Nenhuma questão disponível para esta área.</p>
    </div>
  );

  const scorePct = score.total > 0 ? Math.round((score.corretas / score.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Score + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {score.total > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/10 rounded-xl px-4 py-2.5">
            <span className={`text-lg font-black ${scorePct >= 70 ? 'text-emerald-600' : scorePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{scorePct}%</span>
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{score.corretas}/{score.total} corretas</p>
              <p className="text-[10px] text-gray-400">{scorePct >= 70 ? '✅ Aprovado' : '⚠️ Precisa melhorar'}</p>
            </div>
            <button onClick={resetSimulator} className="ml-2 text-xs text-gray-400 hover:text-red-500 transition-colors" title="Reiniciar">↺</button>
          </div>
        )}
        <select value={selectedArea} onChange={e => { setSelectedArea(e.target.value as OabArea | 'todas'); resetSimulator(); }}
          className="border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <option value="todas">Todas as áreas</option>
          {OAB_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border-b border-indigo-100 dark:border-[#2A2545] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">{currentQ.area}</span>
            {currentQ.exame && <span className="text-xs text-gray-400">{currentQ.exame}</span>}
          </div>
          <span className="text-xs text-gray-400">{currentIdx + 1} / {questions.length}</span>
        </div>

        {/* Enunciado */}
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">{currentQ.enunciado}</p>
        </div>

        {/* Alternativas */}
        <div className="px-5 pb-4 space-y-2">
          {currentQ.alternativas.map((alt, i) => {
            const isCorrect = i === currentQ.gabarito;
            const isSelected = i === selectedAnswer;
            let cls = 'border border-gray-200 dark:border-[#2A2545] bg-white dark:bg-black/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer';
            if (selectedAnswer !== null) {
              if (isCorrect) cls = 'border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 cursor-default';
              else if (isSelected) cls = 'border-2 border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 cursor-default';
              else cls = 'border border-gray-100 dark:border-[#2A2545] bg-gray-50 dark:bg-black/10 text-gray-400 cursor-default opacity-60';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full text-left rounded-xl px-4 py-3 text-xs leading-relaxed transition-all ${cls}`}>
                <span className="font-black mr-2">{String.fromCharCode(65 + i)})</span>{alt}
                {selectedAnswer !== null && isCorrect && <span className="ml-2 font-bold text-emerald-600">✓ Correta</span>}
                {isSelected && !isCorrect && <span className="ml-2 font-bold text-red-600">✗ Incorreta</span>}
              </button>
            );
          })}
        </div>

        {/* Explicação */}
        {showExplanation && (
          <div className="mx-5 mb-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-1">💡 Explicação</p>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">{currentQ.explicacao}</p>
          </div>
        )}

        {/* Next */}
        {selectedAnswer !== null && (
          <div className="px-5 pb-5">
            <button onClick={nextQuestion}
              className="w-full py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              Próxima Questão →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type StudiesSubTab = 'cronograma' | 'simulador';

interface InternStudiesProps {
  grades: Record<string, Record<string, string>>;
}

export const InternStudies: React.FC<InternStudiesProps> = ({ grades: _grades }) => {
  const [subTab, setSubTab] = useState<StudiesSubTab>('cronograma');
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>(INITIAL_STUDY_PLAN);

  const updateHoras = (area: OabArea, delta: number) => {
    setStudyPlan(prev => prev.map(p => p.area === area ? { ...p, horasEstudadas: Math.max(0, p.horasEstudadas + delta) } : p));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {([
          { id: 'cronograma' as const, label: '📊 Cronograma OAB' },
          { id: 'simulador' as const, label: '🎯 Simulador de Questões' },
        ]).map(({ id, label }) => (
          <button key={id} onClick={() => setSubTab(id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${subTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-black/30'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Cronograma de Estudos ── */}
      {subTab === 'cronograma' && (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Cronograma de Estudos — Exame OAB</h4>
            <p className="text-xs text-gray-400 mt-0.5">Registre as horas estudadas em cada área. Use os botões + e − para atualizar.</p>
          </div>
          <StudyPlanWidget plan={studyPlan} onHorasUpdate={updateHoras} />
        </div>
      )}

      {/* ── Simulador OAB ── */}
      {subTab === 'simulador' && (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">🎯 Simulador de Questões OAB</h4>
            <p className="text-xs text-gray-400 mt-0.5">Pratique questões do Exame de Ordem com gabarito comentado por área.</p>
          </div>
          <OabSimulator />
        </div>
      )}
    </div>
  );
};
