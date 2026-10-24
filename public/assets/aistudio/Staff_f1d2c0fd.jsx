import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Key, Shield } from 'lucide-react';
import Modal from './Modal';

const SYSTEM_MENU_PERMISSIONS = [
  { key: 'canAccessDashboard', label: 'Recepção do Dia (Dashboard)' },
  { key: 'canAccessPatients', label: 'Cadastro de Pacientes' },
  { key: 'canAccessWaitingList', label: 'Lista de Espera' },
  { key: 'canAccessAppointments', label: 'Agenda Geral e Individual' },
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

export default function Staff({ professionals, onSaveProfessional, onDeleteProfessional, onResetPassword }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    role: 'Profissional',
    group: 'corpo_clinico',
    registryNumber: '',
    cep: '',
    address: '',
    addressNumber: '',
    photoUrl: '',
    loginUsername: '', // NOVO: CPF ou nome de login criado pelo admin
    email: '',
    password: '',
    permissions: SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      birthDate: '',
      cpf: '',
      role: 'Profissional',
      group: 'corpo_clinico',
      registryNumber: '',
      cep: '',
      address: '',
      addressNumber: '',
      photoUrl: '',
      loginUsername: '',
      email: '',
      password: '123456',
      permissions: SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prof) => {
    setEditingId(prof.id);
    setFormData({
      name: prof.name || '',
      birthDate: prof.birthDate || '',
      cpf: prof.cpf || '',
      role: prof.role || 'Profissional',
      group: prof.group || 'corpo_clinico',
      registryNumber: prof.registryNumber || '',
      cep: prof.cep || '',
      address: prof.address || '',
      addressNumber: prof.addressNumber || '',
      photoUrl: prof.photoUrl || '',
      loginUsername: prof.loginUsername || prof.cpf || '',
      email: prof.email || '',
      password: prof.password || '',
      permissions: {
        ...SYSTEM_MENU_PERMISSIONS.reduce((acc, item) => ({ ...acc, [item.key]: true }), {}),
        ...(prof.permissions || {})
      }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profData = {
      id: editingId || 'prof-' + Date.now(),
      ...formData
    };
    onSaveProfessional(profData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Gestão de Equipe & Profissionais</h2>
          <p className="text-[10px] text-slate-400">Cadastre profissionais, configure o login por CPF/Nome de acesso e permissões.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Novo Profissional</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map(prof => (
          <div key={prof.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center overflow-hidden border">
                {prof.photoUrl ? (
                  <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 m-auto text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs">{prof.name}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${prof.group === 'corpo_clinico' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                  {prof.group === 'corpo_clinico' ? 'Corpo Clínico' : 'Operacional'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 border-t pt-3">
              <p><strong>Usuário de Login (CPF/Nome):</strong> <span className="font-mono font-bold text-emerald-800">{prof.loginUsername || prof.cpf || prof.email}</span></p>
              {prof.group === 'corpo_clinico' && <p><strong>Registro Profissional:</strong> {prof.registryNumber || 'N/A'}</p>}
              <p><strong>CPF:</strong> {prof.cpf || 'N/A'}</p>
            </div>

            <div className="flex items-center justify-end space-x-1 pt-2 border-t">
              <button onClick={() => handleOpenEdit(prof)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold flex items-center space-x-1">
                <Edit2 className="w-3 h-3" /><span>Editar</span>
              </button>
              <button onClick={() => {
                const novaSenha = prompt(`Digite a nova senha para ${prof.name}:`, '123456');
                if (novaSenha) onResetPassword(prof.id, novaSenha);
              }} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold flex items-center space-x-1">
                <Key className="w-3 h-3" /><span>Senha</span>
              </button>
              <button onClick={() => onDeleteProfessional(prof.id)} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-bold">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Profissional" : "Cadastrar Novo Profissional"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700 h-[75vh] overflow-y-auto pr-2">
          
          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">1. Informações Pessoais</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Nome Completo *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="CPF *" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 block">Data de Nascimento *</label>
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 block">Grupo de Acesso *</label>
                <select value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white">
                  <option value="corpo_clinico">Corpo Clínico (Médicos/Terapeutas)</option>
                  <option value="operacional">Operacional (Recepção/Secretaria)</option>
                </select>
              </div>

              <input type="text" placeholder="Função / Cargo (Ex: Psicólogo, Recepcionista)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />

              {formData.group === 'corpo_clinico' && (
                <input required type="text" placeholder="Número do Registro Profissional (CRP / CRM / CREFITO) *" value={formData.registryNumber} onChange={e => setFormData({...formData, registryNumber: e.target.value})} className="w-full p-2.5 border border-blue-300 rounded-xl bg-blue-50 font-bold text-blue-900" />
              )}
            </div>
          </div>

          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase">2. Endereço e Foto de Perfil</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="CEP *" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="Número da Residência *" value={formData.addressNumber} onChange={e => setFormData({...formData, addressNumber: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              <input required type="text" placeholder="Endereço Completo (Rua, Bairro, Cidade) *" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2 w-full p-2.5 border rounded-xl bg-white" />
              
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-slate-500 block">Link / URL da Foto do Profissional</label>
                <input type="url" placeholder="https://exemplo.com/foto.jpg" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              </div>
            </div>
          </div>

          {/* CREDENCIAIS DE LOGIN */}
          <div className="p-4 border rounded-2xl bg-emerald-50/40 space-y-4 border-emerald-200">
            <h4 className="font-extrabold text-emerald-900 uppercase">3. Credenciais de Acesso (CPF ou Nome de Login)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-800 font-bold block">Usuário de Login (CPF ou Apelido/Nome) *</label>
                <input required type="text" placeholder="Ex: 123.456.789-00 ou raphael" value={formData.loginUsername} onChange={e => setFormData({...formData, loginUsername: e.target.value})} className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-emerald-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-800 font-bold block">E-mail para Notificações</label>
                <input type="email" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] text-emerald-800 font-bold block">Senha Provisória de Acesso *</label>
                <input required type="text" placeholder="Ex: Senha123!" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-mono text-emerald-900" />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-2xl bg-slate-50 space-y-4">
            <h4 className="font-extrabold text-slate-900 uppercase flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>4. Controle de Acesso aos Menus do Sistema</span>
            </h4>
            <p className="text-[10px] text-slate-400">Marque os menus que este profissional tem permissão para visualizar e interagir no painel:</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              {SYSTEM_MENU_PERMISSIONS.map(menu => (
                <label key={menu.key} className="flex items-center space-x-2.5 bg-white p-3 rounded-xl border cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.permissions[menu.key] ?? true}
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

          <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 text-sm">
            {editingId ? "Salvar Alterações do Profissional" : "Cadastrar Profissional e Liberar Acesso"}
          </button>
        </form>
      </Modal>
    </div>
  );
}