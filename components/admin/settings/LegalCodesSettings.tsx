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


// ─── Legal Codes Settings ─────────────────────────────────────────────────────
export const LegalCodesSettings: React.FC = () => {
  const [codes, setCodes] = useState<LegalCode[]>(() => dbCodes.getAll());
  const [editingVersionId, setEditingVersionId] = useState<{ codeId: string; versionId: string } | null>(null);
  const [editingVersionName, setEditingVersionName] = useState('');
  const [editingVersionContent, setEditingVersionContent] = useState('');
  const [newVersionName, setNewVersionName] = useState<Record<string, string>>({}); // codeId -> name
  const [saved, setSaved] = useState<string | null>(null);

  const handleActivateVersion = (codeId: string, versionId: string) => {
    const updated = dbCodes.activateVersion(codeId, versionId);
    setCodes(updated);
  };

  const handleDeleteVersion = (codeId: string, versionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta versão?')) {
      const updated = dbCodes.deleteVersion(codeId, versionId);
      setCodes(updated);
    }
  };

  const handleStartEditVersion = (codeId: string, version: CodeVersion) => {
    setEditingVersionId({ codeId, versionId: version.id });
    setEditingVersionName(version.name);
    setEditingVersionContent(version.content);
  };

  const handleSaveVersionEdit = () => {
    if (!editingVersionId) return;
    const { codeId, versionId } = editingVersionId;
    
    const updatedCodes = codes.map(c => {
      if (c.id === codeId) {
        const versions = (c.versions || []).map(v => 
          v.id === versionId 
            ? { ...v, name: editingVersionName, content: editingVersionContent, lastUpdated: new Date().toISOString().split('T')[0] } 
            : v
        );
        const isActive = c.activeVersionId === versionId;
        const updatedCode = {
          ...c,
          versions,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        if (isActive) {
          updatedCode.content = editingVersionContent;
          updatedCode.lastUpdated = new Date().toISOString().split('T')[0];
        }
        return updatedCode;
      }
      return c;
    });
    
    dbCodes.saveAll(updatedCodes);
    setCodes(updatedCodes);
    setEditingVersionId(null);
  };

  const handleVersionUpload = (codeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const versionName = newVersionName[codeId]?.trim() || `Versão ${new Date().toLocaleDateString('pt-BR')}`;
    if (!file) return;

    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.type === 'text/plain';
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    if (isTextFile) {
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const updated = dbCodes.addVersion(codeId, versionName, content, file.name, undefined, 'text');
        setCodes(updated);
        setSaved(codeId);
        setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
        setTimeout(() => setSaved(null), 2500);
      };
      reader.readAsText(file);
    } else if (isPdf) {
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = (dev) => {
        const dataUrl = dev.target?.result as string;
        const arrayBufferReader = new FileReader();
        arrayBufferReader.onload = (aev) => {
          const arrayBuffer = aev.target?.result as ArrayBuffer;
          const extractedText = extractPrintableText(arrayBuffer);
          const updated = dbCodes.addVersion(
            codeId,
            versionName,
            extractedText || `[Conteúdo PDF: ${file.name}]`,
            file.name,
            dataUrl,
            'pdf'
          );
          setCodes(updated);
          setSaved(codeId);
          setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
          setTimeout(() => setSaved(null), 2500);
        };
        arrayBufferReader.readAsArrayBuffer(file);
      };
      dataUrlReader.readAsDataURL(file);
    } else {
      const dataUrlReader = new FileReader();
      dataUrlReader.onload = (dev) => {
        const dataUrl = dev.target?.result as string;
        const arrayBufferReader = new FileReader();
        arrayBufferReader.onload = (aev) => {
          const arrayBuffer = aev.target?.result as ArrayBuffer;
          const extractedText = extractPrintableText(arrayBuffer);
          const updated = dbCodes.addVersion(
            codeId,
            versionName,
            extractedText || `[Conteúdo Binário: ${file.name}]`,
            file.name,
            dataUrl,
            'text'
          );
          setCodes(updated);
          setSaved(codeId);
          setNewVersionName(prev => ({ ...prev, [codeId]: '' }));
          setTimeout(() => setSaved(null), 2500);
        };
        arrayBufferReader.readAsArrayBuffer(file);
      };
      dataUrlReader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-800">Códigos Legais e Regulamentos</h3>
      <p className="text-sm text-gray-500">Gerencie múltiplas versões e faça o upload de arquivos PDF para leitura integrada.</p>

      <div className="space-y-4">
        {codes.map(code => (
          <div key={code.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545]">
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50/50 dark:bg-black/10">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{code.title}</p>
                <p className="text-xs text-gray-400">Total de versões: {code.versions?.length || 0}</p>
              </div>
              {saved === code.id && <span className="text-xs text-green-600 font-medium"><Icon name="✓" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Versão adicionada!</span>}
            </div>

            {/* Version List */}
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Versões Cadastradas</p>
                <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-150 dark:border-[#2A2545] rounded-lg overflow-hidden bg-gray-50/20 dark:bg-black/5">
                  {(code.versions || []).map(ver => {
                    const isActive = code.activeVersionId === ver.id;
                    const isPdf = ver.fileType === 'pdf';
                    return (
                      <div key={ver.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-gray-800 dark:text-white">{ver.name}</span>
                            {isActive && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded text-[9px] font-bold">Ativa</span>}
                            {isPdf && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded text-[9px] font-bold">PDF</span>}
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {ver.fileName ? `Arquivo: ${ver.fileName}` : 'Edição Manual'} | Atualizado em: {new Date(ver.lastUpdated).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isActive && (
                            <button
                              onClick={() => handleActivateVersion(code.id, ver.id)}
                              className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
                            >
                              Ativar
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditVersion(code.id, ver)}
                            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            Editar Texto
                          </button>
                          {(code.versions || []).length > 1 && (
                            <button
                              onClick={() => handleDeleteVersion(code.id, ver.id)}
                              className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload / Add New Version Form */}
              <div className="bg-purple-50/25 dark:bg-purple-950/5 border border-purple-100/60 dark:border-purple-950/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider"><Icon name="📤" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Adicionar Nova Versão</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newVersionName[code.id] || ''}
                      onChange={e => setNewVersionName(prev => ({ ...prev, [code.id]: e.target.value }))}
                      placeholder="Ex: Revisão 2026, Emenda Constitucional 132"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-900 dark:bg-[#1A1730] dark:border-[#2A2545] dark:text-white focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/95 cursor-pointer transition-colors shrink-0">
                    <IconPlus /> Selecionar Arquivo e Enviar
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={e => handleVersionUpload(code.id, e)}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400">Suporta arquivos de texto (.txt, .md) ou arquivos PDF (.pdf) que serão exibidos nativamente na biblioteca.</p>
              </div>
            </div>

            {/* Version Text Editor modal/panel */}
            {editingVersionId && editingVersionId.codeId === code.id && (
              <div className="border-t p-4 space-y-3 bg-gray-50/50 dark:bg-black/15 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Editando Texto da Versão</p>
                  <input
                    type="text"
                    value={editingVersionName}
                    onChange={e => setEditingVersionName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white dark:bg-[#1A1730] dark:text-white"
                    placeholder="Nome da Versão"
                  />
                </div>
                <textarea
                  value={editingVersionContent}
                  onChange={e => setEditingVersionContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none resize-y font-mono bg-white dark:bg-[#1A1730] dark:text-white dark:border-[#2A2545]"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveVersionEdit} className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-primary/90">
                    Salvar Alterações
                  </button>
                  <button onClick={() => setEditingVersionId(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

