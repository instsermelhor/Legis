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


// ─── Legal Documents ──────────────────────────────────────────────────────────
export const LegalDocuments: React.FC = () => {
  const [docs, setDocs] = useState<LegalDocument[]>(() => {
    const savedDocs = localStorage.getItem('legis_legal_docs');
    return savedDocs ? JSON.parse(savedDocs) : mockLegalDocuments;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const saveDocs = (newDocs: LegalDocument[]) => {
    setDocs(newDocs);
    localStorage.setItem('legis_legal_docs', JSON.stringify(newDocs));
  };

  const handleContentChange = (id: string, content: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, content, lastUpdated: new Date().toISOString().split('T')[0] } : d);
    saveDocs(updated);
  };

  const handleSave = (id: string) => {
    setSaved(id);
    setEditingId(null);
    setTimeout(() => setSaved(null), 2500);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.type === 'text/plain';
    const reader = new FileReader();

    if (isTextFile) {
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        const updated = docs.map(d => d.id === id ? { ...d, content: `[Arquivo: ${file.name}]\n${content.substring(0, 500)}...`, lastUpdated: new Date().toISOString().split('T')[0] } : d);
        saveDocs(updated);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        const extracted = extractPrintableText(arrayBuffer);
        const content = `[Conteúdo extraído do arquivo binário ${file.name}]\n\n` + (extracted || 'Nenhum texto legível encontrado no arquivo.');
        const updated = docs.map(d => d.id === id ? { ...d, content: content.substring(0, 2000), lastUpdated: new Date().toISOString().split('T')[0] } : d);
        saveDocs(updated);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      content: newContent,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updated = [...docs, newDoc];
    saveDocs(updated);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento legal?')) {
      const updated = docs.filter(d => d.id !== id);
      saveDocs(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">Documentos Legais</h3>
          <p className="text-sm text-gray-500">Edite, adicione ou exclua os termos, políticas e outros documentos legais.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
          <IconPlus /> Novo Documento
        </button>
      </div>

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2"><IconPlus /> Adicionar Novo Documento Legal</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título do Documento *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 p-2 border bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Ex: Política de Cookies" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conteúdo do Documento *</label>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y bg-white text-gray-900 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500" placeholder="Escreva o conteúdo do documento..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Adicionar Documento</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                <p className="text-xs text-gray-400">Atualizado em: {new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:border-primary/50 cursor-pointer transition-colors dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                  <IconUpload /> Upload
                  <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={e => handleFileUpload(doc.id, e)} />
                </label>
                <button onClick={() => setEditingId(editingId === doc.id ? null : doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <IconEdit /> {editingId === doc.id ? 'Fechar' : 'Editar'}
                </button>
                <button onClick={() => handleDelete(doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  <IconTrash /> Excluir
                </button>
                {saved === doc.id && <span className="text-xs text-green-600 font-medium self-center"><Icon name="✓" className="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> Salvo!</span>}
              </div>
            </div>

            {editingId === doc.id ? (
              <div className="p-4">
                <textarea
                  value={doc.content}
                  onChange={e => handleContentChange(doc.id, e.target.value)}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleSave(doc.id)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                    Salvar Documento
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3">{doc.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

