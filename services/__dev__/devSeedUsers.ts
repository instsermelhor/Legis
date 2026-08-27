/**
 * services/__dev__/devSeedUsers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Dados de usuários de demonstração para desenvolvimento local.
 *
 * ⚠️  ESTE ARQUIVO É EXCLUSIVO PARA DESENVOLVIMENTO.
 *    NÃO importar em código de produção diretamente.
 *    Em produção (Supabase configurado), a autenticação usa Supabase Auth.
 *    Este módulo só é usado via App.tsx quando isSupabaseConfigured = false.
 *
 * Consolidação de G-001/A-5: mock data inline de App.tsx movido para cá,
 * deixando App.tsx limpo de dados de demonstração hardcoded.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Case, Appointment, Intern } from '../../types';
import { mockLawyers } from '../mockLawyerService';

// ─── Casos de demonstração para cliente ───────────────────────────────────────

export function createDemoClientCases(clientName: string): Case[] {
  return [
    {
      id: `demo-case-001-${Date.now()}`,
      title: 'Processo de Divórcio Consensual',
      clientName,
      lawyerName: mockLawyers[0]?.name ?? 'Advogado Demo',
      lawyerId: mockLawyers[0]?.id ?? 1,
      status: 'Ativo',
      stages: [
        { name: 'Análise Inicial', status: 'completed' },
        { name: 'Coleta de Documentos', status: 'completed' },
        { name: 'Elaboração da Petição', status: 'current' },
        { name: 'Protocolo Judicial', status: 'upcoming' },
        { name: 'Sentença', status: 'upcoming' },
      ],
      reviewSubmitted: false,
    },
    {
      id: `demo-case-002-${Date.now()}`,
      title: 'Ação de Alimentos',
      clientName,
      lawyerName: mockLawyers[1]?.name ?? 'Advogado Demo 2',
      lawyerId: mockLawyers[1]?.id ?? 2,
      status: 'Concluído',
      stages: [
        { name: 'Análise Inicial', status: 'completed' },
        { name: 'Petição Inicial', status: 'completed' },
        { name: 'Audiência', status: 'completed' },
        { name: 'Sentença', status: 'completed' },
      ],
      reviewSubmitted: false,
    },
  ];
}

// ─── Agendamentos de demonstração ─────────────────────────────────────────────

export function createDemoAppointments(clientName: string): Appointment[] {
  const future = new Date();
  future.setDate(future.getDate() + 3);
  const past = new Date();
  past.setDate(past.getDate() - 5);

  return [
    {
      id: `demo-apt-001-${Date.now()}`,
      clientName,
      date: future.toISOString().split('T')[0],
      time: '15:00',
      status: 'Confirmado',
      modality: 'Videochamada',
      consultationLink: 'https://meet.legisconnect.com/call/demo',
    },
    {
      id: `demo-apt-002-${Date.now()}`,
      clientName,
      date: past.toISOString().split('T')[0],
      time: '11:00',
      status: 'Concluído',
      modality: 'Videochamada',
    },
  ];
}

// ─── Estagiário de demonstração ───────────────────────────────────────────────

export const demoIntern: Intern = {
  id: 9999,
  name: 'Bacharelando Demo',
  cpf: '000.000.000-00',
  university: 'Universidade Legis Connect (Demo)',
  semester: '5º ao 7º semestre',
  specialtyInterest: 'Direito Civil',
  contact: { phone: '(11) 99999-9999', email: 'demo@legisconnect.com.br' },
  hoursCompleted: 85,
  availableHours: 200,
  casesStudied: [],
  status: 'active',
};

// ─── Advogado de demonstração ─────────────────────────────────────────────────

export function createDemoLawyer(email: string) {
  const base = mockLawyers[0];
  if (!base) return null;
  return {
    ...base,
    contact: { ...base.contact, email },
    name: 'Advogado Demo',
  };
}
