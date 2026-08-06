import React, { useState } from 'react';
import { SAAS_PLANS, PlanConfig, processPayment } from '../../lib/paymentGateway';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (planId: string) => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onPlanSelected,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setIsProcessing(true);

    const amount = billingCycle === 'yearly' ? plan.priceYearly * 12 : plan.priceMonthly;

    try {
      const res = await processPayment({
        amount,
        description: `Assinatura Plano ${plan.name} (${billingCycle === 'yearly' ? 'Anual' : 'Mensal'})`,
        method: 'credit_card',
        payerName: 'Advogado Assinante',
        payerCpfEmail: 'advogado@legisconnect.com.br',
      });

      if (res.status === 'approved') {
        setPaymentSuccess(true);
        if (onPlanSelected) onPlanSelected(plan.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border-b border-gray-200 dark:border-[#2A2545] text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
          
          <span className="bg-primary/10 text-primary dark:text-primary-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Planos SaaS & Upgrade
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            Escolha o Plano Ideal para seu Escritório
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto mt-1">
            Potencialize sua advocacia com Inteligência Artificial, gestão automatizada de processos e pagamentos integrados.
          </p>

          {/* Billing Cycle Toggle Switch */}
          <div className="inline-flex items-center bg-gray-200 dark:bg-[#252040] p-1 rounded-2xl mt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-primary text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Cobrança Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Cobrança Anual
              <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Payment Success View */}
        {paymentSuccess ? (
          <div className="p-12 text-center my-auto">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assinatura Ativada com Sucesso!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
              Seu plano **{selectedPlan?.name}** foi ativado. Seus tokens de IA e limite de clientes já foram atualizados.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
            >
              Acessar Plataforma
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
            {SAAS_PLANS.map(plan => {
              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? 'bg-gradient-to-b from-primary/10 to-transparent border-primary ring-2 ring-primary/40 shadow-xl'
                      : 'bg-gray-50/50 dark:bg-[#151226] border-gray-200 dark:border-[#252040]'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      Mais Popular
                    </span>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-xs text-gray-400">R$</span>
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        Faturado R$ {(plan.priceYearly * 12).toFixed(2).replace('.', ',')} /ano
                      </div>
                    )}

                    <div className="my-6 border-t border-gray-200 dark:border-[#2A2545]" />

                    <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isProcessing}
                    className={`w-full mt-8 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                    }`}
                  >
                    {isProcessing && selectedPlan?.id === plan.id ? 'Processando Pagamento...' : 'Assinar Este Plano'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="p-4 bg-gray-50 dark:bg-[#141126] border-t border-gray-200 dark:border-[#2A2545] text-center text-xs text-gray-500 flex items-center justify-center gap-4">
          <span>🔒 Pagamento 100% Seguro com Criptografia SSL</span>
          <span>•</span>
          <span>⚖️ Split Ético de Honorários OAB</span>
          <span>•</span>
          <span>💳 Suporta PIX & Cartão de Crédito</span>
        </div>
      </div>
    </div>
  );
};
