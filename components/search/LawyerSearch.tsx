import React, { useState, useCallback, useMemo } from 'react';
// FIX: Corrected import paths for local modules.
import type { Lawyer, MapsSearchResult } from '../../types';
import { LawyerCard } from './LawyerCard';
import { AREAS_OF_LAW } from '../../constants';
import { CrosshairsIcon, ChevronLeftIcon, ChevronRightIcon, LocationMarkerIcon } from '../common/IconComponents';

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
  const [areaFilter, setAreaFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

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
    <div className="bg-neutral-light">
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
                          "{chunk.maps.placeAnswerSources[0].reviewSnippets[0].text}" - {chunk.maps.placeAnswerSources[0].reviewSnippets[0].author}
                        </p>
                      )}
                    </div>
                </a>
                ))}
            </div>
            </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Encontre o Advogado Ideal</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select 
                    value={areaFilter} 
                    onChange={e => setAreaFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary md:col-span-2"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary pr-10"
                    />
                     <button 
                        type="button" 
                        onClick={handleGeolocation}
                        disabled={isGeolocating}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary disabled:text-gray-300"
                        aria-label="Usar minha localização"
                     >
                        {isGeolocating ? (
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : (
                           <CrosshairsIcon className="h-5 w-5" />
                        )}
                     </button>
                </div>
                <button 
                  onClick={() => setCurrentPage(1)} 
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-dark transition-colors"
                >
                    Pesquisar
                </button>
            </div>
            {geoError && <p className="text-red-600 text-sm mt-2">{geoError}</p>}
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-6">{processedLawyers.length} advogados encontrados</h3>
            {paginatedLawyers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedLawyers.map(lawyer => {
                            const lawyerWithDistance = lawyer as Lawyer & { distance?: number };
                            return (
                                <LawyerCard 
                                    key={lawyer.id} 
                                    lawyer={lawyer} 
                                    onSelect={onSelectLawyer} 
                                    distance={lawyerWithDistance.distance}
                                />
                            )
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center space-x-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">Nenhum advogado encontrado com os filtros selecionados.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};