import React, { useState } from 'react';

export const AdminWhatsappTab: React.FC = () => {
  const [phone, setPhone] = useState('+55 11 98888-7777');
  const [apiKey, setApiKey] = useState('');
  const [templateAppointments, setTemplateAppointments] = useState(true);
  const [templatePaymentReminders, setTemplatePaymentReminders] = useState(true);
  const [templateCaseUpdates, setTemplateCaseUpdates] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#181537] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2545] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📲</span> Central WhatsApp Business API
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie o número oficial, chaves de API, webhooks e templates de notificação automática para advogados e clientes.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          API Conectada (Meta WABA)
        </span>
      </div>

      {saveToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>✅ Configurações e templates do WhatsApp salvos com sucesso!</span>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Notificações Enviadas (Mês)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">32.450</div>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Taxa de Entrega: 99,8%</span>
        </div>

        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Tempo Médio de Leitura</span>
          <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">1,8 min</div>
          <span className="text-[11px] text-emerald-500 font-bold mt-1 inline-block">Engajamento 4x maior que e-mail</span>
        </div>

        <div className="bg-white dark:bg-[#181537] p-5 rounded-2xl border border-gray-200 dark:border-[#2A2545]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Webhooks Ativos</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">4 Canais</div>
          <span className="text-[11px] text-gray-500 mt-1 inline-block">Status: Sincronizado</span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#181537] p-6 rounded-2xl border border-gray-200 dark:border-[#2A2545] space-y-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Credenciais da API Oficial</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Número WhatsApp Business Oficial</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Token de Acesso permanente (WABA)</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#110F28] border border-gray-300 dark:border-[#2A2545] text-sm text-gray-900 dark:text-white font-mono"
              required
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#2A2545]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Gatilhos de Envio Automático (HSM Approved):</h4>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tpl1"
              checked={templateAppointments}
              onChange={e => setTemplateAppointments(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="tpl1" className="text-sm text-gray-800 dark:text-gray-200">
              Lembretes automáticos de agendamento de consultas (24h e 2h antes)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tpl2"
              checked={templatePaymentReminders}
              onChange={e => setTemplatePaymentReminders(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="tpl2" className="text-sm text-gray-800 dark:text-gray-200">
              Confirmação de pagamento de honorários e emissão de recibo/PIX
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tpl3"
              checked={templateCaseUpdates}
              onChange={e => setTemplateCaseUpdates(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="tpl3" className="text-sm text-gray-800 dark:text-gray-200">
              Notificação de movimentação processual relevante (DJEN/DataJud)
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Salvar Configurações WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
};
