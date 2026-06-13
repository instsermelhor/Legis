import React, { useState, useEffect, useRef } from 'react';
import { b2cServices, b2bServices, ServiceItem } from '../../data/servicesData';
import type { View } from '../../types';
import { ServiceStore } from '../../utils/sessionStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'B2C' | 'B2B';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const tagConfig = {
  popular:  { label: 'Mais Contratado', cls: 'bg-amber-400/20 text-amber-300 border border-amber-400/30' },
  novo:     { label: 'Novo',            cls: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' },
  empresa:  { label: 'Para Empresas',   cls: 'bg-blue-400/20 text-blue-300 border border-blue-400/30' },
  destaque: { label: 'Destaque',        cls: 'bg-purple-400/20 text-purple-300 border border-purple-400/30' },
};

function formatPrice(n: number): string {
  return n.toLocaleString('pt-BR');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onContract,
}: {
  service: ServiceItem;
  onContract: (s: ServiceItem) => void;
}) {
  const tag = service.tag ? tagConfig[service.tag] : null;
  return (
    <article className="relative flex flex-col bg-gradient-to-b from-[#1E1B38] to-[#15122A] border border-[#2A2545] rounded-2xl p-6 hover-lift hover-glow transition-all duration-300 group">
      {/* Tag badge */}
      {tag && (
        <span className={`absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${tag.cls}`}>
          {tag.label}
        </span>
      )}

      {/* Icon + Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
          {service.icon}
        </div>
        <div className="pt-1">
          <h3 className="text-white font-bold text-base leading-snug font-montserrat">
            {service.title}
          </h3>
          <p className="text-[#9CA3D4] text-xs mt-0.5">
            ⏱ Prazo: até {service.deliveryDays === 1 ? '24h' : `${service.deliveryDays} dias`}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#A09CC4] text-sm leading-relaxed mb-5 flex-grow">
        {service.description}
      </p>

      {/* Features */}
      <ul className="space-y-1.5 mb-6">
        {service.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-[#C4B5FD]">
            <span className="text-purple-400 mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* Price + CTA */}
      <div className="mt-auto pt-5 border-t border-[#2A2545] flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#7A77A0] uppercase tracking-wide font-semibold">Investimento</p>
          <p className="text-purple-300 font-bold text-lg leading-none mt-0.5">
            R$ {formatPrice(service.priceFrom)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onContract(service)}
          className="btn-primary text-sm px-5 py-2.5 shrink-0"
          aria-label={`Contratar ${service.title}`}
        >
          Contratar
        </button>
      </div>
    </article>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#2A2545] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-[#1A1730] hover:bg-[#1E1B38] transition-colors group"
        aria-expanded={open}
      >
        <span className="text-white font-semibold text-sm pr-4 group-hover:text-purple-300 transition-colors">
          {q}
        </span>
        <span className={`text-purple-400 transition-transform duration-300 shrink-0 text-lg ${open ? 'rotate-45' : 'rotate-0'}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-6 py-4 bg-[#15122A] border-t border-[#2A2545] animate-slide-down">
          <p className="text-[#A09CC4] text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Modal de Contratação ─────────────────────────────────────────────────────
function ContractModal({
  service,
  onClose,
}: {
  service: ServiceItem;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10)
      e.phone = 'Celular inválido (mín. 10 dígitos)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    // Persist lead in localStorage for possible admin view
    try {
      const leads = JSON.parse(localStorage.getItem('legis_public_leads') ?? '[]');
      leads.push({
        id: `lead-${Date.now()}`,
        service: service.id,
        serviceTitle: service.title,
        ...form,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('legis_public_leads', JSON.stringify(leads));
    } catch { /* noop */ }

    setStep('success');
  };

  // Mask phone input
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.replace(/\D/g, '').length > 6) {
      const digits = v.replace(/\D/g, '');
      v = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setForm((prev) => ({ ...prev, phone: v }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Contratar ${service.title}`}
    >
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#1E1B38] to-[#15122A] border border-[#2A2545] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2545] bg-black/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{service.icon}</span>
            <div>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Contratar Serviço</p>
              <p className="text-white font-bold text-sm">{service.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#7A77A0] hover:text-white transition-colors text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            {/* Price summary */}
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[#A09CC4] text-xs">Investimento a partir de</p>
                <p className="text-purple-300 font-bold text-xl">R$ {formatPrice(service.priceFrom)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#A09CC4] text-xs">Prazo</p>
                <p className="text-white text-sm font-semibold">
                  {service.deliveryDays === 1 ? '24 horas' : `${service.deliveryDays} dias úteis`}
                </p>
              </div>
            </div>

            <p className="text-[#A09CC4] text-xs">
              Preencha seus dados e nossa equipe entrará em contato via WhatsApp em até 1h útil.
            </p>

            {/* Fields */}
            {(
              [
                { key: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo' },
                { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
              ] as const
            ).map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-bold text-[#7A77A0] uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full bg-[#0F0D1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#4A4670] focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${errors[key] ? 'border-red-500' : 'border-[#2A2545] focus:border-purple-500'}`}
                />
                {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-[11px] font-bold text-[#7A77A0] uppercase tracking-wider mb-1.5">
                Celular (WhatsApp)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhone}
                placeholder="(11) 99999-9999"
                className={`w-full bg-[#0F0D1A] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#4A4670] focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all ${errors.phone ? 'border-red-500' : 'border-[#2A2545] focus:border-purple-500'}`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-sm mt-2">
              🚀 Solicitar Atendimento
            </button>

            <p className="text-center text-[10px] text-[#4A4670]">
              🔒 Seus dados são protegidos pela LGPD (Lei 13.709/2018)
            </p>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4 animate-scale-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl animate-bounce">
              ✅
            </div>
            <h3 className="text-white font-bold text-xl font-montserrat">Solicitação Recebida!</h3>
            <p className="text-[#A09CC4] text-sm leading-relaxed">
              Nossa equipe recebeu sua solicitação para{' '}
              <span className="text-purple-300 font-semibold">{service.title}</span>. Você será
              contactado via WhatsApp em até 1 hora útil.
            </p>
            <div className="bg-[#0F0D1A] rounded-xl p-4 border border-[#2A2545] text-left space-y-1">
              <p className="text-xs text-[#7A77A0] uppercase tracking-wider font-bold">Próximos Passos</p>
              <p className="text-[#C4B5FD] text-xs">1. Nossa equipe analisa seu caso</p>
              <p className="text-[#C4B5FD] text-xs">2. Advogado especialista é designado</p>
              <p className="text-[#C4B5FD] text-xs">3. Você recebe proposta personalizada</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full py-3 text-sm"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Section wrappers ─────────────────────────────────────────────────────────
function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal-section ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
interface ServicesPublicPageProps {
  onNavigate?: (view: View) => void;
}

export const ServicesPublicPage: React.FC<ServicesPublicPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabId>('B2C');
  const [contractService, setContractService] = useState<ServiceItem | null>(null);

  const services = activeTab === 'B2C' ? b2cServices : b2bServices;

  // Scroll to catalog when CTA clicked
  const catalogRef = useRef<HTMLDivElement>(null);
  const scrollToCatalog = () =>
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const WHATSAPP_NUMBER = '5511999999999';
  const WHATSAPP_MSG = encodeURIComponent(
    'Olá! Vim pelo site da Legis Connect e gostaria de saber mais sobre os serviços.'
  );

  return (
    <div className="bg-[#0F0C1E] min-h-screen text-white font-sans">
      {/* ─────────────────────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F0C1E 0%, #1A0A2E 45%, #0D1B2A 100%)',
        }}
        aria-label="Serviços de Eficiência Jurídica — Legis Connect"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-700/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-700/15 blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Eyebrow */}
          <p className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 animate-fade-in uppercase tracking-widest">
            ⚡ Soluções Jurídicas Produtizadas
          </p>

          {/* Headline H1 */}
          <h1 className="font-montserrat font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 animate-slide-up">
            Resolva suas demandas jurídicas{' '}
            <span className="text-gradient-purple">em cliques.</span>
            <br className="hidden sm:block" />
            <span className="text-white/80 text-3xl sm:text-4xl lg:text-5xl font-bold">
              {' '}Sem burocracia.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#A09CC4] text-lg sm:text-xl max-w-2xl mx-auto mb-8 animate-slide-up delay-200">
            A Legis Connect une tecnologia de ponta à supervisão de{' '}
            <strong className="text-white">advogados especialistas credenciados pela OAB</strong>{' '}
            para entregar soluções jurídicas com prazo, preço fixo e total transparência.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up delay-300">
            <button
              type="button"
              onClick={scrollToCatalog}
              className="btn-primary text-base px-8 py-4 animate-pulse-glow"
              id="hero-cta-services"
            >
              🗂️ Ver Serviços Disponíveis
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-8 py-4"
              id="hero-cta-whatsapp"
            >
              💬 Falar com Consultor
            </a>
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 animate-fade-in delay-400">
            {[
              { icon: '⭐', stat: '4.9/5', label: 'Avaliação Média' },
              { icon: '✅', stat: '+3.200', label: 'Casos Resolvidos' },
              { icon: '⚖️', stat: '100%', label: 'OAB Regulamentado' },
              { icon: '🔒', stat: 'LGPD', label: 'Total Conformidade' },
            ].map(({ icon, stat, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span>
                <span className="font-montserrat font-bold text-white text-xl">{stat}</span>
                <span className="text-[#7A77A0] text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          2. COMO FUNCIONA
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0F0C1E] border-y border-[#1E1B38]" aria-label="Como funciona">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
              Processo Simples
            </p>
            <h2 className="font-montserrat font-bold text-3xl text-white mb-3">
              Do Problema à Solução em 3 Passos
            </h2>
            <p className="text-[#A09CC4] mb-14 max-w-xl mx-auto">
              Nada de filas, horários de cartório ou papel. Tudo digital, rápido e transparente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line — desktop only */}
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-purple-600/0 via-purple-600/40 to-purple-600/0" />

              {[
                {
                  step: '01',
                  icon: '🎯',
                  title: 'Escolha o Serviço',
                  desc: 'Navegue pelo catálogo e selecione o serviço que resolve sua situação. Preço e prazo mostrados com clareza.',
                },
                {
                  step: '02',
                  icon: '🤖',
                  title: 'IA Faz a Triagem',
                  desc: 'Nossa inteligência artificial analisa seu caso e conecta você ao advogado especialista ideal na sua região.',
                },
                {
                  step: '03',
                  icon: '📊',
                  title: 'Acompanhe Online',
                  desc: 'Acesse seu painel 24h para ver o progresso, enviar documentos e se comunicar com seu advogado.',
                },
              ].map(({ step, icon, title, desc }, i) => (
                <div
                  key={step}
                  className={`relative flex flex-col items-center text-center animate-slide-up delay-${(i + 1) * 200}`}
                >
                  {/* Step number */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/20 border border-purple-500/30 flex flex-col items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{icon}</span>
                  </div>
                  <span className="absolute top-0 right-0 sm:right-auto sm:-top-2 sm:left-1/2 text-[10px] font-bold text-purple-400 bg-[#1E1B38] border border-purple-500/30 rounded-full px-2 py-0.5">
                    {step}
                  </span>
                  <h3 className="font-montserrat font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-[#A09CC4] text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          3. CATÁLOGO DE SERVIÇOS
      ───────────────────────────────────────────────────────── */}
      <section
        ref={catalogRef}
        className="py-20 bg-[#0A0818]"
        id="catalogo"
        aria-label="Catálogo de Serviços"
      >
        <RevealSection>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-10">
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                Catálogo
              </p>
              <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-white mb-3">
                Escolha o Serviço Ideal para Você
              </h2>
              <p className="text-[#A09CC4] max-w-2xl mx-auto">
                Preço fixo, prazo determinado, resultado garantido por advogados especializados.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-[#1A1730] border border-[#2A2545] rounded-2xl p-1.5 gap-1">
                {(
                  [
                    { id: 'B2C' as TabId, label: '👤 Para Você (Pessoa Física)' },
                    { id: 'B2B' as TabId, label: '🏢 Para Sua Empresa' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-[#A09CC4] hover:text-white hover:bg-white/5'
                    }`}
                    aria-pressed={activeTab === id}
                    id={`tab-${id.toLowerCase()}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {services.map((s) => (
                <div key={s.id}>
                  <ServiceCard service={s} onContract={setContractService} />
                </div>
              ))}
            </div>

            {/* Bottom trust nudge */}
            <p className="text-center text-[#4A4670] text-xs mt-10">
              🔒 Pagamento seguro · 100% revisado por advogados · LGPD compliant · OAB regulamentado
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          4. DIFERENCIAIS
      ───────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #1A0A2E 0%, #0F0C1E 50%, #0D1B2A 100%)',
        }}
        aria-label="Diferenciais Legis Connect"
      >
        <RevealSection>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                Por Que Escolher a Legis Connect?
              </p>
              <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-white">
                O Escritório do Futuro,{' '}
                <span className="text-gradient-purple">Disponível Agora</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔐',
                  title: 'Segurança Máxima',
                  color: 'from-blue-600/20 to-indigo-600/10',
                  border: 'border-blue-500/20',
                  items: [
                    'Total conformidade com a LGPD',
                    'Sigilo profissional garantido pela OAB',
                    'Dados criptografados ponta a ponta',
                    'Conformidade com Provimento 205/2021 OAB',
                  ],
                },
                {
                  icon: '🤖',
                  title: 'Inteligência Artificial',
                  color: 'from-purple-600/20 to-violet-600/10',
                  border: 'border-purple-500/20',
                  items: [
                    'Triagem ultrarrápida do seu caso',
                    'Match com especialista por área e região',
                    'Revisão automática de documentos',
                    'Alertas de prazos processuais',
                  ],
                },
                {
                  icon: '⚖️',
                  title: 'Profissionais Qualificados',
                  color: 'from-amber-600/20 to-yellow-600/10',
                  border: 'border-amber-500/20',
                  items: [
                    'Todos os advogados têm OAB ativa verificada',
                    'Especialização certificada por área',
                    'Avaliações públicas de clientes reais',
                    'Experiência mínima de 3 anos exigida',
                  ],
                },
              ].map(({ icon, title, color, border, items }) => (
                <div
                  key={title}
                  className={`bg-gradient-to-b ${color} border ${border} rounded-2xl p-7 hover-lift transition-all`}
                >
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="font-montserrat font-bold text-white text-lg mb-4">{title}</h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#C4B5FD]">
                        <span className="text-purple-400 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          5. DEPOIMENTOS
      ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0A0818]" aria-label="Depoimentos de clientes">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                Histórias Reais
              </p>
              <h2 className="font-montserrat font-bold text-3xl text-white">
                O Que Nossos Clientes Dizem
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Fernanda Oliveira',
                  city: 'São Paulo, SP',
                  avatar: '👩‍💼',
                  rating: 5,
                  service: 'Análise de Contrato de Aluguel',
                  text: 'Em 48h recebi um relatório completo. Descobri 3 cláusulas abusivas que meu senhorio tentou incluir. Economizei muito dinheiro! O atendimento foi impecável.',
                },
                {
                  name: 'Ricardo Andrade',
                  city: 'Curitiba, PR',
                  avatar: '👨‍💻',
                  rating: 5,
                  service: 'Divórcio Consensual Online',
                  text: 'Achei que seria complicado e caro. A Legis Connect coordenou tudo em 15 dias, sem estresse. Nunca precisei ir ao fórum. Recomendo de olhos fechados.',
                },
                {
                  name: 'Mariana Costa',
                  city: 'Belo Horizonte, MG',
                  avatar: '👩‍🦱',
                  rating: 5,
                  service: 'Defesa do Consumidor',
                  text: 'Minha operadora de plano de saúde negou um procedimento indevido. Em 5 dias, o advogado conseguiu a aprovação. Serviço de excelência!',
                },
                {
                  name: 'Paulo Henrique S.',
                  city: 'Recife, PE',
                  avatar: '🧑‍💼',
                  rating: 5,
                  service: 'Registro de Marca no INPI',
                  text: 'Processo transparente do início ao fim. Recebo atualizações automáticas do andamento. Minha marca está registrada e meu negócio protegido.',
                },
                {
                  name: 'Juliana Freitas',
                  city: 'Fortaleza, CE',
                  avatar: '👩‍⚕️',
                  rating: 5,
                  service: 'Termos de Uso + Política LGPD',
                  text: 'Minha clínica precisa estar em conformidade com a LGPD. O serviço foi personalizado, entregue no prazo e com um nível de detalhamento impressionante.',
                },
                {
                  name: 'Thiago Mendes',
                  city: 'Porto Alegre, RS',
                  avatar: '👨‍🔧',
                  rating: 5,
                  service: 'Revisão de Contrato de Trabalho',
                  text: 'Fui demitido sem justa causa e tinha dúvidas sobre meus direitos. A advogada identificou que meu FGTS estava sendo pago incorretamente há 2 anos. Recuperei tudo.',
                },
              ].map(({ name, city, avatar, rating, service, text }) => (
                <div
                  key={name}
                  className="bg-gradient-to-b from-[#1E1B38] to-[#15122A] border border-[#2A2545] rounded-2xl p-6 hover-lift"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-[#C4B5FD] text-sm leading-relaxed mb-5 italic">
                    "{text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#2A2545]">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{name}</p>
                      <p className="text-[#7A77A0] text-xs">{city}</p>
                      <p className="text-purple-400 text-[10px] font-semibold mt-0.5">{service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          6. FAQ
      ───────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(180deg, #0F0C1E 0%, #13102A 100%)' }}
        aria-label="Perguntas Frequentes"
      >
        <RevealSection>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                Dúvidas Frequentes
              </p>
              <h2 className="font-montserrat font-bold text-3xl text-white">
                Antes de Decidir, Tire Suas Dúvidas
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Os serviços são feitos por robôs ou por advogados humanos?',
                  a: 'A Inteligência Artificial faz a triagem inicial, automatiza tarefas repetitivas e acelera o processo — mas 100% dos documentos, pareceres e peças jurídicas são elaborados, revisados e assinados por advogados humanos com OAB ativa. A IA é nossa ferramenta, não nossa substituta.',
                },
                {
                  q: 'Como sei se meu caso tem direito?',
                  a: 'Comece com a Consultoria Jurídica Expressa (R$ 97). Em 60 minutos, um advogado especialista avalia seu caso, explica seus direitos em linguagem simples e te orienta sobre as melhores estratégias. É o ponto de partida ideal antes de qualquer decisão.',
                },
                {
                  q: 'E se eu não ficar satisfeito com o resultado?',
                  a: 'Todos os serviços têm escopo definido e revisões ilimitadas dentro do prazo contratado. Caso haja problema na entrega, nossa equipe de qualidade é acionada imediatamente e refaremos o trabalho sem custo adicional.',
                },
                {
                  q: 'Quais são as formas de pagamento?',
                  a: 'Aceitamos cartão de crédito (em até 12x), débito, Pix e boleto bancário. Para serviços de maior valor, oferecemos parcelamento personalizado. O pagamento é processado somente após o cliente confirmar os termos do serviço.',
                },
                {
                  q: 'Meus dados e informações estão seguros?',
                  a: 'Absolutamente. A Legis Connect segue rigorosamente a LGPD (Lei 13.709/2018). Seus dados são criptografados em trânsito e em repouso, nunca são vendidos ou compartilhados com terceiros, e são acessados apenas pelo advogado responsável pelo seu caso, sob sigilo profissional regulamentado pela OAB.',
                },
                {
                  q: 'Posso cancelar o serviço depois de contratar?',
                  a: 'Você tem 7 dias corridos após a contratação para cancelar sem custo (Código de Defesa do Consumidor, Art. 49). Após o início do trabalho, o cancelamento é proporcional ao que já foi executado.',
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <FaqItem q={q} a={a} />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          CTA FINAL
      ───────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{
          background:
            'linear-gradient(135deg, #2D1B69 0%, #7C3AED 50%, #1A0A2E 100%)',
          backgroundSize: '200% 200%',
        }}
        aria-label="Chamada para ação final"
      >
        <RevealSection>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-montserrat font-bold text-3xl sm:text-4xl text-white mb-4">
              Pronto para Resolver Sua Questão Jurídica?
            </h2>
            <p className="text-purple-200 text-lg mb-10">
              Mais de 3.200 clientes já encontraram a solução que precisavam. Você é o próximo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="btn-primary bg-white !text-purple-700 hover:!bg-purple-50 text-base px-8 py-4"
                style={{ background: 'white', color: '#6D28D9' }}
                id="final-cta-services"
              >
                🗂️ Ver Todos os Serviços
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white/40 text-white text-base px-8 py-4"
                id="final-cta-whatsapp"
              >
                💬 Falar com Consultor Agora
              </a>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ─────────────────────────────────────────────────────────
          7. FOOTER JURÍDICO
      ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#07060F] border-t border-[#1A1730] py-12" aria-label="Rodapé">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <p className="font-cinzel text-white font-bold text-xl mb-3">LEGIS CONNECT</p>
              <p className="text-[#7A77A0] text-sm leading-relaxed mb-4">
                Plataforma jurídica que conecta advogados especialistas, clientes, bacharelandos e
                assistentes jurídicos com tecnologia de ponta.
              </p>
              <p className="text-[#4A4670] text-xs">
                CNPJ: 00.000.000/0001-00 · Sede: São Paulo, SP
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Serviços</p>
              <ul className="space-y-2">
                {b2cServices.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('B2C');
                        scrollToCatalog();
                      }}
                      className="text-[#7A77A0] text-sm hover:text-purple-400 transition-colors text-left"
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Legal</p>
              <ul className="space-y-2 text-[#7A77A0] text-sm">
                <li>Termos de Uso</li>
                <li>Política de Privacidade</li>
                <li>Política de Cookies</li>
                <li>Código de Ética OAB</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1A1730] pt-6 space-y-3">
            {/* OAB compliance note */}
            <p className="text-[#4A4670] text-[11px] leading-relaxed">
              <strong className="text-[#7A77A0]">Nota de Conformidade Jurídica:</strong> A Legis
              Connect opera em conformidade com as diretrizes de publicidade informativa da Ordem dos
              Advogados do Brasil (OAB), conforme o Provimento n.º 205/2021 do Conselho Federal e o
              Código de Ética e Disciplina da OAB. A plataforma não exerce advocacia, mas intermedia e
              conecta profissionais jurídicos habilitados com quem necessita de serviços jurídicos. Todos
              os atos e documentos jurídicos são de exclusiva responsabilidade dos advogados
              credenciados e registrados na OAB.
            </p>
            <p className="text-[#4A4670] text-[11px]">
              © {new Date().getFullYear()} Legis Connect Tecnologia Jurídica Ltda. Todos os direitos
              reservados. Os preços indicados são estimados e sujeitos à avaliação do caso concreto.
            </p>
          </div>
        </div>
      </footer>

      {/* Contract Modal */}
      {contractService && (
        <ContractModal
          service={contractService}
          onClose={() => setContractService(null)}
        />
      )}
    </div>
  );
};
