import React, { useState } from 'react';

interface LegalAiToolsProps {
  role: 'lawyer' | 'intern' | 'secretary';
  allowedTools: string[]; // keys of allowed tools
}

interface ToolConfig {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const ALL_TOOLS: ToolConfig[] = [
  { key: 'pecas', label: '📄 Peças Jurídicas', icon: '📝', description: 'Criação de Petições Iniciais, Contestações e Recursos com IA.' },
  { key: 'pesquisas', label: '🔍 Pesquisas Jurídicas', icon: '📖', description: 'Pesquisa avançada em doutrina e análise de jurisprudência.' },
  { key: 'audios', label: '🎙️ Comandos por Áudio', icon: '🗣️', description: 'Execução de comandos de voz para agendamentos e cadastros.' },
  { key: 'transcricao', label: '📝 Transcrição de Áudio', icon: '🎧', description: 'Transcrição inteligente de audiências e depoimentos gravados.' },
  { key: 'fundamentacoes', label: '⚖️ Fundamentações', icon: '🏛️', description: 'Geração de justificativas jurídicas, constitucionais e infraconstitucionais.' },
  { key: 'revisao', label: '✍️ Revisão de Textos', icon: '✏️', description: 'Revisão gramatical, ortográfica e adequação técnica de petições.' },
  { key: 'jurisprudencia', label: '🏛️ Jurisprudências', icon: '⚖️', description: 'Busca por jurisprudências reais no Datajud e Tribunais.' },
  { key: 'manifestacao', label: '💼 Manifestações', icon: '📑', description: 'Elaboração rápida de manifestações para despachos e prazos.' },
];

export const LegalAiTools: React.FC<LegalAiToolsProps> = ({ role, allowedTools }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // Individual tool states
  const [pecaTemplate, setPecaTemplate] = useState('Petição Inicial');
  const [pecaClient, setPecaClient] = useState('');
  const [pecaFacts, setPecaFacts] = useState('');

  const [pesquisaQuery, setPesquisaQuery] = useState('');
  const [pesquisaArea, setPesquisaArea] = useState('Direito Civil');

  const [audioRecording, setAudioRecording] = useState(false);
  const [audioDetectedText, setAudioDetectedText] = useState('');

  const [transcribeFile, setTranscribeFile] = useState<string>('');

  const [fundamentacaoTese, setFundamentacaoTese] = useState('');
  const [fundamentacaoArtigos, setFundamentacaoArtigos] = useState('');

  const [revisaoOriginal, setRevisaoOriginal] = useState('');

  const [jurisprudenciaTermo, setJurisprudenciaTermo] = useState('');
  const [jurisprudenciaTribunal, setJurisprudenciaTribunal] = useState('STF');

  const [manifestacaoDespacho, setManifestacaoDespacho] = useState('');
  const [manifestacaoTipo, setManifestacaoTipo] = useState('Pedido de Prazo');

  // Colors based on active persona
  const themeColors = {
    lawyer: { primary: 'bg-primary hover:bg-primary/95 text-white', border: 'focus:border-[#B8962E] focus:ring-[#B8962E]/20', text: 'text-[#B8962E]', accent: '#B8962E' },
    intern: { primary: 'bg-indigo-600 hover:bg-indigo-700 text-white', border: 'focus:border-[#1C73E8] focus:ring-[#1C73E8]/20', text: 'text-indigo-600', accent: '#1C73E8' },
    secretary: { primary: 'bg-emerald-600 hover:bg-emerald-700 text-white', border: 'focus:border-[#1F7A6D] focus:ring-[#1F7A6D]/20', text: 'text-emerald-600', accent: '#1F7A6D' },
  }[role];

  const handleSimulate = (toolKey: string, e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    
    setTimeout(() => {
      setLoading(false);
      switch (toolKey) {
        case 'pecas':
          setResult(`EXMO. SR. DR. JUIZ DE DIREITO DA VARA CÍVEL\n\nRequerente: ${pecaClient || 'Cliente Exemplo'}\nRequerido: Empresa de Serviços Gerais S/A\n\nFatos:\n${pecaFacts || 'O Requerente sofreu cobrança indevida de valores...'}\n\nDo Direito:\nÀ luz do Código de Defesa do Consumidor, verifica-se a vulnerabilidade técnica e econômica do consumidor, configurando-se patente falha na prestação dos serviços nos termos do Art. 14 do CDC. Resta clara a obrigação de reparar o dano material decorrente da falha.\n\nPedidos:\n1. A citação da requerida para, querendo, contestar;\n2. A condenação à repetição do indébito em dobro;\n3. A inversão do ônus da prova.\n\nNestes termos, pede deferimento.\n\n${new Date().toLocaleDateString('pt-BR')} | Legis AI.`);
          break;
        case 'pesquisas':
          setResult(`=== MEMORANDO DE PESQUISA JURÍDICA ===\nÁrea: ${pesquisaArea}\nTópico: "${pesquisaQuery || 'Cabimento de danos morais por inscrição indevida'}"\n\n1. SÍNTESE DO ENTENDIMENTO:\nA inscrição indevida em cadastro de inadimplentes gera dano moral in re ipsa (presumido), prescindindo de comprovação do prejuízo concreto.\n\n2. DISPOSITIVOS LEGAIS RELACIONADOS:\n- Art. 186 e 927 do Código Civil brasileiro.\n- Súmula 385 do STJ (mitigação do dano caso haja anotações legítimas prévias).\n\n3. DOUTRINA MAJORITÁRIA:\nPontes de Miranda esclarece que a honra objetiva do cidadão constitui patrimônio moral inalienável, cuja lesão exige pronta reparação pecuniária punitivo-pedagógica.`);
          break;
        case 'audios':
          setResult(`✅ COMANDO DE VOZ EXECUTADO COM SUCESSO!\n\nÁudio interpretado: "Cadastrar nova audiência de conciliação para o processo case001 na próxima sexta-feira às 14:00"\n\nAção realizada: Um novo agendamento foi adicionado à agenda do Dr. supervisor, vinculado ao caso cadastrado.`);
          break;
        case 'transcricao':
          setResult(`=== TRANSCRIÇÃO DE ÁUDIO OFICIAL ===\nArquivo processado: ${transcribeFile || 'audiencia_instrucao.wav'}\nTaxa de acerto: 99.4%\n\n[00:05] Juiz: Inicia-se a audiência de instrução e julgamento do processo 1002432-15.\n[00:15] Requerente: Eu confirmo que nunca assinei esse contrato físico.\n[00:27] Advogado: Excelência, solicito que conste em ata o depoimento pessoal do réu.\n[00:39] Testemunha: Eu presenciei a assinatura das cobranças indevidas.`);
          break;
        case 'fundamentacoes':
          setResult(`=== FUNDAMENTAÇÃO LEGAL EXTRAPOLADA ===\nTese: ${fundamentacaoTese || 'Dano estético decorrente de acidente de trânsito'}\nArtigos: ${fundamentacaoArtigos || 'Art. 949 e 950 do CC'}\n\nFundamentação:\nA responsabilidade civil extracontratual encontra amparo nos Arts. 186 e 927 do Código Civil. O dano estético, consagrado pela Súmula 387 do STJ como cumulável com o dano moral, decorre da degradação da harmonia física da vítima.\n\nAs sequelas permanentes descritas no laudo pericial geram inequivocamente depreciação laboral e sofrimento íntimo de caráter indenizável.`);
          break;
        case 'revisao':
          setResult(`=== TEXTO REVISADO PELA IA ===\n\nOriginal: "O réu, a nível de defesa, vem contestar que não assinou o contrato..."\nRevisão Sugerida: "O réu, em sede de contestação, alega não ter assinado o contrato..."\n\nOriginal: "O autor requer a condenação da ré nos termos do art. 5 da constituição."\nRevisão Sugerida: "O autor requer a condenação da ré nos termos do art. 5º da Constituição Federal."\n\nCorreções executadas:\n- Correção de vício de linguagem ("a nível de" -> "em sede de").\n- Correção de concordância gramatical.\n- Formatação técnica de dispositivos constitucionais.`);
          break;
        case 'jurisprudencia':
          setResult(`=== JURISPRUDÊNCIA REAL ENCONTRADA (TJSP/STJ) ===\nTermo pesquisado: "${jurisprudenciaTermo || 'Erro médico cirurgia plástica reparadora'}"\nTribunal: ${jurisprudenciaTribunal}\n\n1. Recurso Especial REsp 1.845.232/SP\nRelator: Min. Nancy Andrighi - Órgão Julgador: T3\nEmenta: RESPONSABILIDADE CIVIL. ERRO MÉDICO. CIRURGIA REPARADORA. OBRIGAÇÃO DE RESULTADO. CULPA PRESUMIDA DO PROFISSIONAL. DANO MORAL CONFIGURADO. ACÓRDÃO MANTIDO.\n\n2. Apelação Cível TJSP 1004321-12.2023.8.26.0100\nRelator: Des. Francisco Loureiro.\nEmenta: Ação indenizatória. Danos estéticos e morais. Sequelas após procedimento pós-bariátrico. Negligência na condução pós-operatória evidenciada por perícia médica. Indenização mantida em R$ 40.000,00.`);
          break;
        case 'manifestacao':
          setResult(`EXMO. SR. DR. JUIZ DE DIREITO DA VARA DE FAMÍLIA\n\nProcesso nº: case001\n\nIntermediado por seu advogado, vem o Requerente, em atenção ao despacho de fls. 24, MANIFESTAR-SE manifestando ciência e solicitando o prazo suplementar de 15 (quinze) dias úteis para juntada das guias de custas devidamente quitadas.\n\nTermos em que pede deferimento.\n\n${new Date().toLocaleDateString('pt-BR')} | Legis AI.`);
          break;
        default:
          setResult('Simulação de IA concluída.');
      }
    }, 1500);
  };

  const handleSimulateAudioRecording = () => {
    setAudioRecording(true);
    setAudioDetectedText('Gravando...');
    setTimeout(() => {
      setAudioRecording(false);
      setAudioDetectedText('Comando detectado: "Cadastrar nova audiência para sexta-feira às 14:00"');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>⚡</span> Inteligência Jurídica & Automações
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Acesse ferramentas baseadas em inteligência artificial generativa integradas à plataforma.
        </p>
      </div>

      {!selectedTool ? (
        /* Tools Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_TOOLS.map(t => {
            const isAllowed = allowedTools.includes(t.key);
            return (
              <div
                key={t.key}
                onClick={() => isAllowed && setSelectedTool(t.key)}
                className={`bg-white rounded-xl border p-3.5 flex flex-col gap-1.5 transition-all ${
                  isAllowed
                    ? 'border-gray-200 hover:shadow-md cursor-pointer hover:border-primary/40'
                    : 'border-gray-100 bg-gray-50/50 opacity-40 cursor-not-allowed'
                } dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.icon}</span>
                  {!isAllowed && (
                    <span className="px-1.5 py-0.5 bg-red-150 text-red-600 rounded text-[8px] font-bold uppercase tracking-wider">
                      Bloqueado
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{t.label}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">{t.description}</p>
                </div>
                {isAllowed && (
                  <span className={`text-[11px] font-semibold ${themeColors.text} mt-auto hover:underline flex items-center gap-0.5`}>
                    Abrir Ferramenta →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (

        /* Active Tool Detail */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ALL_TOOLS.find(t => t.key === selectedTool)?.icon}</span>
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  {ALL_TOOLS.find(t => t.key === selectedTool)?.label}
                </h4>
                <p className="text-xs text-gray-500">Ferramenta Inteligente de IA</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedTool(null); setResult(''); }}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 rounded-lg font-semibold"
            >
              Voltar ao Menu
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Panel Form */}
            <div className="space-y-4">
              <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">Parâmetros de Entrada</h5>
              
              <form onSubmit={(e) => handleSimulate(selectedTool, e)} className="space-y-4">
                {selectedTool === 'pecas' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Modelo da Peça</label>
                      <select value={pecaTemplate} onChange={e => setPecaTemplate(e.target.value)} className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${themeColors.border}`}>
                        <option>Petição Inicial</option>
                        <option>Habeas Corpus</option>
                        <option>Contestação</option>
                        <option>Recurso de Apelação</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome do Requerente (Cliente)</label>
                      <input type="text" value={pecaClient} onChange={e => setPecaClient(e.target.value)} placeholder="Ex: João da Silva" className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Fatos e Causa de Pedir</label>
                      <textarea rows={4} value={pecaFacts} onChange={e => setPecaFacts(e.target.value)} placeholder="Descreva os fatos principais..." className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} />
                    </div>
                  </>
                )}

                {selectedTool === 'pesquisas' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Termo de Pesquisa / Pergunta Jurídica</label>
                      <input type="text" value={pesquisaQuery} onChange={e => setPesquisaQuery(e.target.value)} placeholder="Ex: Súmula vinculante 10 do STF..." className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Área do Direito</label>
                      <select value={pesquisaArea} onChange={e => setPesquisaArea(e.target.value)} className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${themeColors.border}`}>
                        <option>Direito Civil</option>
                        <option>Direito Penal</option>
                        <option>Direito Constitucional</option>
                        <option>Direito Tributário</option>
                        <option>Direito do Trabalho</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedTool === 'audios' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600">Fale o comando desejado abaixo:</p>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl gap-3 bg-gray-50 dark:bg-black/10">
                      <button
                        type="button"
                        onClick={handleSimulateAudioRecording}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-all ${
                          audioRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white hover:scale-105'
                        }`}
                      >
                        🎙️
                      </button>
                      <span className="text-xs font-semibold text-gray-500">
                        {audioRecording ? 'Gravando áudio...' : 'Clique para falar seu comando'}
                      </span>
                    </div>
                    {audioDetectedText && (
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 text-xs">
                        <strong className="text-gray-700">Transcrito por Voz:</strong>
                        <p className="text-gray-600 mt-1">{audioDetectedText}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTool === 'transcricao' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Arquivo de Áudio (Upload Simulado)</label>
                      <input type="text" value={transcribeFile} onChange={e => setTranscribeFile(e.target.value)} placeholder="Ex: audiencia_instrucao_10-05.mp3" className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} />
                      <p className="text-[10px] text-gray-400 mt-1">Digite um nome de arquivo de áudio para simular a transcrição inteligente.</p>
                    </div>
                  </>
                )}

                {selectedTool === 'fundamentacoes' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tese / Pedido da Ação</label>
                      <input type="text" value={fundamentacaoTese} onChange={e => setFundamentacaoTese(e.target.value)} placeholder="Ex: Cumulação de dano estético e moral" className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Artigos ou Súmulas de Referência</label>
                      <input type="text" value={fundamentacaoArtigos} onChange={e => setFundamentacaoArtigos(e.target.value)} placeholder="Ex: Art. 186 e 927 do Código Civil" className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} />
                    </div>
                  </>
                )}

                {selectedTool === 'revisao' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Texto Jurídico a Ser Revisado</label>
                    <textarea rows={6} value={revisaoOriginal} onChange={e => setRevisaoOriginal(e.target.value)} placeholder="Cole aqui a petição ou trecho para revisão..." className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} required />
                  </div>
                )}

                {selectedTool === 'jurisprudencia' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tese de Busca de Jurisprudência</label>
                      <input type="text" value={jurisprudenciaTermo} onChange={e => setJurisprudenciaTermo(e.target.value)} placeholder="Ex: Exclusão de ICMS base PIS COFINS..." className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tribunal Alvo</label>
                      <select value={jurisprudenciaTribunal} onChange={e => setJurisprudenciaTribunal(e.target.value)} className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${themeColors.border}`}>
                        <option value="STF">STF (Supremo Tribunal Federal)</option>
                        <option value="STJ">STJ (Superior Tribunal de Justiça)</option>
                        <option value="TJSP">TJSP (Tribunal de Justiça de São Paulo)</option>
                        <option value="TJRJ">TJRJ (Tribunal de Justiça do Rio de Janeiro)</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedTool === 'manifestacao' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Despacho Judicial Recebido</label>
                      <textarea rows={4} value={manifestacaoDespacho} onChange={e => setManifestacaoDespacho(e.target.value)} placeholder="Cole o despacho ou intimação judicial..." className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${themeColors.border}`} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Manifestação</label>
                      <select value={manifestacaoTipo} onChange={e => setManifestacaoTipo(e.target.value)} className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${themeColors.border}`}>
                        <option>Pedido de Prazo</option>
                        <option>Ciência do Despacho</option>
                        <option>Juntada de Documentos</option>
                        <option>Réplica à Contestação</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || audioRecording}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${themeColors.primary} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processando com IA...
                    </>
                  ) : (
                    <>✨ Executar Inteligência Artificial</>
                  )}
                </button>
              </form>
            </div>

            {/* Output Panel */}
            <div className="flex flex-col h-full min-h-[300px] border rounded-xl overflow-hidden bg-gray-50/50 dark:bg-black/10">
              <div className="px-4 py-2 border-b bg-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Painel de Resposta da IA</span>
                {result && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(result); alert('Copiado para a área de transferência!'); }}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    📋 Copiar Texto
                  </button>
                )}
              </div>
              
              <div className="flex-1 p-4 font-mono text-xs overflow-auto text-gray-800 leading-relaxed whitespace-pre-wrap">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <span>Analisando fatos e gerando fundamentação...</span>
                  </div>
                ) : result ? (
                  result
                ) : (
                  <span className="text-gray-400 italic">O resultado da automação de IA aparecerá aqui após o processamento.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
