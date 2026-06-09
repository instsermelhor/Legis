// Mock data for Admin Panel
import type { BiApoio, BiDadosBase, BiCliente, BiProduto, BiFornecedor, BiVenda } from '../types';

export function hashPassword(password: string): string {
  if (!password) return '';
  if (password.startsWith('$scrambled$')) return password;
  const salted = "legis_salt_" + password.split('').reverse().join('');
  return '$scrambled$' + btoa(unescape(encodeURIComponent(salted)));
}

export interface MockClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cpf: string;
  activeCases: number;
  totalCases: number;
  joinedDate: string;
  status: 'ativo' | 'inativo';
  totalPaid: number;
  pendingAmount: number;
  lastCaseArea: string;
  assignedLawyerId?: number;
  notes?: string;
}

export interface MockIntern {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  university: string;
  semester: string;
  specialtyInterest: string;
  hoursCompleted: number;
  availableHours: number;
  status: 'ativo' | 'pendente' | 'inativo';
  joinedDate: string;
  city: string;
  state: string;
  stipend?: number;
  totalEarned?: number;
  supervisorLawyerId?: number;
  notes?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  secondaryEmail?: string;
  phone?: string; // WhatsApp number
  password: string;
  role: 'super' | 'admin' | 'manager' | 'collaborator' | 'viewer';
  createdAt: string;
  active: boolean;
  permissions?: string[]; // custom per-user overrides
}

export const mockClients: MockClient[] = [
  { id: 1, name: 'Ana Rodrigues', email: 'ana.rodrigues@email.com', phone: '(11) 91234-5678', address: 'Rua das Acácias, 45', city: 'São Paulo', state: 'SP', cpf: '111.222.333-01', activeCases: 2, totalCases: 3, joinedDate: '2024-01-15', status: 'ativo', totalPaid: 4500, pendingAmount: 900, lastCaseArea: 'Direito de Família e Sucessões', assignedLawyerId: 1, notes: 'Prefere contato por e-mail.' },
  { id: 2, name: 'Bruno Ferreira', email: 'bruno.ferreira@email.com', phone: '(21) 98765-4321', address: 'Av. Atlântica, 200', city: 'Rio de Janeiro', state: 'RJ', cpf: '222.333.444-02', activeCases: 1, totalCases: 1, joinedDate: '2024-02-20', status: 'ativo', totalPaid: 2280, pendingAmount: 0, lastCaseArea: 'Direito Trabalhista', assignedLawyerId: 2 },
  { id: 3, name: 'Carla Mendes', email: 'carla.mendes@email.com', phone: '(31) 97654-3210', address: 'Rua da Bahia, 123', city: 'Belo Horizonte', state: 'MG', cpf: '333.444.555-03', activeCases: 0, totalCases: 2, joinedDate: '2023-11-05', status: 'inativo', totalPaid: 1800, pendingAmount: 300, lastCaseArea: 'Direito Penal', assignedLawyerId: 3 },
  { id: 4, name: 'Daniel Sousa', email: 'daniel.sousa@email.com', phone: '(41) 96543-2109', address: 'Rua XV de Novembro, 88', city: 'Curitiba', state: 'PR', cpf: '444.555.666-04', activeCases: 3, totalCases: 4, joinedDate: '2024-03-01', status: 'ativo', totalPaid: 6750, pendingAmount: 1350, lastCaseArea: 'Direito Civil', assignedLawyerId: 1 },
  { id: 5, name: 'Eliane Costa', email: 'eliane.costa@email.com', phone: '(85) 95432-1098', address: 'Av. Beira Mar, 500', city: 'Fortaleza', state: 'CE', cpf: '555.666.777-05', activeCases: 1, totalCases: 1, joinedDate: '2024-01-30', status: 'ativo', totalPaid: 760, pendingAmount: 0, lastCaseArea: 'Direito Trabalhista', assignedLawyerId: 2 },
  { id: 6, name: 'Fábio Lima', email: 'fabio.lima@email.com', phone: '(51) 94321-0987', address: 'Av. Osvaldo Aranha, 10', city: 'Porto Alegre', state: 'RS', cpf: '666.777.888-06', activeCases: 0, totalCases: 5, joinedDate: '2023-08-12', status: 'inativo', totalPaid: 9200, pendingAmount: 1500, lastCaseArea: 'Direito Previdenciário', assignedLawyerId: 2 },
  { id: 7, name: 'Gabriela Oliveira', email: 'gabriela.oliveira@email.com', phone: '(71) 93210-9876', address: 'Av. Tancredo Neves, 300', city: 'Salvador', state: 'BA', cpf: '777.888.999-07', activeCases: 2, totalCases: 2, joinedDate: '2024-02-10', status: 'ativo', totalPaid: 3040, pendingAmount: 760, lastCaseArea: 'Direito Internacional', assignedLawyerId: 1 },
];

