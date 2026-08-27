/**
 * lib/design-system.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Legis Connect Master Design System Tokens & Primitives (D-4).
 *
 * Padrões de Excelência Visual e Acessibilidade (WCAG 2.1 AA):
 *   - Paleta de Cores Institucional (Roxo Primário, Dourado Nobre, Dark Surfaces)
 *   - Escala Tipográfica (Montserrat, Inter, Cinzel)
 *   - Sistema de Espaçamento e Raios de Borda
 *   - Níveis de Elevação, Sombras e Glassmorphism
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DesignTokens = {
  colors: {
    primary: {
      DEFAULT: '#7C3AED',
      light: '#A855F7',
      dark: '#5B21B6',
      glow: 'rgba(124, 58, 237, 0.35)',
    },
    secondary: {
      DEFAULT: '#F59E0B',
      light: '#FDE68A',
      dark: '#D97706',
    },
    gold: {
      DEFAULT: '#D4AF37',
      light: '#F3E5AB',
      dark: '#AA820A',
    },
    surface: {
      light: '#FFFFFF',
      subtle: '#F8F7FF',
      dark: '#0F0D1A',
      cardDark: '#1A1730',
      borderDark: '#2A2545',
      inputDark: '#1C1A32',
    },
    feedback: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    fonts: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      heading: 'Montserrat, system-ui, -apple-system, sans-serif',
      institutional: 'Cinzel, serif',
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },
  shadows: {
    subtle: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
    card: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    cardDark: '0 4px 24px rgba(0,0,0,0.40)',
    glow: '0 0 24px rgba(124, 58, 237, 0.30)',
    glowGold: '0 0 24px rgba(212, 175, 55, 0.30)',
  },
  glassmorphism: {
    dark: 'background: rgba(15, 13, 26, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(124, 58, 237, 0.15);',
    light: 'background: rgba(255, 255, 255, 0.80); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.35);',
  },
} as const;

/**
 * Utilitário de classes Tailwind para componentes consistentes com o Design System.
 */
export const ComponentStyles = {
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-700 to-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40',
    secondary:
      'inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent text-purple-300 font-semibold border border-purple-400/40 rounded-xl hover:bg-primary/10 hover:border-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40',
    ghost:
      'inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors',
    danger:
      'inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors',
  },
  badge: {
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800',
    info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  },
  card: {
    standard: 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6 dark:bg-[#1A1730] dark:border-[#2A2545] transition-all',
    interactive: 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6 dark:bg-[#1A1730] dark:border-[#2A2545] hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer',
  },
} as const;
