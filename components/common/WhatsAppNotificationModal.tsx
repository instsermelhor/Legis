import React, { useState } from 'react';
import { sendWhatsAppNotification, formatWhatsAppMessage, WhatsAppMessageRequest } from '../../lib/whatsappIntegration';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [clientName, setClientName] = useState('Maria Oliveira Santos');
  const [templateType, setTemplateType] = useState<WhatsAppMessageRequest['templateType']>('prazo_audiencia');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen) return null;

  const vars = {
    clientName,
    caseNumber: '00123-2024.8.26.0100',
    caseTitle: 'Ação de Alimentos c/c Guarda',
    date: '12/08/2026',
    time: '14:30',
    location: 'Sala 04 — Fórum Central Cível SP',
    amount: '1.500,00',
    pixCode: '00020126580014br.gov.bcb.pix0136legis-connect-12345',
    contractUrl: 'https://legisconnect.com.br/c/doc-9876',
    updateSummary: 'Decisão interlocutória deferiu a tutela provisória de urgência.',
  };

  const previewText = formatWhatsAppMessage(templateType, vars);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await sendWhatsAppNotification({
        phone,
        templateType,
        variables: vars,
      });
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 7 — WhatsApp Business API
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Disparo de Notificação Automática via WhatsApp
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          
          {/* Form */}
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Modelo de Mensagem (WhatsApp HSM)
              </label>
              <select
                value={templateType}
                onChange={e => setTemplateType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white"
              >
                <option value="prazo_audiencia">📅 Lembrete de Audiência / Prazo</option>
                <option value="cobranca_pix">💰 Cobrança PIX de Honorários</option>
                <option value="contrato_assinado">📄 Envio de Contrato p/ Assinatura</option>
                <option value="movimentacao_processo">🔔 Notificação de Movimentação Processual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Número do WhatsApp (com DDD)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            {sendSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl animate-in fade-in">
                ✓ Mensagem enviada com sucesso para {phone} via WhatsApp Business API!
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📲</span>
              <span>{isSending ? 'Enviando WhatsApp...' : 'Enviar Notificação pelo WhatsApp'}</span>
            </button>
          </form>

          {/* Smartphone Live Preview */}
          <div className="bg-[#0b141a] p-4 rounded-3xl border border-gray-800 flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  LC
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Legis Connect Bot</div>
                  <div className="text-[9px] text-emerald-400">Conta Comercial Oficial ✓</div>
                </div>
              </div>
            </div>

            {/* Bubble Message */}
            <div className="bg-[#202c33] text-gray-100 p-3.5 rounded-2xl text-xs whitespace-pre-wrap font-sans leading-relaxed shadow my-auto">
              {previewText}
            </div>

            <div className="text-[10px] text-gray-500 text-center mt-3">
              🔒 Notificação oficial enviada via Meta WhatsApp Business Cloud API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
