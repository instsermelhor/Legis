import React from 'react';
import { CaseDescriptionForm } from './CaseDescriptionForm';
// FIX: Corrected import path for local module.
import type { Lawyer, MapsSearchResult } from '../../types';

interface LandingPageProps {
  onSearch: (results: Lawyer[], mapsData: MapsSearchResult | null) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSearch }) => {
  return (
    <>
      <div className="relative bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 sm:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                  <span className="block">A solução para seus</span>
                  <span className="block text-primary">problemas jurídicos.</span>
                </h1>
                <div className="mt-6 text-gray-600 max-w-lg space-y-4 text-base sm:text-lg">
                  <p>
                    A <strong>Legis Connect</strong> nasce da intersecção entre a solidez do Direito e a agilidade da tecnologia. Somos uma plataforma dedicada a modernizar o ecossistema jurídico, estabelecendo conexões seguras e eficientes entre Operadores do Direito, Profissionais, Empresas e a Sociedade.
                  </p>
                  <p>
                    Acreditamos que a excelência jurídica exige mais do que conhecimento técnico; exige ferramentas que garantam precisão e transparência. Por isso, nosso compromisso é oferecer um ambiente de alta performance, onde a integridade da informação e o respeito à ética profissional são os pilares de cada funcionalidade. Na <strong>Legis Connect</strong>, conectamos o presente do Direito ao futuro das soluções jurídicas.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <CaseDescriptionForm onSearch={onSearch} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="bg-neutral-light py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Como funciona</h2>
          <p className="text-center mt-4 text-gray-600">Encontre o advogado certo em 3 passos simples.</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Descreva seu Caso</h3>
              <p className="mt-2 text-base text-gray-500">Forneça detalhes sobre sua necessidade jurídica de forma segura e confidencial.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Receba Sugestões</h3>
              <p className="mt-2 text-base text-gray-500">Nossa IA analisa seu caso e sugere os advogados mais compatíveis.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Conecte-se</h3>
              <p className="mt-2 text-base text-gray-500">Converse, agende consultas e contrate o advogado ideal diretamente na plataforma.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
