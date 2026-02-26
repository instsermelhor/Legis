import React from 'react';
import type { User } from '../../types';
import { UserCircleIcon, MailIcon, PhoneIcon, LocationMarkerIcon } from '../common/IconComponents';

interface ClientProfileCardProps {
    user: User;
}

export const ClientProfileCard: React.FC<ClientProfileCardProps> = ({ user }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meu Perfil</h2>
            <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                    <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <span>{user.name}</span>
                </div>
                <div className="flex items-center">
                    <MailIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <span>{user.email}</span>
                </div>
                {user.phone && (
                    <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                        <span>{user.phone}</span>
                    </div>
                )}
                {user.address && (
                     <div className="flex items-center">
                        <LocationMarkerIcon className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                        <span>{user.address}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
