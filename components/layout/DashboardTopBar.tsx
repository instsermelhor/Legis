import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardRole = 'admin' | 'lawyer' | 'secretary' | 'intern';

interface DashboardTopBarProps {
  /** Panel title shown in the center/left area */
  title: string;
  /** Optional subtitle shown below title on md+ screens */
  subtitle?: string;
  /** Initial letter(s) for the avatar circle */
  avatarLetter?: string;
  /** Role — controls accent color */
  role?: DashboardRole;
  /** Show "← Site" back button */
  onNavigateHome?: () => void;
  /** Logout callback — renders logout button when provided */
  onLogout?: () => void;
  /** Optional slot for extra actions on the right side (e.g. Super Admin badge) */
  rightExtra?: React.ReactNode;
  /** Optional slot for a mobile menu toggle button */
  mobileMenuButton?: React.ReactNode;
  /** Whether the system status indicator should be shown */
  showSystemStatus?: boolean;
}

// ─── Color map per role ───────────────────────────────────────────────────────

const ROLE_COLORS: Record<DashboardRole, {
  avatar: string;
  badge: string;
  backBtn: string;
}> = {
  admin: {
    avatar: 'bg-violet-600',
    badge: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50',
    backBtn: 'text-violet-600 dark:text-violet-400',
  },
  lawyer: {
    avatar: 'bg-violet-600',
    badge: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50',
    backBtn: 'text-violet-600 dark:text-violet-400',
  },
  secretary: {
    avatar: 'bg-purple-600',
    badge: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50',
    backBtn: 'text-purple-600 dark:text-purple-400',
  },
  intern: {
    avatar: 'bg-indigo-600',
    badge: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
    backBtn: 'text-indigo-600 dark:text-indigo-400',
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  title,
  subtitle,
  avatarLetter,
  role = 'admin',
  onNavigateHome,
  onLogout,
  rightExtra,
  mobileMenuButton,
  showSystemStatus = false,
}) => {
  const colors = ROLE_COLORS[role];

  return (
    <div className="
      sticky top-0 z-30
      bg-white/95 dark:bg-[#12102A]/95
      backdrop-blur-md
      border-b border-gray-200 dark:border-[#2A2545]
      shadow-sm
      px-4 sm:px-6 lg:px-8
      py-3
      flex items-center justify-between gap-3
    ">
      {/* ── Left: Back + Title ── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Back to site */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            title="Voltar ao site principal"
            className={`
              flex items-center gap-1.5 text-xs font-semibold
              ${colors.badge}
              border px-2.5 py-1.5 rounded-lg
              transition-all duration-150 shrink-0
            `}
          >
            <BackArrowIcon />
            <span className="hidden sm:inline">Site</span>
          </button>
        )}

        {/* Mobile menu slot */}
        {mobileMenuButton && (
          <div className="shrink-0">
            {mobileMenuButton}
          </div>
        )}

        {/* Avatar + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {avatarLetter && (
            <div className={`
              w-8 h-8 rounded-xl shrink-0
              flex items-center justify-center
              text-white text-sm font-bold
              shadow-sm
              ${colors.avatar}
            `}>
              {avatarLetter.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Status + Extra + Logout ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* System status indicator */}
        {showSystemStatus && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Online
          </span>
        )}

        {/* Extra slot (e.g. Super Admin badge) */}
        {rightExtra && rightExtra}

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sair da conta"
            className="
              flex items-center gap-1.5
              text-xs font-semibold
              text-red-500 dark:text-red-400
              hover:text-red-700 dark:hover:text-red-300
              hover:bg-red-50 dark:hover:bg-red-900/20
              border border-red-200 dark:border-red-800
              hover:border-red-300 dark:hover:border-red-700
              px-2.5 py-1.5 rounded-lg
              transition-all duration-150
            "
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardTopBar;
