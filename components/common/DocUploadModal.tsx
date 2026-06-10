import React, { useState, useRef, useCallback } from 'react';

export interface UploadedFile {
  name: string;
  type: string; // 'PDF' | 'Imagem'
  size: string; // formatted e.g. '2.4 MB'
  date: string; // formatted e.g. '10/06/2025'
  file?: File;
}

interface DocUploadModalProps {
  title?: string;
  description?: string;
  accentColor?: 'blue' | 'purple' | 'primary';
  acceptedFormats?: string; // default: '.pdf,.jpg,.jpeg,.png'
  maxSizeMB?: number; // default: 10
  onClose: () => void;
  onFilesUploaded: (files: UploadedFile[]) => void;
}

const ACCEPT_DEFAULT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png';
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export const DocUploadModal: React.FC<DocUploadModalProps> = ({
  title = 'Upload de Documentos',
  description = 'Arraste e solte ou clique para selecionar documentos',
  accentColor = 'primary',
  acceptedFormats = ACCEPT_DEFAULT,
  maxSizeMB = 10,
  onClose,
  onFilesUploaded,
}) => {
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accent = {
    primary: {
      border: 'border-primary/40',
      bg: 'bg-primary/5',
      text: 'text-primary',
      btn: 'bg-primary hover:bg-primary/90 text-white',
      tag: 'bg-primary/10 text-primary',
    },
    blue: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      tag: 'bg-blue-100 text-blue-700',
    },
    purple: {
      border: 'border-purple-400',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      tag: 'bg-purple-100 text-purple-700',
    },
  }[accentColor];

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newErrors: string[] = [];
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        newErrors.push(`"${f.name}": formato inválido. Use PDF, JPG, JPEG ou PNG.`);
        return;
      }
      const sizeMB = f.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        newErrors.push(`"${f.name}": tamanho ${sizeMB.toFixed(1)}MB excede o limite de ${maxSizeMB}MB.`);
        return;
      }
      newFiles.push({
        name: f.name,
        type: f.type.includes('pdf') ? 'PDF' : 'Imagem',
        size: `${sizeMB.toFixed(2)} MB`,
        date: new Date().toLocaleDateString('pt-BR'),
        file: f,
      });
    });

    setErrors(newErrors);
    setPending(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleConfirm = () => {
    onFilesUploaded(pending);
    setUploaded(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">PDF, JPG, JPEG, PNG · máx. {maxSizeMB}MB</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {uploaded ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-800">Documentos enviados!</p>
              <p className="text-sm text-gray-500">{pending.length} arquivo(s) adicionado(s) com sucesso.</p>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragging ? `${accent.border} ${accent.bg}` : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className={`w-10 h-10 mx-auto mb-3 ${dragging ? accent.text : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className={`text-sm font-semibold ${dragging ? accent.text : 'text-gray-600'}`}>{description}</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, JPEG, PNG</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats}
                  multiple
                  className="hidden"
                  onChange={e => processFiles(e.target.files)}
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                  {errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-700">⚠️ {e}</p>
                  ))}
                </div>
              )}

              {/* Pending files */}
              {pending.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {pending.length} arquivo(s) selecionado(s)
                  </p>
                  {pending.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{f.type === 'PDF' ? '📄' : '🖼️'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-gray-400">{f.type} · {f.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPending(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600 ml-2 shrink-0 text-sm"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={pending.length === 0}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    pending.length > 0
                      ? accent.btn
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirmar Upload
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
