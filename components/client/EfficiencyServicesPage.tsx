import React, { useState, useEffect } from 'react';
import { BriefcaseIcon } from '../common/IconComponents';
import { mockEfficiencyServiceGroups, mockEfficiencyServices } from '../../services/mockDataService';
import type { EfficiencyServiceGroup, EfficiencyService } from '../../types';

export const EfficiencyServicesPage: React.FC = () => {
  const [groups, setGroups] = useState<EfficiencyServiceGroup[]>([]);
  const [services, setServices] = useState<EfficiencyService[]>([]);

  // Carregar os serviços do localStorage caso o admin tenha modificado, senão usa os mocks originais
  useEffect(() => {
    const savedGroups = localStorage.getItem('legis_serviceGroups');
    const savedServices = localStorage.getItem('legis_services');
    
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    else setGroups(mockEfficiencyServiceGroups);

    if (savedServices) setServices(JSON.parse(savedServices));
    else setServices(mockEfficiencyServices);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <BriefcaseIcon className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Serviços Administrativos e de Eficiência
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Soluções ágeis e especializadas para otimizar sua rotina jurídica e documental.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {groups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groups.map(group => {
              const groupServices = services.filter(s => s.groupId === group.id);
              if (groupServices.length === 0) return null;

              return (
                <div key={group.id} className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary/20 pb-3 mb-8">
                    {group.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groupServices.map(service => (
                      <div key={service.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">{service.name}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.description}</p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <button className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors">
                            Contratar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
