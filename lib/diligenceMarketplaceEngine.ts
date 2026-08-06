/**
 * lib/diligenceMarketplaceEngine.ts
 * Nível 11 — Marketplace de Correspondentes Jurídicos & Diligências Geo-Localizadas com Escrow
 * Legis Connect — Plataforma Jurídica Online
 */

export type DiligenceType =
  | 'audiencia_presencial'
  | 'audiencia_virtual'
  | 'copia_processo'
  | 'protocolo_presencial'
  | 'despacho_juiz'
  | 'sustentacao_oral'
  | 'diligencia_policial';

export type DiligenceStatus =
  | 'open'                 // Aberta aguardando correspondente
  | 'accepted'             // Correspondente aceitou
  | 'checked_in'           // Check-in GPS realizado no tribunal/fórum
  | 'delivered'            // Relatório e atas entregues
  | 'approved'             // Aprovado pelo contratante (Escrow liberado)
  | 'disputed'             // Em contestação/arbitragem
  | 'cancelled';            // Cancelada

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  addressName: string;
  timestamp: string;
}

export interface Correspondent {
  id: string;
  name: string;
  oabNumber: string;
  oabUf: string;
  avatarUrl: string;
  comarcaPrincipal: string;
  raioAtendimentoKm: number;
  rating: number; // 0 a 5.0
  totalDiligencias: number;
  taxaSucessoPct: number;
  specialties: string[];
  isVerifiedOab: boolean;
  isOnlineNow: boolean;
  latitude: number;
  longitude: number;
}

