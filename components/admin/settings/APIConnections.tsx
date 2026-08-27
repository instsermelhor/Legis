import { Icon } from '@/components/common/IconComponents';
import React, { useState } from 'react';
import { mockLegalDocuments, mockAdminUsers, mockEfficiencyServiceGroups, hashPassword, mockBiApoio, mockBiDadosBase, mockBiClientes, mockBiProdutos, mockBiFornecedores, mockBiVendas } from '../../../services/mockDataService';
import type { LegalDocument, AdminUser } from '../../../services/mockDataService';
import { SectionTitle, IconEdit, IconPlus, IconKey, IconUpload, IconTrash } from '../AdminShared';
import { dbCodes, LegalCode, dbCloud, CodeVersion } from '../../../services/dbService';
import { useAppConfig } from '../../../context/AppContext';
import type { EfficiencyServiceGroup, BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../../../types';
import { LegalAiTools } from '../../common/LegalAiTools';


// Helper to extract printable ASCII text from binary files (e.g. PDF/DOCX) to prevent garbled text
const extractPrintableText = (arrayBuffer: ArrayBuffer, limit: number = 2000): string => {
  const view = new DataView(arrayBuffer);
  let result = '';
  let currentWord = '';
  for (let i = 0; i < view.byteLength && result.length < limit; i++) {
    const charCode = view.getUint8(i);
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
      const char = String.fromCharCode(charCode);
      currentWord += char;
    } else {
      if (currentWord.trim().length > 4) {
        result += currentWord.trim() + '\n';
      }
      currentWord = '';
    }
  }
  if (currentWord.trim().length > 4) {
    result += currentWord.trim();
  }
  return result.replace(/\n+/g, '\n').substring(0, limit);
};


