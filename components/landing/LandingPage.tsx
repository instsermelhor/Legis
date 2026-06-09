import React, { useEffect, useRef, useState } from 'react';
import { CaseDescriptionForm } from './CaseDescriptionForm';
import type { Lawyer, MapsSearchResult } from '../../types';

interface LandingPageProps {
  onSearch: (results: Lawyer[], mapsData: MapsSearchResult | null) => void;
}

// ── Animated counter hook ─────────────────────────────────────────────────
const useCounter = (target: number, duration = 2000, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
};

// ── Intersection observer hook ────────────────────────────────────────────
const useVisible = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

// ── Stat card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: number; suffix?: string; label: string; icon: string; started: boolean }> = ({ value, suffix = '+', label, icon, started }) => {
  const count = useCounter(value, 2200, started);
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-montserrat text-4xl md:text-5xl font-bold text-gradient-purple mb-1">
        {count.toLocaleString('pt-BR')}{suffix}
      </div>
      <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
};

// ── Testimonial ───────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Dra. Ana Carolina Lima',
    role: 'Advogada Tributarista · OAB/SP 245.891',
    text: 'A LEGIS CONNECT transformou minha captação de clientes. Em 3 meses, tripliquei o número de consultas qualificadas. A plataforma transmite exatamente o nível de profissionalismo que meu escritório exige.',
    avatar: '⚖️',
    rating: 5,
  },
  {
    name: 'Carlos Eduardo Mendes',
    role: 'Empresário · São Paulo, SP',
    text: 'Encontrei o advogado ideal para minha empresa em menos de 2 dias. O processo foi transparente, seguro e extremamente eficiente. Não consigo imaginar como funcionava antes dessa tecnologia.',
    avatar: '💼',
    rating: 5,
  },
  {
    name: 'Dr. Roberto Alves',
    role: 'Advogado Criminalista · OAB/RJ 184.320',
    text: 'O sistema de gerenciamento de casos é excepcional. Consigo acompanhar todos os meus processos, comunicar com clientes e organizar documentos em um único lugar. Recomendo fortemente.',
    avatar: '🏛️',
    rating: 5,
  },
];

