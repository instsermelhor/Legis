/**
 * security/catalog.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGIS CONNECT — CATÁLOGO OFICIAL DE MÓDULOS & FUNCIONALIDADES v3.0
 * 
 * Fonte Oficial de Verdade de Arquitetura Modular da Plataforma.
 * Define os 16 módulos oficiais, suas chaves técnicas estáveis, subfuncionalidades,
 * dependências técnicas obrigatórias, status e regras de faturamento.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ModuleCategory =
  | 'Core'
  | 'Legal'
  | 'Finance'
  | 'Productivity'
  | 'Intelligence'
  | 'Integration'
  | 'Operations'
  | 'Education'
  | 'Client-Facing'
  | 'Marketplace'
  | 'Governance'
  | 'System';

export type ModuleStatus =
  | 'ACTIVE'
  | 'BETA'
  | 'DEPRECATED'
  | 'PLANNED'
  | 'INACTIVE';

export type ModuleKey =
  | 'core_clients'
  | 'core_cases'
  | 'legal_contracts'
  | 'legal_invoices'
  | 'legal_agenda'
  | 'ai_copilot'
  | 'bi_analytics'
  | 'messaging_waba'
  | 'staff_provisioning'
  | 'intern_portal'
  | 'secretary_portal'
  | 'client_portal'
  | 'marketplace'
  | 'audit_compliance'
  | 'super_admin'
  | 'settings_config';

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  requiredPermission?: string;
  isBeta?: boolean;
}

export interface ModuleDefinition {
  id: string;
  key: ModuleKey;
  name: string;
  description: string;
  category: ModuleCategory;
  status: ModuleStatus;
  version: string;
  icon: string;
  dependencies: ModuleKey[];
  configurable: boolean;
  billable: boolean;
  features: FeatureDefinition[];
}

/**
 * Registro Imutável Oficial dos 16 Módulos da Legis Connect
 */
