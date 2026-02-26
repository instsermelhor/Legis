import React, { useState, useCallback } from 'react';
import { analyzeCaseWithGemini, findPlacesWithMaps } from '../../services/geminiService';
import { mockLawyers } from '../../services/mockLawyerService';
// FIX: Corrected import path for local module.
import type { Lawyer, MapsSearchResult } from '../../types';
import { LocationMarkerIcon } from '../common/IconComponents';

interface CaseDescriptionFormProps {
  onSearch: (results: Lawyer[], mapsData: MapsSearchResult | null) => void;
}

export const CaseDescriptionForm: React.FC<CaseDescriptionFormProps> = ({ onSearch }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{latitude: number, longitude: number} | null>(null);

  const handleGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocation('Usando localização atual'); 
        },
        () => {
          setError('Não foi possível obter a geolocalização. Por favor, digite sua cidade.');
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor, descreva seu caso.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // Run both API calls in parallel for better performance
      const [analysis, mapsData] = await Promise.all([
          analyzeCaseWithGemini(description),
          findPlacesWithMaps(description, coords || undefined)
      ]);
      
      // Filter mock lawyers based on Gemini's analysis
      const relevantSpecialties = [analysis.primaryArea, ...analysis.specializations];
      const results = mockLawyers.filter(lawyer => 
        lawyer.specialties.some(spec => relevantSpecialties.includes(spec))
      );
      
      // Pass both results to parent to navigate
      onSearch(results.length > 0 ? results : mockLawyers, mapsData);

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar seu caso. Exibindo resultados gerais.');
      // Fallback to showing all lawyers and no maps data
      onSearch(mockLawyers, null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Encontre um advogado especialista</h2>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descreva sua necessidade jurídica</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          placeholder="Ex: Preciso de ajuda com um processo de divórcio e partilha de bens."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Sua cidade ou estado</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
            type="text"
            id="location"
            name="location"
            className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary pl-3 pr-10 py-2"
            placeholder="Ex: São Paulo, SP"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={handleGeolocation} className="text-gray-400 hover:text-primary">
                    <LocationMarkerIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Buscar Advogados'}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Suas informações são confidenciais e protegidas.
      </p>
    </form>
  );
};
