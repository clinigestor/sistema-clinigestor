import React, { useState } from 'react';
import { Building2, Plus, Users, ShieldAlert, CheckCircle2, Lock, Trash2, Edit2, Key, Search, Phone, Mail, FileText, Eye } from 'lucide-react';
import { Clinic, User } from '../types';
import { formatCpf, cleanCpf, formatCpfCnpj, generateShortLogin, formatPhone } from '../utils/helpers';
import { INITIAL_FOUNDER_CPF } from '../services/storage';
import Modal from './Modal';

interface ClinicsManagerProps {
  clinics: Clinic[];
  users: User[];
  onAddClinic: (clinic: Clinic, adminUser: User) => void;
  onUpdateClinic: (clinicId: string, updatedClinicData: Partial<Clinic>, newPassword?: string | null) => void;
  onToggleClinicStatus: (clinicId: string) => void;
  onDeleteClinic: (clinicId: string) => void;
  onResetClinicAdminPassword: (clinicId: string, adminCpf: string, newPassword: string) => void;
  onSelectClinic?: (clinicId: string) => void;
}

export default function ClinicsManager({
  clinics,
  users,
  onAddClinic,
  onUpdateClinic,
  onToggleClinicStatus,
  onDeleteClinic,
  onResetClinicAdminPassword,
  onSelectClinic
}: ClinicsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais de Confirmação de Exclusão e Reset de Senha
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [resetTargetClinic, setResetTargetClinic] = useState<Clinic | null>(null);
  const [resetSuccessData, setResetSuccessData] = useState<{ adminName: string; adminCpf: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    cep: '',
    address: '',
    addressNumber: '',
    complement: '',
    unitsCount: '1',
    employeesCount: '5',
    adminName: '',
    adminBirthDate: '',
    adminPhone: '',
    adminCpf: '',
    adminEmail: '',
    adminPassword: 'Mudar123',
    planValue: '350,00',
    contractTime: '12',
    monthlyFee: '150,00'
  });

  const handleCepChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 8);
    const formatted = cleaned.length > 5 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
    
    setFormData(prev => ({ ...prev, cep: formatted }));

    if (cleaned.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const fullAddress = `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade || ''}/${data.uf || ''}`;
          setFormData(prev => ({ ...prev, address: fullAddress }));
        }
      } catch (err) {
        console.error('Error fetching CEP:', err);
      }
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      cnpj: '',
      cep: '',
      address: '',
      addressNumber: '',
      complement: '',
      unitsCount: '1',
      employeesCount: '5',
      adminName: '',
      adminBirthDate: '',
      adminPhone: '',
      adminCpf: '',
      adminEmail: '',
      adminPassword: 'Mudar123',
      planValue: '350,00',
      contractTime: '12',
      monthlyFee: '150,00'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (clinic: Clinic) => {
    setEditingId(clinic.id);
    const existingAdmin = users.find(u => u.clinicId === clinic.id && u.role === 'clinic_admin');

    setFormData({
      name: clinic.name || '',
      cnpj: clinic.cnpj || '',
      cep: clinic.cep || '',
      address: clinic.address || '',
      addressNumber: clinic.addressNumber || '',
      complement: clinic.complement || '',
      unitsCount: clinic.unitsCount || '1',
      employeesCount: clinic.employeesCount || '1',
      adminName: clinic.adminName || existingAdmin?.name || '',
      adminBirthDate: existingAdmin?.birthDate || clinic.adminBirthDate || '',
      adminPhone: formatPhone(existingAdmin?.phone || clinic.adminPhone || ''),
      adminCpf: formatCpf(clinic.adminCpf || existingAdmin?.cpf || ''),
      adminEmail: clinic.adminEmail || existingAdmin?.email || '',
      adminPassword: '', 
      planValue: clinic.planValue || '',
      contractTime: clinic.contractTime || '12',
      monthlyFee: clinic.monthlyFee || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCpf = cleanCpf(formData.adminCpf);

    if (rawCpf.length !== 11) {
      alert(`Por favor, informe um CPF válido com 11 dígitos para o Administrador da Clínica (digitados: ${rawCpf.length} dígitos).`);
      return;
    }

    if (rawCpf === INITIAL_FOUNDER_CPF) {
      alert(`Atenção: O CPF ${formatCpf(rawCpf)} pertence exclusivamente ao Fundador do sistema (Superadmin). Por favor, informe o CPF individual do Administrador desta clínica.`);
      return;
    }

    const adminLogin = generateShortLogin(formData.adminName, formData.adminBirthDate, rawCpf);

    if (editingId) {
      const updatedClinicData: Partial<Clinic> = {
        name: formData.name,
        cnpj: formData.cnpj,
        cep: formData.cep,
        address: formData.address,
        addressNumber: formData.addressNumber,
        complement: formData.complement,
        unitsCount: formData.unitsCount || '1',
        employeesCount: formData.employeesCount || '1',
        planValue: formData.planValue,
        contractTime: formData.contractTime,
        monthlyFee: formData.monthlyFee,
        adminName: formData.adminName,
        adminBirthDate: formData.adminBirthDate,
        adminPhone: formData.adminPhone,
        adminCpf: rawCpf,
        adminEmail: formData.adminEmail,
        adminLogin
      };
      
      onUpdateClinic(
        editingId,
        updatedClinicData,
        formData.adminPassword.trim() !== '' ? formData.adminPassword.trim() : null
      );
    } else {
      const newClinicId = 'clinic-' + Date.now();
      const newClinic: Clinic = {
        id: newClinicId,
        name: formData.name,
        cnpj: formData.cnpj,
        cep: formData.cep,
        address: formData.address,
        addressNumber: formData.addressNumber,
        complement: formData.complement,
        unitsCount: formData.unitsCount || '1',
        employeesCount: formData.employeesCount || '1',
        planValue: formData.planValue,
        contractTime: formData.contractTime,
        monthlyFee: formData.monthlyFee,
        adminName: formData.adminName,
        adminBirthDate: formData.adminBirthDate,
        adminPhone: formData.adminPhone,
        adminCpf: rawCpf,
        adminEmail: formData.adminEmail,
        adminLogin,
        status: 'Ativa',
        createdAt: new Date().toISOString()
      };

      const newAdminUser: User = {
        id: 'user-admin-' + Date.now(),
        name: formData.adminName,
        email: formData.adminEmail,
        cpf: rawCpf,
        birthDate: formData.adminBirthDate,
        phone: formData.adminPhone,
        login: adminLogin,
        password: formData.adminPassword.trim() || 'Mudar123',
        group: 'operacional',
        role: 'clinic_admin',
        cargo: 'Administrador da Clínica',
        clinicId: newClinicId,
        mustChangePassword: true, // Força a alteração de senha no primeiro login
        active: true,
        createdAt: new Date().toISOString(),
        permissions: {
          canAccessDashboard: true,
          canAccessPatients: true,
          canAccessWaitingList: true,
          canAccessAppointments: true,
          canAccessMyAgenda: true,
          canAccessAnamnesis: true,
          canAccessGoalsPTI: true,
          canAccessSoap: true,
          canAccessHistory: true,
          canAccessFinancial: true,
          canAccessTelehealth: true,
          canAccessWhatsapp: true,
          canAccessHelpdesk: true,
          canAccessTheme: true
        }
      };

      onAddClinic(newClinic, newAdminUser);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (clinicId: string, clinicName: string) => {
    if (window.confirm(`ATENÇÃO: Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a clínica "${clinicName}" e todos os seus utilizadores vinculados? Esta ação não pode ser desfeita.`)) {
      onDeleteClinic(clinicId);
    }
  };

  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm) ||
    c.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.adminCpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Gestão de Clínicas Contratantes (Tenants)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Área exclusiva do Fundador. Cada nova clínica cadastrada terá seu Administrador liberado para login com CPF e senha padrão inicial (<strong>Mudar123</strong>).
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Clínica</span>
        </button>
      </div>

      {/* Barra de Pesquisa */}
      {clinics.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por clínica, CNPJ ou Administrador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Tabela de Clínicas */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Clínica / CNPJ</th>
              <th className="p-4">Administrador (Login por CPF)</th>
              <th className="p-4">Contrato / Mensalidade</th>
              <th className="p-4 text-center">Status Acesso</th>
              <th className="p-4 text-center">Ações Administrativas</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClinics.map(clinic => {
              const adminUser = users.find(u => u.clinicId === clinic.id && u.role === 'clinic_admin');
              return (
                <tr key={clinic.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900 block text-sm">{clinic.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">CNPJ: {formatCpfCnpj(clinic.cnpj)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">ID: {clinic.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{clinic.adminName || adminUser?.name || 'Admin'}</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 block">
                      CPF: {formatCpf(clinic.adminCpf || adminUser?.cpf || '')}
                    </span>
                    <span className="text-[10px] text-slate-400">{clinic.adminEmail || adminUser?.email}</span>
                  </td>
                  <td className="p-4 text-[11px] font-bold text-blue-700">
                    <div>R$ {clinic.monthlyFee || '150,00'}/mês</div>
                    <span className="text-[10px] text-slate-400 font-normal">Contrato {clinic.contractTime || '12'} meses</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                      clinic.status === 'Ativa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {clinic.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                    {onSelectClinic && (
                      <button
                        onClick={() => onSelectClinic(clinic.id)}
                        className="px-3 py-1.5 font-bold rounded-xl text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 inline-flex items-center space-x-1 cursor-pointer"
                        title="Visualizar Sistema da Clínica para Ajustes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Acessar Clínica</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(clinic)}
                      className="px-3 py-1.5 font-bold rounded-xl text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center space-x-1 cursor-pointer"
                      title="Editar Cadastro da Clínica"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => setResetTargetClinic(clinic)}
                      className="px-3 py-1.5 font-bold rounded-xl text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center space-x-1 cursor-pointer"
                      title="Resetar Senha do Administrador"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Reset Senha</span>
                    </button>

                    <button
                      onClick={() => onToggleClinicStatus(clinic.id)}
                      className={`px-3 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 cursor-pointer ${
                        clinic.status === 'Ativa' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={clinic.status === 'Ativa' ? 'Bloquear Clínica' : 'Reativar Clínica'}
                    >
                      {clinic.status === 'Ativa' ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setClinicToDelete(clinic)}
                      className="px-2.5 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                      title="Excluir Clínica Definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {clinics.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-bold space-y-3">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 opacity-60" />
            <p className="text-sm text-slate-600">Nenhuma clínica cadastrada no sistema.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Como solicitado, o sistema inicia sem clínicas pré-cadastradas. Clique no botão acima para cadastrar a primeira clínica e liberar o acesso do Administrador por CPF.
            </p>
            <button
              onClick={handleOpenNew}
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Clínica Agora</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição da Clínica */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Editar Cadastro da Clínica & Administrador" : "Cadastrar Nova Clínica Contratante"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700 max-h-[75vh] overflow-y-auto pr-2">
          
          {/* 1. Dados da Empresa */}
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>1. Dados da Empresa Contratante</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome da Empresa / Clínica *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Clínica Saúde Integrada"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CNPJ *</label>
                <input
                  required
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={e => setFormData({...formData, cnpj: formatCpfCnpj(e.target.value)})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CEP * (Preenche Endereço)</label>
                <input
                  required
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={e => handleCepChange(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Endereço (Automático pelo CEP) *</label>
                <input
                  required
                  type="text"
                  placeholder="Logradouro, Bairro - Cidade/UF"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Número do Endereço *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: 1234"
                  value={formData.addressNumber}
                  onChange={e => setFormData({...formData, addressNumber: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Complemento</label>
                <input
                  type="text"
                  placeholder="Ex: Sala 302, Bloco B"
                  value={formData.complement}
                  onChange={e => setFormData({...formData, complement: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantidade de Unidades</label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsCount}
                  onChange={e => setFormData({...formData, unitsCount: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantidade de Funcionários / Profissionais</label>
                <input
                  type="number"
                  min="1"
                  value={formData.employeesCount}
                  onChange={e => setFormData({...formData, employeesCount: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Dados do Administrador Responsável */}
          <div className="p-4 border rounded-2xl bg-emerald-50/50 border-emerald-200 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-emerald-900 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Administrador Responsável (Credenciais de Acesso)</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                Login por CPF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Completo do Administrador *</label>
                <input
                  required
                  type="text"
                  placeholder="Nome do gestor da clínica"
                  value={formData.adminName}
                  onChange={e => setFormData({...formData, adminName: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">E-mail de Contato *</label>
                <input
                  required
                  type="email"
                  placeholder="admin@clinica.com"
                  value={formData.adminEmail}
                  onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CPF do Administrador (Chave de Login) *</label>
                <input
                  required
                  type="text"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={formData.adminCpf}
                  onChange={e => setFormData({...formData, adminCpf: formatCpf(e.target.value)})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold text-emerald-900 border-emerald-300"
                />
                <div className="flex justify-between items-center mt-1 text-[10px]">
                  <span className="text-slate-400">Digite os 11 números do CPF</span>
                  <span className={`font-mono font-bold ${cleanCpf(formData.adminCpf).length === 11 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {cleanCpf(formData.adminCpf).length}/11 dígitos
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Data de Nascimento do Admin</label>
                <input
                  type="date"
                  value={formData.adminBirthDate}
                  onChange={e => setFormData({...formData, adminBirthDate: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Telefone / WhatsApp do Admin</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={formData.adminPhone}
                  onChange={e => setFormData({...formData, adminPhone: formatPhone(e.target.value)})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1 bg-white p-3.5 rounded-xl border border-emerald-200">
                <label className="text-[11px] block font-bold text-emerald-900">
                  {editingId ? "Redefinir Senha do Administrador (Deixe em branco para não alterar)" : "Senha Inicial de Acesso (Padrão: Mudar123)"}
                </label>
                <input
                  type="text"
                  placeholder={editingId ? "Deixe em branco para manter a senha atual" : "Mudar123"}
                  value={formData.adminPassword}
                  onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                  className="w-full p-2.5 border border-emerald-300 rounded-xl font-mono text-emerald-900 bg-emerald-50/50"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Nota: Por segurança, no primeiro acesso com a senha padrão <strong>Mudar123</strong>, o sistema exigirá que o Administrador cadastre uma nova senha pessoal.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Dados de Contrato e Plano */}
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>3. Dados de Contrato e Plano SaaS</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Setup / Adesão (R$)</label>
                <input
                  type="text"
                  placeholder="350,00"
                  value={formData.planValue}
                  onChange={e => setFormData({...formData, planValue: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Vigência (Meses)</label>
                <input
                  type="number"
                  placeholder="12"
                  value={formData.contractTime}
                  onChange={e => setFormData({...formData, contractTime: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mensalidade (R$)</label>
                <input
                  type="text"
                  placeholder="150,00"
                  value={formData.monthlyFee}
                  onChange={e => setFormData({...formData, monthlyFee: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {editingId ? "Salvar Alterações na Clínica" : "Cadastrar Clínica & Liberar Acesso"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão da Clínica */}
      <Modal
        isOpen={!!clinicToDelete}
        onClose={() => setClinicToDelete(null)}
        title="Confirmar Exclusão Definitiva da Clínica"
        maxWidth="max-w-md"
      >
        {clinicToDelete && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-xs">Atenção: Ação Irreversível!</p>
                <p className="text-[11px] leading-relaxed mt-0.5 text-rose-800">
                  Você está prestes a excluir definitivamente a clínica <strong>{clinicToDelete.name}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-1.5 text-[11px]">
              <p><strong>Clínica:</strong> {clinicToDelete.name}</p>
              <p><strong>CNPJ:</strong> {formatCpfCnpj(clinicToDelete.cnpj)}</p>
              <p><strong>Administrador:</strong> {clinicToDelete.adminName}</p>
              <p><strong>CPF do Admin:</strong> {formatCpf(clinicToDelete.adminCpf)}</p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Todos os pacientes, profissionais, agendamentos e prontuários vinculados a esta clínica serão permanentemente excluídos da base de dados.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setClinicToDelete(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClinic(clinicToDelete.id);
                  setClinicToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Clínica</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Reset de Senha para Mudar123 */}
      <Modal
        isOpen={!!resetTargetClinic}
        onClose={() => setResetTargetClinic(null)}
        title="Confirmar Reset de Senha do Administrador"
        maxWidth="max-w-md"
      >
        {resetTargetClinic && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-xs">Reset de Credencial Administrativa</p>
                <p className="text-[11px] leading-relaxed mt-0.5 text-amber-800">
                  Deseja redefinir a senha de acesso do Administrador <strong>{resetTargetClinic.adminName}</strong> da clínica <strong>{resetTargetClinic.name}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 text-[11px]">
              <span className="font-extrabold text-emerald-950 block">Nova Senha Padrão de Inicial:</span>
              <p className="font-mono text-sm font-black text-emerald-700 bg-white p-2 rounded-xl border border-emerald-300 text-center">
                Mudar123
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Ao fazer login com o CPF ({formatCpf(resetTargetClinic.adminCpf)}) e esta senha, o Administrador será obrigado a cadastrar sua nova senha pessoal no primeiro acesso.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setResetTargetClinic(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetClinicAdminPassword(resetTargetClinic.id, resetTargetClinic.adminCpf, 'Mudar123');
                  setResetSuccessData({
                    adminName: resetTargetClinic.adminName,
                    adminCpf: resetTargetClinic.adminCpf
                  });
                  setResetTargetClinic(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar Reset para Mudar123</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Caixa de Confirmação de Sucesso no Reset de Senha */}
      <Modal
        isOpen={!!resetSuccessData}
        onClose={() => setResetSuccessData(null)}
        title="Senha Redefinida com Sucesso!"
        maxWidth="max-w-md"
      >
        {resetSuccessData && (
          <div className="space-y-4 text-xs font-semibold text-slate-700 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-black text-slate-900">
              A senha foi redefinida para a senha inicial!
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              O Administrador <strong>{resetSuccessData.adminName}</strong> já pode acessar o sistema utilizando:
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border font-mono text-left space-y-1 text-xs">
              <p><strong>CPF de Login:</strong> <span className="text-emerald-800 font-bold">{formatCpf(resetSuccessData.adminCpf)}</span></p>
              <p><strong>Senha Inicial:</strong> <span className="text-emerald-800 font-bold">Mudar123</span></p>
            </div>

            <p className="text-[10px] text-slate-400">
              No próximo login, o sistema exigirá a redefinição obrigatória para a nova senha pessoal.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setResetSuccessData(null)}
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
