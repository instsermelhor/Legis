import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type FeedbackCategory = 'bug' | 'suggestion' | 'compliment';
type FeedbackRating = 1 | 2 | 3 | 4 | 5;

interface FeedbackPayload {
  user_id: string;
  role: string;
  rating: FeedbackRating;
  category: FeedbackCategory;
  message: string;
  page: string;
  created_at: string;
}

interface Props {
  userId?: string;
  userRole?: string;
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: '🐛 Bug / Problema',
  suggestion: '💡 Sugestão',
  compliment: '⭐ Elogio',
};

export const BetaFeedbackButton: React.FC<Props> = ({ userId = 'anonymous', userRole = 'unknown' }) => {
  const [open, setOpen]               = useState(false);
  const [rating, setRating]           = useState<FeedbackRating | null>(null);
  const [category, setCategory]       = useState<FeedbackCategory>('suggestion');
  const [message, setMessage]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!rating || !message.trim()) return;

    setSubmitting(true);
    try {
      const payload: FeedbackPayload = {
        user_id:    userId,
        role:       userRole,
        rating,
        category,
        message:    message.trim(),
        page:       window.location.pathname,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        await supabase.from('beta_feedback').insert(payload);
      } else {
        // Fallback localStorage em modo offline
        const existing = JSON.parse(localStorage.getItem('legis_beta_feedback') || '[]');
        existing.push({ ...payload, id: `fb_${Date.now()}` });
        localStorage.setItem('legis_beta_feedback', JSON.stringify(existing));
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setRating(null);
        setMessage('');
        setCategory('suggestion');
      }, 2500);
    } catch (err) {
      console.error('[BetaFeedback] Erro ao enviar feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        id="beta-feedback-btn"
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback do beta"
        title="Enviar feedback"
        className="fixed bottom-6 right-6 z-[9998] flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm shadow-2xl transition-all duration-300 group"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: 'white',
          boxShadow: '0 4px 24px rgba(79,70,229,0.5)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
      >
        <span className="text-base">💬</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal de feedback */}
      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Modal de feedback do beta"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, #0f172a, #1e1b4b)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            {submitted ? (
              /* Estado de sucesso */
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-white font-bold text-lg mb-1">Obrigado pelo feedback!</h3>
                <p className="text-indigo-300 text-sm">Sua opinião nos ajuda a melhorar a plataforma.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-white font-bold text-base">💬 Feedback do Beta</h3>
                    <p className="text-indigo-400 text-xs mt-0.5">Sua opinião é muito importante para nós</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
                    aria-label="Fechar modal de feedback"
                  >
                    ✕
                  </button>
                </div>

                {/* Avaliação por estrelas */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Avaliação Geral</p>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4, 5] as FeedbackRating[]).map((star) => (
                      <button
                        key={star}
                        id={`beta-feedback-star-${star}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                        aria-label={`Avaliar ${star} estrelas`}
                      >
                        {star <= (hoverRating ?? rating ?? 0) ? '⭐' : '☆'}
                      </button>
                    ))}
                    {rating && (
                      <span className="ml-2 text-xs text-indigo-400 self-center font-mono">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Categoria</p>
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((cat) => (
                      <button
                        key={cat}
                        id={`beta-feedback-cat-${cat}`}
                        onClick={() => setCategory(cat)}
                        className="text-xs px-3 py-1.5 rounded-full transition font-medium"
                        style={{
                          background: category === cat ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)',
                          color: category === cat ? '#c7d2fe' : '#94a3b8',
                          border: `1px solid ${category === cat ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mensagem */}
                <div className="mb-5">
                  <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Mensagem</p>
                  <textarea
                    id="beta-feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua experiência, bug encontrado ou sugestão..."
                    rows={4}
                    maxLength={1000}
                    className="w-full text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#e2e8f0',
                      focusRingColor: '#6366f1',
                    }}
                  />
                  <p className="text-right text-xs text-slate-600 mt-1">{message.length}/1000</p>
                </div>

                {/* Botão enviar */}
                <button
                  id="beta-feedback-submit"
                  onClick={handleSubmit}
                  disabled={!rating || !message.trim() || submitting}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white',
                  }}
                >
                  {submitting ? '⏳ Enviando...' : '🚀 Enviar Feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
