import React, { useState, useMemo } from 'react';
import { mockLawyers } from '../../../services/mockLawyerService';
import type { Lawyer } from '../../../types';
import { BadgeCheckIcon, XIcon } from '../../common/IconComponents';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientLawyerSearchProps {
  userCity?: string;
  userState?: string;
  aiSuggestedArea?: string;
}

// ─── Specialty filter map ─────────────────────────────────────────────────────

interface SpecialtyFilter {
  label: string;
  emoji: string;
  keywords: string[];
}

const SPECIALTY_FILTERS: SpecialtyFilter[] = [
  { label: 'Problemas no Trabalho', emoji: '🏭', keywords: ['Trabalhista'] },
  { label: 'Família e Divórcio',    emoji: '👨‍👩‍👧', keywords: ['Família'] },
  { label: 'Problemas com Bancos',  emoji: '🏦', keywords: ['Consumidor', 'Bancário'] },
  { label: 'Defesa Criminal',        emoji: '⚖️', keywords: ['Penal', 'Criminal'] },
  { label: 'Contratos e Dívidas',    emoji: '📝', keywords: ['Cível', 'Civil'] },
  { label: 'Casa e Propriedade',     emoji: '🏠', keywords: ['Imobiliário'] },
  { label: 'INSS e Aposentadoria',   emoji: '🧓', keywords: ['Previdenciário'] },
  { label: 'Empresas e Negócios',    emoji: '💼', keywords: ['Empresarial'] },
];

type SortBy = 'rating' | 'price' | 'recommended';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesSpecialtyFilter(lawyer: Lawyer, filter: SpecialtyFilter): boolean {
  return filter.keywords.some(kw =>
    lawyer.specialties.some(s => s.toLowerCase().includes(kw.toLowerCase()))
  );
}

function specialtyMatchesArea(specialties: string[], area?: string): boolean {
  if (!area) return false;
  return specialties.some(s => s.toLowerCase().includes(area.toLowerCase())) ||
    area.split(' ').some(word => word.length > 3 && specialties.some(s => s.toLowerCase().includes(word.toLowerCase())));
}

function truncateBio(bio: string, max = 80): string {
  return bio.length > max ? bio.slice(0, max) + '...' : bio;
}

// ─── Star display ─────────────────────────────────────────────────────────────

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>★</span>
    ))}
  </span>
);

// ─── Booking Modal ────────────────────────────────────────────────────────────