export const mockInterns: MockIntern[] = [
  { id: 1, name: 'Henrique Alves', email: 'henrique.alves@uni.edu.br', phone: '(11) 92345-6789', cpf: '101.111.222-01', university: 'PUC-SP', semester: '7º ao 9º semestre', specialtyInterest: 'Direito Civil', hoursCompleted: 120, availableHours: 200, status: 'ativo', joinedDate: '2024-01-10', city: 'São Paulo', state: 'SP', stipend: 800, totalEarned: 4800, supervisorLawyerId: 1 },
  { id: 2, name: 'Isabela Santos', email: 'isabela.santos@usp.edu.br', phone: '(11) 91234-6789', cpf: '102.222.333-02', university: 'USP', semester: '5º ao 6º semestre', specialtyInterest: 'Direito Trabalhista', hoursCompleted: 80, availableHours: 200, status: 'ativo', joinedDate: '2024-02-15', city: 'São Paulo', state: 'SP', stipend: 700, totalEarned: 2800, supervisorLawyerId: 2 },
  { id: 3, name: 'João Pereira', email: 'joao.pereira@uerj.edu.br', phone: '(21) 92349-1234', cpf: '103.333.444-03', university: 'UERJ', semester: '9º ao 10º semestre', specialtyInterest: 'Direito Penal', hoursCompleted: 180, availableHours: 200, status: 'ativo', joinedDate: '2023-10-01', city: 'Rio de Janeiro', state: 'RJ', stipend: 850, totalEarned: 9350, supervisorLawyerId: 3 },
  { id: 4, name: 'Karen Martins', email: 'karen.martins@ufmg.edu.br', phone: '(31) 91234-4567', cpf: '104.444.555-04', university: 'UFMG', semester: '1º ao 3º semestre', specialtyInterest: 'Direito Constitucional', hoursCompleted: 0, availableHours: 200, status: 'pendente', joinedDate: '2024-03-05', city: 'Belo Horizonte', state: 'MG', stipend: 600, totalEarned: 0 },
  { id: 5, name: 'Lucas Carvalho', email: 'lucas.carvalho@pucpr.edu.br', phone: '(41) 93456-7890', cpf: '105.555.666-05', university: 'PUC-PR', semester: '7º ao 9º semestre', specialtyInterest: 'Direito Tributário', hoursCompleted: 95, availableHours: 200, status: 'ativo', joinedDate: '2024-01-20', city: 'Curitiba', state: 'PR', stipend: 750, totalEarned: 3750, supervisorLawyerId: 1 },
  { id: 6, name: 'Marina Torres', email: 'marina.torres@ufc.edu.br', phone: '(85) 94567-8901', cpf: '106.666.777-06', university: 'UFC', semester: '5º ao 6º semestre', specialtyInterest: 'Direito Internacional', hoursCompleted: 50, availableHours: 200, status: 'inativo', joinedDate: '2023-09-15', city: 'Fortaleza', state: 'CE', stipend: 700, totalEarned: 1750 },
];

export const mockAdminUsers: AdminUser[] = [
  { id: 1, name: 'Super Admin', email: 'admin@legisconnect.com.br', password: 'admin', role: 'super', createdAt: '2024-01-01', active: true },
];

// Financial mock data
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  consultations: number;
}

export const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: 'Out/24', revenue: 42000, consultations: 85 },
  { month: 'Nov/24', revenue: 48500, consultations: 98 },
  { month: 'Dez/24', revenue: 51000, consultations: 105 },
  { month: 'Jan/25', revenue: 38000, consultations: 76 },
  { month: 'Fev/25', revenue: 55000, consultations: 112 },
  { month: 'Mar/25', revenue: 60300, consultations: 121 },
];

// Legal documents mock
export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  fileUrl?: string;
}

export const mockLegalDocuments: LegalDocument[] = [
  {
    id: 'etica_oab',
    title: 'Código de Ética e Disciplina da OAB',
    content: 'O presente Código tem por finalidade fixar a disciplina e a conduta dos advogados no exercício de sua profissão...',
    lastUpdated: '2024-01-01',
  },
  {
    id: 'termos',
    title: 'Termos de Serviço',
    content: 'Ao utilizar a plataforma Legis Connect, o usuário concorda com os seguintes termos e condições...',
    lastUpdated: '2024-03-01',
  },
  {
    id: 'privacidade',
    title: 'Política de Privacidade',
    content: 'A Legis Connect se compromete a proteger a privacidade de seus usuários conforme a LGPD (Lei nº 13.709/2018)...',
    lastUpdated: '2024-03-01',
  },
  {
    id: 'lgpd',
    title: 'LGPD — Lei nº 13.709/2018',
    content: 'A Lei Geral de Proteção de Dados regula o tratamento de dados pessoais no Brasil...',
    lastUpdated: '2024-01-01',
  },
];

import { EfficiencyServiceGroup, EfficiencyService } from '../types';

export const mockEfficiencyServiceGroups: EfficiencyServiceGroup[] = [
  { id: 'group-1', name: '1. Gestão Documental e Processual' },
  { id: 'group-2', name: '2. Compliance e Governança Corporativa' },
  { id: 'group-3', name: '3. Consultoria Empresarial Estratégica' },
  { id: 'group-4', name: '4. Intermediação e Representação Administrativa' },
  { id: 'group-5', name: '5. Gestão de Contratos e Relações Comerciais' },
  { id: 'group-6', name: '6. Recursos Humanos e Relações de Trabalho' },
  { id: 'group-7', name: '7. Propriedade Intelectual e Ativos Intangíveis' },
  { id: 'group-8', name: '8. Mediação, Arbitragem e Resolução de Conflitos' },
  { id: 'group-9', name: '9. Planejamento Tributário e Fiscal (Interface)' },
  { id: 'group-10', name: '10. Legal Operations (Legal Ops)' },
  { id: 'group-11', name: '11. Licitações e Contratos Públicos' },
  { id: 'group-12', name: '12. Regularização e Licenciamento Empresarial' },
  { id: 'group-13', name: '13. Inteligência Jurídica e Monitoramento Normativo' },
  { id: 'group-14', name: '14. Recuperação de Crédito (Extrajudicial)' },
  { id: 'group-15', name: '15. Secretariado Jurídico Executivo' }
];

