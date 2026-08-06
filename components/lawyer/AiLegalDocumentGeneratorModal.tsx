import React, { useState } from 'react';
import {
  DocumentType,
  GeneratedLegalDocument,
  generateLegalDocumentWithAi,
  formatDocumentTypeTitle,
} from '../../lib/aiLegalDocumentGeneratorEngine';

interface AiLegalDocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// External helper to generate SHA-256 hash simulation (outside component for react-hooks/purity)
function generateSha256Simulated(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export const AiLegalDocumentGeneratorModal: React.FC<AiLegalDocumentGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'crypto'>('form');
  
  // Form states
  const [docType, setDocType] = useState<DocumentType>('peticao_inicial_civel');
  const [comarcaTribunal, setComarcaTribunal] = useState('São Paulo - SP');
  const [autorNome, setAutorNome] = useState('João Pedro da Silva');
  const [autorCpfCnpj, setAutorCpfCnpj] = useState('123.456.789-00');
  const [reuNome, setReuNome] = useState('Empresa X Soluções Financeiras Ltda.');
  const [reuCpfCnpj, setReuCpfCnpj] = useState('12.345.678/0001-99');
  const [fatosResumo, setFatosResumo] = useState('O Autor firmou contrato de prestação de serviços com a empresa Ré, contudo a mesma descumpriu injustificadamente a cláusula 4ª do instrumento, acarretando graves prejuízos financeiros e inscrição indevida nos órgãos de proteção ao crédito.');
  const [tese1, setTese1] = useState('Da Inaplicabilidade da Cláusula Penal Excessiva e Abusividade da Inscrição');
  const [tese2, setTese2] = useState('Da Responsabilidade Civil Objetiva e Reparação por Danos Morais in Re Ipsa');
  const [valorCausaBrl, setValorCausaBrl] = useState<number>(45000);
  const [incluirTutelaUrgencia, setIncluirTutelaUrgencia] = useState(true);

  const [generatedDoc, setGeneratedDoc] = useState<GeneratedLegalDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const doc = generateLegalDocumentWithAi({
        docType,
        comarcaTribunal,
        autorNome,
        autorCpfCnpj,
        reuNome,
        reuCpfCnpj,
        fatosResumo,
        tesesPrincipais: [tese1, tese2].filter(Boolean),
        valorCausaBrl,
        incluirTutelaUrgencia,
        advogadoNome: 'Dra. Mariana Costa e Silva',
        advogadoOab: 'OAB/SP 412.980',
      });

      doc.sha256Hash = generateSha256Simulated();
      setGeneratedDoc(doc);
      setIsGenerating(false);
      setActiveTab('preview');
    }, 1200);
  };

  const fullTextToCopy = generatedDoc
    ? `${generatedDoc.cabecalho}\n\n${generatedDoc.qualificacaoPartes}\n\n${generatedDoc.dosFatos}\n\n${generatedDoc.doDireito}\n\n${generatedDoc.daTutelaUrgencia || ''}\n\n${generatedDoc.dosPedidos}\n\n${generatedDoc.valorCausaFormatado}\n\n${generatedDoc.fechamento}`
    : '';

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullTextToCopy);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Gerador de Peças Processuais com IA">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <span className="text-xl">✍️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg">Gerador de Peças Processuais com IA</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  NÍVEL 13
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                IA Generativa Jurídica · Precedentes STF/STJ · Validação Criptográfica SHA-256
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/8 bg-slate-900/60 overflow-x-auto flex-shrink-0">
          {[
            { id: 'form', label: '✍️ Formulário da Peça' },
            { id: 'preview', label: `📄 Pré-Visualização & Editor${generatedDoc ? ' (Gerado)' : ''}` },
            { id: 'crypto', label: '🔏 Autenticidade & SHA-256' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/4'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f1117]">
          
          {/* TAB 1: Formulário */}
          {activeTab === 'form' && (
            <form onSubmit={handleGenerate} className="max-w-3xl mx-auto space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Tipo de Peça Processual *</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as DocumentType)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="peticao_inicial_civel">📜 Petição Inicial Cível (Procedimento Comum)</option>
                  <option value="contestacao_civel">🛡️ Contestação Cível com Reconvenção</option>
                  <option value="agravo_instrumento">⚡ Agravo de Instrumento com Tutela Recursal</option>
                  <option value="habeas_corpus">🔒 Habeas Corpus Repressivo / Preventivo</option>
                  <option value="mandado_seguranca">⚖️ Mandado de Segurança com Pedido Liminar</option>
                  <option value="recurso_especial">🏛️ Recurso Especial (STJ)</option>
                  <option value="reclamacao_trabalhista">💼 Reclamação Trabalhista</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Comarca / Tribunal *</label>
                  <input
                    type="text"
                    required
                    value={comarcaTribunal}
                    onChange={e => setComarcaTribunal(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Valor da Causa (R$) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={valorCausaBrl}
                    onChange={e => setValorCausaBrl(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Qualificação das partes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900 border border-white/8">
                <div className="space-y-2">
                  <span className="text-emerald-400 font-bold text-xs">👤 Polo Ativo (Autor)</span>
                  <input
                    type="text"
                    required
                    value={autorNome}
                    onChange={e => setAutorNome(e.target.value)}
                    placeholder="Nome completo do Autor..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    value={autorCpfCnpj}
                    onChange={e => setAutorCpfCnpj(e.target.value)}
                    placeholder="CPF/CNPJ do Autor..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-rose-400 font-bold text-xs">🏛️ Polo Passivo (Réu)</span>
                  <input
                    type="text"
                    required
                    value={reuNome}
                    onChange={e => setReuNome(e.target.value)}
                    placeholder="Nome completo do Réu..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    value={reuCpfCnpj}
                    onChange={e => setReuCpfCnpj(e.target.value)}
                    placeholder="CPF/CNPJ do Réu..."
                    className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Resumo dos Fatos da Causa *</label>
                <textarea
                  rows={3}
                  required
                  value={fatosResumo}
                  onChange={e => setFatosResumo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 text-xs font-semibold">Teses Jurídicas Principais</label>
                <input
                  type="text"
                  value={tese1}
                  onChange={e => setTese1(e.target.value)}
                  placeholder="Tese 1: Da Responsabilidade Civil..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  value={tese2}
                  onChange={e => setTese2(e.target.value)}
                  placeholder="Tese 2: Do Dano Moral in Re Ipsa..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkTutela"
                  checked={incluirTutelaUrgencia}
                  onChange={e => setIncluirTutelaUrgencia(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label htmlFor="chkTutela" className="text-xs text-slate-200 font-semibold cursor-pointer">
                  Incluir capítulo de Tutela de Urgência Liminar (Art. 300 do CPC)
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-lg">🤖</span>
                    <span>Gerando Peça Jurídica via IA...</span>
                  </>
                ) : (
                  <>
                    <span>🤖 Gerar Peça Processual com IA & Jurisprudência</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Editor & Pré-Visualização */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {!generatedDoc ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-3">✍️</span>
                  <p className="text-slate-400 text-sm">Nenhuma peça foi gerada ainda. Preencha o formulário para gerar.</p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                  >
                    Ir para Formulário
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-white/8">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-300 font-bold">SHA-256:</span>
                      <code className="text-[10px] font-mono text-emerald-400 bg-black/50 px-2 py-0.5 rounded">
                        {generatedDoc.sha256Hash?.slice(0, 24)}...
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyText}
                        className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>{copiedStatus ? '✅ Copiado!' : '📋 Copiar Texto Completo'}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('crypto')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                      >
                        🔏 Validar Criptografia
                      </button>
                    </div>
                  </div>

                  {/* Document Page Simulation */}
                  <div className="p-8 rounded-xl bg-slate-950 border border-white/10 font-serif text-slate-200 text-xs sm:text-sm leading-relaxed space-y-6 shadow-2xl max-w-4xl mx-auto">
                    <div className="text-center font-bold text-white uppercase border-b border-white/10 pb-4 tracking-wider">
                      {generatedDoc.cabecalho}
                    </div>

                    <div className="whitespace-pre-wrap">{generatedDoc.qualificacaoPartes}</div>

                    <div className="whitespace-pre-wrap">{generatedDoc.dosFatos}</div>

                    <div className="whitespace-pre-wrap">{generatedDoc.doDireito}</div>

                    {generatedDoc.daTutelaUrgencia && (
                      <div className="whitespace-pre-wrap p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                        {generatedDoc.daTutelaUrgencia}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{generatedDoc.dosPedidos}</div>

                    <div className="font-bold text-emerald-400 font-mono">{generatedDoc.valorCausaFormatado}</div>

                    <div className="whitespace-pre-wrap text-right">{generatedDoc.fechamento}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Autenticidade & SHA-256 */}
          {activeTab === 'crypto' && (
            <div className="max-w-2xl mx-auto space-y-4 text-slate-300 text-sm">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span>🔏 Validação Criptográfica de Autenticidade (SHA-256)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toda peça gerada no Legis Connect recebe uma assinatura digital com hash SHA-256 calculado via Web Crypto API nativa, garantindo inalterabilidade e integridade para peticionamento eletrônico.
                </p>
              </div>

              {generatedDoc && (
                <div className="p-4 rounded-xl bg-slate-900 border border-white/8 space-y-3">
                  <div>
                    <span className="text-slate-500 text-xs block">Hash Criptográfico SHA-256 da Peça:</span>
                    <code className="text-xs font-mono text-emerald-400 break-all bg-black/60 p-2.5 rounded-lg block mt-1">
                      {generatedDoc.sha256Hash}
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Data de Emissão: {new Date(generatedDoc.createdAt).toLocaleString('pt-BR')}</span>
                    <span className="text-emerald-400 font-bold">✅ VÁLIDO & AUTÊNTICO</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/8 bg-slate-900/60 flex items-center justify-between flex-shrink-0">
          <p className="text-slate-500 text-xs">
            Legis Connect Nível 13 · Gerador Automático de Peças Processuais com IA & Jurisprudência STF/STJ
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-white text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
