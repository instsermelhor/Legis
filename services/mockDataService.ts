// Mock data for Admin Panel

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
  password: string;
  role: 'super' | 'manager' | 'viewer';
  createdAt: string;
  active: boolean;
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
  { id: 1, name: 'Super Admin', email: 'admin@legisconnect.com.br', password: 'legisadmin', role: 'super', createdAt: '2024-01-01', active: true },
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

export let mockLegalDocuments: LegalDocument[] = [
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

export let mockEfficiencyServiceGroups: EfficiencyServiceGroup[] = [
  { id: 'group-1', name: 'Gestão Documental e Processual' },
  { id: 'group-2', name: 'Atendimento e Suporte' },
];

export let mockEfficiencyServices: EfficiencyService[] = [
  { id: 'serv-1', groupId: 'group-1', name: 'Organização de Pastas de Clientes', description: 'Digitalização, catalogação e organização de todos os documentos processuais.', price: 150.00 },
  { id: 'serv-2', groupId: 'group-1', name: 'Acompanhamento de Diários Oficiais', description: 'Leitura diária e triagem de publicações relevantes para os processos.', price: 300.00 },
  { id: 'serv-3', groupId: 'group-2', name: 'Triagem de Atendimentos', description: 'Filtro inicial de potenciais clientes e agendamento de consultas.', price: 200.00 }
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
}

export let mockSecretaries: MockSecretary[] = [
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
  },
];
