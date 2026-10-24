import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Edit2, Code, ShieldAlert, Users } from 'lucide-react';
import Modal from './Modal';

export default function DevsManager({ devs = [], onSaveDev, onDeleteDev }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Backend', department: 'Técnico (Dev)', status: 'Ativo', accessLevel: 'Total'
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Backend', department: 'Técnico (Dev)', status: 'Ativo', accessLevel: 'Total' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveDev({ id: editingId || ('dev-' + Date.now()), ...formData });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm text-white">
        <div>
          <h2 className="font-extrabold text-base flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            Central de Desenvolvedores & Equipe Corporativa SaaS
          </h2>
          <p className="text-xs text-slate-400 mt-1">Área restrita e exclusiva do Fundador. Gestão da equipa de T.I. e administrativa da empresa CliniGestor.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Novo Membro SaaS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devs.map(dev => (
          <div key={dev.id} className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col space-y-4">
            <div className="flex items-center space-x-3 border-b pb-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block text-sm">{dev.name}</span>
                <span className="text-[10px] text-slate-500 block">{dev.email}</span>
              </div>
            </div>
            <div className="text-xs space-y-1.5 text-slate-600">
              <p><strong>Departamento:</strong> <span className="text-indigo-600 font-bold">{dev.department}</span></p>
              <p><strong>Cargo/Função:</strong> {dev.role}</p>
              <p><strong>Acesso:</strong> {dev.accessLevel}</p>
              <p><strong>Status:</strong> <span className={`font-bold ${dev.status === 'Ativo' ? 'text-emerald-600' : 'text-rose-600'}`}>{dev.status}</span></p>
            </div>
            <div className="pt-3 border-t flex justify-end space-x-2">
              <button onClick={() => { setEditingId(dev.id); setFormData(dev); setIsModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDeleteDev(dev.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {devs.length === 0 && (
          <div className="col-span-3 p-12 text-center border-2 border-dashed rounded-3xl bg-slate-50 text-slate-400 font-bold">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Nenhum membro corporativo cadastrado na Central SaaS.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Membro (Central SaaS)">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="block font-bold">Nome Completo</label>
            <input required type="text" placeholder="Nome do colaborador" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="block font-bold">E-mail de Acesso (Login)</label>
            <input required type="email" placeholder="email@clinigestor.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold">Departamento</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Técnico (Dev)">Técnico (Dev)</option>
                <option value="Administrativo Empresa">Administrativo Empresa</option>
                <option value="Suporte / Comercial">Suporte / Comercial</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-bold">Cargo / Especialidade</label>
              <input required type="text" placeholder="Ex: Fullstack, Financeiro..." value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border rounded-xl" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block font-bold">Nível de Acesso à Central</label>
            <select value={formData.accessLevel} onChange={e => setFormData({...formData, accessLevel: e.target.value})} className="w-full p-2.5 border rounded-xl bg-white">
              <option value="Total">Total (Sistema SaaS)</option>
              <option value="Restrito">Restrito (Apenas Visualização)</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">Salvar Membro Corporativo</button>
        </form>
      </Modal>
    </div>
  );
}