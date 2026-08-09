import React, { useState, useEffect } from 'react';
import { PaymentMethod, processPayment, PaymentResponse } from '../../lib/paymentGateway';
import { EscrowService } from '../../services/escrowService';
import { NotificationService } from '../../services/notificationService';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  lawyerName: string;
  lawyerId: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  caseId?: string;
  caseTitle?: string;
  onPaymentSuccess?: (response: PaymentResponse) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  lawyerName,
  lawyerId,
  clientName,
  clientId,
  clientEmail,
  caseId,
  caseTitle,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [enableEscrow, setEnableEscrow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Cartão de Crédito State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(clientName);
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState('1');

  // PIX Countdown (15 min)
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (result && result.method === 'pix') {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await processPayment({
        amount,
        description,
        method,
        payerName: clientName,
        payerCpfEmail: clientEmail,
        lawyerId,
        caseId,
        enableEscrow,
      });

      setResult(resp);

      // Se pagamento imediato (Cartão de Crédito), registra no Escrow
      if (resp.status === 'approved' && enableEscrow) {
        await EscrowService.createEscrow({
          transactionId: resp.transactionId,
          clientId,
          clientName,
          lawyerId,
          lawyerName,
          caseId,
          caseTitle,
          amount,
        });

        await NotificationService.dispatch({
          recipientEmail: clientEmail,
          title: 'Depósito em Escrow Confirmado — Legis Connect',
          body: `Seu pagamento de R$ ${amount.toFixed(2)} foi recebido com sucesso e está mantido em custódia segura até a entrega do serviço pelo advogado ${lawyerName}.`,
          channel: 'email',
          type: 'ESCROW_DEPOSITED',
        });
      }

      onPaymentSuccess?.(resp);
    } catch (err) {
      console.error('[PaymentCheckoutModal] Erro ao processar pagamento', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold font-montserrat flex items-center gap-2">
              💳 Checkout Seguro
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                SSL 256-bit
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Resumo do Valor */}
        <div className="px-5 py-3 bg-indigo-950/30 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Profissional Contratado</span>
            <span className="text-sm font-semibold text-slate-200">{lawyerName}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total a Pagar</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              R$ {amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 overflow-y-auto flex-1">
          {!result ? (
            <form onSubmit={handlePay} className="space-y-5">
              {/* Seleção de Método */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('pix')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'pix'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">⚡</span>
                    <span className="text-xs">PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('credit_card')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'credit_card'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">💳</span>
                    <span className="text-xs">Cartão de Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('boleto')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      method === 'boleto'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">📄</span>
                    <span className="text-xs">Boleto Bancário</span>
                  </button>
                </div>
              </div>

              {/* Opção de Escrow (Conta Garantia) */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="escrow-toggle"
                  checked={enableEscrow}
                  onChange={e => setEnableEscrow(e.target.checked)}
                  className="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <label htmlFor="escrow-toggle" className="text-xs cursor-pointer">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5 mb-0.5">
                    🛡️ Proteger Pagamento com Escrow (Conta Garantia Legis)
                  </span>
                  <span className="text-slate-400 block leading-relaxed">
                    Seu dinheiro fica retido com a Legis Connect e só é repassado ao advogado após a prestação da consultoria ou aceite do serviço.
                  </span>
                </label>
              </div>

              {/* Formulário de Cartão de Crédito */}
              {method === 'credit_card' && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nome no Cartão</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Validade</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">CVV</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Parcelas</label>
                      <select
                        value={installments}
                        onChange={e => setInstallments(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="1">1x R$ {amount.toFixed(2)}</option>
                        <option value="2">2x R$ {(amount / 2).toFixed(2)}</option>
                        <option value="3">3x R$ {(amount / 3).toFixed(2)}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Finalizar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>🔄 Processando Pagamento...</>
                ) : (
                  <>🔒 Pagar R$ {amount.toFixed(2)} Agora</>
                )}
              </button>
            </form>
          ) : (
            /* Tela de Resultado / Pagamento Processado */
            <div className="space-y-5 text-center">
              {result.status === 'approved' ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="text-3xl block mb-2">🎉</span>
                  <h3 className="font-bold text-lg mb-1">Pagamento Confirmado!</h3>
                  <p className="text-xs text-emerald-400">
                    ID Transação: <code className="font-mono bg-emerald-950 px-2 py-0.5 rounded">{result.transactionId}</code>
                  </p>
                  {result.escrowStatus === 'in_escrow_custody' && (
                    <p className="text-xs text-emerald-300/80 mt-2 font-medium">
                      🛡️ Fundos mantidos em Conta Garantia (Escrow) até a prestação do serviço.
                    </p>
                  )}
                </div>
              ) : result.method === 'pix' ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                    <span>⚡ Expira em: <strong className="font-mono">{formatTime(timeLeft)}</strong></span>
                    <span className="text-amber-400 font-semibold">Aguardando Pagamento</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
                    <div className="w-44 h-44 bg-slate-900 rounded flex items-center justify-center text-xs text-white font-mono p-2 text-center">
                      QR CODE PIX<br />R$ {amount.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">PIX Copia e Cola</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={result.pixCopiaECola}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(result.pixCopiaECola || '')}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg shrink-0 transition"
                      >
                        {copiedCode ? '✓ Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Boleto Bancário */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    📄 Boleto Gerado com Sucesso! Vencimento em 3 dias úteis.
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Linha Digitável</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={result.barcode}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(result.barcode || '')}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg shrink-0 transition"
                      >
                        {copiedCode ? '✓ Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Fechar Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
