import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Key, Shield, Search, Check, X, Award } from 'lucide-react';
import { User } from '../types';
import { formatCpf, cleanCpf, generateShortLogin, formatPhone, generateSecurePassword } from '../utils/helpers';
import Modal from './Modal';

const SYSTEM_MENU_PERMISSIONS = [
  { key: 'canAccessDashboard', label: 'Recepção do Dia (Dashboard)' },
  { key: 'canAccessPatients', label: 'Cadastro de Pacientes' },
  { key: 'canAccessWaitingList', label: 'Lista de Espera' },
  { key: 'canAccessAppointments', label: 'Agenda Geral (Todos os Profissionais)' },
  { key: 'canAccessMyAgenda', label: 'Agenda Individual (Apenas a Própria Agenda)' },
  { key: 'canAccessAnamnesis', label: 'Anamneses & Avaliações' },
  { key: 'canAccessGoalsPTI', label: 'Plano Terapêutico (PTI)' },
  { key: 'canAccessSoap', label: 'Evoluções (SOAP)' },
  { key: 'canAccessHistory', label: 'Histórico Clínico Unificado' },
  { key: 'canAccessFinancial', label: 'Financeiro & Repasses' },
  { key: 'canAccessTelehealth', label: 'Teleconsulta' },
  { key: 'canAccessWhatsapp', label: 'Notificações WhatsApp' },
  { key: 'canAccessHelpdesk', label: 'Suporte & Ajuda' },
  { key: 'canAccessTheme', label: 'Personalização do Sistema' }
];

const PRESET_SPECIALTIES = [
  'Psicologia',
  'Neuropsicologia',
  'Fonoaudiologia',
  'Psicopedagogia',
  'Terapia Ocupacional',
  'Psicomotricidade',
  'Nutrição Clínica',
  'Psiquiatria',
  'Fisioterapia',
  'Musicoterapia',
  'Terapia de Casal & Família',
  'Sexologia Clínica'
];

const PRESET_OPERATIONAL_ROLES = [
  'Recepcionista',
  'Secretária(o)',
  'Atendente de Recepção',
  'Auxiliar Administrativo',
  'Coordenador(a) Operacional',
  'Analista Financeiro & Faturamento',
  'Gestor(a) de Atendimento'
];

interface StaffProps {
  professionals: User[];
  clinicId: string;
  clinicName?: string;
  onSaveProfessional: (user: User) => void;
  onDeleteProfessional: (userId: string) => void;
  onResetPassword: (userId: string, newPassword: string) => void;
}

