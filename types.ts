export type View = 'landing' | 'search' | 'profile' | 'dashboard' | 'lawyerDashboard' | 'login' | 'signup' | 'adminDashboard' | 'forLawyers' | 'forInterns' | 'internDashboard' | 'forClients' | 'services' | 'forSecretariado' | 'secretariadoDashboard';

export interface User {
  email: string;
  role: 'client' | 'lawyer' | 'admin' | 'intern' | 'secretary';
  name?: string; // For client/admin name
  data?: Lawyer | Intern | Secretary; // For lawyer-specific detailed data or intern/secretary data
  // Client-specific data
  phone?: string;
  address?: string;
  caseHistory?: Case[];
  appointments?: Appointment[];
  isForeigner?: boolean;
  foreignerDocument?: string;
  countryOfOrigin?: string;
  timeInBrazil?: string;
  socialLinks?: { provider: string; url: string }[];
}

export interface CaseStage {
  name: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Case {
  id: string;
  title: string;
  clientName: string;
  lawyerName: string;
  lawyerId: number;
  status: 'Ativo' | 'Concluído' | 'Cancelado';
  stages: CaseStage[];
  reviewSubmitted?: boolean;
  group?: 'Civil' | 'Penal' | 'Trabalhista' | 'Outro';
  caseType?: string;
  clientCpf?: string;
  clientAddress?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  status: 'Confirmado' | 'Concluído' | 'Cancelado';
  modality: 'Videochamada' | 'Presencial';
  consultationLink?: string;
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
}

export interface DailyAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Lawyer {
  id: number;
  name: string;
  oab: string;
  specialties: string[];
  location: {
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  photoUrl: string;
  rating: number;
  reviewCount: number;
  bio: string;
  experience: { years: number; cases: number };
  education: string[];
  contact: { phone: string; email: string };
  consultationFee?: number;
  monthlyRevenue?: number;
  reviews: Review[];
  availability: DailyAvailability[];
  calendarSyncUrl?: string;
  isCalendarSynced?: boolean;
  status: 'verificado' | 'pendente' | 'suspenso';
  consultationsThisMonth?: number;
  pendingPayments?: number;

  // Fields for signup
  cpf?: string;
  rg?: string;
  dataNasc?: string;
  estadoCivil?: string;
  naturalidade?: string;
  address?: string; // Residential address
  commercialAddress?: string;
  oabUF?: string;
  registrationType?: 'active' | 'intern';

  // Foreigner Fields
  isForeigner?: boolean;
  foreignerDocument?: string;
  countryOfOrigin?: string;
  timeInBrazil?: string;
  socialLinks?: { provider: string; url: string }[];

  // Specialty groups
  primarySpecialties?: string[];
  secondarySpecialties?: string[];
}

export interface Intern {
  id: number;
  name: string;
  cpf: string;
  university: string;
  semester: string;
  specialtyInterest: string;
  contact: { phone: string; email: string };
  hoursCompleted: number;
  availableHours: number;
  casesStudied?: Case[];
  status: 'active' | 'pending';
  supervisorLawyerId?: number;

  // Address fields
  address?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  // Foreigner Fields
  isForeigner?: boolean;
  foreignerDocument?: string;
  countryOfOrigin?: string;
  timeInBrazil?: string;
  socialLinks?: { provider: string; url: string }[];
}

export interface CaseAnalysis {
  primaryArea: string;
  specializations: string[];
  summary: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Message {
  id: number;
  sender: 'client' | 'lawyer';
  text: string;
  timestamp: string;
  avatarUrl: string;
}

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri: string;
        text: string;
        author: string;
      }[];
    }[]
  }
}

export interface MapsSearchResult {
  text: string;
  groundingChunks: GroundingChunk[];
}

export interface EfficiencyServiceGroup {
  id: string;
  name: string;
}

export interface EfficiencyService {
  id: string;
  groupId: string;
  name: string;
  description: string;
  price: number;
  discountLawyer?: number;
  discountIntern?: number;
  discountSecretary?: number;
  discountClient?: number;
}

export interface Secretary {
  id: number;
  name: string;
  cpf?: string;
  rg?: string;
  email: string;
  phone: string;
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
  // Foreigner
  isForeigner?: boolean;
  foreignerDocument?: string;
  countryOfOrigin?: string;
  timeInBrazil?: string;
  socialLinks?: { provider: string; url: string }[];
}

export interface BiApoio {
  teto_execucao_anual_ums: number;
  meta_razao_final: number;
  periodos: string[];
  meta_faturamento_percentual: number[];
}

export interface BiDadosBase {
  id_tab: number;
  semestre: string;
  valor_ums: number;
  mes_ano: string;
  executado_ums: number;
  receita_fat: number;
  transferencia_recebida: number;
  despesa_total: number;
  custo: number;
  imposto: number;
  juros: number;
  salarios_ordenados: number;
  glosa: number;
  emissao_nf: string;
  recebimento_nf: string;
}

export interface BiCliente {
  codigo: string;
  nome: string;
  cpf_cnpj: string;
  cidade: string;
  estado: string; // UF Cliente
  lista_concatenada: string; // "ID - Nome"
}

export interface BiProduto {
  codigo: string;
  nome: string;
  descricao: string;
  custo: number;
  preco_tabela: number;
  lista_concatenada: string;
}

export interface BiFornecedor {
  codigo: string;
  nome: string;
  cpf_cnpj: string;
  estado: string; // UF Fornec
  lista_concatenada: string;
}

export interface BiVenda {
  id_tab: string;
  fornecedor: string; // "ID - Nome"
  cliente: string;
  produto: string;
  qtd: number;
  vlr_unit: number;
  valor_total: number;
  custo_prod: number;
  lucro: number;
  data: string;
  data_referencia: string;
  data_retirada: string;
  data_devolucao: string;
  status_pagamento: string;
  status_aluguel: 'Entregue' | 'Cancelado' | 'Em Realização';
}