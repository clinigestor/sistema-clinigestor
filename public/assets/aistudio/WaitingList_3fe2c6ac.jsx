import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Clock, Calendar, BellRing } from 'lucide-react';
import Modal from './Modal';

const SPECIALTIES_LIST = [
  'Psicologia', 'Psicopedagogia', 'Fonoaudiologia', 'Neuropsicologia', 
  'Terapeuta-Ocupacional', 'Psicomotricista', 'Nutricionista', 'Terapia de Casal', 'Sexologia'
];

const DAYS_OF_WEEK = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export default function WaitingList({ waitingList = [], onSaveItem, onDeleteItem, onToggleHighlight }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    specialties: [],
    preferredDays: [],
    preferredTime: ''
  });

  const handleToggleArrayItem = (field, item) => {
    setFormData(prev => {
      const exists = prev[field].includes(item);
      if (exists) {
        return { ...prev, [field]: prev[field].filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...prev[field], item] };
      }
    });
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', cpf: '', birthDate: '', specialties: [], preferredDays: [], preferredTime: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      cpf: item.cpf || '',
      birthDate: item.birthDate || '',
      specialties: item.specialties || [],
      preferredDays: item.preferredDays || [],
      preferredTime: item.preferredTime || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveItem({
      id: editingId || ('wl-' + Date.now()),
      ...formData,
      highlighted: editingId ? (waitingList.find(w => w.id === editingId)?.highlighted || false) : false
    });
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Lista de Espera & Captação</h2>
          <p className="text-[10px] text-slate-400">Pacientes aguardando disponibilidade de horário na agenda.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition">
          <Plus className="w-4 h-4" />
          <span>Cadastrar na Fila</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Paciente</th>
              <th className="p-4">Especialidade(s) Desejada(s)</th>
              <th className="p-4">Disponibilidade (Dias / Horários)</th>
              <th className="p-4 text-center">Avisar Recepção</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {waitingList.map(item => (
              <tr key={item.id} className={`hover:bg-slate-50 transition ${item.highlighted ? 'bg-amber-50/50' : ''}`}>
                <td className="p-4">
                  <span className="font-extrabold text-slate-900 block">{item.name}</span>
                  <span className="text-[10px] text-slate-400">CPF: {item.cpf}</span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-slate-700">
                    {item.specialties?.length > 0 ? item.specialties.join(', ') : 'Qualquer'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1 font-bold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.preferredDays?.join(', ') || 'Qualquer dia'}</span>
                  </div>
                  <div className="flex items-center space-x-1 font-bold text-slate-600 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.preferredTime || 'Qualquer horário'}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onToggleHighlight(item.id)}
                    className={`px-3 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 transition ${
                      item.highlighted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>{item.highlighted ? 'Vaga Notificada' : 'Surgiu Vaga'}</span>
                  </button>
                </td>
                <td className="p-4 text-center space-x-1">
                  <button onClick={() => handleOpenEdit(item)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition" title="Editar Interesse">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteItem(item.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition" title="Excluir / Desistiu">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {waitingList.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">Nenhum paciente na lista de espera no momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Interesse - Lista de Espera" : "Cadastrar na Lista de Espera"} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Nome Completo *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">CPF *</label>
              <input required type="text" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="w-full p-2.5 border rounded-xl" placeholder="000.000.000-00" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Data de Nascimento *</label>
            <input required type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full sm:w-1/2 p-2.5 border rounded-xl" />
          </div>

          <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
            <div>
              <label className="font-extrabold block text-slate-900">Especialidade(s) de Interesse (Pode marcar mais de uma) *</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPECIALTIES_LIST.map(spec => {
                const isChecked = formData.specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleArrayItem('specialties', spec)}
                    className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center justify-between ${
                      isChecked ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <span>{spec}</span>
                    {isChecked && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-4">
            <div>
              <label className="font-extrabold block text-amber-900">Dias de Preferência *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {DAYS_OF_WEEK.map(day => {
                  const isChecked = formData.preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleArrayItem('preferredDays', day)}
                      className={`p-2 rounded-xl text-center border text-[11px] font-bold transition ${
                        isChecked ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <label className="font-extrabold block text-amber-900">Horário de Preferência *</label>
              <input required type="text" value={formData.preferredTime} onChange={e => setFormData({ ...formData, preferredTime: e.target.value })} className="w-full p-2.5 border rounded-xl" placeholder="Ex: Período da manhã, Após as 18h, ou 14:00 às 15:00" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">{editingId ? "Atualizar Registo" : "Salvar na Lista de Espera"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}