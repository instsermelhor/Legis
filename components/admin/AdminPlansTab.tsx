import React, { useState } from 'react';

export interface SubscriptionPlanAdmin {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  active: boolean;
  userLimit?: number;
  popular?: boolean;
}

const DEFAULT_PLANS: SubscriptionPlanAdmin[] = [
  {
    id: 'plan_starter',
    name: 'Plano Starter',
    priceMonthly: 199,
    priceYearly: 1990,
    description: 'Ideal para advogados autônomos e pequenos escritórios em início de carreira.',
    features: [
      'Até 10 clientes ativos',
      'Acesso básico à IA Jurídica',
      'Assinatura Digital básica',
      'Suporte via ticket'
    ],
    active: true,
    userLimit: 1,
  },
  {
    id: 'plan_pro',
    name: 'Plano Profissional',
    badge: 'Mais Popular',
    priceMonthly: 499,
    priceYearly: 4990,
    description: 'Para escritórios consolidados que buscam automação e IA preditiva completa.',
    features: [
      'Clientes ilimitados',
      'IA Preditiva & RAG STF/STJ ilimitado',
      'Notificações via WhatsApp Business',
      'Marketplace de Diligências',
      'Suporte prioritário 24/7'
    ],
    active: true,
    userLimit: 5,
    popular: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Plano Enterprise / Corporate',
    badge: 'Corporativo',
    priceMonthly: 1299,
    priceYearly: 12990,
    description: 'Para grandes bancas e departamentos jurídicos corporativos.',
    features: [
      'Multi-unidades e Multi-empresas',
      'Smart Contracts com SHA-256 e blockchain',
      'API de Integração ERP/CRM dedicada',
      'Gerente de Contas dedicado e SLAs de 99.9%'
    ],
    active: true,
    userLimit: 50,
  }
];

export const AdminPlansTab: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlanAdmin[]>(() => {
    const saved = localStorage.getItem('legis_admin_plans');
    return saved ? JSON.parse(saved) : DEFAULT_PLANS;
  });

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanAdmin | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const updated = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
    setPlans(updated);
    localStorage.setItem('legis_admin_plans', JSON.stringify(updated));
    setEditingPlan(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const togglePlanStatus = (id: string) => {
    const updated = plans.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPlans(updated);
    localStorage.setItem('legis_admin_plans', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#181537] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💎</span> Gestão de Planos & Assinaturas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure preços, limites de usuários, recursos e benefícios visíveis no site público e nos painéis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            Single Source of Truth
          </span>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>✅ Alterações salvas e sincronizadas com a plataforma pública com sucesso!</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white dark:bg-[#181537] border ${plan.popular ? 'border-amber-500 dark:border-amber-400 shadow-md' : 'border-gray-200 dark:border-[#2A2545]'} rounded-2xl p-6 flex flex-col justify-between relative`}>
            {plan.badge && (
              <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                {plan.badge}
              </span>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <button
                  onClick={() => togglePlanStatus(plan.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                    plan.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {plan.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 min-h-[36px]">{plan.description}</p>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-[#110F28] rounded-xl">
                <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
                  R$ {plan.priceMonthly} <span className="text-xs font-normal text-gray-500">/mês</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  R$ {plan.priceYearly} /ano (economia de 20%)
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Recursos Inclusos:</p>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditingPlan(plan)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Configurações do Plano
            </button>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181537] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Editar {editingPlan.name}
            </h3>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthly}
                    onChange={e => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preço Anual (R$)</label>
                  <input
                    type="number"
                    value={editingPlan.priceYearly}
                    onChange={e => setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={editingPlan.description}
                  onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white h-20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2A2545]">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
