import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Clock, BellRing, Search, ListOrdered, Phone } from 'lucide-react';
import { WaitingListItem } from '../types';
import { formatCpf, cleanCpf, formatPhone } from '../utils/helpers';
import Modal from './Modal';

const SPECIALTIES_LIST = [
  'Psicologia', 'Psicopedagogia', 'Fonoaudiologia', 'Neuropsicologia', 
  'Terapeuta-Ocupacional', 'Psicomotricista', 'Nutricionista', 'Terapia de Casal', 'Sexologia'
];

const DAYS_OF_WEEK = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
];

interface WaitingListProps {
  waitingList: WaitingListItem[];
  clinicId: string;
  onSaveItem: (item: WaitingListItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleHighlight: (id: string) => void;
}

export default function WaitingList({
  waitingList = [],
  clinicId,
  onSaveItem,
  onDeleteItem,
  onToggleHighlight
}: WaitingListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    isWhatsapp: true,
    specialties: [] as string[],
    preferredDays: [] as string[],
    preferredTime: ''
  });

  const handleToggleArrayItem = (field: 'specialties' | 'preferredDays', item: string) => {
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
    setFormData({ name: '', cpf: '', birthDate: '', phone: '', isWhatsapp: true, specialties: [], preferredDays: [], preferredTime: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WaitingListItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      cpf: formatCpf(item.cpf || ''),
      birthDate: item.birthDate || '',
      phone: formatPhone(item.phone || ''),
      isWhatsapp: item.isWhatsapp !== false,
      specialties: item.specialties || [],
      preferredDays: item.preferredDays || [],
      preferredTime: item.preferredTime || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveItem({
      id: editingId || ('wl-' + Date.now()),
      clinicId: clinicId,
      name: formData.name,
      cpf: cleanCpf(formData.cpf),
      birthDate: formData.birthDate,
      phone: formData.phone,
      isWhatsapp: formData.isWhatsapp,
      specialties: formData.specialties,
      preferredDays: formData.preferredDays,
      preferredTime: formData.preferredTime,
      highlighted: editingId ? (waitingList.find(w => w.id === editingId)?.highlighted || false) : false,
      createdAt: new Date().toISOString()
    });
    setIsModalOpen(false);
    setEditingId(null);
  };

  const getWhatsappLink = (phone: string, name: string) => {
    const cleanNum = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá ${name}! Entramos em contato do CliniGestor para informar que surgiu uma vaga/horário que corresponde ao seu interesse. Podemos agendar?`);
    return `https://wa.me/55${cleanNum}?text=${text}`;
  };

  const filtered = waitingList.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.cpf.includes(cleanCpf(searchTerm)) ||
    (w.phone && w.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-amber-500" />
            <span>Lista de Espera & Captação</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pacientes aguardando horários livres ou novas turmas terapêuticas, com telefone de contato para avisar sobre vagas.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar na Fila</span>
        </button>
      </div>

      {waitingList.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por paciente, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Paciente & Contato</th>
              <th className="p-4">Especialidade(s) Desejada(s)</th>
              <th className="p-4">Disponibilidade (Dias / Horários)</th>
              <th className="p-4 text-center">Contato p/ Vaga</th>
              <th className="p-4 text-center">Avisar Recepção</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(item => (
              <tr key={item.id} className={`hover:bg-slate-50 transition ${item.highlighted ? 'bg-amber-50/60' : ''}`}>
                <td className="p-4">
                  <span className="font-extrabold text-slate-900 block">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">CPF: {formatCpf(item.cpf)}</span>
                  {item.phone ? (
                    <span className="text-[11px] font-bold text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{item.phone}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-bold italic">Sem telefone cadastrado</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="font-bold text-slate-700">
                    {item.specialties?.length > 0 ? item.specialties.join(', ') : 'Qualquer especialidade'}
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
                  {item.phone ? (
                    <a
                      href={getWhatsappLink(item.phone, item.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] inline-flex items-center space-x-1 shadow-sm transition"
                      title="Entrar em contato via WhatsApp para falar sobre a vaga"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chamar p/ Vaga</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Cadastre o telefone</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onToggleHighlight(item.id)}
                    className={`px-3 py-1.5 font-bold rounded-xl text-[10px] inline-flex items-center space-x-1 transition cursor-pointer ${
                      item.highlighted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>{item.highlighted ? 'Vaga Notificada' : 'Surgiu Vaga'}</span>
                  </button>
                </td>
                <td className="p-4 text-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition cursor-pointer"
                    title="Editar Interesse"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                    title="Excluir da Lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                  Nenhum paciente na lista de espera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Lista de Espera" : "Cadastrar na Fila de Espera"} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Nome Completo *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
                placeholder="Ex: Maria Souza"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">CPF *</label>
              <input
                required
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({ ...formData, cpf: formatCpf(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-white font-mono"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Telefone de Contato / WhatsApp *</label>
              <div className="flex items-center space-x-2">
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                  placeholder="(00) 00000-0000"
                />
                <label className="flex items-center space-x-1 shrink-0 text-[10px] font-extrabold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isWhatsapp}
                    onChange={e => setFormData({ ...formData, isWhatsapp: e.target.checked })}
                    className="rounded"
                  />
                  <span>WhatsApp</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
            <label className="font-extrabold block text-slate-900">Especialidade(s) de Interesse</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPECIALTIES_LIST.map(spec => {
                const isChecked = formData.specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleArrayItem('specialties', spec)}
                    className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
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

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
            <label className="font-extrabold block text-amber-900">Dias de Preferência</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isChecked = formData.preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleArrayItem('preferredDays', day)}
                    className={`p-2 rounded-xl text-center border text-[11px] font-bold transition cursor-pointer ${
                      isChecked ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 pt-2">
              <label className="font-extrabold block text-amber-900">Horário de Preferência</label>
              <input
                type="text"
                value={formData.preferredTime}
                onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
                placeholder="Ex: Manhã, ou após as 17:00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition cursor-pointer"
            >
              {editingId ? "Atualizar Registro" : "Salvar na Lista"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