export const mockEfficiencyServices: EfficiencyService[] = [
  // Group 1
  { id: 'serv-1', groupId: 'group-1', name: 'Elaboração, revisão e padronização de contratos', description: 'Criação de minutas personalizadas, revisão de termos de parceria e estabelecimento de contratos padrão seguros para operações comerciais.', price: 250.00 },
  { id: 'serv-2', groupId: 'group-1', name: 'Controle de prazos (agenda jurídica estratégica)', description: 'Acompanhamento preventivo de datas críticas, controle de prazos processuais e integração com fluxo de produtividade.', price: 180.00 },
  { id: 'serv-3', groupId: 'group-1', name: 'Organização de arquivos físicos e digitais', description: 'Conversão de arquivos físicos para o formato digital, catalogação sistemática e auditoria de repositórios eletrônicos em nuvem.', price: 150.00 },
  { id: 'serv-4', groupId: 'group-1', name: 'Due diligence documental', description: 'Auditoria documental profunda e levantamento de passivos jurídicos para transações comerciais ou validação interna.', price: 350.00 },
  { id: 'serv-5', groupId: 'group-1', name: 'Protocolos administrativos em órgãos públicos', description: 'Protocolo ágil de requerimentos, acompanhamento e intermediação de processos administrativos junto a secretarias municipais e estaduais.', price: 220.00 },
  { id: 'serv-6', groupId: 'group-1', name: 'Gestão de certidões e registros', description: 'Busca, emissão e controle de certidões negativas de débitos municipais, federais, trabalhistas e certidões imobiliárias.', price: 120.00 },

  // Group 2
  { id: 'serv-7', groupId: 'group-2', name: 'Implementação de programas de compliance', description: 'Mapeamento regulatório, definição de controles internos e desenvolvimento do programa de integridade corporativo customizado.', price: 1200.00 },
  { id: 'serv-8', groupId: 'group-2', name: 'Criação de códigos de ética e conduta', description: 'Redação do estatuto interno de conduta profissional e ética empresarial alinhado com as políticas institucionais da corporação.', price: 600.00 },
  { id: 'serv-9', groupId: 'group-2', name: 'Mapeamento de riscos jurídicos', description: 'Levantamento estatístico e análise qualitativa de possíveis gargalos cíveis, tributários e trabalhistas para evitar litígios.', price: 850.00 },
  { id: 'serv-10', groupId: 'group-2', name: 'Auditorias internas', description: 'Auditoria independente de processos internos, verificação de conformidade financeira e operacional em todos os departamentos.', price: 950.00 },
  { id: 'serv-11', groupId: 'group-2', name: 'Treinamento de equipes em conformidade', description: 'Instrução coletiva de lideranças e colaboradores em boas práticas regulatórias, compliance tributário e prevenção de infrações.', price: 500.00 },
  { id: 'serv-12', groupId: 'group-2', name: 'Adequação à Lei Geral de Proteção de Dados (LGPD)', description: 'Diagnóstico de fluxos de dados pessoais, mapeamento de cookies, elaboração de Políticas de Privacidade e adequação integral à LGPD.', price: 1500.00 },

  // Group 3
  { id: 'serv-13', groupId: 'group-3', name: 'Estruturação societária (LTDA, S/A, holdings)', description: 'Planejamento societário avançado, redação de acordos de sócios, constituição de SPEs, sociedades limitadas ou holdings familiares.', price: 2500.00 },
  { id: 'serv-14', groupId: 'group-3', name: 'Planejamento jurídico preventivo', description: 'Orientação empresarial rotineira focada na redução de litígios contratuais, civis e trabalhistas através de medidas preventivas.', price: 800.00 },
  { id: 'serv-15', groupId: 'group-3', name: 'Assessoria em decisões administrativas críticas', description: 'Suporte analítico de risco jurídico e assessoria imediata em decisões de alto impacto estratégico ou reestruturações.', price: 1000.00 },
  { id: 'serv-16', groupId: 'group-3', name: 'Elaboração de pareceres técnicos', description: 'Elaboração de opiniões legais formais e pareceres técnicos embasados em jurisprudência atualizada para fundamentar decisões corporativas.', price: 750.00 },
  { id: 'serv-17', groupId: 'group-3', name: 'Reestruturação empresarial', description: 'Orientação legal na venda de ativos, fusões, aquisições (M&A), dissoluções de sociedade ou processos de recuperação extrajudicial.', price: 3000.00 },

  // Group 4
  { id: 'serv-18', groupId: 'group-4', name: 'Atuação junto a órgãos públicos (prefeituras, juntas comerciais)', description: 'Representação institucional e peticionamento perante prefeituras, órgãos ambientais, Receita Federal e Juntas Comerciais Estaduais.', price: 450.00 },
  { id: 'serv-19', groupId: 'group-4', name: 'Defesa em processos administrativos', description: 'Redação de defesas técnicas e recursos administrativos contra autos de infração de conselhos profissionais, PROCON e vigilância sanitária.', price: 900.00 },
  { id: 'serv-20', groupId: 'group-4', name: 'Regularização de empresas', description: 'Regularização de pendências societárias, obtenção de certidões retidas e desembaraço burocrático de empresas com débitos em aberto.', price: 1200.00 },
  { id: 'serv-21', groupId: 'group-4', name: 'Licenças e alvarás', description: 'Gestão de licenças sanitárias, alvarás de funcionamento, laudos de corpo de bombeiros e autorizações especiais governamentais.', price: 650.00 },
  { id: 'serv-22', groupId: 'group-4', name: 'Participação em reuniões estratégicas como assessor jurídico', description: 'Participação consultiva e assessoria verbal presencial ou remota em assembleias de acionistas e reuniões críticas de negócios.', price: 500.00 },

  // Group 5
  { id: 'serv-23', groupId: 'group-5', name: 'Administração de contratos ativos', description: 'Acompanhamento de prazos de renovação, reajustes anuais e cumprimento de metas de nível de serviço (SLA).', price: 400.00 },
  { id: 'serv-24', groupId: 'group-5', name: 'Negociação com fornecedores e parceiros', description: 'Mediação jurídica em termos de fornecimento, otimização de custos e renegociação contratual estratégica.', price: 650.00 },
  { id: 'serv-25', groupId: 'group-5', name: 'Controle de inadimplência (cobrança extrajudicial)', description: 'Notificações extrajudiciais, termos de confissão de dívida e conciliação para recuperação de créditos retidos.', price: 350.00 },
  { id: 'serv-26', groupId: 'group-5', name: 'Gestão de cláusulas de risco', description: 'Análise consultiva de responsabilidade civil, multas rescisórias e matrizes de risco em acordos comerciais.', price: 450.00 },
  { id: 'serv-27', groupId: 'group-5', name: 'Monitoramento de obrigações contratuais', description: 'Varredura contínua de obrigações de fazer, não fazer, entregáveis e conformidade regulatória bilateral.', price: 300.00 },

  // Group 6
  { id: 'serv-28', groupId: 'group-6', name: 'Elaboração de políticas internas', description: 'Redação de regulamentos internos de trabalho, políticas de home office, uso de dispositivos (BYOD) e código de vestimenta.', price: 500.00 },
  { id: 'serv-29', groupId: 'group-6', name: 'Estruturação de contratos de trabalho', description: 'Modelos seguros de admissão, termos de confidencialidade (NDA), não concorrência, propriedade intelectual e PJ.', price: 350.00 },
  { id: 'serv-30', groupId: 'group-6', name: 'Compliance trabalhista', description: 'Análise de processos de contratação, jornada, adicionais e benefícios para mitigar riscos trabalhistas sistêmicos.', price: 1100.00 },
  { id: 'serv-31', groupId: 'group-6', name: 'Gestão de passivos trabalhistas (preventivo)', description: 'Saneamento de contingências laborais em aberto e aconselhamento sobre acordos de rescisão voluntária segura.', price: 900.00 },
  { id: 'serv-32', groupId: 'group-6', name: 'Apoio em desligamentos estratégicos', description: 'Assessoria legal e condução documental em demissões de cargos-chave ou desligamentos em massa para evitar litígios.', price: 600.00 },

  // Group 7
  { id: 'serv-33', groupId: 'group-7', name: 'Registro de marcas e patentes', description: 'Busca de anterioridade, protocolo de registro de marca/patente no INPI e acompanhamento de oposições.', price: 1800.00 },
  { id: 'serv-34', groupId: 'group-7', name: 'Gestão de direitos autorais', description: 'Proteção de obras intelectuais, softwares, design industrial e contratos de cessão de direitos patrimoniais de imagem.', price: 700.00 },
  { id: 'serv-35', groupId: 'group-7', name: 'Proteção de know-how empresarial', description: 'Blindagem de segredos comerciais, inteligência de negócios, fórmulas e metodologias por meio de barreiras contratuais rígidas.', price: 950.00 },
  { id: 'serv-36', groupId: 'group-7', name: 'Monitoramento de uso indevido de marca', description: 'Varredura de mercado para detectar violações de propriedade industrial, plágio, concorrência desleal ou pirataria.', price: 400.00 },

  // Group 8
  { id: 'serv-37', groupId: 'group-8', name: 'Atuação em câmaras arbitrais', description: 'Patrocínio e representação de interesses corporativos em procedimentos de arbitragem privada complexos.', price: 2500.00 },
  { id: 'serv-38', groupId: 'group-8', name: 'Mediação de conflitos empresariais', description: 'Facilitação de acordos entre sócios, parceiros comerciais ou acionistas buscando preservar relações institucionais.', price: 1200.00 },
  { id: 'serv-39', groupId: 'group-8', name: 'Negociação preventiva de litígios', description: 'Intermediação direta e formulação de acordos de transação extrajudicial antes do ajuizamento de ações civis.', price: 800.00 },
  { id: 'serv-40', groupId: 'group-8', name: 'Estruturação de cláusulas compromissórias', description: 'Redação personalizada de cláusulas de eleição de foro, mediação e arbitragem (cláusula cheia) em contratos de relevância.', price: 300.00 },

  // Group 9
  { id: 'serv-41', groupId: 'group-9', name: 'Apoio jurídico ao planejamento tributário', description: 'Assistência jurídica na estruturação de operações para otimização da carga fiscal corporativa de forma legal e segura.', price: 1500.00 },
  { id: 'serv-42', groupId: 'group-9', name: 'Revisão de enquadramento fiscal', description: 'Análise da atividade da empresa e faturamento para indicação do regime tributário mais vantajoso (Simples, Presumido, Real).', price: 800.00 },
  { id: 'serv-43', groupId: 'group-9', name: 'Defesa administrativa em autuações', description: 'Elaboração de defesas impugnando autos de infração e multas fiscais municipais, estaduais ou federais.', price: 1200.00 },
  { id: 'serv-44', groupId: 'group-9', name: 'Interpretação normativa tributária', description: 'Elaboração de consultas e pareceres sobre a aplicação de leis tributárias complexas a casos específicos da empresa.', price: 700.00 },

  // Group 10
  { id: 'serv-45', groupId: 'group-10', name: 'Implantação de sistemas jurídicos (KPIs, dashboards)', description: 'Configuração de softwares de gestão jurídica, parametrização de relatórios e painéis visuais de controle.', price: 2000.00 },
  { id: 'serv-46', groupId: 'group-10', name: 'Automação de fluxos legais', description: 'Mapeamento e automação de fluxos de trabalho do departamento jurídico, desde contratos a prazos processuais.', price: 1500.00 },
  { id: 'serv-47', groupId: 'group-10', name: 'Gestão de indicadores de desempenho jurídico', description: 'Definição, mensuração e acompanhamento de métricas de eficiência (SLAs, taxas de êxito, custo por processo).', price: 1000.00 },
  { id: 'serv-48', groupId: 'group-10', name: 'Otimização de custos legais', description: 'Auditoria de despesas com escritórios externos, custas processuais e busca de eficiência na alocação de recursos.', price: 1200.00 },
  { id: 'serv-49', groupId: 'group-10', name: 'Integração jurídico-financeira', description: 'Parametrização e conciliação de fluxos financeiros de pagamentos de condenações, custas e honorários com o ERP financeiro.', price: 1300.00 },

  // Group 11
  { id: 'serv-50', groupId: 'group-11', name: 'Análise de editais', description: 'Revisão técnica de editais de concorrências públicas, pregões e tomadas de preço para avaliar riscos e exigências legais.', price: 600.00 },
  { id: 'serv-51', groupId: 'group-11', name: 'Preparação de documentação para licitação', description: 'Organização, conferência e estruturação de toda a documentação de habilitação jurídica, fiscal e técnica exigida.', price: 800.00 },
  { id: 'serv-52', groupId: 'group-11', name: 'Gestão contratual com o setor público', description: 'Acompanhamento de reajustes contratuais, prorrogações, aditivos e conformidade na execução de contratos administrativos.', price: 1000.00 },
  { id: 'serv-53', groupId: 'group-11', name: 'Impugnações e recursos administrativos', description: 'Redação de peças para questionamento de termos de editais ou recursos administrativos contra decisões de classificação.', price: 900.00 },

  // Group 12
  { id: 'serv-54', groupId: 'group-12', name: 'Abertura, alteração e encerramento de empresas', description: 'Condução de processos burocráticos em juntas comerciais, cartórios, Receita Federal e órgãos locais.', price: 1100.00 },
  { id: 'serv-55', groupId: 'group-12', name: 'Licenças ambientais e sanitárias', description: 'Assessoria na obtenção e renovação de alvarás da vigilância sanitária, licenças de operação e controle de resíduos.', price: 1300.00 },
  { id: 'serv-56', groupId: 'group-12', name: 'Regularização imobiliária', description: 'Desembaraço de pendências em cartórios de registro de imóveis, prefeituras (IPTU, Habite-se) e regularização de sedes comerciais.', price: 1500.00 },
  { id: 'serv-57', groupId: 'group-12', name: 'Registro em conselhos de classe', description: 'Inscrição, regularização e defesa da pessoa jurídica perante órgãos de classe profissional (CREA, CRM, CRA, etc.).', price: 400.00 },

  // Group 13
  { id: 'serv-58', groupId: 'group-13', name: 'Monitoramento diário de novas legislações', description: 'Acompanhamento e compilação de novas leis, decretos e regulamentos publicados nos diários oficiais de interesse da empresa.', price: 500.00 },
  { id: 'serv-59', groupId: 'group-13', name: 'Análise de impacto regulatório (AIR)', description: 'Avaliação técnica do impacto de novas regras governamentais ou setoriais na operação do cliente.', price: 950.00 },
  { id: 'serv-60', groupId: 'group-13', name: 'Relatórios de tendências jurisprudenciais', description: 'Estudos analíticos sobre as decisões mais recentes de tribunais em temas sensíveis para o negócio.', price: 800.00 },
  { id: 'serv-61', groupId: 'group-13', name: 'Mapeamento de projetos de lei em tramitação', description: 'Acompanhamento preventivo de projetos legislativos federais, estaduais ou municipais que possam impactar o setor.', price: 700.00 },

  // Group 14
  { id: 'serv-62', groupId: 'group-14', name: 'Negociação de dívidas', description: 'Intermediação direta com devedores para renegociação de prazos e valores de débitos comerciais ou financeiros.', price: 450.00 },
  { id: 'serv-63', groupId: 'group-14', name: 'Estruturação de acordos', description: 'Elaboração de termos de acordo de parcelamento de débito, confissão de dívida e garantias associadas.', price: 350.00 },
  { id: 'serv-64', groupId: 'group-14', name: 'Estratégias de cobrança administrativa', description: 'Planejamento e estruturação de régua de cobrança preventiva, notificações e abordagens extrajudiciais.', price: 500.00 },
  { id: 'serv-65', groupId: 'group-14', name: 'Gestão de carteira de inadimplentes', description: 'Controle sistemático de recebíveis em atraso, contatos periódicos e relatórios de recuperação de crédito.', price: 600.00 },

  // Group 15
  { id: 'serv-66', groupId: 'group-15', name: 'Organização de reuniões e atas societárias', description: 'Agendamento, preparação de pautas, convocação e redação formal de atas de reuniões de diretoria ou assembleias.', price: 550.00 },
  { id: 'serv-67', groupId: 'group-15', name: 'Elaboração de documentos administrativos formais', description: 'Redação de procurações, ofícios, circulares internas, cartas institucionais e memorandos.', price: 300.00 },
  { id: 'serv-68', groupId: 'group-15', name: 'Interface entre diretoria e áreas técnicas', description: 'Canal de facilitação de comunicação, centralização de demandas e controle de andamentos contratuais e societários.', price: 700.00 },
  { id: 'serv-69', groupId: 'group-15', name: 'Controle de compliance documental', description: 'Organização e auditoria preventiva periódica de documentos de governança, certidões e registros obrigatórios da empresa.', price: 450.00 }
];

