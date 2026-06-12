/**
 * SecretaryDocuments.tsx
 * GED & Protocolo de Entrada — Painel do Secret./Assist. Jurídico
 * Inbox de arquivos de clientes, Status de assinatura digital, Encaminhamento interno.
 */
import React, { useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InboxDocument {
  id: string;
  name: string;
  fileType: 'PDF' | 'Imagem';
  size: string;
  date: string;
  docType: string;
  sender: string;
  status: 'pendente' | 'encaminhado' | 'arquivado';
  forwardedTo?: string;
  forwardedCase?: string;
}

interface SignatureDocument {
  id: string;
  title: string;
  type: 'procuracao' | 'honorarios' | 'contrato' | 'declaracao';
  platform: 'DocuSign' | 'Clicksign' | 'eNotariado';
  client: string;
  lawyer: string;
  sentAt: string;
  deadline?: string;
  signers: { name: string; role: string; signed: boolean; signedAt?: string }[];
  status: 'aguardando' | 'parcial' | 'concluido' | 'expirado';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INBOX: InboxDocument[] = [
  { id: 'i1', name: 'CNH_Ana_Paula.jpg', fileType: 'Imagem', size: '1.2 MB', date: '12/06/2025', docType: 'CNH', sender: 'Ana Paula Mendes', status: 'pendente' },
  { id: 'i2', name: 'Comprovante_Residencia_Joao.pdf', fileType: 'PDF', size: '540 KB', date: '12/06/2025', docType: 'Comprovante de Residência', sender: 'João Carvalho', status: 'pendente' },
  { id: 'i3', name: 'RG_Carlos_Andrade.pdf', fileType: 'PDF', size: '890 KB', date: '11/06/2025', docType: 'RG', sender: 'Carlos Andrade', status: 'encaminhado', forwardedTo: 'Dr. Carlos Mendonça', forwardedCase: 'Caso #0042' },
  { id: 'i4', name: 'Contrato_Trabalho_Maria.pdf', fileType: 'PDF', size: '2.1 MB', date: '11/06/2025', docType: 'Contrato de Trabalho', sender: 'Maria da Silva', status: 'pendente' },
];

const MOCK_SIGNATURES: SignatureDocument[] = [
  {
    id: 's1', title: 'Procuração Ad Judicia', type: 'procuracao', platform: 'Clicksign',
    client: 'Ana Paula Mendes', lawyer: 'Dr. Carlos Mendonça', sentAt: '10/06/2025', deadline: '17/06/2025',
    signers: [
      { name: 'Ana Paula Mendes', role: 'Outorgante', signed: true, signedAt: '11/06/2025' },
      { name: 'Dr. Carlos Mendonça', role: 'Outorgado', signed: false },
    ],
    status: 'parcial',
  },
  {
    id: 's2', title: 'Contrato de Honorários', type: 'honorarios', platform: 'DocuSign',
    client: 'João Carvalho', lawyer: 'Dra. Beatriz Fontana', sentAt: '09/06/2025', deadline: '16/06/2025',
    signers: [
      { name: 'João Carvalho', role: 'Contratante', signed: false },
      { name: 'Dra. Beatriz Fontana', role: 'Contratada', signed: true, signedAt: '09/06/2025' },
    ],
    status: 'aguardando',
  },
  {
    id: 's3', title: 'Acordo Extrajudicial', type: 'contrato', platform: 'eNotariado',
    client: 'Carlos Andrade', lawyer: 'Dr. Carlos Mendonça', sentAt: '08/06/2025',
    signers: [
      { name: 'Carlos Andrade', role: 'Parte 1', signed: true, signedAt: '08/06/2025' },
      { name: 'Empresa XYZ Ltda', role: 'Parte 2', signed: true, signedAt: '09/06/2025' },
      { name: 'Dr. Carlos Mendonça', role: 'Advogado', signed: true, signedAt: '08/06/2025' },
    ],
    status: 'concluido',
  },
];

const PLATFORM_COLORS = {
  DocuSign:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  Clicksign:  'bg-blue-100 text-blue-700 border-blue-200',
  eNotariado: 'bg-purple-100 text-purple-700 border-purple-200',
};

const SIG_STATUS = {
  aguardando: { label: 'Aguardando',   color: 'bg-amber-100 text-amber-700' },
  parcial:    { label: 'Parcialmente', color: 'bg-blue-100 text-blue-700' },
  concluido:  { label: 'Concluído ✓', color: 'bg-green-100 text-green-700' },
  expirado:   { label: 'Expirado ✕',  color: 'bg-red-100 text-red-700' },
};

const DOC_TYPES = ['RG', 'CPF', 'CNH', 'Passaporte', 'Comprovante de Residência', 'Certidão', 'Contrato de Trabalho', 'Laudo', 'Prova', 'Despacho', 'Outro'];

// ─── Forward Modal ────────────────────────────────────────────────────────────

interface ForwardModalProps {
  doc: InboxDocument;
  onClose: () => void;
  onConfirm: (docId: string, to: string, caseRef: string) => void;
}

const MOCK_LAWYERS_SELECT = [
  { name: 'Dr. Carlos Mendonça', oab: 'SP 58.234' },
  { name: 'Dra. Beatriz Fontana', oab: 'RJ 89.123' },
  { name: 'Dr. Ricardo Alves', oab: 'MG 23.456' },
];

const ForwardModal: React.FC<ForwardModalProps> = ({ doc, onClose, onConfirm }) => {
  const [to, setTo] = useState('');
  const [caseRef, setCaseRef] = useState('');
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    if (!to) return;
    setDone(true);
    setTimeout(() => { onConfirm(doc.id, to, caseRef); onClose(); }, 800);
  };

  const inputCls = 'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-purple-400';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#12102A] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-[#2A2545]">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">📤 Encaminhar Documento</h2>
          <p className="text-xs text-gray-500 mt-0.5 truncate">Arquivo: {doc.name}</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Advogado Destinatário *</label>
            <select value={to} onChange={e => setTo(e.target.value)} className={inputCls}>
              <option value="">Selecione o advogado...</option>
              {MOCK_LAWYERS_SELECT.map(l => <option key={l.oab} value={l.name}>{l.name} — OAB {l.oab}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nº do Caso / Processo (opcional)</label>
            <input value={caseRef} onChange={e => setCaseRef(e.target.value)} placeholder="Ex: Caso #0042 ou Proc. nº 0012345..." className={inputCls} />
          </div>
          {done && <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl px-4 py-2">✅ Documento encaminhado com sucesso!</div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-[#2A2545]">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Cancelar</button>
          <button onClick={handleConfirm} disabled={!to || done}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all">
            {done ? '✅ Encaminhado!' : '📤 Encaminhar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────

interface UploadModalProps { onClose: () => void; onSave: (doc: InboxDocument) => void; }

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSave }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; type: 'PDF' | 'Imagem'; size: string } | null>(null);
  const [sender, setSender] = useState('');
  const [docType, setDocType] = useState('');
  const [done, setDone] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({ name: f.name, type: f.type.includes('pdf') ? 'PDF' : 'Imagem', size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
    e.target.value = '';
  };

  const handleSave = () => {
    if (!file || !sender.trim() || !docType) return;
    setDone(true);
    setTimeout(() => {
      onSave({ id: `i_${Date.now()}`, name: file.name, fileType: file.type, size: file.size, date: new Date().toLocaleDateString('pt-BR'), docType, sender: sender.trim(), status: 'pendente' });
      onClose();
    }, 800);
  };

  const inputCls = 'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-purple-400';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#12102A] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-[#2A2545]">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">📥 Receber Documento de Cliente</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nome do Cliente / Remetente *</label>
            <input value={sender} onChange={e => setSender(e.target.value)} placeholder="Ex: Ana Paula Mendes" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tipo de Documento *</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className={inputCls}>
              <option value="">Selecione...</option>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Arquivo *</label>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
            {!file ? (
              <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-purple-200 dark:border-purple-900/40 rounded-xl py-6 text-center hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                <p className="text-2xl mb-1">📁</p>
                <p className="text-xs font-medium text-gray-500">Clique para selecionar (PDF, JPG, PNG)</p>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 rounded-xl px-4 py-3">
                <span className="text-xl">{file.type === 'PDF' ? '📄' : '🖼️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400">{file.type} · {file.size}</p>
                </div>
                <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
              </div>
            )}
          </div>
          {done && <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl px-4 py-2">✅ Documento recebido!</div>}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-[#2A2545]">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={!file || !sender.trim() || !docType || done}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all">
            {done ? '✅ Recebido!' : '📥 Confirmar Recebimento'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecretaryDocuments: React.FC = () => {
  const [inbox, setInbox] = useState<InboxDocument[]>(MOCK_INBOX);
  const [signatures] = useState<SignatureDocument[]>(MOCK_SIGNATURES);
  const [activeSection, setActiveSection] = useState<'inbox' | 'assinatura'>('inbox');
  const [showUpload, setShowUpload] = useState(false);
  const [forwardingDoc, setForwardingDoc] = useState<InboxDocument | null>(null);
  const [expandedSig, setExpandedSig] = useState<string | null>(null);

  const handleForward = (docId: string, to: string, caseRef: string) => {
    setInbox(prev => prev.map(d => d.id === docId ? { ...d, status: 'encaminhado', forwardedTo: to, forwardedCase: caseRef } : d));
  };

  const handleArchive = (docId: string) => setInbox(prev => prev.map(d => d.id === docId ? { ...d, status: 'arquivado' } : d));

  const pendingCount = inbox.filter(d => d.status === 'pendente').length;
  const pendingSig = signatures.filter(s => s.status !== 'concluido').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Section tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSection('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeSection === 'inbox' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400'}`}>
          📥 Inbox de Documentos
          {pendingCount > 0 && <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">{pendingCount}</span>}
        </button>
        <button onClick={() => setActiveSection('assinatura')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeSection === 'assinatura' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400'}`}>
          ✍️ Assinatura Digital
          {pendingSig > 0 && <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-[9px] font-black rounded-full">{pendingSig}</span>}
        </button>
      </div>

      {/* ── Inbox ── */}
      {activeSection === 'inbox' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">{pendingCount} documento(s) pendente(s) de encaminhamento</p>
            <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-1.5">
              📥 Receber Documento
            </button>
          </div>
          {inbox.length === 0 ? (
            <div className="bg-gray-50 dark:bg-[#1A1730] border border-dashed border-gray-300 dark:border-[#2A2545] rounded-2xl p-12 text-center">
              <p className="text-4xl mb-2">📭</p>
              <h4 className="font-bold text-gray-700 dark:text-gray-300">Inbox vazio</h4>
              <p className="text-xs text-gray-400 mt-1">Clique em "Receber Documento" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inbox.map(doc => (
                <div key={doc.id} className={`bg-white dark:bg-[#1A1730] border rounded-2xl p-4 transition-all ${doc.status === 'pendente' ? 'border-amber-200 dark:border-amber-900/30' : doc.status === 'encaminhado' ? 'border-green-200 dark:border-green-900/30' : 'border-gray-200 dark:border-[#2A2545] opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{doc.fileType === 'PDF' ? '📄' : '🖼️'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{doc.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">De: {doc.sender} · {doc.date}</p>
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-black/20 text-gray-600 dark:text-gray-400 rounded-full">{doc.docType}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${doc.status === 'pendente' ? 'bg-amber-100 text-amber-700' : doc.status === 'encaminhado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {doc.status === 'pendente' ? '⏳ Pendente' : doc.status === 'encaminhado' ? '✅ Encaminhado' : '🗄️ Arquivado'}
                          </span>
                        </div>
                        {doc.forwardedTo && (
                          <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">→ {doc.forwardedTo}{doc.forwardedCase ? ` · ${doc.forwardedCase}` : ''}</p>
                        )}
                      </div>
                    </div>
                    {doc.status === 'pendente' && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => setForwardingDoc(doc)} className="px-3 py-1.5 text-[10px] font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">📤 Encaminhar</button>
                        <button onClick={() => handleArchive(doc.id)} className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-black/20 rounded-lg hover:bg-gray-200 transition-colors">🗄️ Arquivar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Assinatura Digital ── */}
      {activeSection === 'assinatura' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">{pendingSig} documento(s) aguardando assinatura completa</p>
          {signatures.map(sig => {
            const isExpanded = expandedSig === sig.id;
            const statusMeta = SIG_STATUS[sig.status];
            const signedCount = sig.signers.filter(s => s.signed).length;
            const progress = Math.round((signedCount / sig.signers.length) * 100);
            return (
              <div key={sig.id} className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{sig.title}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[sig.platform]}`}>{sig.platform}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusMeta.color}`}>{statusMeta.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Cliente: {sig.client} · Advogado: {sig.lawyer}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Enviado em {sig.sentAt}{sig.deadline ? ` · Prazo: ${sig.deadline}` : ''}</p>
                    </div>
                    <button onClick={() => setExpandedSig(isExpanded ? null : sig.id)} className="shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-black/20 text-gray-400">
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>{signedCount} de {sig.signers.length} assinatura(s)</span>
                      <span className={progress === 100 ? 'text-green-600 font-bold' : 'text-amber-600'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-black/20 rounded-full h-2">
                      <div className={`${progress === 100 ? 'bg-green-500' : 'bg-amber-500'} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                {/* Signers list (expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-[#2A2545] px-4 pb-4 pt-3 space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Signatários</p>
                    {sig.signers.map((signer, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${signer.signed ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-black/20 text-gray-400'}`}>
                          {signer.signed ? '✓' : '○'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white">{signer.name}</p>
                          <p className="text-[10px] text-gray-400">{signer.role}{signer.signedAt ? ` · Assinou em ${signer.signedAt}` : ' · Pendente'}</p>
                        </div>
                        {!signer.signed && (
                          <button className="px-2.5 py-1 text-[9px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 whitespace-nowrap">
                            📩 Reenviar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSave={doc => setInbox(prev => [doc, ...prev])} />}
      {forwardingDoc && <ForwardModal doc={forwardingDoc} onClose={() => setForwardingDoc(null)} onConfirm={handleForward} />}
    </div>
  );
};
