import React, { useState, useCallback } from 'react';
import { analyzeCaseWithGemini, findPlacesWithMaps } from '../../services/geminiService';
import { mockLawyers } from '../../services/mockLawyerService';
import type { Lawyer, MapsSearchResult } from '../../types';
import { LocationMarkerIcon } from '../common/IconComponents';
import { CaseStore } from '../../utils/sessionStore';

interface CaseDescriptionFormProps {
  onSearch: (results: Lawyer[], mapsData: MapsSearchResult | null) => void;
  /** Called when user clicks "Buscar" but wants to be redirected to signup instead */
  onRedirectToSignup?: (description: string, city: string) => void;
  /** If true, redirect to signup after saving to sessionStorage (used on landing hero) */
  captureMode?: boolean;
  /** Pre-fill values from sessionStorage intent */
  initialDescription?: string;
  initialCity?: string;
}

export const CaseDescriptionForm: React.FC<CaseDescriptionFormProps> = ({
  onSearch,
  onRedirectToSignup,
  captureMode = false,
  initialDescription = '',
  initialCity = '',
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [location, setLocation]       = useState(initialCity);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [coords, setCoords]           = useState<{ latitude: number; longitude: number } | null>(null);

  const handleGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocation('Usando localização atual');
        },
        () => setError('Não foi possível obter a geolocalização. Por favor, digite sua cidade.')
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setError('Por favor, descreva seu caso.'); return; }
    setError('');

    // Always persist to sessionStorage before any action
    CaseStore.set({ description: description.trim(), city: location.trim() });

    // Capture mode: redirect to signup with pre-filled data
    if (captureMode && onRedirectToSignup) {
      onRedirectToSignup(description.trim(), location.trim());
      return;
    }

    setIsLoading(true);
    try {
      const [analysis, mapsData] = await Promise.all([
        analyzeCaseWithGemini(description),
        findPlacesWithMaps(description, coords || undefined),
      ]);
      const relevantSpecialties = [analysis.primaryArea, ...analysis.specializations];
      const results = mockLawyers.filter(l =>
        l.specialties.some(s => relevantSpecialties.includes(s))
      );
      onSearch(results.length > 0 ? results : mockLawyers, mapsData);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar seu caso. Exibindo resultados gerais.');
      onSearch(mockLawyers, null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="case-description"
          className="block text-xs font-semibold text-gray-300 tracking-wide uppercase"
        >
          Descreva sua necessidade jurídica
        </label>
        <textarea
          id="case-description"
          name="description"
          rows={4}
          className="
            w-full px-4 py-3 rounded-xl
            bg-white/6 border border-white/12
            text-white placeholder-white/35
            text-sm leading-relaxed
            resize-none
            transition-all duration-200
            focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white/8
            hover:border-white/20
          "
          style={{ colorScheme: 'dark' }}
          placeholder="Ex: Preciso de ajuda com um processo de divórcio e partilha de bens. Tenho dois filhos menores..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label
          htmlFor="case-location"
          className="block text-xs font-semibold text-gray-300 tracking-wide uppercase"
        >
          Sua cidade ou estado
        </label>
        <div className="relative">
          <input
            type="text"
            id="case-location"
            name="location"
            className="
              w-full px-4 py-3 pr-11 rounded-xl
              bg-white/6 border border-white/12
              text-white placeholder-white/35
              text-sm
              transition-all duration-200
              focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white/8
              hover:border-white/20
            "
            style={{ colorScheme: 'dark' }}
            placeholder="Ex: São Paulo, SP"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleGeolocation}
              className="text-gray-500 hover:text-primary transition-colors"
              title="Usar minha localização"
              aria-label="Usar localização atual"
            >
              <LocationMarkerIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Analisando com IA…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Buscar Advogados
          </>
        )}
      </button>

      {/* Legal notice */}
      <p className="text-[10px] text-gray-600 text-center leading-relaxed">
        Informações protegidas por sigilo profissional (Lei nº 8.906/94, Art. 7º), Código de Ética OAB e LGPD (Lei nº 13.709/18).
      </p>
    </form>
  );
};
