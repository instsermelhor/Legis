export type View = 'landing' | 'search' | 'profile' | 'dashboard' | 'lawyerDashboard' | 'login' | 'signup' | 'adminDashboard' | 'forLawyers' | 'forInterns' | 'internDashboard';

export interface User {
  email: string;
  role: 'client' | 'lawyer' | 'admin' | 'intern';
  name?: string; // For client/admin name
  data?: Lawyer | Intern; // For lawyer-specific detailed data or intern data
  // Client-specific data
  phone?: string;
  address?: string;
  caseHistory?: Case[];
  appointments?: Appointment[];
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
  address?: string; // Residential address
  commercialAddress?: string;
  oabUF?: string;
  registrationType?: 'active' | 'intern';
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