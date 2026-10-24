import React, { useState } from 'react';
import { Building2, Plus, Users, ShieldAlert, CheckCircle2, Lock, Trash2, Edit2, Key } from 'lucide-react';
import Modal from './Modal';

export default function ClinicsManager({ clinics, professionals, onAddClinic, onUpdateClinic, onToggleClinicStatus, onDeleteClinic, onResetClinicAdminPassword }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', cnpj: '', cep: '', addressNumber: '',
    unitsCount: '', employeesCount: '',
    adminName: '', adminBirthDate: '', adminCpf: '', adminEmail: '', adminPassword: '',
    planValue: '', contractTime: '', monthlyFee: ''
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      name: '', cnpj: '', cep: '', addressNumber: '',
      unitsCount: '', employeesCount: '',
      adminName: '', adminBirthDate: '', adminCpf: '', adminEmail: '', adminPassword: '',
      planValue: '', contractTime: '', monthlyFee: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (clinic) => {
    setEditingId(clinic.id);
    setFormData({
      name: clinic.name || '',
      cnpj: clinic.cnpj || '',
      cep: clinic.cep || '',
      addressNumber: clinic.addressNumber || '',
      unitsCount: clinic.unitsCount || '',
      employeesCount: clinic.employeesCount || '',
      adminName: clinic.adminName || '',
      adminBirthDate: clinic.adminBirthDate || '',
      adminCpf: clinic.adminCpf || '',
      adminEmail: clinic.adminEmail || '',
      adminPassword: '', 
      planValue: clinic.planValue || '',
      contractTime: clinic.contractTime || '',
      monthlyFee: clinic.monthlyFee || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const updatedClinicData = {
        name: formData.name, cnpj: formData.cnpj,
        cep: formData.cep, addressNumber: formData.addressNumber,
        unitsCount: formData.unitsCount || '1', employeesCount: formData.employeesCount || '1',
        planValue: formData.planValue, contractTime: formData.contractTime, monthlyFee: formData.monthlyFee,
        adminName: formData.adminName, adminEmail: formData.adminEmail
      };
      onUpdateClinic(editingId, updatedClinicData, formData.adminPassword.trim() !== '' ? formData.adminPassword : null);
    } else {
      const newClinicId = 'clinic-' + Date.now();
      const newClinic = {
        id: newClinicId,
        name: formData.name, cnpj: formData.cnpj,
        cep: formData.cep, addressNumber: formData.addressNumber,
        unitsCount: formData.unitsCount || '1', employeesCount: formData.employeesCount || '1',
        planValue: formData.planValue, contractTime: formData.contractTime, monthlyFee: formData.monthlyFee,
        adminName: formData.adminName, adminEmail: formData.adminEmail,
        status: 'Ativa'
      };

      const newAdminUser = {
        name: formData.adminName, email: formData.adminEmail, cpf: formData.adminCpf, birthDate: formData.adminBirthDate,
        password: formData.adminPassword || '123456', group: 'operacional', role: 'clinic_admin', clinicId: newClinicId
      };

      onAddClinic(newClinic, newAdminUser);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (clinicId, clinicName) => {
    if (window.confirm(`ATENÇÃO: Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a clínica "${clinicName}" e todos os seus utilizadores? Esta ação não pode ser desfeita.`)) {
      onDeleteClinic(clinicId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Gestão de Clínicas (Tenants)</h2>
          <p className="text-[10px] text-slate-400">Administração de clientes do sistema SaaS, contratos e acessos.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Nova Clínica</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Clínica / CNPJ</th>
              <th className="p-4">Admin Principal</th>
              <th className="p-4">Plano / Mensalidade</th>
              <th className="p-4 text-center">Status Acesso</th>
              <th className="p-4 text-center">Ações Administrativas</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clinics.map(clinic => (
              <tr key={clinic.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <span className="font-extrabold text-slate-900 block">{clinic.name}</span>
                  <span className="text-[10px] text-slate-500">{clinic.cnpj}</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-slate-700 block">{clinic.adminName || 'Admin'}</span>
                  <span className="text-[10px] text-slate-400">{clinic.adminEmail}</span>
                </td>
                <td className="p-4 text-[10px] font-bold text-blue-700">R$ {clinic.monthlyFee || 'N/A'} / {clinic.contractTime || 'N/A'} Meses</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${clinic.status === 'Ativa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{clinic.status}</span>
                </td>
                <td className="p-4 text-center space-x-1">
                  <button onClick={() => handleOpenEdit(clinic)} className="px-3 py-1.5 font-bold rounded-xl text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center space-x-1" title="Editar Cadastro">
                    <Edit2 className="w-3.5 h-3.5" /><span>Editar</span>
                  </button>

                  {/* CAMPO DE RESET DE SENHA LIMPO E SEM EXIBIR SUA SENHA */}
                  <button onClick={() => {
                    const novaSenha = prompt(`Digite a nova senha temporária para o administrador ${clinic.adminName || clinic.name}:`, '');
                    if (novaSenha && novaSenha.trim() !== '') {
                      onResetClinicAdminPassword(clinic.id, clinic.adminEmail, novaSenha.trim());
                    }
                  }} className="px-3 py-1.5 font-bold rounded-xl text-[10px] bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center space-x-1" title="Resetar Senha de Acesso">
                    <Key className="w-3.5 h-3.5" /><span>Reset Senha</span>
                  </button>

                  <button onClick={() => onToggleClinicStatus(clinic.id)} className={`px-3 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 ${clinic.status === 'Ativa' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`} title={clinic.status === 'Ativa' ? 'Bloquear Clínica' : 'Reativar Clínica'}>
                    {clinic.status === 'Ativa' ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <button onClick={() => handleDelete(clinic.id, clinic.name)} className="px-3 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 bg-rose-50 text-rose-700 hover:bg-rose-100" title="Excluir Clínica">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Cadastro da Clínica & Senha" : "Cadastrar Nova Clínica"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700 h-[70vh] overflow-y-auto pr-2">
          
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">1. Dados da Empresa</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Nome da Empresa" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="CNPJ" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="CEP" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="Número / Complemento" value={formData.addressNumber} onChange={e => setFormData({...formData, addressNumber: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="number" placeholder="Quantidade de Unidades" value={formData.unitsCount} onChange={e => setFormData({...formData, unitsCount: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="number" placeholder="Quantidade de Funcionários" value={formData.employeesCount} onChange={e => setFormData({...formData, employeesCount: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
            </div>
          </div>

          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">2. Dados do Administrador Responsável & Senha</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Nome Completo do Administrador" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="email" placeholder="E-mail de Acesso (Login)" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              
              {!editingId && (
                <>
                  <input required type="text" placeholder="CPF" value={formData.adminCpf} onChange={e => setFormData({...formData, adminCpf: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">Data de Nascimento</label>
                    <input required type="date" value={formData.adminBirthDate} onChange={e => setFormData({...formData, adminBirthDate: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
                  </div>
                </>
              )}

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-slate-500 block font-bold text-emerald-700">
                  {editingId ? "Redefinir Senha Provisória (Deixe em branco para não alterar)" : "Definir Senha Provisória de Primeiro Acesso"}
                </label>
                <input type="text" placeholder={editingId ? "Deixe em branco para manter a senha atual" : "Ex: Senha123!"} value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} className="w-full p-2.5 border border-emerald-300 rounded-xl font-mono text-emerald-900 bg-emerald-50" />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">3. Dados de Contrato e Plano</h4>
            <div className="grid grid-cols-3 gap-4">
              <input required type="text" placeholder="Valor de Setup/Plano (R$)" value={formData.planValue} onChange={e => setFormData({...formData, planValue: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="number" placeholder="Tempo Contratado (Meses)" value={formData.contractTime} onChange={e => setFormData({...formData, contractTime: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="Mensalidade Manutenção (R$)" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
            {editingId ? "Salvar Alterações na Clínica" : "Cadastrar Clínica e Libertar Acesso"}
          </button>
        </form>
      </Modal>
    </div>
  );
}