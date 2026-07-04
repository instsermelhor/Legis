import React, { useState } from 'react';
import { CARD, DIVIDER } from './theme';

/**
 * DashboardShell — layout unificado de painel, extraído do módulo Advogado
 * (referência canônica da identidade visual Legis Connect).
 *
 * Sidebar em card arredondado com navegação agrupada, cabeçalho de usuário
 * com avatar, barra mobile com botão ☰ Menu, e área de conteúdo em card.
 * Usado por TODOS os painéis: advogado, cliente, bacharel, assistente
 * jurídico/secretariado e administrativo.
 */

export interface ShellNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode; // emoji ou SVG
  desc?: string;
  badge?: string;
}

export interface ShellNavGroup<T extends string = string> {
  title?: string;
  items: ShellNavItem<T>[];
}

interface DashboardShellProps<T extends string = string> {
  /** Nome exibido no cabeçalho da sidebar */
  userName: string;
  /** Subtítulo — ex.: "Painel do Advogado", "Painel do Cliente" */
  panelLabel: string;
  photoUrl?: string;
  groups: ShellNavGroup<T>[];
  active: T;
  onSelect: (id: T) => void;
  onLogout?: () => void;
  /** conteúdo extra na sidebar, abaixo do cabeçalho do usuário */
  sidebarExtra?: React.ReactNode;
  /** envolve o conteúdo no card branco padrão (default true) */
  contentCard?: boolean;
  children: React.ReactNode;
}

export function DashboardShell<T extends string = string>({
  userName, panelLabel, photoUrl, groups, active, onSelect, onLogout,
  sidebarExtra, contentCard = true, children,
}: DashboardShellProps<T>) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const initial = userName?.charAt(0)?.toUpperCase() || '?';

  const Avatar = photoUrl ? (
    <img src={photoUrl} alt={userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-600 shrink-0" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-lg ring-2 ring-violet-600/30 shrink-0">
      {initial}
    </div>
  );

  const NavButton: React.FC<{ item: ShellNavItem<T> }> = ({ item }) => (
    <button
      onClick={() => { onSelect(item.id); setShowMobileMenu(false); }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
        active === item.id
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/10'
      }`}
    >
      <span className="shrink-0">{item.icon}</span>
      <span className="flex-1 text-left truncate">{item.label}</span>
      {item.badge && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
          active === item.id
            ? 'bg-white/20 text-white'
            : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
        }`}>
          {item.badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Barra Mobile ── */}
      <div className={`md:hidden flex items-center justify-between ${CARD} rounded-xl p-3.5 mb-4`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {Avatar}
          <div className="min-w-0">
            <span className="block text-xs font-bold text-gray-800 dark:text-white truncate">{userName}</span>
            <span className="block text-[9px] text-gray-400">{panelLabel}</span>
          </div>
        </div>
        <button
          onClick={() => setShowMobileMenu(v => !v)}
          className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow shrink-0"
        >
          <span>{showMobileMenu ? '✕ Fechar' : '☰ Menu'}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start animate-fade-in">

        {/* ── Sidebar ── */}
        <aside className={`w-full md:w-64 shrink-0 ${CARD} rounded-xl p-4 h-fit ${showMobileMenu ? 'block' : 'hidden md:block'}`}>
          <div className={`hidden md:flex items-center gap-3 ${DIVIDER} pb-4 mb-4`}>
            {Avatar}
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-800 dark:text-white truncate">{userName}</h3>
              <p className="text-[9px] text-gray-400 font-medium">{panelLabel}</p>
            </div>
          </div>

          {sidebarExtra}

          <nav className="space-y-4">
            {groups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {group.title && (
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2.5 mb-1.5">
                    {group.title}
                  </p>
                )}
                {group.items.map(item => <NavButton key={item.id} item={item} />)}
              </div>
            ))}

            {onLogout && (
              <div className={`space-y-1 border-t border-gray-100 dark:border-[#2A2545] pt-3`}>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150"
                >
                  <span>🚪</span> Sair da Conta
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* ── Conteúdo ── */}
        {contentCard ? (
          <main className={`flex-grow ${CARD} rounded-xl p-6 sm:p-8 min-w-0 w-full`}>
            {children}
          </main>
        ) : (
          <main className="flex-grow min-w-0 w-full">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
