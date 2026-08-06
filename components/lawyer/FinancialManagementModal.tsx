import React, { useState } from 'react';
import { processPayment, calculateOabSplit, PaymentResponse } from '../../lib/paymentGateway';

interface FinancialManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialManagementModal: React.FC<FinancialManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emit' | 'history' | 'split'>('emit');
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('Honorários Advocatícios — Ação Ordinária');
  const [amount, setAmount] = useState<number>(2500);
  const [method, setMethod] = useState<'pix' | 'boleto' | 'credit_card'>('pix');
  const [lawyerSplitPercent, setLawyerSplitPercent] = useState<number>(90);
  
  // Generated result
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const splitResult = calculateOabSplit(amount || 0, lawyerSplitPercent);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await processPayment({
        amount,
        description,
        method,
        payerName: clientName || 'Cliente Genérico',
        payerCpfEmail: 'cliente@email.com',
        splitConfig: {
          lawyerFeePercentage: lawyerSplitPercent,
          platformFeePercentage: 100 - lawyerSplitPercent,
        },
      });
      setPaymentResult(res);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-purple-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 3 — Módulo Financeiro & Split OAB
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Gestão de Cobranças & Honorários Advocatícios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-[#2A2545] px-6 bg-gray-50/50 dark:bg-[#141126]/50">
          <button
            onClick={() => setActiveTab('emit')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'emit'
                ? 'border-primary text-primary dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ⚡ Emitir Nova Cobrança (PIX / Boleto)
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'split'
                ? 'border-primary text-primary dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ⚖️ Divisão Ética de Honorários (Split OAB)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'emit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form Column */}
              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Ex: Maria Oliveira Santos"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descrição do Serviço Jurídico
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Valor dos Honorários (R$)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      min="10"
                      step="50"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Forma de Cobrança
                    </label>
                    <select
                      value={method}
                      onChange={e => setMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                    >
                      <option value="pix">💚 PIX Copia e Cola / QR Code</option>
                      <option value="boleto">📄 Boleto Bancário</option>
                      <option value="credit_card">💳 Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

                {/* OAB Split preview box */}
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-xs">
                  <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">
                    Repasse Ético OAB ({lawyerSplitPercent}% Advogado / {100 - lawyerSplitPercent}% Plataforma)
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Advogado Recebe:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {splitResult.lawyerAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md"
                >
                  {isGenerating ? 'Gerando Cobrança...' : '⚡ Emitir Cobrança Instantânea'}
                </button>
              </form>

              {/* Invoice Output Column */}
              <div className="bg-gray-50 dark:bg-[#151226] p-5 rounded-2xl border border-gray-200 dark:border-[#252040] flex flex-col justify-between">
                {!paymentResult ? (
                  <div className="my-auto text-center text-gray-400 text-xs py-12">
                    <span className="text-4xl block mb-2">🧾</span>
                    Preencha os dados e clique em **Emitir Cobrança** para gerar o código PIX ou Boleto para seu cliente.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#252040] pb-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Fatura #{paymentResult.transactionId.slice(-8)}
                      </span>
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Pendente
                      </span>
                    </div>

                    <div className="text-center py-2">
                      <div className="text-xs text-gray-500">Valor Total a Cobrar</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        R$ {paymentResult.amount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    {paymentResult.method === 'pix' && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Código PIX Copia e Cola:
                        </label>
                        <textarea
                          readOnly
                          rows={3}
                          value={paymentResult.pixCopiaECola}
                          className="w-full p-2 bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] rounded-xl text-[10px] font-mono text-gray-700 dark:text-gray-300 focus:outline-none"
                        />
                        <button
                          onClick={() => copyToClipboard(paymentResult.pixCopiaECola || '')}
                          className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          {copied ? '✓ Código Copiado!' : '📋 Copiar PIX Copia e Cola'}
                        </button>
                      </div>
                    )}

                    {paymentResult.method === 'boleto' && (
                      <div className="space-y-2 text-xs">
                        <div className="font-bold text-gray-800 dark:text-gray-200">Linha Digitável:</div>
                        <div className="p-2 bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] rounded-xl font-mono text-[10px] break-all">
                          {paymentResult.barcode}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
                <h4 className="font-bold text-sm mb-1">⚖️ OAB Compliance — Provimento 196/2020 OAB</h4>
                <p>
                  A plataforma Legis Connect atua estritamente como **facilitadora tecnológica** e intermediadora de pagamentos. A retenção da taxa de uso da plataforma é feita via split automático transparente sem incidência sobre a atividade-fim da advocacia.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-[#151226] p-6 rounded-2xl border border-gray-200 dark:border-[#252040]">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">
                  Simulador de Repasse de Honorários
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Porcentagem do Advogado: {lawyerSplitPercent}%
                    </label>
                    <input
                      type="range"
                      min="70"
                      max="95"
                      value={lawyerSplitPercent}
                      onChange={e => setLawyerSplitPercent(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-[#2A2545]">
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Repasse Advogado ({lawyerSplitPercent}%)</div>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                        R$ {splitResult.lawyerAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">Taxa Tecnologia ({100 - lawyerSplitPercent}%)</div>
                      <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
                        R$ {splitResult.platformAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
