import React, { useState } from 'react';
import type { Secretary } from '../../types';
import type { Lawyer } from '../../types';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { ChangeEmailModal } from '../common/ChangeEmailModal';
import { LawyerInfoPopup } from '../common/LawyerInfoPopup';
import { mockLawyers } from '../../services/mockLawyerService';

interface SecretariadoDashboardProps {
  secretary: Secretary;
  userEmail?: string;
  onUpdateSecretary?: (updates: Partial<Secretary>) => void;
  onUpdateEmail?: (newEmail: string) => void;
}

type ActiveTab = 'overview' | 'perfil' | 'agenda' | 'documentos';

const AREAS_CONHECIMENTO = [
  'Atendimento ao Cliente',
  'Gestão de Agenda',
  'Protocolo Judicial',
  'Organização Documental',
  'Redação Jurídica',
  'Diários Oficiais',
  'Controle Financeiro',
  'Triagem de Clientes',
  'Gestão de Escritório',
  'Suporte Administrativo',
  'PJe / e-SAJ',
  'Arquivo e Digitalização',
];

export const SecretariadoDashboard: React.FC<SecretariadoDashboardProps> = ({
  secretary, userEmail, onUpdateSecretary, onUpdateEmail
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLawyerPopup, setShowLawyerPopup] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    name: secretary.name || '',
    phone: secretary.phone || '',
    city: secretary.city || '',
    state: secretary.state || '',
    address: secretary.address || '',
    experience: String(secretary.experience || 0),
    availability: secretary.availability || 'integral',
    bio: secretary.bio || '',
    areasOfKnowledge: secretary.areasOfKnowledge || [],
  });

  // Find assigned lawyer (if any)
  const assignedLawyer = secretary.assignedLawyerId
    ? mockLawyers.find(l => l.id === secretary.assignedLawyerId) || null
    : null;

  const handleSaveProfile = () => {
    if (onUpdateSecretary) {
      onUpdateSecretary({
        ...profile,
        experience: Number(profile.experience),
      });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const toggleArea = (area: string) => {
    setProfile(p => ({
      ...p,
      areasOfKnowledge: p.areasOfKnowledge.includes(area)
        ? p.areasOfKnowledge.filter(a => a !== area)
        : [...p.areasOfKnowledge, area],
    }));
  };

  const tabBtn = (id: ActiveTab, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === id
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-neutral-light p-6 sm:p-8 rounded-xl shadow-sm">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-bold shrink-0">
            {secretary.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Painel do Secretariado</h1>
            <p className="text-gray-600">Bem-vindo(a), {secretary.name}!</p>
            {assignedLawyer && (
              <button
                onClick={() => setShowLawyerPopup(true)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full hover:bg-green-100 transition-colors"
              >
                🎉 Vinculado: {assignedLawyer.name} — Ver informações
              </button>
            )}
          </div>
        </div>

        {/* Notification Banner if newly selected */}
        {assignedLawyer && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-sm">Você foi selecionado por um advogado!</p>
                <p className="text-xs text-white/85">Dr(a). {assignedLawyer.name} — OAB {assignedLawyer.oab}</p>
              </div>
            </div>
            <button onClick={() => setShowLawyerPopup(true)} className="shrink-0 px-4 py-2 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors">
              Ver Detalhes
            </button>
          </div>
        )}

        {/* Tab Nav */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex flex-wrap gap-2 sm:space-x-4">
            {tabBtn('overview', '📊 Visão Geral')}
            {tabBtn('perfil', '👤 Meu Perfil')}
            {tabBtn('agenda', '📅 Agenda')}
            {tabBtn('documentos', '📂 Documentos')}
          </nav>
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon="⭐" label="Experiência" value={`${secretary.experience} anos`} color="purple" />
              <StatCard icon="📋" label="Disponibilidade" value={secretary.availability === 'integral' ? 'Tempo Integral' : secretary.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer'} color="blue" />
              <StatCard icon="🏙️" label="Localização" value={`${secretary.city}/${secretary.state}`} color="green" />
            </div>

            {/* Areas of Knowledge */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">🎯 Áreas de Conhecimento</h3>
              <div className="flex flex-wrap gap-2">
                {secretary.areasOfKnowledge.map(area => (
                  <span key={area} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                    {area}
                  </span>
                ))}
                {secretary.areasOfKnowledge.length === 0 && (
                  <p className="text-sm text-gray-400">Nenhuma área cadastrada. Edite seu perfil.</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {secretary.bio && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-2">📝 Apresentação Profissional</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{secretary.bio}</p>
              </div>
            )}

            {/* No lawyer assigned info */}
            {!assignedLawyer && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">⏳</p>
                <h4 className="font-bold text-blue-900 text-sm">Aguardando vinculação</h4>
                <p className="text-xs text-blue-700 mt-1">Seu perfil está disponível para advogados que buscam secretariado. Assim que você for selecionado, as informações do profissional aparecerão aqui.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── PERFIL ─── */}
        {activeTab === 'perfil' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Dados Pessoais e Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome Completo</label>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone</label>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cidade</label>
                  <input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado (UF)</label>
                  <input value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} maxLength={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Experiência (anos)</label>
                  <input type="number" min="0" value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Disponibilidade</label>
                  <select value={profile.availability} onChange={e => setProfile(p => ({ ...p, availability: e.target.value as Secretary['availability'] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                    <option value="integral">Tempo Integral</option>
                    <option value="meio-periodo">Meio Período</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Endereço</label>
                  <input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Rua, Número, Bairro, CEP" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Apresentação / Bio</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Descreva sua experiência e diferenciais..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>

            {/* Areas of Knowledge checkboxes */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">🎯 Áreas de Conhecimento</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AREAS_CONHECIMENTO.map(area => {
                  const selected = profile.areasOfKnowledge.includes(area);
                  return (
                    <label key={area} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${selected ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200'}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleArea(area)} className="rounded" />
                      {area}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800">🔐 Segurança de Acesso</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">🔑 Alterar Senha</button>
                <button onClick={() => setShowEmailModal(true)} className="px-4 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">📧 Alterar E-mail</button>
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">E-mail atual: <strong>{userEmail || secretary.email}</strong></p>
            </div>

            <button onClick={handleSaveProfile} className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-md transition-colors">
              {profileSaved ? '✓ Perfil Salvo!' : 'Salvar Alterações'}
            </button>
          </div>
        )}

        {/* ─── AGENDA ─── */}
        {activeTab === 'agenda' && (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-10 text-center animate-fade-in">
            <p className="text-3xl mb-2">📅</p>
            <h3 className="text-lg font-bold text-gray-700">Agenda em construção</h3>
            <p className="text-sm text-gray-500 mt-1">Aqui você poderá visualizar compromissos agendados pelo advogado vinculado.</p>
          </div>
        )}

        {/* ─── DOCUMENTOS ─── */}
        {activeTab === 'documentos' && (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-10 text-center animate-fade-in">
            <p className="text-3xl mb-2">📂</p>
            <h3 className="text-lg font-bold text-gray-700">Documentos</h3>
            <p className="text-sm text-gray-500 mt-1">Gerencie documentos e arquivos compartilhados pelo advogado.</p>
          </div>
        )}
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} onSave={(cur) => cur.length >= 4} />}
      {showEmailModal && (
        <ChangeEmailModal
          currentEmail={userEmail || secretary.email}
          onClose={() => setShowEmailModal(false)}
          onSave={(pwd, newEmail) => { if (pwd.length < 4) return false; if (onUpdateEmail) onUpdateEmail(newEmail); return true; }}
        />
      )}
      {showLawyerPopup && assignedLawyer && (
        <LawyerInfoPopup
          lawyer={assignedLawyer}
          message="Você foi selecionado como secretário(a) deste advogado!"
          onClose={() => setShowLawyerPopup(false)}
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
  };
  return (
    <div className={`${colors[color] || colors.purple} border rounded-xl p-4 text-center`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-bold text-sm mt-0.5">{value}</p>
    </div>
  );
};
