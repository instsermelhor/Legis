import React from 'react';
import type { View } from '../../types';
import { BriefcaseIcon } from '../common/IconComponents';
import { useAppConfig } from '../../context/AppContext';

interface FooterProps {
    onNavigate: (view: View) => void;
    onShowTerms: () => void;
    onShowPrivacy: () => void;
    onShowEtica: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowTerms, onShowPrivacy, onShowEtica }) => {
    const { config } = useAppConfig();

    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Info */}
                    <div>
                        <div className="flex items-center mb-4">
                            {config.footerLogoUrl ? (
                                <img src={config.footerLogoUrl} alt={config.appName} className="h-8 w-auto object-contain" />
                            ) : (
                                <>
                                    <BriefcaseIcon className="h-8 w-8 text-primary" />
                                    <span className="ml-3 text-2xl font-bold">{config.appName}</span>
                                </>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm">
                            {config.siteTagline}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Links Rápidos</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('search'); }} className="text-gray-400 hover:text-white transition">Encontrar Advogado</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forLawyers'); }} className="text-gray-400 hover:text-white transition">Para Advogados</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="text-gray-400 hover:text-white transition">Login</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }} className="text-gray-400 hover:text-white transition">Cadastro</a></li>
                        </ul>
                    </div>
                    
                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Legal</h3>
                         <ul className="mt-4 space-y-2 text-sm">
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowTerms(); }} className="text-gray-400 hover:text-white transition">Termos de Serviço</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowPrivacy(); }} className="text-gray-400 hover:text-white transition">Política de Privacidade</a></li>
                            <li><a href="#" onClick={(e) => { e.preventDefault(); onShowEtica(); }} className="text-gray-400 hover:text-white transition">Ética OAB</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Contato</h3>
                         <ul className="mt-4 space-y-2 text-sm text-gray-400">
                           {config.contactEmail && <li>Email: {config.contactEmail}</li>}
                           {config.contactPhone && <li>Telefone: {config.contactPhone}</li>}
                           {config.customFields?.map(field => (
                             <li key={field.id}>{field.key}: {field.value}</li>
                           ))}
                           {!config.contactEmail && !config.contactPhone && (!config.customFields || config.customFields.length === 0) && (
                             <li className="italic text-gray-500">Sem informações de contato</li>
                           )}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
                    <p>{config.footerText}</p>
                </div>
            </div>
        </footer>
    );
};
