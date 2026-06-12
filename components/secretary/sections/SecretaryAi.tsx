/**
 * SecretaryAi.tsx
 * Secretária Virtual Assistiva — IA Jurídica para Secret./Assist. Jurídico
 * Transcritor de áudio WhatsApp, Gerador de mensagens formais, Parser OCR.
 */
import React, { useState, useRef } from 'react';

// ─── Audio Transcriber ────────────────────────────────────────────────────────

const MOCK_TRANSCRIPTION = `**ATA DE REUNIÃO — TRANSCRIÇÃO IA**

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Duração do áudio:** 4min 38s

---

**FATOS PRINCIPAIS IDENTIFICADOS:**

1. **Reclamante:** João Silva, funcionário há 8 anos na Empresa XYZ Ltda.
2. **Objeto da reclamação:** Acúmulo de função não remunerado desde jan/2023.
3. **Evidências relatadas:** E-mails de atribuição de tarefas adicionais.
4. **Testemunhas:** Colega de setor (Maria Santos) pode confirmar o acúmulo.
5. **Pedido:** Pagamento de diferenças salariais + reflexos em 13º, férias e FGTS.

**PRÓXIMOS PASSOS SUGERIDOS:**
- Solicitar contracheques dos últimos 24 meses
- Colher depoimento da testemunha
- Analisar contrato de trabalho original

*Transcrição gerada por IA — revise antes de utilizar.*`;