export default function Staff({
  professionals,
  clinicId,
  clinicName,
  onSaveProfessional,
  onDeleteProfessional,
  onResetPassword
}: StaffProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');

  // Modais de Confirmação de Reset de Senha para Mudar123
  const [staffToReset, setStaffToReset] = useState<User | null>(null);
  const [resetSuccessStaff, setResetSuccessStaff] = useState<{ name: string; cpf: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phone: '',
    cpf: '',
    cargo: 'Psicólogo(a)',
    role: 'Psicologia',
    specialties: ['Psicologia'] as string[],
    group: 'corpo_clinico' as User['group'],
    registryNumber: '',
    cep: '',
    address: '',
    addressNumber: '',
    email: '',
    password: 'Mudar123',
    permissions: SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setCustomSpecialtyInput('');
    setFormData({
      name: '',
      birthDate: '',
      phone: '',
      cpf: '',
      cargo: 'Psicólogo(a)',
      role: 'Psicologia',
      specialties: ['Psicologia'],
      group: 'corpo_clinico',
      registryNumber: '',
      cep: '',
      address: '',
      addressNumber: '',
      email: '',
      password: 'Mudar123',
      permissions: SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prof: User) => {
    setEditingId(prof.id);
    setCustomSpecialtyInput('');
    
    // Resolve existing specialties (array, single specialty, or role)
    const existingSpecialties = Array.isArray(prof.specialties) && prof.specialties.length > 0
      ? prof.specialties
      : prof.specialty
      ? [prof.specialty]
      : prof.role
      ? [prof.role]
      : ['Psicologia'];

    const existingCargo = prof.cargo || (prof.group === 'operacional' ? (prof.role || 'Recepcionista') : (existingSpecialties.join(', ') || 'Profissional Clínico'));

    setFormData({
      name: prof.name || '',
      birthDate: prof.birthDate || '',
      phone: formatPhone(prof.phone || ''),
      cpf: formatCpf(prof.cpf || ''),
      cargo: existingCargo,
      role: prof.cargo || (prof.group === 'operacional' ? 'Recepcionista' : existingSpecialties[0] || 'Profissional'),
      specialties: existingSpecialties,
      group: prof.group || 'corpo_clinico',
      registryNumber: prof.registryNumber || '',
      cep: '',
      address: '',
      addressNumber: '',
      email: prof.email || '',
      password: '',
      permissions: {
        ...SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {}),
        ...(prof.permissions || {})
      }
    });
    setIsModalOpen(true);
  };

  const toggleSpecialty = (spec: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      const updated = exists 
        ? prev.specialties.filter(s => s !== spec) 
        : [...prev.specialties, spec];
      return {
        ...prev,
        specialties: updated,
        role: updated.join(', ') || 'Corpo Clínico',
        cargo: prev.cargo || updated.join(', ') || 'Corpo Clínico'
      };
    });
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialtyInput.trim();
    if (!trimmed) return;
    if (!formData.specialties.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, trimmed],
        role: [...prev.specialties, trimmed].join(', '),
        cargo: prev.cargo || [...prev.specialties, trimmed].join(', ')
      }));
    }
    setCustomSpecialtyInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCpf = cleanCpf(formData.cpf);

    if (rawCpf.length !== 11) {
      alert('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    if (formData.group === 'corpo_clinico' && formData.specialties.length === 0) {
      alert('Para profissionais do Corpo Clínico, selecione pelo menos UMA especialidade habilitada.');
      return;
    }

    const resolvedCargo = formData.cargo?.trim() 
      || formData.role?.trim() 
      || (formData.group === 'corpo_clinico' ? (formData.specialties.join(', ') || 'Profissional Clínico') : 'Recepcionista');

    const generatedLogin = generateShortLogin(formData.name, formData.birthDate, rawCpf);
    const existingProf = editingId ? professionals.find(p => p.id === editingId) : null;
    const finalPassword = formData.password && formData.password.trim() !== '' && formData.password.trim() !== 'Mudar123'
      ? formData.password.trim()
      : (existingProf?.password || generateSecurePassword(formData.name, formData.birthDate, rawCpf));

    const profData: User = {
      id: editingId || 'prof-' + Date.now(),
      name: formData.name,
      birthDate: formData.birthDate,
      phone: formData.phone,
      login: generatedLogin,
      cpf: rawCpf,
      role: formData.group === 'corpo_clinico' ? 'professional' : 'receptionist',
      cargo: resolvedCargo,
      specialties: formData.group === 'corpo_clinico' ? formData.specialties : [],
      specialty: formData.specialties[0] || '',
      group: formData.group,
      registryNumber: formData.registryNumber,
      email: formData.email,
      password: finalPassword,
      clinicId: clinicId,
      mustChangePassword: true,
      active: true,
      createdAt: new Date().toISOString(),
      permissions: formData.permissions
    };

    onSaveProfessional(profData);
    setIsModalOpen(false);
  };

  const handleSendLoginWhatsApp = (prof: User) => {
    const phoneClean = (prof.phone || '').replace(/\D/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      alert(`O profissional ${prof.name} não possui um número de telefone válido cadastrado (${prof.phone || 'vazio'}). Por favor, cadastre o telefone do profissional primeiro.`);
      return;
    }

    const formattedPhone = phoneClean.startsWith('55') ? phoneClean : '55' + phoneClean;
    const loginText = prof.login || generateShortLogin(prof.name, prof.birthDate || '', prof.cpf);
    const passText = prof.password || generateSecurePassword(prof.name, prof.birthDate || '', prof.cpf);

    const message = `Olá, Agora você faz parte da ${clinicName || 'Clínica'}, confira abaixo as informações de login:

O Seu Login é: ${loginText}
Sua Senha é: ${passText}

Obrigado por fazer parte da nossa equipe.

Estamos à disposição. 😊`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredStaff = professionals.filter(p => {
    const specs = Array.isArray(p.specialties) ? p.specialties.join(' ') : (p.role || '');
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(cleanCpf(searchTerm)) ||
      specs.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Equipe & Profissionais da Clínica</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre médicos e terapeutas com <strong>múltiplas especialidades</strong> (ex: Neuropsicóloga e Psicóloga). A agenda aceitará pacientes para todas as áreas habilitadas.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Membro da Equipe</span>
        </button>
      </div>

      {professionals.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(prof => {
          const profSpecialties = Array.isArray(prof.specialties) && prof.specialties.length > 0
            ? prof.specialties
            : prof.specialty
            ? [prof.specialty]
            : [prof.role || 'Profissional'];

          return (
            <div key={prof.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-100 shrink-0">
                    {prof.name?.charAt(0) || 'P'}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{prof.name}</h3>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      prof.role === 'clinic_admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 font-extrabold'
                        : prof.group === 'corpo_clinico'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prof.role === 'clinic_admin'
                        ? 'Administrador da Clínica (Titular)'
                        : prof.group === 'corpo_clinico'
                        ? (prof.cargo || profSpecialties[0] || 'Profissional Clínico')
                        : (prof.cargo || (prof.role !== 'receptionist' && prof.role !== 'professional' ? prof.role : 'Operacional'))}
                    </span>
                  </div>
                </div>

                {/* Badges de Especialidades Habilitadas */}
                {prof.group === 'corpo_clinico' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Áreas Habilitadas na Agenda:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {profSpecialties.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 space-y-1 border-t pt-2.5">
                  <p>
                    <strong>Login Curto:</strong>{' '}
                    <span className="font-mono font-bold text-emerald-800">{prof.login || generateShortLogin(prof.name, prof.birthDate || '', prof.cpf)}</span>
                  </p>
                  <p>
                    <strong>Telefone:</strong>{' '}
                    <span className="font-mono font-bold text-slate-700">{prof.phone || 'Não informado'}</span>
                  </p>
                  {prof.registryNumber && (
                    <p>
                      <strong>Registro Profissional:</strong> {prof.registryNumber}
                    </p>
                  )}
                  {prof.email && (
                    <p className="truncate">
                      <strong>E-mail:</strong> {prof.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => handleSendLoginWhatsApp(prof)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center space-x-1 cursor-pointer shadow-sm"
                  title="Enviar Login e Senha via WhatsApp"
                >
                  <span>Enviar Login</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(prof)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold flex items-center space-x-1 hover:bg-blue-100 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setStaffToReset(prof)}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold flex items-center space-x-1 hover:bg-amber-100 cursor-pointer"
                  title="Resetar Senha"
                >
                  <Key className="w-3 h-3" />
                  <span>Reset Senha</span>
                </button>
                
                {/* O Administrador da Clínica NÃO pode ser excluído por aqui */}
                {prof.role !== 'clinic_admin' ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir o membro da equipe "${prof.name}"?`)) {
                        onDeleteProfessional(prof.id);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                    title="Excluir Membro da Equipe"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold italic px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    Titular Protegido
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredStaff.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white rounded-3xl border text-slate-400 font-bold space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
            <p>Nenhum profissional cadastrado na equipe desta clínica.</p>
            <button
              onClick={handleOpenNew}
              className="mt-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              Cadastrar Primeiro Profissional
            </button>
          </div>
        )}
      </div>

      {/* Modal Cadastro / Edição com Múltiplas Especialidades */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Membro da Equipe & Especialidades" : "Cadastrar Novo Membro da Equipe"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700 max-h-[78vh] overflow-y-auto pr-2">
          
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">1. Dados Pessoais & Categoria</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  required
                  type="text"
                  placeholder="Nome do profissional"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CPF do Profissional *</label>
                <input
                  required
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: formatCpf(e.target.value)})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold text-emerald-900 border-emerald-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Telefone / WhatsApp (DDD + Número) *</label>
                <input
                  required
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Data de Nascimento *</label>
                <input
                  required
                  type="date"
                  value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Grupo de Acesso *</label>
                <select
                  value={formData.group}
                  onChange={e => {
                    const newGroup = e.target.value as User['group'];
                    setFormData(prev => ({
                      ...prev,
                      group: newGroup,
                      role: newGroup === 'operacional' ? 'Recepcionista' : (prev.specialties[0] || 'Psicologia')
                    }));
                  }}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold"
                >
                  <option value="corpo_clinico">Corpo Clínico (Médicos / Terapeutas / Especialistas)</option>
                  <option value="operacional">Operacional (Recepção / Secretaria)</option>
                </select>
              </div>

              {formData.group === 'corpo_clinico' && (
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Registro Profissional (CRP / CRM / CREFITO) *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: CRP 06/12345"
                    value={formData.registryNumber}
                    onChange={e => setFormData({...formData, registryNumber: e.target.value})}
                    className="w-full p-2.5 border border-blue-300 rounded-xl bg-blue-50 font-bold text-blue-900 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seletor de Cargo Operacional */}
          {formData.group === 'operacional' && (
            <div className="p-4 border rounded-2xl bg-amber-50/50 border-amber-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-amber-950 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>2. Cargo / Função Operacional</span>
                </h4>
                <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                  {formData.role || 'Recepcionista'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Selecione ou digite o cargo específico deste colaborador operacional:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {PRESET_OPERATIONAL_ROLES.map(roleOption => {
                  const isSelected = (formData.cargo || formData.role) === roleOption;
                  return (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: roleOption, cargo: roleOption }))}
                      className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      <span>{roleOption}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Cargo Personalizado */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Outro cargo personalizado..."
                  value={formData.cargo || formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value, cargo: e.target.value }))}
                  className="flex-1 p-2 border rounded-xl bg-white text-xs font-bold"
                />
              </div>
            </div>
          )}

          {/* Seletor de Múltiplas Especialidades */}
          {formData.group === 'corpo_clinico' && (
            <div className="p-4 border rounded-2xl bg-indigo-50/50 border-indigo-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-indigo-950 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>2. Especialidades & Cargo Clínico</span>
                </h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                  {formData.specialties.length} selecionada(s)
                </span>
              </div>
              <p className="text-[11px] text-indigo-800">
                Marque todas as áreas para as quais o profissional está habilitado a receber consultas na agenda (ex: <strong>Neuropsicologia + Psicologia</strong>):
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {PRESET_SPECIALTIES.map(spec => {
                  const isChecked = formData.specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <span>{spec}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Adicionar Especialidade Customizada */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Outra especialidade (Ex: ABA, Estimulação Precoce)..."
                  value={customSpecialtyInput}
                  onChange={e => setCustomSpecialtyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSpecialty(); } }}
                  className="flex-1 p-2 border rounded-xl bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpecialty}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition cursor-pointer shrink-0"
                >
                  Adicionar
                </button>
              </div>

              {/* Cargo / Título Profissional */}
              <div className="pt-2 border-t border-indigo-100">
                <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                  Cargo / Título Profissional (Exibido no perfil e nos atendimentos):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Psicólogo(a) Clínico(a), Terapeuta Ocupacional, Médico..."
                  value={formData.cargo}
                  onChange={e => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  className="w-full p-2.5 border rounded-xl bg-white text-xs font-bold text-indigo-900 border-indigo-200"
                />
              </div>
            </div>
          )}

          {/* Credenciais de Acesso */}
          <div className="p-4 border rounded-2xl bg-emerald-50/50 border-emerald-200 space-y-4">
            <h4 className="font-extrabold text-emerald-900 uppercase">3. Credenciais de Acesso</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">E-mail para Notificações</label>
                <input
                  type="email"
                  placeholder="profissional@clinica.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">Senha Inicial de Acesso (Padrão: Mudar123)</label>
                <input
                  type="text"
                  placeholder="Mudar123"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>4. Permissões de Acesso aos Menus</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {SYSTEM_MENU_PERMISSIONS.map(menu => (
                <label key={menu.key} className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={(formData.permissions as any)[menu.key] ?? true}
                    onChange={e => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, [menu.key]: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-bold text-slate-700">{menu.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              {editingId ? "Salvar Alterações" : "Cadastrar & Liberar Acesso"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Reset de Senha para Mudar123 */}
      <Modal
        isOpen={!!staffToReset}
        onClose={() => setStaffToReset(null)}
        title="Confirmar Reset de Senha do Colaborador"
        maxWidth="max-w-md"
      >
        {staffToReset && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-xs">Redefinição de Senha do Profissional</p>
                <p className="text-[11px] leading-relaxed mt-0.5 text-amber-800">
                  Deseja redefinir a senha de acesso de <strong>{staffToReset.name}</strong> (CPF: {formatCpf(staffToReset.cpf)})?
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 text-[11px]">
              <span className="font-extrabold text-emerald-950 block">Nova Senha Padrão de Inicial:</span>
              <p className="font-mono text-sm font-black text-emerald-700 bg-white p-2 rounded-xl border border-emerald-300 text-center">
                Mudar123
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                No próximo acesso com o CPF, o profissional será solicitado a cadastrar sua nova senha pessoal.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStaffToReset(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetPassword(staffToReset.id, 'Mudar123');
                  setResetSuccessStaff({
                    name: staffToReset.name,
                    cpf: staffToReset.cpf
                  });
                  setStaffToReset(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                Confirmar Reset para Mudar123
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Caixa de Confirmação de Sucesso */}
      <Modal
        isOpen={!!resetSuccessStaff}
        onClose={() => setResetSuccessStaff(null)}
        title="Senha Redefinida com Sucesso!"
        maxWidth="max-w-md"
      >
        {resetSuccessStaff && (
          <div className="space-y-4 text-xs font-semibold text-slate-700 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Key className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-black text-slate-900">
              A senha foi redefinida para a senha inicial!
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              O colaborador <strong>{resetSuccessStaff.name}</strong> já pode acessar o sistema utilizando:
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border font-mono text-left space-y-1 text-xs">
              <p><strong>CPF de Login:</strong> <span className="text-emerald-800 font-bold">{formatCpf(resetSuccessStaff.cpf)}</span></p>
              <p><strong>Senha Inicial:</strong> <span className="text-emerald-800 font-bold">Mudar123</span></p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setResetSuccessStaff(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
