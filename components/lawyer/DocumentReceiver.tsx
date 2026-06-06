/**
 * DocumentReceiver.tsx
 * Recebimento de documentos PDF e imagens separados.
 * Com opção de sincronização local (download) do advogado.
 */
import React, { useState, useRef } from 'react';
import { dbDocuments } from '../../services/dbService';
import type { ReceivedDocument } from '../../services/dbService';

const fmt = (bytes: number) => bytes < 1024 * 1024
  ? `${(bytes / 1024).toFixed(1)} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const DocIcon: React.FC<{ type: 'pdf' | 'image' }> = ({ type }) => (
  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-xs ${type === 'pdf' ? 'bg-red-500' : 'bg-blue-500'}`}>
    {type === 'pdf' ? 'PDF' : 'IMG'}
  </span>
);

interface DocumentReceiverProps {
  lawyerId?: number;
}

export const DocumentReceiver: React.FC<DocumentReceiverProps> = ({ lawyerId }) => {
  const [docs, setDocs] = useState<ReceivedDocument[]>(() => dbDocuments.getAll(lawyerId));
  const [activeTab, setActiveTab] = useState<'pdf' | 'image'>('pdf');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    setUploading(true);
    const readers = files.map(file => new Promise<void>(resolve => {
      const reader = new FileReader();
      reader.onload = ev => {
        const doc: ReceivedDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl: ev.target?.result as string,
          lawyerId,
        };
        dbDocuments.add(doc);
        setDocs(dbDocuments.getAll(lawyerId));
        resolve();
      };
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(() => setUploading(false));
    e.target.value = '';
  };

  const handleDownload = (doc: ReceivedDocument) => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  };

  const handleDelete = (id: string) => {
    dbDocuments.remove(id);
    setDocs(dbDocuments.getAll(lawyerId));
    setConfirmDelete(null);
  };

  const filtered = docs.filter(d => d.type === activeTab);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-700">Documentos Recebidos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => pdfRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm transition-colors"
          >
            ⬆ Enviar PDF
          </button>
          <button
            onClick={() => imgRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            🖼 Enviar Imagem
          </button>
        </div>
        <input ref={pdfRef} type="file" accept=".pdf" multiple className="hidden" onChange={e => handleUpload(e, 'pdf')} />
        <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e, 'image')} />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Processando arquivos...
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['pdf', 'image'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'pdf' ? '📄 PDFs' : '🖼 Imagens'} ({docs.filter(d => d.type === tab).length})
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-3xl mb-2">{activeTab === 'pdf' ? '📄' : '🖼'}</p>
          <p className="text-gray-500 text-sm">Nenhum {activeTab === 'pdf' ? 'PDF' : 'imagem'} recebido ainda.</p>
          <p className="text-gray-400 text-xs mt-1">Use o botão acima para enviar arquivos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y">
          {filtered.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
              <DocIcon type={doc.type} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">
                  {fmt(doc.size)} · {new Date(doc.uploadedAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Sincronizar localmente (baixar)"
                >
                  ⬇ Sincronizar Local
                </button>
                <button
                  onClick={() => setConfirmDelete(doc.id)}
                  className="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  title="Excluir"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <p className="text-3xl">🗑️</p>
            <h3 className="text-lg font-bold text-gray-900">Excluir documento?</h3>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Excluir</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
