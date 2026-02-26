import React from 'react';
// FIX: Corrected import path for local module.
import type { View } from '../../types';
import { BriefcaseIcon } from '../common/IconComponents';

interface FooterProps {
    onNavigate: (view: View) => void;
    onShowTerms: () => void;
    onShowPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onShowTerms, onShowPrivacy }) => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Info */}
                    <div>
                        <div className="flex items-center mb-4">
                            <BriefcaseIcon className="h-8 w-8 text-primary" />
                            <span className="ml-3 text-2xl font-bold">Legis Connect</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Conectando você à justiça. Encontre o advogado certo de forma rápida e segura.
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
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold tracking-wider uppercase">Contato</h3>
                         <ul className="mt-4 space-y-2 text-sm text-gray-400">
                           <li>Email: contato@legisconnect.com</li>
                           <li>Telefone: (11) 4002-8922</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Legis Connect. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};
