// FIX: Corrected import path for local module.
import type { Lawyer, DailyAvailability } from '../types';

// Helper to generate dynamic availability for the next few days
const generateAvailability = (days: number): DailyAvailability[] => {
  const availability: DailyAvailability[] = [];
  const today = new Date();
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  for (let i = 2; i < days + 2; i++) { // Start from 2 days in the future
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    availability.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      slots: timeSlots.map(time => ({
        time,
        isBooked: Math.random() > 0.6, // Randomly book some slots
      })),
    });
  }
  return availability;
};

export const mockLawyers: Lawyer[] = [
  {
    id: 1,
    name: 'Dr. Carlos Andrade',
    oab: 'SP123456',
    specialties: ['Direito de Família', 'Direito Civil'],
    location: { city: 'São Paulo', state: 'SP', latitude: -23.550520, longitude: -46.633308 },
    photoUrl: 'https://picsum.photos/seed/carlos/400/400',
    rating: 4.9,
    reviewCount: 125,
    bio: 'Advogado com mais de 15 anos de experiência, especializado em divórcios, partilha de bens e questões de herança. Focado em soluções conciliatórias e eficientes para meus clientes.',
    experience: { years: 15, cases: 500 },
    education: ['Mestrado em Direito Civil - USP', 'Graduação em Direito - PUC-SP'],
    contact: { phone: '(11) 99999-1111', email: 'carlos.andrade@legisconnect.com' },
    consultationFee: 450,
    monthlyRevenue: 25500,
    consultationsThisMonth: 18,
    pendingPayments: 3200,
    reviews: [
      { id: 1, clientName: 'Maria S.', rating: 5, comment: 'Excelente profissional, muito atencioso e resolveu meu caso rapidamente.', date: '2023-03-15' },
      { id: 2, clientName: 'João P.', rating: 5, comment: 'Dr. Carlos foi crucial para o sucesso do meu processo de divórcio.', date: '2023-02-20' },
    ],
    availability: generateAvailability(20),
    calendarSyncUrl: 'https://api.legisconnect.com/calendar/v1/subscribe?token=carlos-andrade-secret-token-123',
    isCalendarSynced: true,
    status: 'verificado',
    cpf: '111.222.333-44',
    rg: '11.222.333-4',
    address: 'Rua das Flores, 123, São Paulo, SP',
    commercialAddress: 'Av. Paulista, 1000, Sala 501, São Paulo, SP',
    oabUF: 'SP',
    registrationType: 'active',
  },
  {
    id: 2,
    name: 'Dra. Beatriz Lima',
    oab: 'RJ654321',
    specialties: ['Direito Trabalhista', 'Direito Previdenciário'],
    location: { city: 'Rio de Janeiro', state: 'RJ', latitude: -22.906847, longitude: -43.172897 },
    photoUrl: 'https://picsum.photos/seed/beatriz/400/400',
    rating: 4.8,
    reviewCount: 98,
    bio: 'Especialista em direitos do trabalhador e questões previdenciárias. Atuo na defesa de clientes contra práticas abusivas e na busca por aposentadorias e benefícios justos.',
    experience: { years: 10, cases: 350 },
    education: ['Pós-graduação em Direito do Trabalho - UERJ', 'Graduação em Direito - UFRJ'],
    contact: { phone: '(21) 98888-2222', email: 'beatriz.lima@legisconnect.com' },
    consultationFee: 380,
    monthlyRevenue: 19800,
    consultationsThisMonth: 15,
    pendingPayments: 1500,
    reviews: [
      { id: 1, clientName: 'Fernanda C.', rating: 5, comment: 'A Dra. Beatriz foi fantástica, consegui meus direitos na empresa.', date: '2023-04-10' },
    ],
    availability: generateAvailability(15),
    calendarSyncUrl: 'https://api.legisconnect.com/calendar/v1/subscribe?token=beatriz-lima-secret-token-456',
    isCalendarSynced: false,
    status: 'verificado',
    cpf: '222.333.444-55',
    rg: '22.333.444-5',
    address: 'Rua de Copacabana, 456, Rio de Janeiro, RJ',
    commercialAddress: 'Av. Rio Branco, 200, Sala 120, Rio de Janeiro, RJ',
    oabUF: 'RJ',
    registrationType: 'active',
  },
  {
    id: 3,
    name: 'Dr. Ricardo Mendes',
    oab: 'MG112233',
    specialties: ['Direito Penal', 'Direito Digital'],
    location: { city: 'Belo Horizonte', state: 'MG', latitude: -19.916681, longitude: -43.934494 },
    photoUrl: 'https://picsum.photos/seed/ricardo/400/400',
    rating: 4.7,
    reviewCount: 76,
    bio: 'Atuação focada na área criminal, com vasta experiência em tribunal do júri e crimes digitais. Defesa técnica e combativa em todas as fases do processo.',
    experience: { years: 12, cases: 200 },
    education: ['Especialização em Criminologia - UFMG', 'Graduação em Direito - UFMG'],
    contact: { phone: '(31) 97777-3333', email: 'ricardo.mendes@legisconnect.com' },
    monthlyRevenue: 15000,
    consultationsThisMonth: 8,
    pendingPayments: 4500,
    reviews: [
      // FIX: Completed the truncated review object, adding the required 'date' property to resolve the type error.
      { id: 1, clientName: 'Anônimo', rating: 5, comment: 'Profissional de altíssimo nível, recomendo a todos.', date: '2023-05-22' },
    ],
    availability: generateAvailability(10),
    calendarSyncUrl: 'https://api.legisconnect.com/calendar/v1/subscribe?token=ricardo-mendes-secret-token-789',
    isCalendarSynced: true,
    status: 'verificado',
    cpf: '333.444.555-66',
    rg: '33.444.555-6',
    address: 'Rua da Bahia, 789, Belo Horizonte, MG',
    commercialAddress: 'Av. Afonso Pena, 300, Sala 30, Belo Horizonte, MG',
    oabUF: 'MG',
    registrationType: 'active',
  },
];