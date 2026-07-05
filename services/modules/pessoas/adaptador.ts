/**
 * Adaptador: AdvogadoApi (vitrine da API) → tipo Lawyer que os componentes
 * de busca/exibição consomem. Campos sem origem no banco recebem valores
 * neutros (nunca números inventados).
 */
import type { Lawyer } from '../../../types';
import type { AdvogadoApi } from './index';

export function advogadoParaLawyer(a: AdvogadoApi): Lawyer {
  return {
    id: a.id,
    name: a.nome,
    oab: a.oab,
    specialties: a.especialidades ?? [],
    location: { city: a.cidade ?? '', state: a.estado ?? '' },
    photoUrl: a.foto_url ?? `https://i.pravatar.cc/200?u=adv-${a.id}`,
    rating: 0,
    reviewCount: 0,
    bio: a.bio ?? '',
    experience: { years: 0, cases: 0 },
    education: [],
    contact: { phone: a.telefone ?? '', email: a.email },
    reviews: [],
    availability: [],
    status: a.status === 'verificado' ? 'verificado' : 'pendente',
  };
}