interface BookingModalProps {
  lawyer: Lawyer;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ lawyer, onClose }) => {
  const next7Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(d.toISOString().split('T')[0]);
      }
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState(next7Days[0] || '');
  const [selectedTime, setSelectedTime] = useState('');
  const [modality, setModality] = useState<'Videochamada' | 'Presencial'>('Videochamada');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [success, setSuccess] = useState(false);

  const availableSlots = useMemo(() => {
    const dayEntry = lawyer.availability.find(a => a.date === selectedDate);
    return dayEntry ? dayEntry.slots.filter(s => !s.isBooked) : [];
  }, [lawyer.availability, selectedDate]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !clientName.trim() || !clientPhone.trim()) return;
    setSuccess(true);
    setTimeout(() => onClose(), 2200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-200 dark:border-[#2A2545] bg-gradient-to-r from-purple-600 to-indigo-600">
          <img
            src={lawyer.photoUrl}
            alt={lawyer.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Agendar consulta com</p>
            <h2 className="text-lg font-bold text-white truncate">{lawyer.name}</h2>
            <p className="text-sm text-white/70">OAB {lawyer.oab}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors shrink-0"
            aria-label="Fechar modal"
          >
            <XIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Agendamento confirmado!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {selectedTime} — {modality}
            </p>
            <p className="text-gray-400 text-xs mt-4">Este modal fechará em instantes...</p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Date selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                📅 Selecionar Data
              </label>
              <div className="flex flex-wrap gap-2">
                {next7Days.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => { setSelectedDate(day); setSelectedTime(''); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      selectedDate === day
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-purple-300'
                    }`}
                  >
                    {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                🕐 Horário Disponível
              </label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum horário disponível nesta data.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        selectedTime === slot.time
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modality */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                📡 Modalidade
              </label>
              <div className="flex gap-3">
                {(['Videochamada', 'Presencial'] as const).map(m => (
                  <label
                    key={m}
                    className={`flex items-center gap-2 flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      modality === m
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-[#2A2545] hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modality"
                      value={m}
                      checked={modality === m}
                      onChange={() => setModality(m)}
                      className="accent-purple-600"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {m === 'Videochamada' ? '📹' : '🏢'} {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Client info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  👤 Seu Nome
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-[#120F24] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  📱 Telefone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-[#120F24] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            {/* Fee info */}
            {lawyer.consultationFee && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Valor da consulta</p>
                  <p className="text-base font-bold text-amber-800 dark:text-amber-300">
                    R$ {lawyer.consultationFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || !clientName.trim() || !clientPhone.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-purple-500/25 text-sm"
            >
              📅 Confirmar Agendamento
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Profile Modal ────────────────────────────────────────────────────────────

interface ProfileModalProps {
  lawyer: Lawyer;
  onClose: () => void;
  onBook: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ lawyer, onClose, onBook }) => (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-[#1A1730] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-700 to-indigo-800 p-6 text-white rounded-t-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fechar"
        >
          <XIcon className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={lawyer.photoUrl}
              alt={lawyer.name}
              className="w-20 h-20 rounded-full object-cover border-3 border-white/30"
            />
            {lawyer.status === 'verificado' && (
              <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <BadgeCheckIcon className="w-4 h-4 text-white" />
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{lawyer.name}</h2>
            <p className="text-sm text-white/70">OAB {lawyer.oab} · {lawyer.location.city}/{lawyer.location.state}</p>
            <div className="flex items-center gap-2 mt-1">
              <StarDisplay rating={lawyer.rating} />
              <span className="text-xs text-white/60">{lawyer.rating.toFixed(1)} ({lawyer.reviewCount} avaliações)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Bio */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Sobre</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{lawyer.bio}</p>
        </div>

        {/* Specialties */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties.map(s => (
              <span
                key={s}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 dark:bg-[#120F24] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{lawyer.experience.years}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Anos de exp.</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#120F24] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-indigo-600">{lawyer.experience.cases}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Casos</p>
          </div>
          <div className="bg-gray-50 dark:bg-[#120F24] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-500">
              {lawyer.consultationFee ? `R$${lawyer.consultationFee}` : 'Sob consulta'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Consulta</p>
          </div>
        </div>

        {/* Education */}
        {lawyer.education.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Formação</h3>
            <ul className="space-y-1">
              {lawyer.education.map(e => (
                <li key={e} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">🎓</span> {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent reviews */}
        {lawyer.reviews.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Avaliações Recentes</h3>
            <div className="space-y-3">
              {lawyer.reviews.slice(0, 2).map(r => (
                <div key={r.id} className="bg-gray-50 dark:bg-[#120F24] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.clientName}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { onClose(); onBook(); }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md text-sm"
        >
          📅 Agendar Consulta
        </button>
      </div>
    </div>
  </div>
);

// ─── Lawyer Card ──────────────────────────────────────────────────────────────

interface LawyerCardProps {
  lawyer: Lawyer;
  isRecommended: boolean;
  isFromRegion: boolean;
  onBook: () => void;
  onViewProfile: () => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({
  lawyer,
  isRecommended,
  isFromRegion,
  onBook,
  onViewProfile,
}) => {
  const visibleSpecialties = lawyer.specialties.slice(0, 2);
  const extraCount = lawyer.specialties.length - 2;

  return (
    <article className="group relative bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fade-in">
      {/* Badges top-right */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
        {isRecommended && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-bold whitespace-nowrap">
            🤖 Recomendado para você
          </span>
        )}
        {isFromRegion && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px] font-bold whitespace-nowrap">
            📍 Da sua região
          </span>
        )}
      </div>

      {/* Header: photo + info */}
      <div className="flex items-start gap-4 pr-24">
        <div className="relative shrink-0">
          <img
            src={lawyer.photoUrl}
            alt={lawyer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-[#2A2545]"
          />
          {lawyer.status === 'verificado' && (
            <span
              className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-md"
              title="Verificado"
            >
              <BadgeCheckIcon className="w-4 h-4 text-white" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate text-base leading-tight">
            {lawyer.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            OAB {lawyer.oab} · {lawyer.location.city}/{lawyer.location.state}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <StarDisplay rating={lawyer.rating} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lawyer.rating.toFixed(1)} <span className="text-gray-400">({lawyer.reviewCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Specialty tags */}
      <div className="flex flex-wrap gap-1.5">
        {visibleSpecialties.map(s => (
          <span
            key={s}
            className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold"
          >
            {s}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-xs font-semibold">
            +{extraCount} mais
          </span>
        )}
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {truncateBio(lawyer.bio)}
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-[#2A2545] pt-3">
        <span className="flex items-center gap-1">
          📋 <strong className="text-gray-700 dark:text-gray-300">{lawyer.experience.cases}</strong> casos
        </span>
        <span className="flex items-center gap-1">
          ⏱ Resposta: <strong className="text-gray-700 dark:text-gray-300">~24h</strong>
        </span>
        <span className="flex items-center gap-1 font-semibold">
          💰{' '}
          {lawyer.consultationFee
            ? <strong className="text-green-600 dark:text-green-400">R$ {lawyer.consultationFee.toLocaleString('pt-BR')}</strong>
            : <span className="text-gray-400">Sob consulta</span>
          }
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          id={`book-lawyer-${lawyer.id}`}
          onClick={onBook}
          className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-purple-500/20 flex items-center justify-center gap-1.5"
        >
          📅 Agendar
        </button>
        <button
          id={`profile-lawyer-${lawyer.id}`}
          onClick={onViewProfile}
          className="flex-1 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#2A2545] border border-gray-200 dark:border-[#2A2545] rounded-xl hover:bg-gray-200 dark:hover:bg-[#352F5B] transition-colors flex items-center justify-center gap-1.5"
        >
          👤 Ver Perfil
        </button>
      </div>
    </article>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ClientLawyerSearch: React.FC<ClientLawyerSearchProps> = ({
  userCity,
  userState,
  aiSuggestedArea,
}) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyFilter | null>(null);
  const [minRating, setMinRating] = useState<0 | 3 | 4>(0);
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Modal states
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState<Lawyer | null>(null);
  const [selectedLawyerForProfile, setSelectedLawyerForProfile] = useState<Lawyer | null>(null);

  // Pre-select specialty from aiSuggestedArea on mount
  const initialSpecialty = useMemo(() => {
    if (!aiSuggestedArea) return null;
    return SPECIALTY_FILTERS.find(f =>
      f.keywords.some(kw => aiSuggestedArea.toLowerCase().includes(kw.toLowerCase()))
    ) || null;
  }, [aiSuggestedArea]);

  // Apply initial specialty once
  const [initialized, setInitialized] = useState(false);
  if (!initialized && initialSpecialty) {
    setSelectedSpecialty(initialSpecialty);
    setInitialized(true);
  }

  // Filtered + sorted lawyers
  const filteredLawyers = useMemo(() => {
    let result = mockLawyers.filter(lawyer => {
      // Name search
      if (searchQuery && !lawyer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Specialty filter
      if (selectedSpecialty && !matchesSpecialtyFilter(lawyer, selectedSpecialty)) return false;
      // Rating
      if (minRating > 0 && lawyer.rating < minRating) return false;
      return true;
    });

    // Sort
    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      result = [...result].sort((a, b) => {
        const fa = a.consultationFee ?? 99999;
        const fb = b.consultationFee ?? 99999;
        return fa - fb;
      });
    } else {
      // Recommended: put AI-match first, then region, then rating
      result = [...result].sort((a, b) => {
        const aRec = specialtyMatchesArea(a.specialties, aiSuggestedArea) ? 2 : 0;
        const bRec = specialtyMatchesArea(b.specialties, aiSuggestedArea) ? 2 : 0;
        const aReg = (a.location.city === userCity || a.location.state === userState) ? 1 : 0;
        const bReg = (b.location.city === userCity || b.location.state === userState) ? 1 : 0;
        const scoreA = aRec + aReg + a.rating / 10;
        const scoreB = bRec + bReg + b.rating / 10;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [searchQuery, selectedSpecialty, minRating, sortBy, aiSuggestedArea, userCity, userState]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setMinRating(0);
    setSortBy('recommended');
  };

  const hasActiveFilters = searchQuery || selectedSpecialty || minRating > 0 || sortBy !== 'recommended';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🔍 Encontrar Advogado
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Profissionais verificados prontos para ajudar você
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            Tempo de resposta médio: <strong className="text-gray-600 dark:text-gray-300">~24h</strong>
          </p>
        </div>

        {/* AI suggestion banner */}
        {aiSuggestedArea && (
          <div className="mt-3 flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl px-4 py-3">
            <span className="text-xl shrink-0">🤖</span>
            <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
              Com base no seu caso, buscamos advogados de{' '}
              <strong className="text-purple-900 dark:text-purple-200">{aiSuggestedArea}</strong>
            </p>
          </div>
        )}
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl shadow-sm overflow-hidden">
        {/* Accordion toggle (mobile) */}
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 sm:cursor-default sm:pointer-events-none"
          aria-expanded={filtersOpen}
        >
          <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
            🎛️ Filtros
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                Ativos
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform sm:hidden ${filtersOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Filter body */}
        <div className={`${filtersOpen ? 'block' : 'hidden sm:block'} px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-[#2A2545] pt-4`}>
          {/* Name search */}
          <div>
            <label htmlFor="lawyer-search-input" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Buscar por nome
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                id="lawyer-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do advogado..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-[#120F24] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpar busca"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Specialty tags */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Área jurídica
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_FILTERS.map(filter => (
                <button
                  key={filter.label}
                  id={`specialty-filter-${filter.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() =>
                    setSelectedSpecialty(prev =>
                      prev?.label === filter.label ? null : filter
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    selectedSpecialty?.label === filter.label
                      ? 'border-purple-500 bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300'
                  }`}
                >
                  <span>{filter.emoji}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating + Sort row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Min rating */}
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Avaliação mínima
              </p>
              <div className="flex gap-2">
                {([0, 3, 4] as const).map(r => (
                  <button
                    key={r}
                    id={`rating-filter-${r}`}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      minRating === r
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-200 dark:border-[#2A2545] text-gray-600 dark:text-gray-400 hover:border-amber-300'
                    }`}
                  >
                    {r === 0 ? 'Qualquer' : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort by */}
            <div>
              <label htmlFor="sort-select" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Ordenar por
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2A2545] rounded-xl bg-white dark:bg-[#120F24] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              >
                <option value="recommended">⭐ Mais Indicados</option>
                <option value="rating">🏆 Avaliação</option>
                <option value="price">💰 Menor Preço</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1"
              >
                <XIcon className="w-3 h-3" /> Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Results counter ─── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-white">{filteredLawyers.length}</strong>{' '}
          {filteredLawyers.length === 1 ? 'advogado encontrado' : 'advogados encontrados'}
        </p>
        {filteredLawyers.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">Resposta média ~24h</span>
        )}
      </div>

      {/* ─── Grid ─── */}
      {filteredLawyers.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-white">
            Nenhum advogado encontrado com esses filtros
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Tente ajustar os critérios de busca ou limpar os filtros.
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLawyers.map(lawyer => {
            const isRecommended = specialtyMatchesArea(lawyer.specialties, aiSuggestedArea);
            const isFromRegion =
              (!!userCity && lawyer.location.city.toLowerCase() === userCity.toLowerCase()) ||
              (!!userState && lawyer.location.state.toLowerCase() === userState.toLowerCase());

            return (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                isRecommended={isRecommended}
                isFromRegion={isFromRegion}
                onBook={() => setSelectedLawyerForBooking(lawyer)}
                onViewProfile={() => setSelectedLawyerForProfile(lawyer)}
              />
            );
          })}
        </div>
      )}

      {/* ─── Booking Modal ─── */}
      {selectedLawyerForBooking && (
        <BookingModal
          lawyer={selectedLawyerForBooking}
          onClose={() => setSelectedLawyerForBooking(null)}
        />
      )}

      {/* ─── Profile Modal ─── */}
      {selectedLawyerForProfile && (
        <ProfileModal
          lawyer={selectedLawyerForProfile}
          onClose={() => setSelectedLawyerForProfile(null)}
          onBook={() => {
            setSelectedLawyerForBooking(selectedLawyerForProfile);
            setSelectedLawyerForProfile(null);
          }}
        />
      )}
    </div>
  );
};