// ── Feature card ──────────────────────────────────────────────────────────
const features = [
  {
    icon: '🤖',
    title: 'IA Jurídica Avançada',
    desc: 'Nossa inteligência artificial analisa seu caso e identifica os advogados mais compatíveis com base em especialidade, localização e histórico de sucesso.',
    color: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/20',
  },
  {
    icon: '🔒',
    title: 'Segurança & Sigilo',
    desc: 'Dados criptografados de ponta a ponta. Conformidade total com LGPD e os princípios éticos da OAB. Seus dados jurídicos estão protegidos.',
    color: 'from-blue-500/20 to-indigo-600/10',
    border: 'border-blue-500/20',
  },
  {
    icon: '⚡',
    title: 'Conexão em Minutos',
    desc: 'Da descrição do seu caso ao primeiro contato com o advogado ideal em poucos minutos. Eficiência que respeita o valor do seu tempo.',
    color: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/20',
  },
  {
    icon: '📊',
    title: 'Dashboard Profissional',
    desc: 'Gestão completa de processos, documentos, agenda, finanças e comunicação em uma plataforma integrada de alto desempenho.',
    color: 'from-teal-500/20 to-emerald-600/10',
    border: 'border-teal-500/20',
  },
  {
    icon: '🎓',
    title: 'Ecossistema Jurídico',
    desc: 'Conectamos advogados, bacharelandos, assistentes jurídicos e clientes em um ecossistema completo que impulsiona carreiras e negócios.',
    color: 'from-rose-500/20 to-pink-600/10',
    border: 'border-rose-500/20',
  },
  {
    icon: '🏆',
    title: 'Perfis Verificados',
    desc: 'Todos os advogados passam por verificação de registro OAB, especialidades e histórico profissional. Você sempre contrata com segurança.',
    color: 'from-yellow-500/20 to-gold/10',
    border: 'border-yellow-500/20',
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────
const steps = [
  { num: '01', icon: '📝', title: 'Descreva seu Caso', desc: 'Forneça os detalhes da sua necessidade jurídica de forma segura. Nossa IA processa as informações com precisão.' },
  { num: '02', icon: '🎯', title: 'Receba Sugestões Precisas', desc: 'O sistema analisa especialidades, localização e avaliações para indicar os advogados mais adequados para seu caso.' },
  { num: '03', icon: '🤝', title: 'Conecte-se & Contrate', desc: 'Entre em contato direto, agende consultas e formalize a contratação com total transparência e segurança jurídica.' },
];

// ── Who is it for ─────────────────────────────────────────────────────────
const audiences = [
  { icon: '⚖️', title: 'Advogados', desc: 'Expanda sua clientela, gerencie processos e organize seu escritório com ferramentas profissionais de alta performance.', cta: 'Sou Advogado', view: 'forLawyers' as const },
  { icon: '🏢', title: 'Clientes & Empresas', desc: 'Encontre o especialista jurídico ideal para sua situação com segurança, transparência e eficiência tecnológica.', cta: 'Sou Cliente', view: 'forClients' as const },
  { icon: '🎓', title: 'Bacharelandos', desc: 'Inicie sua carreira jurídica conectando-se a escritórios reconhecidos e adquirindo experiência prática de alto nível.', cta: 'Sou Bacharelando', view: 'forInterns' as const },
  { icon: '📋', title: 'Secret./Assist. Jurídico', desc: 'Profissionalize sua atuação e conecte-se a escritórios que valorizam a expertise em secretariado e assistência jurídica.', cta: 'Sou Assist. Jurídico', view: 'forSecretariado' as const },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSearch }) => {
  const { ref: statsRef, visible: statsVisible } = useVisible();

  return (
    <div className="min-h-screen bg-surface-dark text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center bg-animated-gradient overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        {/* Glow blobs */}
        <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%]  w-[400px] h-[400px] rounded-full bg-accent/15  blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%]  right-[20%] w-[200px] h-[200px] rounded-full bg-secondary/10 blur-[60px]  pointer-events-none animate-float" />

        {/* Orbital decorations */}
        <div className="orbital absolute top-20 right-[8%]  w-64  h-64  delay-200" style={{ animationDuration: '10s' }} />
        <div className="orbital absolute bottom-20 left-[6%] w-48  h-48  delay-500" style={{ animationDuration: '14s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: headline + CTAs */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-sm font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Plataforma LegalTech Nº1 do Brasil
              </div>

              {/* Headline */}
              <div className="animate-slide-up delay-100">
                <h1 className="font-montserrat text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                  <span className="block text-white">O Futuro do</span>
                  <span className="block text-gradient-purple">Direito Digital</span>
                  <span className="block text-white">está aqui.</span>
                </h1>
              </div>

              {/* Subheadline */}
              <p className="animate-slide-up delay-200 text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed">
                A <strong className="text-white font-semibold">LEGIS CONNECT</strong> une sofisticação jurídica e tecnologia avançada para conectar advogados, clientes e profissionais em um ecossistema de alto desempenho.
              </p>

              {/* CTA buttons */}
              <div className="animate-slide-up delay-300 flex flex-wrap gap-4">
                <a href="#buscar" className="btn-primary text-base py-3.5 px-7">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  Buscar Advogado Agora
                </a>
                <a href="#como-funciona" className="btn-secondary text-base py-3.5 px-7">
                  Como funciona
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </a>
              </div>

              {/* Trust badges */}
              <div className="animate-fade-in delay-500 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  LGPD Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Verificado OAB
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Criptografia TLS
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Atendimento 24h
                </span>
              </div>
            </div>

            {/* Right: search form card */}
            <div id="buscar" className="animate-scale-in delay-300">
              <div className="card-dark p-8 hover-glow">
                {/* Form header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">⚖️</div>
                  <div>
                    <h2 className="font-montserrat text-lg font-bold text-white">Descreva seu Caso</h2>
                    <p className="text-sm text-gray-400">Nossa IA encontrará o advogado ideal</p>
                  </div>
                </div>
                <CaseDescriptionForm onSearch={onSearch} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 text-xs animate-float">
          <span>Role para explorar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F0D1A 0%, #13102A 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCard value={1200} label="Advogados Verificados" icon="⚖️" started={statsVisible} />
            <StatCard value={8500} label="Casos Conectados" icon="📁" started={statsVisible} />
            <StatCard value={27} label="Estados Atendidos" icon="🗺️" started={statsVisible} suffix="+" />
            <StatCard value={98} label="Satisfação dos Clientes" icon="⭐" started={statsVisible} suffix="%" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #13102A 0%, #0F0D1A 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-section">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-sm font-semibold mb-6">
              ✦ Tecnologia de ponta
            </div>
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
              Tudo que você precisa,<br/>
              <span className="text-gradient-purple">em um só lugar.</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Desenvolvida por especialistas em direito e tecnologia, a LEGIS CONNECT redefine padrões de excelência no setor jurídico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`reveal-section card-dark p-6 hover-lift border bg-gradient-to-br ${f.color} ${f.border}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-montserrat text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F0D1A 0%, #1A0A2E 100%)' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-section">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-sm font-semibold mb-6">
              ✦ Simples e eficiente
            </div>
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-gray-400 text-lg">Encontre o advogado ideal em 3 passos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30" />

            {steps.map((s, i) => (
              <div key={i} className={`reveal-section text-center delay-${(i + 1) * 200}`}>
                <div className="relative inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-primary/15 border border-primary/30 text-3xl mb-6 mx-auto animate-pulse-glow">
                  {s.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center font-montserrat text-xs font-bold text-white shadow-glow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-montserrat text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHO IS IT FOR
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, #1A0A2E 0%, #0F0D1A 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-section">
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
              Para quem é a<br/>
              <span className="text-gradient-purple">LEGIS CONNECT?</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Uma plataforma desenhada para todos os agentes do ecossistema jurídico.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((a, i) => (
              <div
                key={i}
                className={`reveal-section card-dark p-8 text-center hover-lift cursor-pointer group delay-${(i + 1) * 100}`}
                onClick={() => {}}
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{a.icon}</div>
                <h3 className="font-montserrat text-xl font-bold text-white mb-3">{a.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{a.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {a.cta}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0F0D1A 0%, #13102A 100%)' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-section">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-accent text-sm font-semibold mb-6">
              ✦ Quem usa, recomenda
            </div>
            <h2 className="font-montserrat text-4xl md:text-5xl font-bold text-white mb-4">
              O que dizem sobre<br/>
              <span className="text-gradient-purple">a plataforma</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className={`reveal-section card-dark p-8 hover-glow delay-${(i + 1) * 150}`}>
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cta-gradient" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-black/20 blur-[80px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="reveal-section max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8">
              ⚡ Comece gratuitamente hoje
            </div>
            <h2 className="font-montserrat text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              O Direito do futuro<br/>começa agora.
            </h2>
            <p className="text-xl text-white/75 mb-10 leading-relaxed">
              Junte-se a mais de 1.200 advogados e 8.500 clientes que já transformaram sua relação com o universo jurídico.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-montserrat font-bold text-base rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Criar Conta Gratuita
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-montserrat font-semibold text-base rounded-xl border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                Saber mais
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-6 text-white/50 text-sm flex-wrap">
              <span>✓ Sem cartão de crédito</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />
              <span>✓ Configuração em 2 minutos</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />
              <span>✓ Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