// ─── Secretariat Mock Data ─────────────────────────────────────────────────────
export interface MockSecretary {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  city: string;
  state: string;
  address?: string;
  experience: number; // years
  areasOfKnowledge: string[];
  availability: 'integral' | 'meio-periodo' | 'freelancer';
  bio?: string;
  status: 'ativo' | 'pendente' | 'inativo';
  assignedLawyerId?: number;
  joinedDate: string;
  notes?: string;
  monthlyFee?: number;   // honorário/remuneração mensal (R$)
  totalEarned?: number;  // total acumulado recebido (R$)
  pendingFee?: number;   // valor pendente (R$)
}

export const mockSecretaries: MockSecretary[] = [
  {
    id: 1,
    name: 'Fernanda Alves',
    email: 'fernanda.alves@email.com',
    phone: '(11) 97654-3210',
    cpf: '123.456.789-01',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua Bela Cintra, 100, Consolação',
    experience: 5,
    areasOfKnowledge: ['Atendimento ao Cliente', 'Gestão de Agenda', 'Protocolo Judicial', 'Organização Documental'],
    availability: 'integral',
    bio: 'Secretária com 5 anos de experiência em escritórios de advocacia de médio porte. Especializada em gestão de processos e atendimento ao cliente.',
    status: 'ativo',
    joinedDate: '2024-01-10',
    monthlyFee: 3800,
    totalEarned: 22800,
    pendingFee: 0,
  },
  {
    id: 2,
    name: 'Carlos Eduardo Melo',
    email: 'carlos.melo@email.com',
    phone: '(21) 96543-2109',
    cpf: '234.567.890-02',
    city: 'Rio de Janeiro',
    state: 'RJ',
    experience: 3,
    areasOfKnowledge: ['Redação Jurídica', 'Diários Oficiais', 'Controle Financeiro', 'Triagem de Clientes'],
    availability: 'meio-periodo',
    bio: 'Profissional com formação em Administração e experiência em suporte a advogados. Conhecimento em softwares de gestão jurídica.',
    status: 'ativo',
    joinedDate: '2024-03-15',
    monthlyFee: 2200,
    totalEarned: 8800,
    pendingFee: 2200,
  },
  {
    id: 3,
    name: 'Maria Luísa Carvalho',
    email: 'maria.carvalho@email.com',
    phone: '(31) 95432-1098',
    cpf: '345.678.901-03',
    city: 'Belo Horizonte',
    state: 'MG',
    experience: 8,
    areasOfKnowledge: ['Gestão de Escritório', 'Protocolo Judicial', 'Atendimento VIP', 'Organização Documental', 'Redação Jurídica'],
    availability: 'integral',
    bio: 'Vasta experiência em grandes escritórios de advocacia. Excelente organização e proatividade. Disponível para trabalho presencial ou remoto.',
    status: 'ativo',
    joinedDate: '2023-08-20',
    assignedLawyerId: 2,
    monthlyFee: 4500,
    totalEarned: 58500,
    pendingFee: 0,
  },
  {
    id: 4,
    name: 'Rafael Nunes',
    email: 'rafael.nunes@email.com',
    phone: '(41) 94321-0987',
    city: 'Curitiba',
    state: 'PR',
    experience: 2,
    areasOfKnowledge: ['Triagem de Clientes', 'Controle de Agenda', 'Suporte Administrativo'],
    availability: 'freelancer',
    status: 'pendente',
    joinedDate: '2024-05-01',
    monthlyFee: 0,
    totalEarned: 0,
    pendingFee: 0,
  },
  {
    id: 5,
    name: 'Juliana Pires',
    email: 'juliana.pires@email.com',
    phone: '(85) 93210-9876',
    cpf: '456.789.012-04',
    city: 'Fortaleza',
    state: 'CE',
    experience: 6,
    areasOfKnowledge: ['Diários Oficiais', 'Controle Financeiro', 'Redação Jurídica', 'Protocolo Judicial'],
    availability: 'integral',
    bio: 'Secretária jurídica com sólida experiência. Domínio de sistemas de acompanhamento processual eletrônico (PJe, e-SAJ).',
    status: 'ativo',
    joinedDate: '2023-11-12',
    monthlyFee: 3200,
    totalEarned: 41600,
    pendingFee: 3200,
  },
];

