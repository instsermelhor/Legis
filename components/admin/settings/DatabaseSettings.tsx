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


// ─── Database Settings ────────────────────────────────────────────────────────
export const DatabaseSettings: React.FC = () => {
  const { config, updateConfig } = useAppConfig();
  const [dbType, setDbType] = useState(config.dbType || 'local');
  const [dbCloudProvider, setDbCloudProvider] = useState(config.dbCloudProvider || 'firebase');
  const [dbApiKey, setDbApiKey] = useState(config.dbApiKey || '');
  const [dbProjectUrl, setDbProjectUrl] = useState(config.dbProjectUrl || '');
  const [dbAuthDomain, setDbAuthDomain] = useState(config.dbAuthDomain || '');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Status for Local and Cloud connections
  const [localStatus, setLocalStatus] = useState<'connected' | 'failed' | 'not_connected'>(() => {
    const savedStatus = localStorage.getItem('legis_db_local_status');
    if (savedStatus) return savedStatus as 'connected' | 'failed' | 'not_connected';
    return config.dbType === 'local' ? 'connected' : 'not_connected';
  });

  const [cloudStatus, setCloudStatus] = useState<'connected' | 'failed' | 'not_connected'>(() => {
    const savedStatus = localStorage.getItem('legis_db_cloud_status');
    if (savedStatus) return savedStatus as 'connected' | 'failed' | 'not_connected';
    return config.dbType === 'cloud' ? 'not_connected' : 'not_connected';
  });

  const updateLocalStatus = (status: 'connected' | 'failed' | 'not_connected') => {
    setLocalStatus(status);
    localStorage.setItem('legis_db_local_status', status);
  };

  const updateCloudStatus = (status: 'connected' | 'failed' | 'not_connected') => {
    setCloudStatus(status);
    localStorage.setItem('legis_db_cloud_status', status);
  };

  const handleSave = () => {
    updateConfig({
      dbType,
      dbCloudProvider,
      dbApiKey,
      dbProjectUrl,
      dbAuthDomain,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    if (dbType === 'local') {
      updateLocalStatus('connected');
    } else {
      updateLocalStatus('not_connected');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (dbType === 'local') {
        setTesting(false);
        setTestResult({
          type: 'success',
          message: 'Conexão local (localStorage) estabelecida com sucesso! Status: Ativo e operacional.'
        });
        updateLocalStatus('connected');
        updateCloudStatus('not_connected');
      } else {
        if (!dbApiKey || !dbProjectUrl) {
          setTesting(false);
          setTestResult({
            type: 'error',
            message: 'Erro ao conectar na nuvem: Chave da API e URL do Projeto são obrigatórias.'
          });
          updateCloudStatus('failed');
          updateLocalStatus('not_connected');
        } else {
          const ok = await dbCloud.testConnection(dbCloudProvider, dbApiKey, dbProjectUrl);
          setTesting(false);
          if (ok) {
            setTestResult({
              type: 'success',
              message: `Conexão de teste com ${dbCloudProvider === 'firebase' ? 'Firebase Firestore' : 'Supabase PostgreSQL'} bem-sucedida!`
            });
            updateCloudStatus('connected');
            updateLocalStatus('not_connected');
          } else {
            setTestResult({
              type: 'error',
              message: `Falha na conexão com ${dbCloudProvider === 'firebase' ? 'Firebase' : 'Supabase'}. Verifique as credenciais e tente novamente.`
            });
            updateCloudStatus('failed');
            updateLocalStatus('not_connected');
          }
        }
      }
    } catch (e) {
      setTesting(false);
      setTestResult({
        type: 'error',
        message: `Erro ao testar conexão: ${e instanceof Error ? e.message : String(e)}`
      });
      if (dbType === 'local') {
        updateLocalStatus('failed');
      } else {
        updateCloudStatus('failed');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
      <div>
        <h3 className="text-base font-bold text-gray-800">Conexão de Banco de Dados</h3>
        <p className="text-sm text-gray-500">Configure as conexões locais ou em nuvem para sincronização em tempo real de dados jurídicos.</p>
      </div>

      {/* Connectivity Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] p-4 rounded-xl">
        {/* Local Connection Indicator */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-lg"><Icon name="💻" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Conexão Local</p>
              <p className="text-[10px] text-gray-500">localStorage do Navegador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full inline-block animate-pulse ${
              localStatus === 'connected' ? 'bg-emerald-500 shadow-sm shadow-emerald-400' :
              localStatus === 'failed' ? 'bg-amber-500 shadow-sm shadow-amber-400' :
              'bg-rose-500 shadow-sm shadow-rose-400'
            }`} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {localStatus === 'connected' && 'Conectado'}
              {localStatus === 'failed' && 'Falha ao Conectar'}
              {localStatus === 'not_connected' && 'Não Conectado'}
            </span>
          </div>
        </div>

        {/* Cloud Connection Indicator */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-lg"><Icon name="☁" className="w-4 h-4 inline-block mr-1 align-text-bottom" />️</span>
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Conexão Nuvem</p>
              <p className="text-[10px] text-gray-500">Firebase / Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full inline-block animate-pulse ${
              cloudStatus === 'connected' ? 'bg-emerald-500 shadow-sm shadow-emerald-400' :
              cloudStatus === 'failed' ? 'bg-amber-500 shadow-sm shadow-amber-400' :
              'bg-rose-500 shadow-sm shadow-rose-400'
            }`} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {cloudStatus === 'connected' && 'Conectado'}
              {cloudStatus === 'failed' && 'Falha ao Conectar'}
              {cloudStatus === 'not_connected' && 'Não Conectado'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo de Armazenamento/Conexão</label>
          <select
            value={dbType}
            onChange={e => { setDbType(e.target.value as 'local' | 'cloud'); setTestResult(null); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white p-2 border dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
          >
            <option value="local">Banco de Dados Local (localStorage - Offline Primeiro)</option>
            <option value="cloud">Banco de Dados em Nuvem (Firebase / Supabase)</option>
          </select>
        </div>

        {dbType === 'cloud' && (
          <div className="bg-gray-50 dark:bg-[#201C3D] border border-gray-200 dark:border-[#2A2545] p-4 rounded-xl space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Configurações de Credenciais da Nuvem</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Provedor Cloud</label>
                <select
                  value={dbCloudProvider}
                  onChange={e => setDbCloudProvider(e.target.value as 'firebase' | 'supabase')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                >
                  <option value="firebase">Firebase Firestore</option>
                  <option value="supabase">Supabase PostgreSQL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chave da API (API Key) *</label>
                <input
                  type="password"
                  value={dbApiKey}
                  onChange={e => setDbApiKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ID do Projeto / URL do Projeto *</label>
                <input
                  type="text"
                  value={dbProjectUrl}
                  onChange={e => setDbProjectUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="https://sua-app.supabase.co ou project-id"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domínio de Autenticação (Auth Domain)</label>
                <input
                  type="text"
                  value={dbAuthDomain}
                  onChange={e => setDbAuthDomain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none bg-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white p-1"
                  placeholder="sua-app.firebaseapp.com"
                />
              </div>
            </div>

            {dbCloudProvider === 'firebase' && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2a243d] dark:to-[#221c33] border border-amber-200 dark:border-[#3d3159] p-4 rounded-xl mt-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <span><Icon name="🔑" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
                  <span>Guia de Acesso e Configuração do Firebase</span>
                </div>
                
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                  <p>
                    Como as políticas de segurança do Google bloqueiam logins automatizados por segurança, você precisará copiar as chaves do Console do Firebase. Siga o passo a passo abaixo:
                  </p>
                  
                  <div className="space-y-2 pl-1">
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">1</span>
                      <div>
                        Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Firebase Console</a>.
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">2</span>
                      <div className="flex-1">
                        Use as credenciais abaixo para entrar na conta do Google:
                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/70 dark:bg-[#1A1730]/65 p-2 rounded-lg border border-amber-100 dark:border-[#3d3159]">
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-gray-500">Email:</span>
                            <code className="bg-gray-100 dark:bg-[#201C3D] px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">legisconnectonline@gmail.com</code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('legisconnectonline@gmail.com');
                                alert('E-mail copiado!');
                              }}
                              className="text-primary hover:underline text-[10px] shrink-0"
                            >
                              Copiar
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-gray-500">Senha:</span>
                            <code className="bg-gray-100 dark:bg-[#201C3D] px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">@@Rk08266570#</code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('@@Rk08266570#');
                                alert('Senha copiada!');
                              }}
                              className="text-primary hover:underline text-[10px] shrink-0"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">3</span>
                      <div>
                        Selecione o projeto correspondente (ex: <strong>Legis Connect</strong>) no painel.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">4</span>
                      <div>
                        Clique no ícone de <strong>Engrenagem (Configurações do Projeto)</strong> no menu lateral esquerdo e selecione <strong>Configurações do projeto</strong>.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">5</span>
                      <div>
                        Na guia <strong>Geral</strong>, role até a seção <strong>Seus aplicativos</strong>. Copie os seguintes valores do bloco de código `firebaseConfig`:
                        <ul className="list-disc list-inside mt-1 space-y-0.5 pl-2 text-gray-600 dark:text-gray-400">
                          <li><code className="text-gray-800 dark:text-gray-200">apiKey</code> &rarr; Cole no campo <strong>Chave da API</strong> acima</li>
                          <li><code className="text-gray-800 dark:text-gray-200">projectId</code> &rarr; Cole no campo <strong>ID do Projeto / URL do Projeto</strong> acima</li>
                          <li><code className="text-gray-800 dark:text-gray-200">authDomain</code> &rarr; Cole no campo <strong>Domínio de Autenticação</strong> acima</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-amber-200 dark:bg-[#3d3159] text-amber-900 dark:text-amber-200 font-bold rounded-full text-[10px] shrink-0">6</span>
                      <div>
                        Clique em <strong>Salvar Conexão</strong> e depois em <strong><Icon name="🔌" className="w-4 h-4 inline-block mr-1 align-text-bottom" /> Testar Conexão</strong> para validar a sincronização.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Connection Links */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 text-xs text-gray-700">
          <p className="font-bold text-blue-900">Links Úteis para Configuração e Conexão:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Console de Gerenciamento Cloud: {' '}
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                Firebase Console (Firestore)
              </a>
              {' '} ou {' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                Supabase Dashboard (PostgreSQL)
              </a>
            </li>
            <li>
              Visualização de Banco de Dados Local: {' '}
              <button
                type="button"
                onClick={() => alert('Os dados locais estão armazenados no localStorage do seu navegador sob a chave "legis_lawyer_cases" e "legis_received_docs".')}
                className="text-primary hover:underline font-semibold"
              >
                Inspecionar localStorage Local
              </button>
            </li>
          </ul>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg border text-xs font-medium ${testResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {testResult.type === 'success' ? '✓ ' : '✗ '} {testResult.message}
          </div>
        )}


      </div>{/* end space-y-4 */}

      <div className="pt-4 border-t flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
        >
          {saved ? '✓ Salvo!' : 'Salvar Conexão'}
        </button>
        
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          {testing ? 'Testando...' : '🔌 Testar Conexão'}
        </button>
      </div>
    </div>
  );
};

