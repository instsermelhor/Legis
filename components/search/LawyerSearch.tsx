import React, { useState, useCallback, useMemo } from 'react';
import type { Lawyer, MapsSearchResult } from '../../types';
import { LawyerCard } from './LawyerCard';
import { AREAS_OF_LAW } from '../../constants';
import { CrosshairsIcon, ChevronLeftIcon, ChevronRightIcon, LocationMarkerIcon } from '../common/IconComponents';
import { GatedSearchModal } from './GatedSearchModal';
import { SearchStore } from '../../utils/sessionStore';

interface LawyerSearchProps {
  lawyers: Lawyer[];
  onSelectLawyer: (lawyer: Lawyer) => void;
  mapsResult: MapsSearchResult | null;
}

const ITEMS_PER_PAGE = 6;

// Helper function to calculate distance between two lat/lon points (Haversine formula)
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};


export const LawyerSearch: React.FC<LawyerSearchProps> = ({ lawyers, onSelectLawyer, mapsResult }) => {
  // Gate: anonymous users must provide CPF/email before seeing full profiles
  const isLoggedIn = !!localStorage.getItem('legis_user');
  const [isUnlocked, setIsUnlocked] = useState(isLoggedIn || SearchStore.isUnlocked());
  const [showGate, setShowGate] = useState(!isLoggedIn && !SearchStore.isUnlocked());

  const [areaFilter, setAreaFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setShowGate(false);
  };

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setIsGeolocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationFilter('Minha Localização Atual');
        setIsGeolocating(false);
        setCurrentPage(1); // Reset page on new search
      },
      () => {
        setGeoError('Não foi possível obter a localização. Verifique as permissões do navegador.');
        setIsGeolocating(false);
      }
    );
  }, []);

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
    if (userCoords) {
      setUserCoords(null); // Clear coords if user types manually
    }
  };
  
  const processedLawyers = useMemo(() => {
    let lawyersToProcess = [...lawyers];

    // 1. Filter by area
    if (areaFilter) {
      lawyersToProcess = lawyersToProcess.filter(l => l.specialties.includes(areaFilter));
    }

    // 2. Filter/Sort by location
    if (userCoords && locationFilter === 'Minha Localização Atual') {
      return lawyersToProcess
        .map(lawyer => {
          const distance =
            lawyer.location.latitude && lawyer.location.longitude
              ? getDistanceInKm(userCoords.lat, userCoords.lon, lawyer.location.latitude, lawyer.location.longitude)
              : Infinity;
          return { ...lawyer, distance };
        })
        .sort((a, b) => a.distance - b.distance);
    }
    
    if (locationFilter && locationFilter !== 'Minha Localização Atual') {
       lawyersToProcess = lawyersToProcess.filter(lawyer =>
        lawyer.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        lawyer.location.state.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    return lawyersToProcess;

  }, [lawyers, areaFilter, locationFilter, userCoords]);

  const totalPages = Math.ceil(processedLawyers.length / ITEMS_PER_PAGE);
  const paginatedLawyers = processedLawyers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="relative bg-neutral-light">
      <div className={`${showGate ? 'blur-sm pointer-events-none select-none' : ''} transition-all duration-300`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {mapsResult && mapsResult.groundingChunks.length > 0 && (
            <div className="mb-12 bg-blue-50 border-l-4 border-primary p-6 rounded-r-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sugestões do Google Maps</h2>
              <p className="text-gray-700 mb-6 prose">{mapsResult.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mapsResult.groundingChunks.map((chunk, index) => (
                  <a
                    key={index}
                    href={chunk.maps.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border flex items-start space-x-3 group"
                  >
                    <LocationMarkerIcon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-primary group-hover:underline">{chunk.maps.title}</h4>
                      {chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].text}" — {chunk.maps.placeAnswerSources[0].reviewSnippets[0].author}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-surface-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-montserrat">Encontre o Advogado Ideal</h2>
              {(areaFilter || locationFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setAreaFilter('');
                    setLocationFilter('');
                    setUserCoords(null);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary-dark dark:hover:text-primary-light flex items-center gap-1 self-start sm:self-auto"
                >
                  ✕ Limpar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={areaFilter}
                onChange={e => {
                  setAreaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-3.5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white md:col-span-2 text-sm font-medium transition-all"
              >
                <option value="">Todas as Áreas de Atuação</option>
                {AREAS_OF_LAW.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  placeholder="Cidade, Estado ou use sua localização"
                  value={locationFilter}
                  onChange={handleLocationInputChange}
                  className="w-full p-3.5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white pr-10 text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isGeolocating}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-primary disabled:text-gray-300 transition-colors"
                  aria-label="Usar minha localização"
                >
                  {isGeolocating ? (
                    <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : (
                    <CrosshairsIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-full btn-primary font-bold py-3.5 px-4 rounded-xl shadow-md shadow-purple-600/20 hover:shadow-purple-600/35 transition-all"
              >
                Buscar
              </button>
            </div>
            {geoError && <p className="text-red-500 text-xs mt-2.5 font-medium">{geoError}</p>}
          </div>

          {/* Results */}
          <div id="search-results">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {processedLawyers.length} {processedLawyers.length === 1 ? 'advogado encontrado' : 'advogados encontrados'}
              </h3>
            </div>
            {paginatedLawyers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {paginatedLawyers.map(lawyer => {
                    const lawyerWithDistance = lawyer as Lawyer & { distance?: number };
                    return (
                      <LawyerCard
                        key={lawyer.id}
                        lawyer={lawyer}
                        onSelect={onSelectLawyer}
                        distance={lawyerWithDistance.distance}
                      />
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Página anterior"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-primary text-white shadow-md shadow-purple-600/30'
                            : 'border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Próxima página"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto mb-4">
                  ⚖️
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum advogado encontrado</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  Tente ajustar ou limpar os filtros de especialidade ou localização para encontrar profissionais disponíveis.
                </p>
                <button
                  onClick={() => {
                    setAreaFilter('');
                    setLocationFilter('');
                    setUserCoords(null);
                    setCurrentPage(1);
                  }}
                  className="btn-secondary text-sm py-2.5 px-6"
                >
                  Ver Todos os Advogados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gated content modal for anonymous users */}
      <GatedSearchModal
        isOpen={showGate}
        onUnlock={handleUnlock}
        query={locationFilter}
      />
    </div>
  );
};