export const mockBiApoio: BiApoio = {
  teto_execucao_anual_ums: 189346,
  meta_razao_final: 0.4399678,
  periodos: ['1º sem', '2º sem', '3º sem', '4º sem'],
  meta_faturamento_percentual: [0.31, 0.47, 0.495, 0.505],
};

export const mockBiDadosBase: BiDadosBase[] = [
  {
    id_tab: 1,
    semestre: '1º sem',
    valor_ums: 5.2,
    mes_ano: '2026-01-15',
    executado_ums: 8500,
    receita_fat: 45000,
    transferencia_recebida: 5000,
    despesa_total: 21000,
    custo: 8000,
    imposto: 4000,
    juros: 1000,
    salarios_ordenados: 5000,
    glosa: 1000,
    emissao_nf: '2026-01-10',
    recebimento_nf: '2026-02-12',
  },
  {
    id_tab: 2,
    semestre: '1º sem',
    valor_ums: 5.2,
    mes_ano: '2026-02-15',
    executado_ums: 9000,
    receita_fat: 48000,
    transferencia_recebida: 4000,
    despesa_total: 23000,
    custo: 9000,
    imposto: 4200,
    juros: 800,
    salarios_ordenados: 5200,
    glosa: 1200,
    emissao_nf: '2026-02-10',
    recebimento_nf: '2026-03-11',
  },
  {
    id_tab: 3,
    semestre: '1º sem',
    valor_ums: 5.3,
    mes_ano: '2026-03-15',
    executado_ums: 11000,
    receita_fat: 52000,
    transferencia_recebida: 6000,
    despesa_total: 28000,
    custo: 11000,
    imposto: 4800,
    juros: 1100,
    salarios_ordenados: 5500,
    glosa: 1500,
    emissao_nf: '2026-03-10',
    recebimento_nf: '2026-04-15',
  },
  {
    id_tab: 4,
    semestre: '1º sem',
    valor_ums: 5.3,
    mes_ano: '2026-04-15',
    executado_ums: 12500,
    receita_fat: 55000,
    transferencia_recebida: 3000,
    despesa_total: 29000,
    custo: 11500,
    imposto: 5000,
    juros: 900,
    salarios_ordenados: 5600,
    glosa: 1000,
    emissao_nf: '2026-04-08',
    recebimento_nf: '2026-05-06',
  },
  {
    id_tab: 5,
    semestre: '1º sem',
    valor_ums: 5.4,
    mes_ano: '2026-05-15',
    executado_ums: 13000,
    receita_fat: 35000,
    transferencia_recebida: 1000,
    despesa_total: 31000,
    custo: 12000,
    imposto: 5500,
    juros: 1200,
    salarios_ordenados: 8500,
    glosa: 1300,
    emissao_nf: '2026-05-12',
    recebimento_nf: '2026-06-14',
  },
  {
    id_tab: 6,
    semestre: '1º sem',
    valor_ums: 5.4,
    mes_ano: '2026-06-15',
    executado_ums: 14500,
    receita_fat: 65000,
    transferencia_recebida: 8000,
    despesa_total: 34000,
    custo: 13000,
    imposto: 6000,
    juros: 1500,
    salarios_ordenados: 6000,
    glosa: 1800,
    emissao_nf: '2026-06-10',
    recebimento_nf: '2026-07-09',
  },
  {
    id_tab: 7,
    semestre: '2º sem',
    valor_ums: 5.5,
    mes_ano: '2026-07-15',
    executado_ums: 15000,
    receita_fat: 68000,
    transferencia_recebida: 6000,
    despesa_total: 35000,
    custo: 13500,
    imposto: 6200,
    juros: 1000,
    salarios_ordenados: 6200,
    glosa: 1100,
    emissao_nf: '2026-07-05',
    recebimento_nf: '2026-08-07',
  },
  {
    id_tab: 8,
    semestre: '2º sem',
    valor_ums: 5.5,
    mes_ano: '2026-08-15',
    executado_ums: 16000,
    receita_fat: 70000,
    transferencia_recebida: 5000,
    despesa_total: 38000,
    custo: 14000,
    imposto: 6500,
    juros: 1300,
    salarios_ordenados: 6500,
    glosa: 1600,
    emissao_nf: '2026-08-10',
    recebimento_nf: '2026-09-08',
  },
  {
    id_tab: 9,
    semestre: '2º sem',
    valor_ums: 5.6,
    mes_ano: '2026-09-15',
    executado_ums: 18000,
    receita_fat: 75000,
    transferencia_recebida: 7000,
    despesa_total: 42000,
    custo: 15500,
    imposto: 7000,
    juros: 1400,
    salarios_ordenados: 7000,
    glosa: 2000,
    emissao_nf: '2026-09-08',
    recebimento_nf: '2026-10-10',
  },
  {
    id_tab: 10,
    semestre: '2º sem',
    valor_ums: 5.6,
    mes_ano: '2026-10-15',
    executado_ums: 19500,
    receita_fat: 80000,
    transferencia_recebida: 4000,
    despesa_total: 44000,
    custo: 16000,
    imposto: 7500,
    juros: 1200,
    salarios_ordenados: 7500,
    glosa: 1500,
    emissao_nf: '2026-10-12',
    recebimento_nf: '2026-11-11',
  },
  {
    id_tab: 11,
    semestre: '2º sem',
    valor_ums: 5.7,
    mes_ano: '2026-11-15',
    executado_ums: 21000,
    receita_fat: 85000,
    transferencia_recebida: 9000,
    despesa_total: 48000,
    custo: 17500,
    imposto: 8000,
    juros: 1800,
    salarios_ordenados: 8000,
    glosa: 2500,
    emissao_nf: '2026-11-10',
    recebimento_nf: '2026-12-12',
  },
  {
    id_tab: 12,
    semestre: '2º sem',
    valor_ums: 5.7,
    mes_ano: '2026-12-15',
    executado_ums: 23000,
    receita_fat: 90000,
    transferencia_recebida: 10000,
    despesa_total: 52000,
    custo: 19000,
    imposto: 8500,
    juros: 2000,
    salarios_ordenados: 8500,
    glosa: 3000,
    emissao_nf: '2026-12-05',
    recebimento_nf: '2027-01-04',
  },
];

