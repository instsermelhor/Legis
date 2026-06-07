import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns, mockSecretaries } from '../../services/mockDataService';
import type { MockClient, MockIntern, MockSecretary } from '../../services/mockDataService';
import { SearchInput, SectionTitle, IconEdit, IconBriefcase, IconUsers, IconGradCap, lawyerStatusBadge, clientStatusBadge, internStatusBadge } from './AdminShared';
import { ConfirmSaveModal, ConfirmSaveField } from '../common/ConfirmSaveModal';

type RecordType = 'lawyers' | 'clients' | 'interns' | 'secretaries';

// Generic field editor row
const FieldRow: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
  </div>
);

const SelectRow: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

// Password Reset Simulation Button
const ResetPasswordButton: React.FC<{ email: string; name: string }> = ({ email, name }) => {
  const [sent, setSent] = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-orange-800">⚠️ Confirmar Reset de Senha</p>
        <p className="text-xs text-orange-700">
          Será enviado um link de redefinição de senha para o e-mail:<br />
          <strong>{email}</strong> ({name})
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { setSent(true); setConfirm(false); setTimeout(() => setSent(false), 5000); }}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            ✉️ Confirmar Envio
          </button>
          <button onClick={() => setConfirm(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sent && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-semibold">
          ✅ Link de redefinição enviado para {email}
        </div>
      )}
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
      >
        🔑 Resetar Senha (enviar link por e-mail)
      </button>
    </div>
  );
};