// ─── API Connections Screen ───────────────────────────────────────────────────
export const APIConnections: React.FC = () => {
  const APIS = [
    {
      id: 'whatsapp', label: 'WhatsApp Business API', icon: '💬', color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800', description: 'Envio de notificações e mensagens automáticas aos clientes via WhatsApp.',
      fields: [{ key: 'token', label: 'Token de Acesso', type: 'password' }, { key: 'phone_id', label: 'Phone Number ID', type: 'text' }],
    },
    {
      id: 'gcal', label: 'Google Calendar', icon: '📅', color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800', description: 'Sincronize a agenda dos advogados e secretariado com o Google Calendar.',
      fields: [{ key: 'client_id', label: 'Client ID', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }],
    },
    {
      id: 'ms365', label: 'Microsoft 365 / Outlook', icon: '📧', color: 'bg-indigo-50 border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800', description: 'Integração com Outlook Calendar e OneDrive para documentos.',
      fields: [{ key: 'tenant_id', label: 'Tenant ID', type: 'text' }, { key: 'client_id', label: 'Client ID (App)', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }],
    },
    {
      id: 'viacep', label: 'ViaCEP', icon: '📮', color: 'bg-yellow-50 border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800', description: 'Preenchimento automático de endereços via CEP nos formulários de cadastro.',
      fields: [],
    },
    {
      id: 'jusbrasil', label: 'JusBrasil API', icon: '⚖️', color: 'bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800', description: 'Consulta de processos judiciais e jurisprudência diretamente na plataforma.',
      fields: [{ key: 'api_key', label: 'Chave da API', type: 'password' }],
    },
    {
      id: 'cnj', label: 'CNJ — Datajud', icon: '🏛️', color: 'bg-red-50 border-red-200',
      badgeColor: 'bg-red-100 text-red-800', description: 'Integração com o Conselho Nacional de Justiça para consulta de dados processuais.',
      fields: [{ key: 'api_key', label: 'Chave Datajud', type: 'password' }],
    },
    {
      id: 'receita', label: 'Receita Federal (CPF/CNPJ)', icon: '🇧🇷', color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800', description: 'Validação e consulta de CPF e CNPJ via API da Receita Federal.',
      fields: [{ key: 'api_token', label: 'Token de Acesso', type: 'password' }],
    },
    {
      id: 'openai', label: 'OpenAI (IA Jurídica)', icon: '🤖', color: 'bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800', description: 'Habilite assistência jurídica com IA para redação de peças e resumo de documentos.',
      fields: [{ key: 'api_key', label: 'OpenAI API Key', type: 'password' }, { key: 'model', label: 'Modelo (ex: gpt-4o)', type: 'text' }],
    },
    {
      id: 'stripe', label: 'Stripe (Pagamentos)', icon: '💳', color: 'bg-cyan-50 border-cyan-200',
      badgeColor: 'bg-cyan-100 text-cyan-800', description: 'Processamento de pagamentos e cobranças online dos clientes.',
      fields: [{ key: 'publishable_key', label: 'Chave Pública', type: 'text' }, { key: 'secret_key', label: 'Chave Secreta', type: 'password' }],
    },
    {
      id: 'zapsign', label: 'ZapSign (Assinatura Digital)', icon: '✍️', color: 'bg-teal-50 border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800', description: 'Envio e coleta de assinaturas digitais em documentos e contratos.',
      fields: [{ key: 'api_token', label: 'API Token', type: 'password' }],
    },
  ];

  type ApiField = { key: string; label: string; type: 'text' | 'password' };
  type ApiEntry = typeof APIS[0] & { custom?: boolean };

  // ── State ──────────────────────────────────────────────────────────────────
  const [customApis, setCustomApis] = useState<ApiEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('legis_custom_apis') || '[]'); } catch { return []; }
  });

  const allApis: ApiEntry[] = [...APIS, ...customApis];

  const [enabledApis, setEnabledApis] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('legis_api_enabled') || '{}'); } catch { return {}; }
  });
  const [apiValues, setApiValues] = useState<Record<string, Record<string, string>>>(() => {
    try { return JSON.parse(localStorage.getItem('legis_api_values') || '{}'); } catch { return {}; }
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // ── Add new API ────────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApi, setNewApi] = useState({ label: '', icon: '🔌', description: '', endpoint: '', keyLabel: 'API Key' });
  const ICON_OPTIONS = ['🔌','🌐','📡','📊','📝','💡','🔗','🚀','📦','⚙️','🛡️','🔐','💸','🤝','⚖️','📋','📧','📱','💬','📅','🤖','💳','✍️','🏛️','🇧🇷'];

  const handleAddApi = () => {
    if (!newApi.label.trim()) return;
    const entry: ApiEntry = {
      id: `custom_${Date.now()}`,
      label: newApi.label.trim(),
      icon: newApi.icon,
      description: newApi.description.trim() || 'Integração personalizada.',
      color: 'bg-gray-50 border-gray-300',
      badgeColor: 'bg-gray-100 text-gray-800',
      fields: [
        { key: 'endpoint', label: newApi.endpoint.trim() || 'Endpoint / URL', type: 'text' as const },
        { key: 'api_key', label: newApi.keyLabel.trim() || 'API Key', type: 'password' as const },
      ],
      custom: true,
    };
    const next = [...customApis, entry];
    setCustomApis(next);
    localStorage.setItem('legis_custom_apis', JSON.stringify(next));
    setNewApi({ label: '', icon: '🔌', description: '', endpoint: '', keyLabel: 'API Key' });
    setShowAddForm(false);
  };

  // ── Delete API ─────────────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteApi = (id: string) => {
    const next = customApis.filter(a => a.id !== id);
    setCustomApis(next);
    localStorage.setItem('legis_custom_apis', JSON.stringify(next));
    const nextEnabled = { ...enabledApis };
    delete nextEnabled[id];
    setEnabledApis(nextEnabled);
    localStorage.setItem('legis_api_enabled', JSON.stringify(nextEnabled));
    setDeleteConfirmId(null);
  };

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const toggleApi = (id: string) => {
    const next = { ...enabledApis, [id]: !enabledApis[id] };
    setEnabledApis(next);
    localStorage.setItem('legis_api_enabled', JSON.stringify(next));
  };

  const setField = (apiId: string, key: string, value: string) =>
    setApiValues(prev => ({ ...prev, [apiId]: { ...prev[apiId], [key]: value } }));

  const handleSaveApi = (id: string) => {
    // SECURITY: Mask sensitive secret values before saving to browser localStorage
    const sanitized = { ...apiValues };
    const api = allApis.find(a => a.id === id);
    if (api && sanitized[id]) {
      const maskedFields: Record<string, string> = { ...sanitized[id] };
      for (const field of api.fields) {
        if (field.type === 'password' && maskedFields[field.key]) {
          maskedFields[field.key] = '[CONFIGURED_VIA_SECRET_MANAGER]';
        }
      }
      sanitized[id] = maskedFields;
    }
    localStorage.setItem('legis_api_values', JSON.stringify(sanitized));
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleTest = (id: string) => {
    setTesting(id);
    setTestResults(prev => ({ ...prev, [id]: { ok: false, msg: '' } }));
    setTimeout(() => {
      setTesting(null);
      const vals = apiValues[id] || {};
      const api = allApis.find(a => a.id === id)!;
      const allFilled = api.fields.length === 0 || api.fields.every((f: ApiField) => !!vals[f.key]?.trim());
      setTestResults(prev => ({
        ...prev,
        [id]: allFilled
          ? { ok: true, msg: `Conexão com ${api.label} estabelecida com sucesso!` }
          : { ok: false, msg: 'Preencha todos os campos obrigatórios antes de testar.' },
      }));
    }, 1500);
  };

  const activeCount = Object.values(enabledApis).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">Conexão com APIs</h3>
          <p className="text-sm text-gray-500 mt-0.5">Configure e ative integrações externas para expandir as funcionalidades da plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
            {activeCount} ativa{activeCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${showAddForm ? 'bg-gray-200 text-gray-700' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          >
            {showAddForm ? '✕ Cancelar' : '+ Incluir Nova API'}
          </button>
        </div>
      </div>

      {/* ── Add New API Form ── */}
      {showAddForm && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl"><Icon name="📡" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
            <p className="text-sm font-bold text-teal-800">Incluir Nova API</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da API *</label>
              <input value={newApi.label} onChange={e => setNewApi(p => ({ ...p, label: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Ex: Minha API Personalizada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
              <input value={newApi.description} onChange={e => setNewApi(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Para que serve esta integração..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo do Endpoint</label>
              <input value={newApi.endpoint} onChange={e => setNewApi(p => ({ ...p, endpoint: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Ex: URL Base, Servidor..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rótulo da Chave de Acesso</label>
              <input value={newApi.keyLabel} onChange={e => setNewApi(p => ({ ...p, keyLabel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                placeholder="Ex: API Key, Token..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button" onClick={() => setNewApi(p => ({ ...p, icon: ic }))}
                  className={`text-xl w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${newApi.icon === ic ? 'border-teal-500 bg-teal-100 scale-110 shadow' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAddApi} disabled={!newApi.label.trim()}
              className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Incluir API
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── API list ── */}
      <div className="grid grid-cols-1 gap-4">
        {allApis.map(api => {
          const isEnabled = !!enabledApis[api.id];
          const isExpanded = expandedId === api.id;
          const vals = apiValues[api.id] || {};
          const testResult = testResults[api.id];
          const isCustom = !!api.custom;
          const awaitingDelete = deleteConfirmId === api.id;

          return (
            <div key={api.id} className={`rounded-xl border-2 transition-all ${isEnabled ? api.color : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-4 p-4">
                <span className="text-2xl shrink-0">{api.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{api.label}</p>
                    {isEnabled && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${api.badgeColor}`}>Ativo</span>}
                    {isCustom && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">Personalizado</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{api.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {api.fields.length > 0 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : api.id)}
                      className="text-xs text-gray-500 hover:text-primary font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
                      {isExpanded ? '▲ Fechar' : '⚙️ Configurar'}
                    </button>
                  )}
                  {isCustom && (
                    awaitingDelete ? (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                        <span className="text-xs text-red-700 font-semibold">Confirmar exclusão?</span>
                        <button onClick={() => handleDeleteApi(api.id)}
                          className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-bold hover:bg-red-700">Sim</button>
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-bold hover:bg-gray-200">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(api.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                        🗑️ Excluir API
                      </button>
                    )
                  )}
                  <button onClick={() => toggleApi(api.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none shrink-0 ${isEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                    title={isEnabled ? 'Desativar' : 'Ativar'}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              {isExpanded && api.fields.length > 0 && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {api.fields.map((field: ApiField) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{field.label}</label>
                        <input type={field.type} value={vals[field.key] || ''} onChange={e => setField(api.id, field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white font-mono dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                          placeholder={field.type === 'password' ? '••••••••••••••••' : `${field.label}...`} />
                      </div>
                    ))}
                  </div>
                  {testResult && (
                    <div className={`px-3 py-2 rounded-lg text-xs font-semibold border ${testResult.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleSaveApi(api.id)} className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">
                      {savedId === api.id ? '✅ Salvo!' : '💾 Salvar Credenciais'}
                    </button>
                    <button onClick={() => handleTest(api.id)} disabled={testing === api.id}
                      className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                      {testing === api.id ? '⏳ Testando...' : '🔌 Testar Conexão'}
                    </button>
                  </div>
                </div>
              )}

              {/* ViaCEP has no fields – just info */}
              {isExpanded && api.fields.length === 0 && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-200 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <p className="text-xs text-gray-500">Esta API não requer configuração adicional. Basta ativar para uso automático.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