export const mockBiClientes: BiCliente[] = [
  { codigo: 'C01', nome: 'Clínica São Lucas', cpf_cnpj: '12.345.678/0001-90', cidade: 'São Paulo', estado: 'SP', lista_concatenada: 'C01 - Clínica São Lucas' },
  { codigo: 'C02', nome: 'Hospital Delta', cpf_cnpj: '98.765.432/0001-10', cidade: 'Rio de Janeiro', estado: 'RJ', lista_concatenada: 'C02 - Hospital Delta' },
  { codigo: 'C03', nome: 'Centro Clínico Sul', cpf_cnpj: '45.678.901/0001-22', cidade: 'Porto Alegre', estado: 'RS', lista_concatenada: 'C03 - Centro Clínico Sul' },
  { codigo: 'C04', nome: 'Laboratório Exame', cpf_cnpj: '33.222.111/0001-00', cidade: 'Belo Horizonte', estado: 'MG', lista_concatenada: 'C04 - Laboratório Exame' },
];

export const mockBiProdutos: BiProduto[] = mockEfficiencyServices.map((s) => {
  const groupMatch = s.groupId.match(/group-(\d+)/);
  const groupNum = groupMatch ? parseInt(groupMatch[1], 10) : 1;
  
  const groupServices = mockEfficiencyServices.filter(x => x.groupId === s.groupId);
  const serviceIndex = groupServices.findIndex(x => x.id === s.id) + 1;
  
  const codigo = `G${groupNum}${String(serviceIndex).padStart(3, '0')}`;
  const custo = Math.round(s.price * 0.8 * 100) / 100;
  
  return {
    codigo,
    nome: s.name,
    descricao: s.description || '',
    custo,
    preco_tabela: s.price,
    lista_concatenada: `${codigo} - ${s.name}`
  };
});

