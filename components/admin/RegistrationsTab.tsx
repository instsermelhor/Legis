import React, { useState, useMemo } from 'react';
import type { Lawyer } from '../../types';
import { mockClients, mockInterns } from '../../services/mockDataService';
import type { MockClient, MockIntern } from '../../services/mockDataService';
import { SearchInput, SectionTitle, IconEdit, IconBriefcase, IconUsers, IconGradCap, lawyerStatusBadge, clientStatusBadge, internStatusBadge } from './AdminShared';

type RecordType = 'lawyers' | 'clients' | 'interns';

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
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

// ─── Lawyer Editor ────────────────────────────────────────────────────────────
const LawyerEditor: React.FC<{ lawyer: Lawyer; onSave: (l: Lawyer) => void; onBack: () => void }> = ({ lawyer, onSave, onBack }) => {
  const [data, setData] = useState({ ...lawyer });
  const [saved, setSaved] = useState(false);

  const f = (field: keyof Lawyer) => (v: string) => setData(d => ({ ...d, [field]: v }));
  const handleSave = () => { onSave(data); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <button onClick={onBack} className="text-sm text-primary hover:underline mb-5">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><IconEdit /> Editar Advogado</h2>
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
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bio</label>
        <textarea value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <button onClick={handleSave} className="mt-4 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
        {saved ? '✓ Salvo!' : 'Salvar Alterações'}
      </button>
    </div>
  );
};

// ─── Client Editor ────────────────────────────────────────────────────────────
const ClientEditor: React.FC<{ client: MockClient; onSave: (c: MockClient) => void; onBack: () => void }> = ({ client, onSave, onBack }) => {
  const [data, setData] = useState({ ...client });
  const [saved, setSaved] = useState(false);
  const f = (field: keyof MockClient) => (v: string) => setData(d => ({ ...d, [field]: v }));
  const handleSave = () => { onSave(data); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <button onClick={onBack} className="text-sm text-primary hover:underline mb-5">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><IconEdit /> Editar Cliente</h2>
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
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observações</label>
        <textarea value={data.notes || ''} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <button onClick={handleSave} className="mt-4 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
        {saved ? '✓ Salvo!' : 'Salvar Alterações'}
      </button>
    </div>
  );
};

// ─── Intern Editor ────────────────────────────────────────────────────────────
const InternEditor: React.FC<{ intern: MockIntern; onSave: (i: MockIntern) => void; onBack: () => void }> = ({ intern, onSave, onBack }) => {
  const [data, setData] = useState({ ...intern });
  const [saved, setSaved] = useState(false);
  const f = (field: keyof MockIntern) => (v: string) => setData(d => ({ ...d, [field]: v }));
  const handleSave = () => { onSave(data); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <button onClick={onBack} className="text-sm text-primary hover:underline mb-5">← Voltar</button>
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><IconEdit /> Editar Estudante</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Nome Completo" value={data.name} onChange={f('name')} />
        <FieldRow label="CPF" value={data.cpf || ''} onChange={f('cpf')} />
        <FieldRow label="E-mail" value={data.email} onChange={f('email')} type="email" />
        <FieldRow label="Telefone" value={data.phone} onChange={f('phone')} />
        <FieldRow label="Universidade" value={data.university} onChange={f('university')} />
        <FieldRow label="Semestre" value={data.semester} onChange={f('semester')} />
        <FieldRow label="Interesse" value={data.specialtyInterest} onChange={f('specialtyInterest')} />
        <FieldRow label="Cidade" value={data.city} onChange={f('city')} />
        <FieldRow label="Estado (UF)" value={data.state} onChange={f('state')} />
        <FieldRow label="Bolsa Mensal (R$)" value={String(data.stipend || '')} onChange={v => setData(d => ({ ...d, stipend: Number(v) }))} type="number" />
        <SelectRow label="Status" value={data.status} onChange={v => setData(d => ({ ...d, status: v as MockIntern['status'] }))} options={['ativo', 'pendente', 'inativo']} />
      </div>
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observações</label>
        <textarea value={data.notes || ''} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <button onClick={handleSave} className="mt-4 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
        {saved ? '✓ Salvo!' : 'Salvar Alterações'}
      </button>
    </div>
  );
};

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

  const filteredLawyers = useMemo(() => lawyers.filter(l => l.name.toLowerCase().includes(search.toLowerCase())), [lawyers, search]);
  const filteredClients = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const filteredInterns = useMemo(() => interns.filter(i => i.name.toLowerCase().includes(search.toLowerCase())), [interns, search]);

  if (editing) {
    if (editing.type === 'lawyers') {
      const l = lawyers.find(x => x.id === editing.id)!;
      return <LawyerEditor lawyer={l} onSave={onLawyerUpdate} onBack={() => setEditing(null)} />;
    }
    if (editing.type === 'clients') {
      const c = clients.find(x => x.id === editing.id)!;
      return <ClientEditor client={c} onSave={updated => setClients(prev => prev.map(x => x.id === updated.id ? updated : x))} onBack={() => setEditing(null)} />;
    }
    const i = interns.find(x => x.id === editing.id)!;
    return <InternEditor intern={i} onSave={updated => setInterns(prev => prev.map(x => x.id === updated.id ? updated : x))} onBack={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Gestão de Cadastros" subtitle="Edite e atualize qualquer cadastro da plataforma" />

      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {([['lawyers', 'Advogados', <IconBriefcase />], ['clients', 'Clientes', <IconUsers />], ['interns', 'Estudantes', <IconGradCap />]] as [RecordType, string, React.ReactNode][]).map(([t, label, icon]) => (
          <button key={t} onClick={() => { setRecordType(t); setSearch(''); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${recordType === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'}`}>
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
              <tr><th className="px-5 py-3">Advogado</th><th className="px-5 py-3">OAB</th><th className="px-5 py-3">Especialidades</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
            </thead>
            <tbody>
              {filteredLawyers.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2"><img src={l.photoUrl} className="w-8 h-8 rounded-full object-cover" alt="" />{l.name}</td>
                  <td className="px-5 py-3">{l.oab}</td>
                  <td className="px-5 py-3 max-w-xs truncate text-xs">{l.specialties.join(', ')}</td>
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
                  <td className="px-5 py-3">{c.email}</td>
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
              <tr><th className="px-5 py-3">Nome</th><th className="px-5 py-3">Universidade</th><th className="px-5 py-3">Cidade/UF</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Ação</th></tr>
            </thead>
            <tbody>
              {filteredInterns.map(i => (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{i.name}</td>
                  <td className="px-5 py-3">{i.university}</td>
                  <td className="px-5 py-3">{i.city}/{i.state}</td>
                  <td className="px-5 py-3">{internStatusBadge(i.status)}</td>
                  <td className="px-5 py-3 text-center"><button onClick={() => setEditing({ type: 'interns', id: i.id })} className="flex items-center gap-1 text-primary text-xs font-medium hover:underline mx-auto"><IconEdit /> Editar</button></td>
                </tr>
              ))}
              {filteredInterns.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum resultado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
