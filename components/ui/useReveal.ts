import { useEffect } from 'react';

/**
 * useRevealSections — ativa as animações de scroll-reveal (.reveal-section).
 *
 * O script global de index.html roda no DOMContentLoaded, ANTES do React
 * montar — por isso as seções ficavam presas em opacity:0 (página "vazia").
 * Este hook registra o IntersectionObserver após o mount, no ciclo certo.
 */
export function useRevealSections() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-section');
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