export const mockBiFornecedores: BiFornecedor[] = [
  { codigo: 'F01', nome: 'Med Tech Brasil', cpf_cnpj: '11.222.333/0001-44', estado: 'SP', lista_concatenada: 'F01 - Med Tech Brasil' },
  { codigo: 'F02', nome: 'Health Equipamentos', cpf_cnpj: '55.666.777/0001-88', estado: 'PR', lista_concatenada: 'F02 - Health Equipamentos' },
  { codigo: 'F03', nome: 'Life Care Ltda', cpf_cnpj: '99.888.777/0001-11', estado: 'RJ', lista_concatenada: 'F03 - Life Care Ltda' },
];

const rawBiVendas = [
  { id_tab: 'v01', fornecedor: 'F01 - Med Tech Brasil', cliente: 'C01 - Clínica São Lucas', prodIdx: 0, qtd: 2, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-08-10', data_referencia: '2026-08-01', data_retirada: '2026-08-10', data_devolucao: '2026-08-20' },
  { id_tab: 'v02', fornecedor: 'F02 - Health Equipamentos', cliente: 'C02 - Hospital Delta', prodIdx: 1, qtd: 5, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-08-25', data_referencia: '2026-08-01', data_retirada: '2026-08-25', data_devolucao: '2026-09-05' },
  { id_tab: 'v03', fornecedor: 'F01 - Med Tech Brasil', cliente: 'C03 - Centro Clínico Sul', prodIdx: 0, qtd: 3, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-09-12', data_referencia: '2026-09-01', data_retirada: '2026-09-12', data_devolucao: '2026-09-22' },
  { id_tab: 'v04', fornecedor: 'F03 - Life Care Ltda', cliente: 'C04 - Laboratório Exame', prodIdx: 2, qtd: 10, status_pagamento: 'Pendente', status_aluguel: 'Cancelado', data: '2026-09-28', data_referencia: '2026-09-01', data_retirada: '2026-09-28', data_devolucao: '' },
  { id_tab: 'v05', fornecedor: 'F02 - Health Equipamentos', cliente: 'C01 - Clínica São Lucas', prodIdx: 1, qtd: 4, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-10-05', data_referencia: '2026-10-01', data_retirada: '2026-10-05', data_devolucao: '2026-10-15' },
  { id_tab: 'v06', fornecedor: 'F03 - Life Care Ltda', cliente: 'C02 - Hospital Delta', prodIdx: 3, qtd: 2, status_pagamento: 'Pendente', status_aluguel: 'Cancelado', data: '2026-10-20', data_referencia: '2026-10-01', data_retirada: '2026-10-20', data_devolucao: '' },
  { id_tab: 'v07', fornecedor: 'F01 - Med Tech Brasil', cliente: 'C04 - Laboratório Exame', prodIdx: 0, qtd: 4, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-11-08', data_referencia: '2026-11-01', data_retirada: '2026-11-08', data_devolucao: '2026-11-18' },
  { id_tab: 'v08', fornecedor: 'F02 - Health Equipamentos', cliente: 'C03 - Centro Clínico Sul', prodIdx: 2, qtd: 8, status_pagamento: 'Pendente', status_aluguel: 'Em Realização', data: '2026-11-22', data_referencia: '2026-11-01', data_retirada: '2026-11-22', data_devolucao: '' },
  { id_tab: 'v09', fornecedor: 'F01 - Med Tech Brasil', cliente: 'C01 - Clínica São Lucas', prodIdx: 3, qtd: 3, status_pagamento: 'Pago', status_aluguel: 'Entregue', data: '2026-12-05', data_referencia: '2026-12-01', data_retirada: '2026-12-05', data_devolucao: '2026-12-15' },
  { id_tab: 'v10', fornecedor: 'F03 - Life Care Ltda', cliente: 'C02 - Hospital Delta', prodIdx: 1, qtd: 5, status_pagamento: 'Pendente', status_aluguel: 'Cancelado', data: '2026-12-18', data_referencia: '2026-12-01', data_retirada: '2026-12-18', data_devolucao: '' },
];

export const mockBiVendas: BiVenda[] = rawBiVendas.map(v => {
  const prod = mockBiProdutos[v.prodIdx] || mockBiProdutos[0];
  const valor_total = v.qtd * prod.preco_tabela;
  const custo_prod = prod.custo;
  const lucro = valor_total - (v.qtd * custo_prod);
  return {
    id_tab: v.id_tab,
    fornecedor: v.fornecedor,
    cliente: v.cliente,
    produto: prod.lista_concatenada,
    qtd: v.qtd,
    vlr_unit: prod.preco_tabela,
    valor_total,
    custo_prod,
    lucro,
    data: v.data,
    data_referencia: v.data_referencia,
    data_retirada: v.data_retirada,
    data_devolucao: v.data_devolucao,
    status_pagamento: v.status_pagamento,
    status_aluguel: v.status_aluguel as any,
  };
});

