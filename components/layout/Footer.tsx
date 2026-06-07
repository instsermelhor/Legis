import React from 'react';
import type { View } from '../../types';
import { useAppConfig } from '../../context/AppContext';

interface FooterProps {
  onNavigate: (view: View) => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  onShowEtica: () => void;
}

// Scales icon
const ScalesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 10l7-7 7 7M3 14h6m6 0h6M6 14l-3 4h6l-3-4zM18 14l-3 4h6l-3-4z"/>
  </svg>
);

const NavLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className="text-gray-500 hover:text-white text-sm transition-colors duration-200 hover:translate-x-0.5 transform inline-block"
    >
      {children}
    </button>
  </li>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowTerms, onShowPrivacy, onShowEtica }) => {
  const { config } = useAppConfig();

  const socialLinks = [
    { icon: '𝕏', label: 'Twitter / X', href: '#' },
    { icon: 'in', label: 'LinkedIn', href: '#' },
    { icon: '📷', label: 'Instagram', href: '#' },
  ];

  return (
    <footer style={{ background: 'linear-gradient(180deg, #0D0B18 0%, #08060F 100%)' }}>
      {/* Top divider with glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ── Brand (2 cols) ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              {config.headerLogoUrl ? (
                <img src={config.headerLogoUrl} alt={config.appName} className="h-8 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <ScalesIcon />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-cinzel text-lg font-semibold tracking-widest text-white">LEGIS</span>
                    <span className="font-cinzel text-[9px] tracking-[0.35em] text-accent/70 -mt-0.5">CONNECT</span>
                  </div>
                </>
              )}
            </div>

            {/* Tagline */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {config.siteTagline || 'Conectando o presente do Direito ao futuro das soluções jurídicas com tecnologia avançada.'}
            </p>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {['LGPD', 'OAB Verificado', 'TLS/SSL', 'ISO 27001'].map(badge => (
                <span key={badge} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-500 font-medium">
                  ✓ {badge}
                </span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all duration-200 text-sm font-bold"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Contact */}
            {(config.contactEmail || config.contactPhone) && (
              <div className="space-y-1 pt-1">
                {config.contactEmail && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-primary/60">✉</span> {config.contactEmail}
                  </p>
                )}
                {config.contactPhone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-primary/60">📞</span> {config.contactPhone}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Plataforma ─────────────────────────────────────────────── */}
          <div>
            <h4 className="font-montserrat text-xs font-bold text-white tracking-widest uppercase mb-5">Plataforma</h4>
            <ul className="space-y-3">
              <NavLink onClick={() => onNavigate('search')}>Buscar Advogado</NavLink>
              <NavLink onClick={() => onNavigate('forLawyers')}>Para Advogados</NavLink>
              <NavLink onClick={() => onNavigate('forInterns')}>Para Bacharelandos</NavLink>
              <NavLink onClick={() => onNavigate('forSecretariado')}>Para Assist. Jurídico</NavLink>
              <NavLink onClick={() => onNavigate('forClients')}>Para Clientes</NavLink>
              <NavLink onClick={() => onNavigate('services')}>Serviços</NavLink>
            </ul>
          </div>

          {/* ── Acesso ─────────────────────────────────────────────────── */}
          <div>
            <h4 className="font-montserrat text-xs font-bold text-white tracking-widest uppercase mb-5">Acesso</h4>
            <ul className="space-y-3">
              <NavLink onClick={() => onNavigate('login')}>Entrar</NavLink>
              <NavLink onClick={() => onNavigate('signup')}>Criar Conta</NavLink>
              <NavLink onClick={() => onNavigate('forLawyers')}>Cadastro Advogado</NavLink>
              <NavLink onClick={() => onNavigate('forInterns')}>Cadastro Bacharelando</NavLink>
              <NavLink onClick={() => onNavigate('forSecretariado')}>Cadastro Assist. Jurídico</NavLink>
            </ul>
          </div>

          {/* ── Legal ──────────────────────────────────────────────────── */}
          <div>
            <h4 className="font-montserrat text-xs font-bold text-white tracking-widest uppercase mb-5">Legal & Ética</h4>
            <ul className="space-y-3">
              <NavLink onClick={onShowTerms}>Termos de Serviço</NavLink>
              <NavLink onClick={onShowPrivacy}>Política de Privacidade</NavLink>
              <NavLink onClick={onShowEtica}>Código de Ética OAB</NavLink>
              {config.customFields?.map(field => (
                <li key={field.id}>
                  <span className="text-gray-500 text-sm">{field.key}: {field.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div className="mt-14 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            {config.footerText || `© ${new Date().getFullYear()} LEGIS CONNECT. Todos os direitos reservados.`}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-700">
            <span>Desenvolvido com</span>
            <span className="text-primary">♥</span>
            <span>e tecnologia de ponta para o Direito Brasileiro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