export interface DiligenceTask {
  id: string;
  title: string;
  type: DiligenceType;
  description: string;
  comarca: string;
  tribunalVara: string;
  processNumber?: string;
  deadline: string;
  escrowValueBrl: number;
  platformFeeBrl: number;
  netCorrespondentBrl: number;
  status: DiligenceStatus;
  requesterId: string;
  requesterName: string;
  requesterOab: string;
  correspondentId?: string;
  correspondent?: Correspondent;
  createdAt: string;
  acceptedAt?: string;
  checkInLocation?: GPSLocation;
  deliveredDocsUrls?: string[];
  deliveryNotes?: string;
  deliveredAt?: string;
  approvedAt?: string;
  escrowTransactionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dados Simulados de Correspondentes no Brasil
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CORRESPONDENTS: Correspondent[] = [
  {
    id: 'cor_1',
    name: 'Dra. Mariana Costa e Silva',
    oabNumber: 'OAB/SP 412.980',
    oabUf: 'SP',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    comarcaPrincipal: 'Fórum Cível Central de São Paulo',
    raioAtendimentoKm: 30,
    rating: 4.95,
    totalDiligencias: 142,
    taxaSucessoPct: 99.3,
    specialties: ['Audiências Cíveis', 'Sustentação Oral no TJSP', 'Despachos com Magistrados'],
    isVerifiedOab: true,
    isOnlineNow: true,
    latitude: -23.55052,
    longitude: -46.633308,
  },
  {
    id: 'cor_2',
    name: 'Dr. Roberto Alcantara Santos',
    oabNumber: 'OAB/RJ 198.430',
    oabUf: 'RJ',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    comarcaPrincipal: 'TRT 1ª Região - Rio de Janeiro',
    raioAtendimentoKm: 45,
    rating: 4.88,
    totalDiligencias: 98,
    taxaSucessoPct: 97.9,
    specialties: ['Audiências Trabalhistas', 'Cópia de Autos Físicos', 'Diligências em Delegacias'],
    isVerifiedOab: true,
    isOnlineNow: true,
    latitude: -22.906847,
    longitude: -43.172896,
  },
  {
    id: 'cor_3',
    name: 'Dra. Beatriz Mendes Ferreira',
    oabNumber: 'OAB/MG 175.210',
    oabUf: 'MG',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    comarcaPrincipal: 'Fórum Lafayette - Belo Horizonte',
    raioAtendimentoKm: 25,
    rating: 4.92,
    totalDiligencias: 76,
    taxaSucessoPct: 100.0,
    specialties: ['Audiências de Conciliação', 'Protocolos Urgentes', 'Despacho com Relator TJMG'],
    isVerifiedOab: true,
    isOnlineNow: false,
    latitude: -19.916681,
    longitude: -43.934493,
  },
  {
    id: 'cor_4',
    name: 'Dr. Lucas Gabriel Prado',
    oabNumber: 'OAB/DF 64.890',
    oabUf: 'DF',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    comarcaPrincipal: 'STF / STJ / TST - Brasília',
    raioAtendimentoKm: 60,
    rating: 4.99,
    totalDiligencias: 215,
    taxaSucessoPct: 99.8,
    specialties: ['Despachos em Tribunais Superiores', 'Sustentação Oral STF/STJ', 'Acompanhamento de Julgamentos'],
    isVerifiedOab: true,
    isOnlineNow: true,
    latitude: -15.7975,
    longitude: -47.8919,
  },
];

// Diligências mock de exemplo
export const INITIAL_DILIGENCES: DiligenceTask[] = [
  {
    id: 'dil_101',
    title: 'Audiência de Instrução e Julgamento Cível',
    type: 'audiencia_presencial',
    description: 'Acompanhamento de audiência presencial com colheita de depoimento pessoal e testemunhas. Fórum João Mendes Jr., 4ª Vara Cível, São Paulo.',
    comarca: 'São Paulo - SP',
    tribunalVara: '4ª Vara Cível - Foro Central Cível',
    processNumber: '1048291-33.2025.8.26.0100',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    escrowValueBrl: 350.00,
    platformFeeBrl: 35.00,
    netCorrespondentBrl: 315.00,
    status: 'open',
    requesterId: 'req_1',
    requesterName: 'Dr. Carlos Eduardo Rocha',
    requesterOab: 'OAB/SP 312.450',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'dil_102',
    title: 'Despacho Urgente com Desembargador Relator (Liminar em Agravo)',
    type: 'despacho_juiz',
    description: 'Despacho presencial da petição de tutela de urgência no TJSP. Pedido de efeito suspensivo ativo em agravo de instrumento contratual.',
    comarca: 'São Paulo - SP',
    tribunalVara: 'TJSP - 12ª Câmara de Direito Privado',
    processNumber: '2194810-88.2025.8.26.0000',
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(),
    escrowValueBrl: 500.00,
    platformFeeBrl: 50.00,
    netCorrespondentBrl: 450.00,
    status: 'accepted',
    requesterId: 'req_2',
    requesterName: 'Dra. Vanessa Lins',
    requesterOab: 'OAB/RJ 145.920',
    correspondentId: 'cor_1',
    correspondent: MOCK_CORRESPONDENTS[0],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    acceptedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'dil_103',
    title: 'Sustentação Oral em Agravo de Regimento no STJ',
    type: 'sustentacao_oral',
    description: 'Sustentação oral telepresencial/presencial na 3ª Turma do Superior Tribunal de Justiça. Matéria tributária de alta relevância.',
    comarca: 'Brasília - DF',
    tribunalVara: 'STJ - 3ª Turma',
    processNumber: 'REsp 1.948.201/DF',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    escrowValueBrl: 1200.00,
    platformFeeBrl: 120.00,
    netCorrespondentBrl: 1080.00,
    status: 'delivered',
    requesterId: 'req_3',
    requesterName: 'Dr. Fernando Botelho',
    requesterOab: 'OAB/MG 98.710',
    correspondentId: 'cor_4',
    correspondent: MOCK_CORRESPONDENTS[3],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    acceptedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    deliveryNotes: 'Sustentação oral realizada com êxito. Ata da sessão e áudio anexados.',
    deliveredDocsUrls: ['https://legisconnect.com.br/docs/ata_stj_resp1948201.pdf'],
    checkInLocation: {
      latitude: -15.7975,
      longitude: -47.8919,
      accuracyMeters: 4.2,
      addressName: 'STF/STJ - Praça dos Três Poderes, Brasília DF',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Cálculos de Geolocalização e Distância (Fórmula de Haversine)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários de Custódia Escrow
// ─────────────────────────────────────────────────────────────────────────────

export function calculateEscrowSplit(totalValueBrl: number): { escrowValue: number; platformFee: number; netCorrespondent: number } {
  const platformFee = Math.round(totalValueBrl * 0.10 * 100) / 100; // 10% taxa de plataforma
  const netCorrespondent = Math.round((totalValueBrl - platformFee) * 100) / 100;
  return {
    escrowValue: totalValueBrl,
    platformFee,
    netCorrespondent,
  };
}

export function formatDiligenceTypeLabel(type: DiligenceType): { label: string; badgeColor: string; icon: string } {
  switch (type) {
    case 'audiencia_presencial':
      return { label: 'Audiência Presencial', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: '🏛️' };
    case 'audiencia_virtual':
      return { label: 'Audiência Virtual', badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: '💻' };
    case 'copia_processo':
      return { label: 'Cópia de Processo', badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: '📁' };
    case 'protocolo_presencial':
      return { label: 'Protocolo Físico', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: '📥' };
    case 'despacho_juiz':
      return { label: 'Despacho com Juiz/Relator', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: '⚖️' };
    case 'sustentacao_oral':
      return { label: 'Sustentação Oral', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30', icon: '🗣️' };
    case 'diligencia_policial':
      return { label: 'Acompanhamento Policial', badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: '🛡️' };
  }
}

export function formatStatusBadge(status: DiligenceStatus): { label: string; badgeColor: string } {
  switch (status) {
    case 'open':
      return { label: '🟢 Aberta', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    case 'accepted':
      return { label: '🤝 Aceita', badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    case 'checked_in':
      return { label: '📍 Check-in GPS', badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
    case 'delivered':
      return { label: '📦 Entregue (Aguardando Aprovação)', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    case 'approved':
      return { label: '✅ Concluída & Escrow Liberado', badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' };
    case 'disputed':
      return { label: '⚠️ Em Mediação', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    case 'cancelled':
      return { label: '❌ Cancelada', badgeColor: 'bg-slate-700/30 text-slate-400 border-slate-600/30' };
  }
}