const AudioTranscriber: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
    setTranscript('');
    e.target.value = '';
  };

  const handleTranscribe = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setTranscript(MOCK_TRANSCRIPTION); }, 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl shrink-0">🎙️</div>
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">Transcritor de Áudio para Texto</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Faça upload de áudios do WhatsApp e gere atas estruturadas automaticamente</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".mp3,.mp4,.ogg,.wav,.m4a,.opus" className="hidden" onChange={handleFile} />
      {!file ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-purple-200 dark:border-purple-900/40 rounded-xl py-6 text-center hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
          <p className="text-2xl mb-1">🎵</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Clique para selecionar o áudio</p>
          <p className="text-xs text-gray-400 mt-0.5">MP3, OGG, WAV, M4A, OPUS (áudios do WhatsApp)</p>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl px-4 py-3">
          <span className="text-xl">🎵</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{file.size}</p>
          </div>
          <button onClick={() => { setFile(null); setTranscript(''); }} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
        </div>
      )}
      {file && !transcript && (
        <button onClick={handleTranscribe} disabled={loading}
          className="w-full py-3 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Transcrevendo...</> : '✨ Gerar Transcrição com IA'}
        </button>
      )}
      {transcript && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">✅ Transcrição concluída</span>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="px-3 py-1.5 text-[10px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                {copied ? '✓ Copiado!' : '📋 Copiar'}
              </button>
              <button className="px-3 py-1.5 text-[10px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">📤 Exportar</button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] rounded-xl p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{transcript}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Formal Message Generator ─────────────────────────────────────────────────

const MESSAGE_TEMPLATES = {
  agendamento: {
    label: '📅 Agendamento',
    template: (client: string, date: string, lawyer: string) =>
`Prezado(a) ${client || '[Nome do Cliente]'},

Confirmamos o agendamento de sua consulta para o dia ${date || '[Data]'}, com Dr(a). ${lawyer || '[Nome do Advogado]'}, em nosso escritório.

Por favor, traga os documentos solicitados: RG, CPF e comprovante de residência.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Secretaria Jurídica`,
  },
  cobranca: {
    label: '💳 Cobrança',
    template: (client: string, value: string) =>
`Prezado(a) ${client || '[Nome do Cliente]'},

Informamos que consta em aberto em sua conta o valor de R$ ${value || '0,00'}, referente a honorários advocatícios.

Solicitamos a regularização do débito até [data limite] para evitar encargos adicionais.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Secretaria do Escritório`,
  },
  atraso: {
    label: '⏰ Atraso/Desculpa',
    template: (client: string) =>
`Prezado(a) ${client || '[Nome do Cliente]'},

Vimos por meio deste comunicar que, por motivos de força maior, houve um atraso imprevisto no atendimento de seu processo/solicitação.

Pedimos sinceras desculpas pelo transtorno e informamos que nossa equipe já está trabalhando na resolução. Entraremos em contato em breve com um prazo atualizado.

Agradecemos sua compreensão.

Atenciosamente,
Secretaria do Escritório`,
  },
  andamento: {
    label: '📋 Andamento Processual',
    template: (client: string, status: string) =>
`Prezado(a) ${client || '[Nome do Cliente]'},

Informamos que houve uma atualização em seu processo: **${status || '[Descreva o andamento]'}**.

Nossa equipe continua acompanhando o desenvolvimento do seu caso e manteremos você informado(a) sobre os próximos passos.

Atenciosamente,
Secretaria Jurídica`,
  },
};

const MessageGenerator: React.FC = () => {
  const [template, setTemplate] = useState<keyof typeof MESSAGE_TEMPLATES>('agendamento');
  const [client, setClient] = useState('');
  const [param1, setParam1] = useState('');
  const [param2, setParam2] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  const getTemplate = () => {
    switch (template) {
      case 'agendamento': return MESSAGE_TEMPLATES.agendamento.template(client, param1, param2);
      case 'cobranca': return MESSAGE_TEMPLATES.cobranca.template(client, param1);
      case 'atraso': return MESSAGE_TEMPLATES.atraso.template(client);
      case 'andamento': return MESSAGE_TEMPLATES.andamento.template(client, param1);
    }
  };

  const handleGenerate = () => setMessage(getTemplate());
  const handleCopy = () => { navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const inputCls = 'w-full border border-gray-300 dark:border-[#2A2545] rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-[#1A1730] focus:outline-none focus:ring-2 focus:ring-purple-400 dark:placeholder-gray-500';

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl shrink-0">✉️</div>
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">Gerador de Mensagens Formais</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">IA cria e formata mensagens no padrão do escritório</p>
        </div>
      </div>

      {/* Template selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.entries(MESSAGE_TEMPLATES) as [keyof typeof MESSAGE_TEMPLATES, typeof MESSAGE_TEMPLATES[keyof typeof MESSAGE_TEMPLATES]][]).map(([key, val]) => (
          <button key={key} onClick={() => { setTemplate(key); setMessage(''); }}
            className={`py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${template === key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-blue-300'}`}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome do Cliente</label>
          <input value={client} onChange={e => setClient(e.target.value)} placeholder="Ex: Ana Paula Mendes" className={inputCls} />
        </div>
        {template === 'agendamento' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Data / Horário</label>
              <input value={param1} onChange={e => setParam1(e.target.value)} placeholder="12/06/2025 às 14h00" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Advogado</label>
              <input value={param2} onChange={e => setParam2(e.target.value)} placeholder="Dr. Carlos Mendonça" className={inputCls} />
            </div>
          </div>
        )}
        {template === 'cobranca' && (
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor</label>
            <input value={param1} onChange={e => setParam1(e.target.value)} placeholder="1.500,00" className={inputCls} />
          </div>
        )}
        {template === 'andamento' && (
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Andamento / Status</label>
            <input value={param1} onChange={e => setParam1(e.target.value)} placeholder="Ex: Decisão favorável em audiência" className={inputCls} />
          </div>
        )}
      </div>

      {/* Channel */}
      <div className="flex gap-2">
        {(['whatsapp', 'email'] as const).map(ch => (
          <button key={ch} onClick={() => setChannel(ch)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${channel === ch ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700' : 'border border-gray-200 dark:border-[#2A2545] text-gray-500'}`}>
            {ch === 'whatsapp' ? '💬 WhatsApp' : '📧 E-mail'}
          </button>
        ))}
      </div>

      <button onClick={handleGenerate}
        className="w-full py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
        ✨ Gerar Mensagem
      </button>

      {message && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">✅ Mensagem gerada</span>
            <button onClick={handleCopy} className="px-3 py-1.5 text-[10px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8}
            className="w-full border border-gray-200 dark:border-[#2A2545] rounded-xl px-4 py-3 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          <p className="text-[10px] text-gray-400">Edite o texto acima antes de enviar. Mensagem adaptada para {channel === 'whatsapp' ? 'WhatsApp' : 'e-mail formal'}.</p>
        </div>
      )}
    </div>
  );
};

// ─── OCR Document Parser ──────────────────────────────────────────────────────

const MOCK_OCR_RESULT = {
  tipo: 'CNH',
  nome: 'ANA PAULA MENDES',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  dataNascimento: '15/03/1988',
  naturalidade: 'São Paulo/SP',
  validadeCnh: '15/03/2028',
  categorias: 'AB',
};

const OcrParser: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; type: 'PDF' | 'Imagem'; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_OCR_RESULT | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({ name: f.name, type: f.type.includes('pdf') ? 'PDF' : 'Imagem', size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
    setResult(null);
    e.target.value = '';
  };

  const handleOcr = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(MOCK_OCR_RESULT); }, 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const txt = Object.entries(result).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl shrink-0">🔍</div>
        <div>
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">Parser de Documentos por OCR</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Extraia dados de CNH/RG automaticamente para preenchimento do cadastro</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFile} />
      {!file ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-amber-200 dark:border-amber-900/40 rounded-xl py-6 text-center hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">
          <p className="text-2xl mb-1">📷</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Foto ou scan do documento</p>
          <p className="text-xs text-gray-400 mt-0.5">CNH, RG, Passaporte · JPG, PNG, PDF</p>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl px-4 py-3">
          <span className="text-xl">{file.type === 'PDF' ? '📄' : '🖼️'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
            <p className="text-[10px] text-gray-400">{file.type} · {file.size}</p>
          </div>
          <button onClick={() => { setFile(null); setResult(null); }} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
        </div>
      )}

      {file && !result && (
        <button onClick={handleOcr} disabled={loading}
          className="w-full py-3 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processando OCR...</> : '🔍 Extrair Dados com IA'}
        </button>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-600 dark:text-green-400">✅ Dados extraídos</span>
            <button onClick={handleCopyAll} className="px-3 py-1.5 text-[10px] font-bold text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              {copied ? '✓ Copiado!' : '📋 Copiar Tudo'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#2A2545] rounded-xl p-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
            📋 Preencher Cadastro Automaticamente
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const SecretaryAi: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">⚡ Secretária Virtual Assistiva</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Inteligência Artificial para acelerar o trabalho operacional repetitivo</p>
      </div>
      <AudioTranscriber />
      <MessageGenerator />
      <OcrParser />
    </div>
  );
};
