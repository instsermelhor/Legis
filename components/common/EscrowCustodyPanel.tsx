import React, { useState, useEffect } from 'react';
import { EscrowService, EscrowTransaction } from '../../services/escrowService';

interface EscrowCustodyPanelProps {
  userId: string;
  userRole: 'CLIENT' | 'LAWYER' | 'ADMIN';
}

export const EscrowCustodyPanel: React.FC<EscrowCustodyPanelProps> = ({ userId, userRole }) => {
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadEscrows = async () => {
    setLoading(true);
    let data: EscrowTransaction[] = [];
    if (userRole === 'LAWYER') {
      data = await EscrowService.getByLawyer(userId);
    } else if (userRole === 'CLIENT') {
      data = await EscrowService.getByClient(userId);
    } else {
      data = await EscrowService.getAll();
    }
    setEscrows(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEscrows();
  }, [userId, userRole]);

  const handleRelease = async (escrowId: string) => {
    const updated = await EscrowService.releaseFunds(escrowId, userId);
    if (updated) {
      setActionSuccess(`Fundos de R$ ${updated.totalAmount.toFixed(2)} liberados com sucesso para o advogado!`);
      loadEscrows();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscrow || !proofNotes.trim()) return;

    await EscrowService.uploadProof(selectedEscrow.id, proofNotes);
    setActionSuccess('Comprovante de prestação de serviço anexado com sucesso!');
    setSelectedEscrow(null);
    setProofNotes('');
    loadEscrows();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscrow || !disputeReason.trim()) return;

    await EscrowService.disputeEscrow(selectedEscrow.id, disputeReason, userId);
    setActionSuccess('Disputa aberta com sucesso. Nossa equipe de compliance irá analisar.');
    setSelectedEscrow(null);
    setDisputeReason('');
    loadEscrows();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const totalInCustody = escrows
    .filter(e => e.status === 'in_escrow_custody')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100 mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            🛡️ Conta Garantia (Escrow Jurídico)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
              OAB Split Compliant
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Retenção segura de honorários até a confirmação e conclusão da prestação do serviço jurídico.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Retido em Custódia</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            R$ {totalInCustody.toFixed(2)}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          ✓ {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-slate-500 text-xs animate-pulse">Carregando custódias...</div>
      ) : escrows.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800/60">
          Nenhuma transação de honorários mantida em custódia no momento.
        </div>
      ) : (
        <div className="space-y-3">
          {escrows.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.status === 'in_escrow_custody'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : item.status === 'released_to_lawyer'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {item.status === 'in_escrow_custody'
                      ? '🔒 Em Custódia'
                      : item.status === 'released_to_lawyer'
                      ? '✅ Liberado ao Advogado'
                      : '⚠️ Em Disputa'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {item.transactionId}</span>
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  {userRole === 'LAWYER' ? `Cliente: ${item.clientName}` : `Advogado: ${item.lawyerName}`}
                </p>
                {item.caseTitle && (
                  <p className="text-xs text-slate-400">Processo: {item.caseTitle}</p>
                )}

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                  <span>Total: R$ {item.totalAmount.toFixed(2)}</span>
                  <span>|</span>
                  <span className="text-emerald-400">Advogado ({item.lawyerSharePercent}%): R$ {item.lawyerAmount.toFixed(2)}</span>
                  <span>|</span>
                  <span>Plataforma: R$ {item.platformAmount.toFixed(2)}</span>
                </div>

                {item.proofNotes && (
                  <div className="mt-2 p-2 bg-indigo-950/40 rounded border border-indigo-500/20 text-xs text-indigo-300">
                    📝 Comprovante de Serviço: {item.proofNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'in_escrow_custody' && userRole === 'CLIENT' && (
                  <button
                    onClick={() => handleRelease(item.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    🔓 Liberar Honorários
                  </button>
                )}

                {item.status === 'in_escrow_custody' && userRole === 'LAWYER' && (
                  <button
                    onClick={() => setSelectedEscrow(item)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    📤 Anexar Comprovante
                  </button>
                )}

                {item.status === 'in_escrow_custody' && (
                  <button
                    onClick={() => setSelectedEscrow(item)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium rounded-lg border border-slate-700 transition"
                  >
                    ⚠️ Contestar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Anexar Comprovante ou Disputar */}
      {selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-5 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-100 mb-3">
              Gerenciar Escrow #{selectedEscrow.transactionId}
            </h4>

            {userRole === 'LAWYER' ? (
              <form onSubmit={handleUploadProof} className="space-y-3">
                <label className="text-xs text-slate-400 block">Descreva o serviço concluído ou parecer anexado:</label>
                <textarea
                  required
                  rows={3}
                  value={proofNotes}
                  onChange={e => setProofNotes(e.target.value)}
                  placeholder="Ex: Parecer jurídico entregue e consulta remota realizada..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEscrow(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Salvar Comprovante
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDispute} className="space-y-3">
                <label className="text-xs text-slate-400 block">Motivo da Contestação / Disputa:</label>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  placeholder="Descreva o motivo da divergência..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEscrow(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Abrir Disputa
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
