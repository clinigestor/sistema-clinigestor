import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Edit2, ShieldAlert, Users } from 'lucide-react';
import { DevMember } from '../types';
import Modal from './Modal';

interface DevsManagerProps {
  devs: DevMember[];
  onSaveDev: (dev: DevMember) => void;
  onDeleteDev: (id: string) => void;
}

export default function DevsManager({ devs = [], onSaveDev, onDeleteDev }: DevsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Backend & Cloud',
    department: 'Técnico (Dev)',
    status: 'Ativo' as DevMember['status'],
    accessLevel: 'Total' as DevMember['accessLevel']
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Backend & Cloud', department: 'Técnico (Dev)', status: 'Ativo', accessLevel: 'Total' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dev: DevMember) => {
    setEditingId(dev.id);
    setFormData({ ...dev });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDev({ id: editingId || ('dev-' + Date.now()), ...formData });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl text-white">
        <div>
          <h2 className="font-extrabold text-base flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <span>Central SaaS & Equipe Corporativa CliniGestor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão restrita do Fundador. Controle da equipe interna de desenvolvimento, infraestrutura e suporte da empresa.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Membro SaaS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devs.map(dev => (
          <div key={dev.id} className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 border-b pb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-extrabold text-slate-900 block text-sm truncate">{dev.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{dev.email}</span>
                </div>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p><strong>Departamento:</strong> <span className="text-indigo-600 font-bold">{dev.department}</span></p>
                <p><strong>Cargo:</strong> {dev.role}</p>
                <p><strong>Acesso:</strong> {dev.accessLevel}</p>
                <p><strong>Status:</strong> <span className={`font-bold ${dev.status === 'Ativo' ? 'text-emerald-600' : 'text-rose-600'}`}>{dev.status}</span></p>
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => handleOpenEdit(dev)}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteDev(dev.id)}
                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {devs.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-3xl bg-slate-50 text-slate-400 font-bold">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Nenhum membro corporativo cadastrado na Central SaaS.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Membro da Equipe SaaS">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="block font-bold">Nome Completo</label>
            <input
              required
              type="text"
              placeholder="Ex: Carlos Eduardo"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-2.5 border rounded-xl bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-bold">E-mail Corporativo</label>
            <input
              required
              type="email"
              placeholder="carlos@clinigestor.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-2.5 border rounded-xl bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold">Departamento</label>
              <select
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="Técnico (Dev)">Técnico (Dev)</option>
                <option value="Administrativo SaaS">Administrativo SaaS</option>
                <option value="Suporte / Comercial">Suporte / Comercial</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-bold">Cargo / Especialidade</label>
              <input
                required
                type="text"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition cursor-pointer"
          >
            Salvar Membro Corporativo
          </button>
        </form>
      </Modal>
    </div>
  );
}
