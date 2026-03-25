import React from 'react';

// ─── Icons ───────────────────────────────────────────────────────────────────
export const Icon: React.FC<{ d: string; className?: string }> = ({ d, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
export const IconBriefcase = () => <Icon d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />;
export const IconUsers = () => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" />;
export const IconGradCap = () => <Icon d="M12 14l9-5-9-5-9 5 9 5zm0 0v6M5 9.5l-2 1.12V16m16-5.5v5.38" />;
export const IconMoney = () => <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const IconChart = () => <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
export const IconSettings = () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
export const IconShield = () => <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />;
export const IconEdit = () => <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
export const IconPlus = () => <Icon d="M12 4v16m8-8H4" />;
export const IconTrash = () => <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;
export const IconUpload = () => <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />;
export const IconEye = () => <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />;
export const IconX = () => <Icon d="M6 18L18 6M6 6l12 12" />;
export const IconKey = () => <Icon d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />;
export const IconFilter = () => <Icon d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />;

// ─── Shared Components ────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  onClick?: () => void;
}> = ({ icon, label, value, sub, color = 'bg-primary/10', onClick }) => (
  <div
    className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/40 transition-all' : ''}`}
    onClick={onClick}
  >
    <div className={`${color} p-3 rounded-full shrink-0`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {onClick && <div className="ml-auto text-gray-300"><Icon d="M9 5l7 7-7 7" className="w-4 h-4" /></div>}
  </div>
);

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Pesquisar...'} className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full" />
  </div>
);

export const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}>{label}</span>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

export const lawyerStatusBadge = (s: 'verificado' | 'pendente' | 'suspenso') => {
  const map = { verificado: ['Verificado', 'bg-green-100 text-green-800'], pendente: ['Pendente', 'bg-yellow-100 text-yellow-800'], suspenso: ['Suspenso', 'bg-red-100 text-red-800'] } as const;
  return <Badge label={map[s][0]} color={map[s][1]} />;
};
export const clientStatusBadge = (s: 'ativo' | 'inativo') => {
  const map = { ativo: ['Ativo', 'bg-green-100 text-green-800'], inativo: ['Inativo', 'bg-gray-100 text-gray-600'] } as const;
  return <Badge label={map[s][0]} color={map[s][1]} />;
};
export const internStatusBadge = (s: 'ativo' | 'pendente' | 'inativo') => {
  const map = { ativo: ['Ativo', 'bg-green-100 text-green-800'], pendente: ['Pendente', 'bg-yellow-100 text-yellow-800'], inativo: ['Inativo', 'bg-gray-100 text-gray-600'] } as const;
  return <Badge label={map[s][0]} color={map[s][1]} />;
};
