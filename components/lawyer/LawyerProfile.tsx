import React, { useState } from 'react';
// FIX: Corrected import path for local module.
import type { Lawyer, View } from '../../types';
import { StarRating } from '../common/StarRating';
import { BadgeCheckIcon, BriefcaseIcon, AcademicCapIcon, PhoneIcon, MailIcon, LocationMarkerIcon, ChevronLeftIcon } from '../common/IconComponents';
import { BookingCalendar } from '../common/BookingCalendar';

interface LawyerProfileProps {
  lawyer: Lawyer;
  onBack: () => void;
  onNavigate: (view: View) => void;
}

export const LawyerProfile: React.FC<LawyerProfileProps> = ({ lawyer, onBack, onNavigate }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-primary mb-6">
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Voltar para a busca
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 sticky top-28 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <img className="h-40 w-40 rounded-full object-cover mx-auto ring-4 ring-primary/30" src={lawyer.photoUrl} alt={lawyer.name} />
                <h1 className="text-3xl font-bold text-center mt-4 text-gray-900 flex items-center justify-center">
                  {lawyer.name}
                  <BadgeCheckIcon className="h-7 w-7 text-accent ml-2" />
                </h1>
                <p className="text-center text-gray-500">{lawyer.oab}</p>
                <div className="flex justify-center mt-2">
                  <StarRating rating={lawyer.rating} />
                  <span className="text-sm text-gray-500 ml-2">({lawyer.reviewCount} avaliações)</span>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-600 flex items-center justify-center"><LocationMarkerIcon className="h-5 w-5 mr-2 text-gray-400"/> {lawyer.location.city}, {lawyer.location.state}</p>
                  <p className="text-gray-600 flex items-center justify-center mt-2"><MailIcon className="h-5 w-5 mr-2 text-gray-400"/> {lawyer.contact.email}</p>
                  <p className="text-gray-600 flex items-center justify-center mt-2"><PhoneIcon className="h-5 w-5 mr-2 text-gray-400"/> {lawyer.contact.phone}</p>
                </div>
                <div className="mt-6">
                  {lawyer.consultationFee && (
                      <div className="text-center bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-700">Valor da consulta</p>
                          <p className="text-2xl font-bold text-green-800">R$ {lawyer.consultationFee},00</p>
                      </div>
                  )}
                  <button 
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors shadow-lg hover:shadow-primary/40 transform hover:scale-105"
                  >
                      Agendar Consulta
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Sobre</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">{lawyer.bio}</p>

                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mt-10">Áreas de Atuação</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {lawyer.specialties.map(spec => (
                    <span key={spec} className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">{spec}</span>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Experiência</h2>
                      <div className="mt-4 space-y-3">
                          <p className="text-gray-600 flex items-center"><BriefcaseIcon className="h-5 w-5 mr-3 text-primary"/>{lawyer.experience.years} anos de experiência</p>
                          <p className="text-gray-600 flex items-center"><BriefcaseIcon className="h-5 w-5 mr-3 text-primary"/>Mais de {lawyer.experience.cases} casos atendidos</p>
                      </div>
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Formação</h2>
                      <div className="mt-4 space-y-3">
                          {lawyer.education.map(edu => (
                              <p key={edu} className="text-gray-600 flex items-center"><AcademicCapIcon className="h-5 w-5 mr-3 text-primary"/>{edu}</p>
                          ))}
                      </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mt-10">Avaliações de Clientes</h2>
                <div className="mt-4 space-y-6">
                  {lawyer.reviews.map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="font-semibold text-gray-800">{review.clientName}</p>
                              <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-gray-400">{review.date}</p>
                      </div>
                      <p className="mt-2 text-gray-600 italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isBookingOpen && (
         <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsBookingOpen(false)}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-slide-up dark:text-white dark:bg-[#1A1730] dark:border-[#2A2545] dark:placeholder-gray-500 dark:caret-purple-500"
                onClick={(e) => e.stopPropagation()}
            >
                <BookingCalendar lawyer={lawyer} onClose={() => setIsBookingOpen(false)} onNavigate={onNavigate} />
            </div>
        </div>
      )}
    </>
  );
};
