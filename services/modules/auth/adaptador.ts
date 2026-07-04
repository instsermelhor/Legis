/**
 * Adaptador de sessão: converte a resposta da API ({ pessoa, perfil })
 * para o formato `User` que os painéis do frontend consomem.
 *
 * Campos exclusivamente visuais que ainda não existem no banco (avaliações,
 * fotos padrão) recebem valores neutros — nunca números inventados.
 */
import type { User, Lawyer, Intern, Secretary } from '../../../types';
import type { PessoaApi } from './index';

type Perfil = Record<string, unknown> | null;

function paraLawyer(pessoa: PessoaApi, perfil: Perfil): Lawyer {
  const p = perfil ?? {};
  return {
    id: pessoa.id,
    name: pessoa.nome,
    oab: String(p.oab ?? ''),
    specialties: (p.especialidades as string[]) ?? [],
    location: { city: pessoa.cidade ?? '', state: pessoa.estado ?? '' },
    photoUrl: String(p.foto_url ?? `https://i.pravatar.cc/200?u=adv-${pessoa.id}`),
    rating: 0,
    reviewCount: 0,
    bio: String(p.bio ?? ''),
    experience: { years: 0, cases: 0 },
    education: [],
    contact: { phone: pessoa.telefone ?? '', email: pessoa.email },
    reviews: [],
    availability: [],
    status: (p.status as Lawyer['status']) ?? 'pendente',
  };
}

function paraIntern(pessoa: PessoaApi, perfil: Perfil): Intern {
  const p = perfil ?? {};
  return {
    id: pessoa.id,
    name: pessoa.nome,
    cpf: '',
    university: String(p.universidade ?? ''),
    semester: String(p.semestre ?? ''),
    specialtyInterest: String(p.interesse ?? ''),
    contact: { phone: pessoa.telefone ?? '', email: pessoa.email },
    hoursCompleted: 0,
    availableHours: 200,
    casesStudied: [],
    status: 'active',
    city: pessoa.cidade ?? undefined,
    state: pessoa.estado ?? undefined,
    supervisorLawyerId: (p.supervisor_id as number | null) ?? undefined,
  };
}

function paraSecretary(pessoa: PessoaApi, perfil: Perfil): Secretary {
  const p = perfil ?? {};
  return {
    id: pessoa.id,
    name: pessoa.nome,
    email: pessoa.email,
    phone: pessoa.telefone ?? '',
    city: pessoa.cidade ?? '',
    state: pessoa.estado ?? '',
    experience: Number(p.experiencia_anos ?? 0),
    areasOfKnowledge: [],
    availability: (p.disponibilidade as Secretary['availability']) ?? 'integral',
    bio: '',
    status: 'ativo',
    joinedDate: new Date().toISOString().split('T')[0],
    assignedLawyerId: (p.advogado_id as number | null) ?? undefined,
  };
}

/** Sessão da API → User do frontend. */
export function sessaoParaUser(pessoa: PessoaApi, perfil: Perfil): User {
  switch (pessoa.tipo) {
    case 'admin':
      return { email: pessoa.email, role: 'admin', name: pessoa.nome };
    case 'advogado':
      return { email: pessoa.email, role: 'lawyer', name: pessoa.nome, data: paraLawyer(pessoa, perfil) };
    case 'bacharel':
      return { email: pessoa.email, role: 'intern', name: pessoa.nome, data: paraIntern(pessoa, perfil) };
    case 'secretario':
      return { email: pessoa.email, role: 'secretary', name: pessoa.nome, data: paraSecretary(pessoa, perfil) };
    case 'cliente':
    default:
      return {
        email: pessoa.email,
        role: 'client',
        name: pessoa.nome,
        phone: pessoa.telefone ?? undefined,
        address: [pessoa.cidade, pessoa.estado].filter(Boolean).join(', ') || undefined,
        caseHistory: [],
        appointments: [],
      };
  }
}
