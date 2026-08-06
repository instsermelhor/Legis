import React, { useState, useRef } from 'react';
import { createSmartContract, signSmartContract, SmartContractData } from '../../lib/smartContractsEngine';

interface SmartContractSignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartContractSignModal: React.FC<SmartContractSignModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [contract, setContract] = useState<SmartContractData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signedContract, setSignedContract] = useState<SmartContractData | null>(null);
  
  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  if (!isOpen) return null;

  const handleGenerateContract = async () => {
    setIsGenerating(true);
    try {
      const newContract = await createSmartContract(
        'Contrato de Honorários Advocatícios & Prestação de Serviços',
        'Maria Oliveira Santos',
        '123.456.789-00',
        'Dr. Carlos Silva',
        '123456/SP',
        3500.00,
        'Pelo presente instrumento particular, as partes ajustam a prestação de serviços jurídicos para patrocínio de Ação Ordinária, mediante honorários acordados no valor de R$ 3.500,00, com cláusula de êxito de 10%.'
      );
      setContract(newContract);
      setSignedContract(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmSignature = async () => {
    if (!contract || !hasSignature) return;
    setIsSigning(true);
    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
      const signed = await signSmartContract(contract, signatureDataUrl);
      setSignedContract(signed);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1A1730] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2545] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600/10 via-primary/10 to-emerald-500/10 border-b border-gray-200 dark:border-[#2A2545] flex items-center justify-between">
          <div>
            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Nível 9 — Smart Contracts & Validação Criptográfica
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              Assinatura Digital Biométrica & QR Code SHA-256
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252040]"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {!contract ? (
            <div className="text-center py-16 space-y-4">
              <span className="text-5xl block">📜</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gerar Contrato Inteligente Criptografado
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Crie um contrato com hash SHA-256 imutável, carimbo de data/hora oficial e suporte a assinatura biométrica em tela.
              </p>
              <button
                onClick={handleGenerateContract}
                disabled={isGenerating}
                className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-lg"
              >
                {isGenerating ? 'Gerando Hash SHA-256...' : '⚡ Gerar Contrato Inteligente'}
              </button>
            </div>
          ) : signedContract ? (
            /* Signed Success Screen */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 animate-bounce">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contrato Assinado & Criptografado com Sucesso!
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Assinado em: {new Date(signedContract.signedAt || '').toLocaleString('pt-BR')}
                </p>
              </div>

              {/* SHA-256 Seal Box */}
              <div className="p-4 bg-gray-50 dark:bg-[#151226] border border-gray-200 dark:border-[#252040] rounded-2xl space-y-3">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  🔐 Selo Criptográfico de Autenticidade (SHA-256):
                </div>
                <div className="p-2.5 bg-white dark:bg-[#201C3D] border border-gray-300 dark:border-[#2A2545] rounded-xl font-mono text-[10px] text-gray-700 dark:text-gray-300 break-all select-all">
                  {signedContract.hashSha256}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-[#252040]">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    URL de Validação Pública: <br />
                    <span className="text-primary font-mono text-[11px] underline">
                      {signedContract.qrCodeVerificationUrl}
                    </span>
                  </div>

                  {/* QR Code Graphic Representation */}
                  <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm text-center shrink-0">
                    <div className="w-20 h-20 bg-gray-900 flex items-center justify-center text-white text-[9px] font-mono rounded">
                      [QR CODE]
                    </div>
                    <span className="text-[9px] text-gray-500 font-bold block mt-1">Escanear p/ Validar</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateContract}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-xl hover:opacity-90 transition-all"
              >
                + Gerar Novo Contrato
              </button>
            </div>
          ) : (
            /* Signing Pad Screen */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Clauses Column */}
              <div className="bg-gray-50 dark:bg-[#151226] p-5 rounded-2xl border border-gray-200 dark:border-[#252040] space-y-3 text-xs">
                <div className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#252040] pb-2">
                  {contract.title}
                </div>

                <div className="text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>Contratante:</strong> {contract.clientName} (CPF: {contract.clientCpf})</p>
                  <p><strong>Contratado:</strong> {contract.lawyerName} (OAB: {contract.lawyerOab})</p>
                  <p><strong>Valor:</strong> R$ {contract.amount.toFixed(2).replace('.', ',')}</p>
                </div>

                <div className="p-3 bg-white dark:bg-[#201C3D] border border-gray-200 dark:border-[#2A2545] rounded-xl italic text-gray-700 dark:text-gray-300 leading-relaxed">
                  "{contract.content}"
                </div>

                <div className="text-[10px] text-gray-400 font-mono">
                  Hash prévio: {contract.hashSha256.slice(0, 32)}...
                </div>
              </div>

              {/* Biometric Canvas Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    ✍️ Assinatura Biométrica em Tela (Desenhe abaixo):
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] text-rose-500 font-bold hover:underline"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="border-2 border-dashed border-primary/40 rounded-2xl overflow-hidden bg-white dark:bg-[#201C3D] shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[160px] cursor-crosshair touch-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={!hasSignature || isSigning}
                  onClick={handleConfirmSignature}
                  className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                >
                  {isSigning ? 'Validando Hash & Criptografia...' : '✓ Assinar e Validar Contrato Digital'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
