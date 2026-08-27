import React, { useState } from 'react';
import { SectionTitle } from './AdminShared';
import { LegalAiTools } from '../common/LegalAiTools';
import {
  LegalDocuments,
  AdminUsers,
  GeneralSettings,
  ServiceGroupsSettings,
  LegalCodesSettings,
  DatabaseSettings,
  APIConnections,
} from './settings';

// ─── Settings Hub (Icon Grid) ─────────────────────────────────────────────────
export type SettingsSection =
  | 'general'
  | 'codes'
  | 'documents'
  | 'users'
  | 'services_groups'
  | 'database'
  | 'api_connections'
  | 'ia_tools'
  | null;

export const settingsSections = [
  {
    id: 'general' as const,
    label: 'Configurações Gerais',
    icon: '⚙️',
    description: 'Nome do app, logos, contato e dados gerais',
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    id: 'codes' as const,
    label: 'Código',
    icon: '📜',
    description: 'Upload e edição de legislações e códigos legais',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    id: 'documents' as const,
    label: 'Documentos Legais',
    icon: '📋',
    description: 'Termos de uso, políticas de privacidade e regulamentos',
    color: 'from-emerald-500 to-green-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    id: 'users' as const,
    label: 'Usuários Administrativos',
    icon: '👥',
    description: 'Criar, ativar e gerenciar credenciais de admins',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    id: 'services_groups' as const,
    label: 'Serviços de Eficiência',
    icon: '🚀',
    description: 'Grupos e serviços oferecidos pela plataforma',
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
  },
  {
    id: 'database' as const,
    label: 'Banco de Dados',
    icon: '🗄️',
    description: 'Configurar conexão local ou cloud (Firebase / Supabase)',
    color: 'from-slate-500 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    textColor: 'text-slate-700',
  },
  {
    id: 'api_connections' as const,
    label: 'Conexão com APIs',
    icon: '🔌',
    description: 'WhatsApp, Google, IA Jurídica, Pagamentos e mais',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    textColor: 'text-teal-700',
  },
  {
    id: 'ia_tools' as const,
    label: 'IA Jurídica',
    icon: '⚡',
    description: 'Acesse e teste as ferramentas de Inteligência Artificial Generativa',
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50/50',
    border: 'border-amber-100',
    textColor: 'text-amber-700',
  },
];

export const SettingsTab: React.FC = () => {
  const [section, setSection] = useState<SettingsSection>(null);

  // Hub landing page
  if (!section) {
    return (
      <div className="space-y-6">
        <SectionTitle
          title="Configurações"
          subtitle="Selecione uma categoria para acessar as configurações da plataforma"
        />

        {/* Icon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {settingsSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 ${s.bg} ${s.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left w-full`}
            >
              {/* Gradient orb */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-md`}
              >
                {s.icon}
              </div>
              <div>
                <p className={`text-sm font-bold ${s.textColor}`}>{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.description}</p>
              </div>
              {/* Arrow hint */}
              <span className="absolute bottom-4 right-4 text-gray-300 group-hover:text-gray-500 transition-colors text-lg">
                →
              </span>
            </button>
          ))}
        </div>

        {/* Quick-access footer info */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">ℹ️</span>
          <p className="text-xs text-gray-500">
            Cada seção de configurações opera de forma independente. Alterações salvas são
            aplicadas em tempo real na plataforma. Certifique-se de salvar antes de navegar para
            outra seção.
          </p>
        </div>
      </div>
    );
  }

  // Sub-section view with back button
  const current = settingsSections.find((s) => s.id === section)!;

  return (
    <div className="space-y-5">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSection(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
        >
          ← Configurações
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2">
          <span className="text-base">{current.icon}</span>
          <span className={`text-sm font-bold ${current.textColor}`}>{current.label}</span>
        </div>
      </div>

      {section === 'general' && <GeneralSettings />}
      {section === 'codes' && <LegalCodesSettings />}
      {section === 'documents' && <LegalDocuments />}
      {section === 'users' && <AdminUsers />}
      {section === 'services_groups' && <ServiceGroupsSettings />}
      {section === 'database' && <DatabaseSettings />}
      {section === 'api_connections' && <APIConnections />}
      {section === 'ia_tools' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 dark:bg-[#1A1730] dark:border-[#2A2545]">
          <LegalAiTools
            role="lawyer"
            allowedTools={[
              'pecas',
              'pesquisas',
              'audios',
              'transcricao',
              'fundamentacoes',
              'revisao',
              'jurisprudencia',
              'manifestacao',
            ]}
          />
        </div>
      )}
    </div>
  );
};