// ─── Secretary Status Badge ────────────────────────────────────────────────────
const secretaryStatusBadge = (status: MockSecretary['status']) => {
  const map: Record<MockSecretary['status'], string> = {
    ativo: 'bg-green-100 text-green-700',
    pendente: 'bg-yellow-100 text-yellow-700',
    inativo: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
};

// ─── Lawyer Editor ────────────────────────────────────────────────────────────
const LawyerEditor: React.FC<{ lawyer: Lawyer; onSave: (l: Lawyer) => void; onBack: () => void }> = ({ lawyer, onSave, onBack }) => {
  const [data, setData] = useState({ ...lawyer, adminNotes: (lawyer as any).adminNotes || '' });
  const [showConfirm, setShowConfirm] = useState(false);

  const f = (field: keyof Lawyer) => (v: string) => setData(d => ({ ...d, [field]: v }));

  const buildFields = (): ConfirmSaveField[] => [
    { label: 'Nome', oldValue: lawyer.name, newValue: data.name },
    { label: 'OAB', oldValue: lawyer.oab, newValue: data.oab },
    { label: 'CPF', oldValue: lawyer.cpf || '', newValue: data.cpf || '' },
    { label: 'E-mail', oldValue: lawyer.contact.email, newValue: data.contact.email },
    { label: 'Telefone', oldValue: lawyer.contact.phone, newValue: data.contact.phone },
    { label: 'Cidade', oldValue: lawyer.location.city, newValue: data.location.city },
    { label: 'Estado', oldValue: lawyer.location.state, newValue: data.location.state },
    { label: 'Status', oldValue: lawyer.status, newValue: data.status },
    { label: 'Taxa Consulta', oldValue: String(lawyer.consultationFee || ''), newValue: String(data.consultationFee || '') },
    { label: 'Bio', oldValue: lawyer.bio, newValue: data.bio },
    { label: 'Notas do Admin', oldValue: (lawyer as any).adminNotes || '', newValue: data.adminNotes },
  ];

  const handleConfirmedSave = () => {
    onSave(data as Lawyer);
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl space-y-6">
      <button onClick={onBack} className="text-sm text-primary hover:underline">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><IconEdit /> Editar Advogado</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Nome Completo" value={data.name} onChange={f('name')} />
        <FieldRow label="OAB" value={data.oab} onChange={f('oab')} />
        <FieldRow label="CPF" value={data.cpf || ''} onChange={f('cpf')} />
        <FieldRow label="RG" value={data.rg || ''} onChange={f('rg')} />
        <FieldRow label="E-mail" value={data.contact.email} onChange={v => setData(d => ({ ...d, contact: { ...d.contact, email: v } }))} type="email" />
        <FieldRow label="Telefone" value={data.contact.phone} onChange={v => setData(d => ({ ...d, contact: { ...d.contact, phone: v } }))} />
        <FieldRow label="Cidade" value={data.location.city} onChange={v => setData(d => ({ ...d, location: { ...d.location, city: v } }))} />
        <FieldRow label="Estado (UF)" value={data.location.state} onChange={v => setData(d => ({ ...d, location: { ...d.location, state: v } }))} />
        <FieldRow label="Endereço Residencial" value={data.address || ''} onChange={f('address')} />
        <FieldRow label="Endereço Comercial" value={data.commercialAddress || ''} onChange={f('commercialAddress')} />
        <FieldRow label="Taxa de Consulta (R$)" value={String(data.consultationFee || '')} onChange={v => setData(d => ({ ...d, consultationFee: Number(v) }))} type="number" />
        <SelectRow label="Status" value={data.status} onChange={v => setData(d => ({ ...d, status: v as Lawyer['status'] }))} options={['verificado', 'pendente', 'suspenso']} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bio Profissional</label>
        <textarea value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Admin Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider">📋 Informações Adicionais do Administrador</label>
        <textarea
          value={data.adminNotes}
          onChange={e => setData(d => ({ ...d, adminNotes: e.target.value }))}
          rows={3}
          placeholder="Adicione notas internas, observações administrativas, histórico de ocorrências..."
          className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
        />
      </div>

      {/* Password Reset */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">🔐 Gestão de Acesso</p>
        <ResetPasswordButton email={data.contact.email} name={data.name} />
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        Revisar e Salvar Alterações
      </button>

      {showConfirm && (
        <ConfirmSaveModal
          title="Editar Cadastro de Advogado"
          userName={data.name}
          userEmail={data.contact.email}
          fields={buildFields()}
          onConfirm={handleConfirmedSave}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

// ─── Client Editor ────────────────────────────────────────────────────────────
const ClientEditor: React.FC<{ client: MockClient; onSave: (c: MockClient) => void; onBack: () => void }> = ({ client, onSave, onBack }) => {
  const [data, setData] = useState({ ...client, adminNotes: (client as any).adminNotes || '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const f = (field: keyof MockClient) => (v: string) => setData(d => ({ ...d, [field]: v }));

  const buildFields = (): ConfirmSaveField[] => [
    { label: 'Nome', oldValue: client.name, newValue: data.name },
    { label: 'CPF', oldValue: client.cpf, newValue: data.cpf },
    { label: 'E-mail', oldValue: client.email, newValue: data.email },
    { label: 'Telefone', oldValue: client.phone, newValue: data.phone },
    { label: 'Endereço', oldValue: client.address, newValue: data.address },
    { label: 'Cidade', oldValue: client.city, newValue: data.city },
    { label: 'Estado', oldValue: client.state, newValue: data.state },
    { label: 'Status', oldValue: client.status, newValue: data.status },
    { label: 'Área do Caso', oldValue: client.lastCaseArea || '', newValue: data.lastCaseArea || '' },
    { label: 'Notas Admin', oldValue: (client as any).adminNotes || '', newValue: data.adminNotes },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl space-y-6">
      <button onClick={onBack} className="text-sm text-primary hover:underline">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><IconEdit /> Editar Cliente</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Nome Completo" value={data.name} onChange={f('name')} />
        <FieldRow label="CPF" value={data.cpf} onChange={f('cpf')} />
        <FieldRow label="E-mail" value={data.email} onChange={f('email')} type="email" />
        <FieldRow label="Telefone" value={data.phone} onChange={f('phone')} />
        <FieldRow label="Endereço" value={data.address} onChange={f('address')} />
        <FieldRow label="Cidade" value={data.city} onChange={f('city')} />
        <FieldRow label="Estado (UF)" value={data.state} onChange={f('state')} />
        <FieldRow label="Área do Caso" value={data.lastCaseArea} onChange={f('lastCaseArea')} />
        <SelectRow label="Status" value={data.status} onChange={v => setData(d => ({ ...d, status: v as MockClient['status'] }))} options={['ativo', 'inativo']} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observações do Cadastro</label>
        <textarea value={data.notes || ''} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Admin Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider">📋 Informações Adicionais do Administrador</label>
        <textarea
          value={data.adminNotes}
          onChange={e => setData(d => ({ ...d, adminNotes: e.target.value }))}
          rows={3}
          placeholder="Adicione notas internas, observações administrativas, histórico..."
          className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
        />
      </div>

      {/* Password Reset */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">🔐 Gestão de Acesso</p>
        <ResetPasswordButton email={data.email} name={data.name} />
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        Revisar e Salvar Alterações
      </button>

      {showConfirm && (
        <ConfirmSaveModal
          title="Editar Cadastro de Cliente"
          userName={data.name}
          userEmail={data.email}
          fields={buildFields()}
          onConfirm={() => { onSave(data as MockClient); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

// ─── Intern Editor ────────────────────────────────────────────────────────────
const InternEditor: React.FC<{ intern: MockIntern; onSave: (i: MockIntern) => void; onBack: () => void }> = ({ intern, onSave, onBack }) => {
  const [data, setData] = useState({ ...intern, adminNotes: (intern as any).adminNotes || '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const f = (field: keyof MockIntern) => (v: string) => setData(d => ({ ...d, [field]: v }));

  const buildFields = (): ConfirmSaveField[] => [
    { label: 'Nome', oldValue: intern.name, newValue: data.name },
    { label: 'CPF', oldValue: intern.cpf || '', newValue: data.cpf || '' },
    { label: 'E-mail', oldValue: intern.email, newValue: data.email },
    { label: 'Telefone', oldValue: intern.phone, newValue: data.phone },
    { label: 'Universidade', oldValue: intern.university, newValue: data.university },
    { label: 'Semestre', oldValue: intern.semester, newValue: data.semester },
    { label: 'Interesse', oldValue: intern.specialtyInterest, newValue: data.specialtyInterest },
    { label: 'Cidade', oldValue: intern.city, newValue: data.city },
    { label: 'Estado', oldValue: intern.state, newValue: data.state },
    { label: 'Status', oldValue: intern.status, newValue: data.status },
    { label: 'Bolsa (R$)', oldValue: String(intern.stipend || ''), newValue: String(data.stipend || '') },
    { label: 'Notas Admin', oldValue: (intern as any).adminNotes || '', newValue: data.adminNotes },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl space-y-6">
      <button onClick={onBack} className="text-sm text-primary hover:underline">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><IconEdit /> Editar Estudante</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Nome Completo" value={data.name} onChange={f('name')} />
        <FieldRow label="CPF" value={data.cpf || ''} onChange={f('cpf')} />
        <FieldRow label="E-mail" value={data.email} onChange={f('email')} type="email" />
        <FieldRow label="Telefone" value={data.phone} onChange={f('phone')} />
        <FieldRow label="Universidade" value={data.university} onChange={f('university')} />
        <FieldRow label="Semestre" value={data.semester} onChange={f('semester')} />
        <FieldRow label="Área de Interesse" value={data.specialtyInterest} onChange={f('specialtyInterest')} />
        <FieldRow label="Cidade" value={data.city} onChange={f('city')} />
        <FieldRow label="Estado (UF)" value={data.state} onChange={f('state')} />
        <FieldRow label="Bolsa Mensal (R$)" value={String(data.stipend || '')} onChange={v => setData(d => ({ ...d, stipend: Number(v) }))} type="number" />
        <SelectRow label="Status" value={data.status} onChange={v => setData(d => ({ ...d, status: v as MockIntern['status'] }))} options={['ativo', 'pendente', 'inativo']} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observações do Cadastro</label>
        <textarea value={data.notes || ''} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Admin Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider">📋 Informações Adicionais do Administrador</label>
        <textarea
          value={data.adminNotes}
          onChange={e => setData(d => ({ ...d, adminNotes: e.target.value }))}
          rows={3}
          placeholder="Adicione notas internas, histórico de estágio, ocorrências, recomendações..."
          className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
        />
      </div>

      {/* Password Reset */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">🔐 Gestão de Acesso</p>
        <ResetPasswordButton email={data.email} name={data.name} />
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        Revisar e Salvar Alterações
      </button>

      {showConfirm && (
        <ConfirmSaveModal
          title="Editar Cadastro de Estudante"
          userName={data.name}
          userEmail={data.email}
          fields={buildFields()}
          onConfirm={() => { onSave(data as MockIntern); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

// ─── Secretary Editor ─────────────────────────────────────────────────────────
const SecretaryEditor: React.FC<{ secretary: MockSecretary; onSave: (s: MockSecretary) => void; onBack: () => void }> = ({ secretary, onSave, onBack }) => {
  const [data, setData] = useState({ ...secretary, adminNotes: (secretary as any).adminNotes || '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const f = (field: keyof MockSecretary) => (v: string) => setData(d => ({ ...d, [field]: v }));

  const buildFields = (): ConfirmSaveField[] => [
    { label: 'Nome', oldValue: secretary.name, newValue: data.name },
    { label: 'CPF', oldValue: secretary.cpf || '', newValue: data.cpf || '' },
    { label: 'E-mail', oldValue: secretary.email, newValue: data.email },
    { label: 'Telefone', oldValue: secretary.phone, newValue: data.phone },
    { label: 'Cidade', oldValue: secretary.city, newValue: data.city },
    { label: 'Estado', oldValue: secretary.state, newValue: data.state },
    { label: 'Endereço', oldValue: secretary.address || '', newValue: data.address || '' },
    { label: 'Experiência (anos)', oldValue: String(secretary.experience), newValue: String(data.experience) },
    { label: 'Disponibilidade', oldValue: secretary.availability, newValue: data.availability },
    { label: 'Status', oldValue: secretary.status, newValue: data.status },
    { label: 'Notas Admin', oldValue: (secretary as any).adminNotes || '', newValue: data.adminNotes },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl space-y-6">
      <button onClick={onBack} className="text-sm text-primary hover:underline">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <IconEdit /> Editar Secretário(a)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Nome Completo" value={data.name} onChange={f('name')} />
        <FieldRow label="CPF" value={data.cpf || ''} onChange={f('cpf')} />
        <FieldRow label="E-mail" value={data.email} onChange={f('email')} type="email" />
        <FieldRow label="Telefone" value={data.phone} onChange={f('phone')} />
        <FieldRow label="Cidade" value={data.city} onChange={f('city')} />
        <FieldRow label="Estado (UF)" value={data.state} onChange={f('state')} />
        <FieldRow
          label="Experiência (anos)"
          value={String(data.experience)}
          onChange={v => setData(d => ({ ...d, experience: Number(v) }))}
          type="number"
        />
        <SelectRow
          label="Disponibilidade"
          value={data.availability}
          onChange={v => setData(d => ({ ...d, availability: v as MockSecretary['availability'] }))}
          options={['integral', 'meio-periodo', 'freelancer']}
        />
        <SelectRow
          label="Status"
          value={data.status}
          onChange={v => setData(d => ({ ...d, status: v as MockSecretary['status'] }))}
          options={['ativo', 'pendente', 'inativo']}
        />
        <div className="sm:col-span-2">
          <FieldRow label="Endereço Completo" value={data.address || ''} onChange={f('address')} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Áreas de Conhecimento</label>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[40px]">
          {data.areasOfKnowledge.length > 0 ? data.areasOfKnowledge.map(a => (
            <span key={a} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">{a}</span>
          )) : <span className="text-xs text-gray-400">Nenhuma área cadastrada</span>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bio / Apresentação</label>
        <textarea
          value={data.bio || ''}
          onChange={e => setData(d => ({ ...d, bio: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Admin Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider">📋 Informações Adicionais do Administrador</label>
        <textarea
          value={data.adminNotes}
          onChange={e => setData(d => ({ ...d, adminNotes: e.target.value }))}
          rows={3}
          placeholder="Notas internas sobre o secretário(a), histórico de vinculações, ocorrências..."
          className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
        />
      </div>

      {/* Password Reset */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">🔐 Gestão de Acesso</p>
        <ResetPasswordButton email={data.email} name={data.name} />
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        Revisar e Salvar Alterações
      </button>

      {showConfirm && (
        <ConfirmSaveModal
          title="Editar Cadastro de Secretário(a)"
          userName={data.name}
          userEmail={data.email}
          fields={buildFields()}
          onConfirm={() => { onSave(data as MockSecretary); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

// ─── Icon Secretariado ─────────────────────────────────────────────────────────
const IconSecretariat = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// ─── Main RegistrationsTab ────────────────────────────────────────────────────
export const RegistrationsTab: React.FC<{
  lawyers: Lawyer[];
  onLawyerUpdate: (l: Lawyer) => void;
}> = ({ lawyers, onLawyerUpdate }) => {
  const [recordType, setRecordType] = useState<RecordType>('lawyers');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ type: RecordType; id: number } | null>(null);
  const [clients, setClients] = useState(mockClients);
  const [interns, setInterns] = useState(mockInterns);
  const [secretaries, setSecretaries] = useState(mockSecretaries);

  const filteredLawyers = useMemo(() => lawyers.filter(l => l.name.toLowerCase().includes(search.toLowerCase())), [lawyers, search]);
  const filteredClients = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const filteredInterns = useMemo(() => interns.filter(i => i.name.toLowerCase().includes(search.toLowerCase())), [interns, search]);
  const filteredSecretaries = useMemo(() => secretaries.filter(s => s.name.toLowerCase().includes(search.toLowerCase())), [secretaries, search]);

  if (editing) {
    if (editing.type === 'lawyers') {
      const l = lawyers.find(x => x.id === editing.id)!;
      return <LawyerEditor lawyer={l} onSave={updated => { onLawyerUpdate(updated); setEditing(null); }} onBack={() => setEditing(null)} />;
    }
    if (editing.type === 'clients') {
      const c = clients.find(x => x.id === editing.id)!;
      return <ClientEditor client={c} onSave={updated => { setClients(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditing(null); }} onBack={() => setEditing(null)} />;
    }
    if (editing.type === 'interns') {
      const i = interns.find(x => x.id === editing.id)!;
      return <InternEditor intern={i} onSave={updated => { setInterns(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditing(null); }} onBack={() => setEditing(null)} />;
    }
    if (editing.type === 'secretaries') {
      const s = secretaries.find(x => x.id === editing.id)!;
      return <SecretaryEditor secretary={s} onSave={updated => { setSecretaries(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditing(null); }} onBack={() => setEditing(null)} />;
    }
  }

  const tabs: [RecordType, string, React.ReactNode][] = [
    ['lawyers', 'Advogados', <IconBriefcase />],
    ['clients', 'Clientes', <IconUsers />],
    ['interns', 'Estudantes', <IconGradCap />],
    ['secretaries', 'Secretariado', <IconSecretariat />],
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Gestão de Cadastros" subtitle="Edite, atualize e gerencie qualquer cadastro da plataforma" />

      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(([t, label, icon]) => (
          <button
            key={t}
            onClick={() => { setRecordType(t); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              recordType === t
                ? t === 'secretaries' ? 'bg-purple-600 text-white border-purple-600' : 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
            }`}
          >
            <span className="w-4 h-4">{icon}</span>{label}
          </button>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." />

      {/* Lawyers list */}
      {recordType === 'lawyers' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr><th className="px-5 py-3">Advogado</th><th className="px-5 py-3">OAB</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
            </thead>
            <tbody>
              {filteredLawyers.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2"><img src={l.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />{l.name}</td>
                  <td className="px-5 py-3">{l.oab}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{l.contact.email}</td>
                  <td className="px-5 py-3">{lawyerStatusBadge(l.status)}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => setEditing({ type: 'lawyers', id: l.id })} className="flex items-center gap-1 text-primary text-xs font-medium hover:underline mx-auto"><IconEdit /> Editar</button></td>
                </tr>
              ))}
              {filteredLawyers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Clients list */}
      {recordType === 'clients' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Cidade/UF</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
            </thead>
            <tbody>
              {filteredClients.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-xs">{c.email}</td>
                  <td className="px-5 py-3">{c.city}/{c.state}</td>
                  <td className="px-5 py-3">{clientStatusBadge(c.status)}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => setEditing({ type: 'clients', id: c.id })} className="flex items-center gap-1 text-primary text-xs font-medium hover:underline mx-auto"><IconEdit /> Editar</button></td>
                </tr>
              ))}
              {filteredClients.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Interns list */}
      {recordType === 'interns' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">Universidade</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
            </thead>
            <tbody>
              {filteredInterns.map(i => (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{i.name}</td>
                  <td className="px-5 py-3 text-xs">{i.university}</td>
                  <td className="px-5 py-3 text-xs">{i.email}</td>
                  <td className="px-5 py-3">{internStatusBadge(i.status)}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => setEditing({ type: 'interns', id: i.id })} className="flex items-center gap-1 text-primary text-xs font-medium hover:underline mx-auto"><IconEdit /> Editar</button></td>
                </tr>
              ))}
              {filteredInterns.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Secretaries list */}
      {recordType === 'secretaries' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <div className="px-5 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
            <span className="text-purple-700">🗂️</span>
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Gestão de Secretariado — {secretaries.length} cadastro(s)</span>
          </div>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Cidade/UF</th>
                <th className="px-5 py-3">Experiência</th>
                <th className="px-5 py-3">Disponibilidade</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredSecretaries.map(s => {
                const availLabel = s.availability === 'integral' ? 'Integral' : s.availability === 'meio-periodo' ? 'Meio Período' : 'Freelancer';
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{s.email}</td>
                    <td className="px-5 py-3">{s.city}/{s.state}</td>
                    <td className="px-5 py-3">{s.experience} anos</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.availability === 'integral' ? 'bg-blue-50 text-blue-700' :
                        s.availability === 'meio-periodo' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {availLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3">{secretaryStatusBadge(s.status)}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setEditing({ type: 'secretaries', id: s.id })}
                        className="flex items-center gap-1 text-purple-600 text-xs font-medium hover:underline mx-auto"
                      >
                        <IconEdit /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSecretaries.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