export const LEGIS_MODULE_CATALOG: Record<ModuleKey, ModuleDefinition> = {
  core_clients: {
    id: 'mod_clients_001',
    key: 'core_clients',
    name: 'Gestão de Clientes & CRM',
    description: 'Cadastro, gestão de contatos, qualificação e histórico de relacionamentos.',
    category: 'Core',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Users',
    dependencies: [],
    configurable: true,
    billable: true,
    features: [
      { key: 'client_create', name: 'Cadastrar Cliente', description: 'Criação de novos clientes pessoa física ou jurídica.' },
      { key: 'client_edit', name: 'Editar Cliente', description: 'Atualização cadastral e documentos de identificação.' },
      { key: 'client_export', name: 'Exportar Base de Clientes', description: 'Exportação de relatórios de clientes.' },
      { key: 'client_archive', name: 'Arquivar Cliente', description: 'Inativação segura sem perda de histórico.' },
    ]
  },

  core_cases: {
    id: 'mod_cases_002',
    key: 'core_cases',
    name: 'Casos & Processos Jurídicos',
    description: 'Gestão processual, fases, prazos judiciais, distribuição e acompanhamento.',
    category: 'Core',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Briefcase',
    dependencies: ['core_clients'],
    configurable: true,
    billable: true,
    features: [
      { key: 'case_create', name: 'Distribuir/Criar Caso', description: 'Abertura de nova pasta processual.' },
      { key: 'case_timeline', name: 'Linha do Tempo Processual', description: 'Registro de andamentos e fases judiciais.' },
      { key: 'case_archive', name: 'Arquivar Caso', description: 'Conclusão e arquivamento de processo.' },
      { key: 'case_delegate', name: 'Delegar Atuação', description: 'Atribuição de responsabilidade a advogado ou assistente.' },
    ]
  },

  legal_contracts: {
    id: 'mod_contracts_003',
    key: 'legal_contracts',
    name: 'Contratos & Assinaturas Digitais',
    description: 'Minutas jurídicas, assinatura eletrônica com carimbo de tempo e hash SHA-256.',
    category: 'Legal',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'FileText',
    dependencies: ['core_cases'],
    configurable: true,
    billable: true,
    features: [
      { key: 'contract_draft', name: 'Elaborar Minuta', description: 'Criação e edição de contratos vinculados ao caso.' },
      { key: 'contract_sign', name: 'Coletar Assinatura Digital', description: 'Disparo de fluxo de assinatura com valor legal.' },
      { key: 'contract_verify', name: 'Verificar Autenticidade', description: 'Validação criptográfica do carimbo de integridade.' },
    ]
  },

  legal_invoices: {
    id: 'mod_invoices_004',
    key: 'legal_invoices',
    name: 'Faturamento, Honorários & Split',
    description: 'Gestão de honorários contratuais, sucumbência, custódia e split de pagamentos.',
    category: 'Finance',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'DollarSign',
    dependencies: ['core_cases'],
    configurable: true,
    billable: true,
    features: [
      { key: 'invoice_generate', name: 'Emitir Cobrança / Honorário', description: 'Geração de fatura com split bancário.' },
      { key: 'fee_split_config', name: 'Configurar Regras de Split', description: 'Definição de rateio entre sócios e associados.' },
      { key: 'financial_reconciliation', name: 'Conciliação Financeira', description: 'Liquidação e baixa automática de faturas.' },
    ]
  },

  legal_agenda: {
    id: 'mod_agenda_005',
    key: 'legal_agenda',
    name: 'Agenda Jurídica & Prazos',
    description: 'Controle de prazos fatais, audiências, compromissos e lembretes automáticos.',
    category: 'Productivity',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Calendar',
    dependencies: ['core_cases'],
    configurable: true,
    billable: true,
    features: [
      { key: 'event_schedule', name: 'Agendar Audiência / Reunião', description: 'Criação de eventos vinculados aos processos.' },
      { key: 'fatal_deadline_alert', name: 'Alertas de Prazo Fatal', description: 'Notificação compulsória de prazos processuais.' },
    ]
  },

  ai_copilot: {
    id: 'mod_ai_006',
    key: 'ai_copilot',
    name: 'IA Jurídica & Gemini RAG',
    description: 'Assistente generativo, análise de petições, busca semântica em jurisprudência STF/STJ.',
    category: 'Intelligence',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Sparkles',
    dependencies: ['core_cases'],
    configurable: true,
    billable: true,
    features: [
      { key: 'ai_document_analysis', name: 'Análise de Peças Processuais', description: 'Extração automática de teses e riscos.' },
      { key: 'ai_jurisprudence_search', name: 'Busca Semântica RAG', description: 'Consulta contextualizada ao acervo de súmulas e julgados.' },
      { key: 'ai_draft_generation', name: 'Geração de Minutas com IA', description: 'Elaboração assistida de petições e respostas.' },
    ]
  },

  bi_analytics: {
    id: 'mod_bi_007',
    key: 'bi_analytics',
    name: 'Relatórios & BI Analytics',
    description: 'Dashboards executivos, indicadores de desempenho, exportação em Excel e PDF auditados.',
    category: 'Intelligence',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'BarChart2',
    dependencies: ['core_cases', 'legal_invoices'],
    configurable: true,
    billable: true,
    features: [
      { key: 'bi_export_financial', name: 'Exportar Relatório Financeiro', description: 'Geração de planilhas e demonstrativos contábeis.' },
      { key: 'bi_export_operational', name: 'Exportar Métricas Operacionais', description: 'Relatório de taxa de êxito e tempo médio de tramitação.' },
    ]
  },

  messaging_waba: {
    id: 'mod_waba_008',
    key: 'messaging_waba',
    name: 'Notificações WhatsApp Business',
    description: 'Envio de atualizações de processos e lembretes para clientes via WhatsApp API.',
    category: 'Integration',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'MessageSquare',
    dependencies: ['core_clients'],
    configurable: true,
    billable: true,
    features: [
      { key: 'waba_auto_notify', name: 'Notificação Automática de Andamento', description: 'Disparo de mensagens transacionais oficiais.' },
      { key: 'waba_custom_broadcast', name: 'Comunicados em Massa', description: 'Envio autorizado de informativos aos clientes.' },
    ]
  },

  staff_provisioning: {
    id: 'mod_provisioning_009',
    key: 'staff_provisioning',
    name: 'Serviços Jurídicos & Diligências',
    description: 'Contratação e provisionamento de serviços administrativos e diligências externas.',
    category: 'Operations',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Layers',
    dependencies: ['core_cases'],
    configurable: true,
    billable: true,
    features: [
      { key: 'service_request', name: 'Solicitar Diligência / Serviço', description: 'Abertura de ordem de serviço administrativo.' },
      { key: 'service_approve', name: 'Aprovar Provisionamento', description: 'Homologação e liberação de recursos para execução.' },
    ]
  },

  intern_portal: {
    id: 'mod_intern_010',
    key: 'intern_portal',
    name: 'Portal do Estagiário & Supervisão',
    description: 'Ambiente controlado de estágio supervisionado com validação de peças.',
    category: 'Education',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'BookOpen',
    dependencies: ['core_cases'],
    configurable: false,
    billable: false,
    features: [
      { key: 'intern_submit_draft', name: 'Submeter Minuta para Revisão', description: 'Envio de peça jurídica ao advogado orientador.' },
      { key: 'supervisor_feedback', name: 'Aprovação e Parecer do Supervisor', description: 'Validação pedagógica e liberação da peça.' },
    ]
  },

  secretary_portal: {
    id: 'mod_sec_011',
    key: 'secretary_portal',
    name: 'Portal da Secretária & Atendimento',
    description: 'Atendimento inicial, triagem de clientes e gestão de agendamentos.',
    category: 'Operations',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Headphones',
    dependencies: ['core_clients', 'legal_agenda'],
    configurable: false,
    billable: false,
    features: [
      { key: 'secretary_reception', name: 'Triagem e Recepção de Clientes', description: 'Registro de primeiro contato e encaminhamento.' },
    ]
  },

  client_portal: {
    id: 'mod_client_012',
    key: 'client_portal',
    name: 'Portal do Cliente / Acompanhamento',
    description: 'Interface simplificada para o cliente final consultar seus processos e faturas.',
    category: 'Client-Facing',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'UserCheck',
    dependencies: ['core_cases'],
    configurable: false,
    billable: false,
    features: [
      { key: 'client_view_timeline', name: 'Visualizar Andamentos do Processo', description: 'Acesso às atualizações públicas autorizadas.' },
      { key: 'client_view_invoices', name: 'Visualizar Faturas e Boletos', description: 'Consulta e emissão de segunda via de pagamento.' },
    ]
  },

  marketplace: {
    id: 'mod_market_013',
    key: 'marketplace',
    name: 'Marketplace de Correspondentes',
    description: 'Rede aberta para contratação de advogados correspondentes para audiências.',
    category: 'Marketplace',
    status: 'BETA',
    version: '1.0.0-beta',
    icon: 'Globe',
    dependencies: ['core_cases', 'legal_invoices'],
    configurable: true,
    billable: true,
    features: [
      { key: 'market_post_demand', name: 'Publicar Demanda de Diligência', description: 'Oferta de vaga de correspondente.' },
      { key: 'market_apply', name: 'Candidatar-se à Diligência', description: 'Envio de proposta para realização de audiência.' },
    ]
  },

  audit_compliance: {
    id: 'mod_grc_014',
    key: 'audit_compliance',
    name: 'Auditoria, GRC & Trilha LGPD',
    description: 'Trilha imutável de eventos, conformidade com a LGPD e governança corporativa.',
    category: 'Governance',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'ShieldCheck',
    dependencies: [],
    configurable: true,
    billable: true,
    features: [
      { key: 'view_audit_trail', name: 'Consultar Trilha de Auditoria', description: 'Inspeção de logs de eventos e acessos.' },
      { key: 'lgpd_data_export', name: 'Relatório de Impacto à Privacidade (RIPD)', description: 'Exportação de dados para cumprimento da LGPD.' },
    ]
  },

  super_admin: {
    id: 'mod_sys_015',
    key: 'super_admin',
    name: 'Governança da Plataforma Global',
    description: 'Painel mestre de supervisão multi-tenant, saúde do sistema e impersonação auditada.',
    category: 'System',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Cpu',
    dependencies: [],
    configurable: false,
    billable: false,
    features: [
      { key: 'tenant_provisioning', name: 'Provisionar Novo Tenant', description: 'Criação e isolamento de nova banca/escritório.' },
      { key: 'impersonate_support', name: 'Impersonação Controlada de Suporte', description: 'Acesso auditado com justificativa mínima de 20 chars.' },
    ]
  },

  settings_config: {
    id: 'mod_config_016',
    key: 'settings_config',
    name: 'Configurações do Escritório & Tenant',
    description: 'Customização de identidade visual, dados cadastrais e preferências operacionais.',
    category: 'System',
    status: 'ACTIVE',
    version: '3.0.0',
    icon: 'Settings',
    dependencies: [],
    configurable: true,
    billable: false,
    features: [
      { key: 'tenant_branding', name: 'Identidade Visual e Logo', description: 'Personalização do ambiente de trabalho do escritório.' },
      { key: 'tenant_security_policy', name: 'Políticas de Senha e MFA', description: 'Definição de requisitos de segurança do tenant.' },
    ]
  }
};

/**
 * Recupera a definição imutável de um módulo pelo seu identificador técnico estável
 */
export function getModuleDefinition(key: ModuleKey): ModuleDefinition | undefined {
  return LEGIS_MODULE_CATALOG[key];
}

/**
 * Retorna todos os módulos cadastrados no catálogo oficial
 */
export function getAllModules(): ModuleDefinition[] {
  return Object.values(LEGIS_MODULE_CATALOG);
}
