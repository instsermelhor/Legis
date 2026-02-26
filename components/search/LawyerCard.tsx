import React from 'react';
// FIX: Corrected import path for local module.
import type { Lawyer } from '../../types';
import { StarRating } from '../common/StarRating';
import { LocationMarkerIcon, BadgeCheckIcon } from '../common/IconComponents';

interface LawyerCardProps {
  lawyer: Lawyer;
  onSelect: (lawyer: Lawyer) => void;
  distance?: number;
}

export const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onSelect, distance }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer border border-gray-100 flex flex-col"
      onClick={() => onSelect(lawyer)}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-center space-x-4">
          <img className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20" src={lawyer.photoUrl} alt={lawyer.name} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                {lawyer.name}
                {lawyer.status === 'verificado' && <BadgeCheckIcon className="h-5 w-5 text-accent ml-2 flex-shrink-0" />}
            </h3>
            <p className="text-sm text-primary font-medium">{lawyer.specialties[0]}</p>
            <div className="flex items-center mt-2">
              <StarRating rating={lawyer.rating} />
              <span className="text-xs text-gray-500 ml-2">({lawyer.reviewCount} avaliações)</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 h-16 overflow-hidden">{lawyer.bio.substring(0, 120)}...</p>
      </div>
      <div className="p-6 mt-auto bg-gray-50/50">
        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
                <LocationMarkerIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {distance !== undefined 
                    ? `Aprox. ${distance.toFixed(0)} km de distância` 
                    : `${lawyer.location.city}, ${lawyer.location.state}`}
                </span>
            </div>
            <button className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors flex-shrink-0">
                Ver Perfil
            </button>
        </div>
      </div>
    </div>
  );
};