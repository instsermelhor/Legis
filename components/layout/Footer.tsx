import { Icon } from '@/components/common/IconComponents';
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
    { 
      label: 'Twitter / X', 
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      label: 'LinkedIn', 
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.99 0 1.8-.81 1.8-1.8 0-.99-.81-1.8-1.8-1.8-.99 0-1.8.81-1.8 1.8 0 .99.81 1.8 1.8 1.8m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
        </svg>
      )
    },
    { 
      label: 'Instagram', 
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
  ];


  return (
    <footer style={{ background: 'linear-gradient(180deg, #0D0B18 0%, #08060F 100%)' }}>
      {/* Top divider with glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ── Brand (2 cols) ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo e Área Restrita */}
            <div className="flex flex-wrap items-center gap-4">
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

              {/* Botão Área Restrita (Acesso ao Painel Admin em nova aba com subdomínio próprio) */}
              <a
                href="https://www.admin.legisconnect.com.br"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://www.legisconnect.com.br?adminLogin=1', '_blank');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-200 shadow-sm"
                title="Acesso Restrito ao Painel Administrativo (www.admin.legisconnect.com.br)"
              >
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Área Restrita</span>
              </a>
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
                    <span className="text-primary/60"><Icon name="✉" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span> {config.contactEmail}
                  </p>
                )}
                {config.contactPhone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-primary/60"><Icon name="📞" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span> {config.contactPhone}
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
            <span className="text-primary"><Icon name="♥" className="w-4 h-4 inline-block mr-1 align-text-bottom" /></span>
            <span>e tecnologia de ponta para o Direito Brasileiro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
