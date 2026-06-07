import React, { useState } from 'react';

const ALL_APIS = [
  { id: 'whatsapp', label: 'WhatsApp Business API', icon: '💬', description: 'Mensagens automáticas aos clientes via WhatsApp.' },
  { id: 'gcal', label: 'Google Calendar', icon: '📅', description: 'Sincronização de agenda com Google Calendar.' },
  { id: 'ms365', label: 'Microsoft 365 / Outlook', icon: '📧', description: 'Integração com Outlook Calendar e OneDrive.' },
  { id: 'viacep', label: 'ViaCEP', icon: '📮', description: 'Preenchimento automático de endereços via CEP.' },
  { id: 'jusbrasil', label: 'JusBrasil API', icon: '⚖️', description: 'Consulta de processos judiciais e jurisprudência.' },
  { id: 'cnj', label: 'CNJ — Datajud', icon: '🏛️', description: 'Dados processuais do Conselho Nacional de Justiça.' },
  { id: 'receita', label: 'Receita Federal (CPF/CNPJ)', icon: '🇧🇷', description: 'Validação de CPF e CNPJ.' },
  { id: 'openai', label: 'OpenAI (IA Jurídica)', icon: '🤖', description: 'Assistência jurídica com IA para redação de peças.' },
  { id: 'stripe', label: 'Stripe (Pagamentos)', icon: '💳', description: 'Processamento de pagamentos online.' },
  { id: 'zapsign', label: 'ZapSign (Assinatura Digital)', icon: '✍️', description: 'Assinaturas digitais em documentos e contratos.' },
];

/** Read-only status panel: shows which APIs are active (from admin config) */
export const ApiStatusPanel: React.FC = () => {
  const enabledApis: Record<string, boolean> = (() => {
    try { return JSON.parse(localStorage.getItem('legis_api_enabled') || '{}'); } catch { return {}; }
  })();

  const active = ALL_APIS.filter(a => enabledApis[a.id]);
  const inactive = ALL_APIS.filter(a => !enabledApis[a.id]);

  return (
    <div className="space-y-5">
      {/* Active APIs */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          ✅ Ativas ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-100">
            Nenhuma API ativada pelo administrador ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.map(api => (
              <div key={api.id} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <span className="text-xl shrink-0">{api.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{api.label}</p>
                  <p className="text-xs text-gray-500 truncate">{api.description}</p>
                </div>
                <span className="ml-auto shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Ativo</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive APIs */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            ⬜ Inativas ({inactive.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inactive.map(api => (
              <div key={api.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg shrink-0 grayscale">{api.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-600 truncate">{api.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        As integrações são habilitadas pelo Administrador em Configurações → Conexão com APIs.
      </p>
    </div>
  );
};
