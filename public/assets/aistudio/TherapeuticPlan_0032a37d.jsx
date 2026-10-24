import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function TherapeuticPlan({ plans = [], patients = [], professionals = [], currentUser, onSavePlan, onDeletePlan }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    professionalId: currentUser?.id || '',
    complaint: '',
    shortTermGoals: '',
    longTermGoals: '',
    strategies: '',
    reevaluationDate: '',
    status: 'Ativo'
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ patientId: '', professionalId: currentUser?.id || '', complaint: '', shortTermGoals: '', longTermGoals: '', strategies: '', reevaluationDate: '', status: 'Ativo' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingId(plan.id);
    setFormData({ ...plan });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePlan({ id: editingId || ('pti-' + Date.now()), date: new Date().toISOString().split('T')[0], ...formData });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600" /> Planos Terapêuticos (PTI)</h2>
          <p className="text-[10px] text-slate-400">Defina metas, estratégias e acompanhe o progresso do tratamento.</p>
        </div>
        <button onClick={handleOpenNew} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Novo PTI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => {
          const patient = patients.find(p => p.id === plan.patientId);
          const prof = professionals.find(p => p.id === plan.professionalId);
          return (
            <div key={plan.id} className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm">{patient?.name || 'Paciente Desconhecido'}</span>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Responsável: {prof?.name || 'Profissional'}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${plan.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{plan.status}</span>
              </div>
              
              <div className="text-xs space-y-2 flex-1 text-slate-600">
                <p><strong>Queixa/Diagnóstico:</strong> {plan.complaint}</p>
                <p><strong>Metas a Curto Prazo:</strong> {plan.shortTermGoals}</p>
                <p><strong>Reavaliação:</strong> {plan.reevaluationDate ? plan.reevaluationDate.split('-').reverse().join('/') : 'Não definida'}</p>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button onClick={() => handleOpenEdit(plan)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDeletePlan(plan.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Plano Terapêutico Individual (PTI)" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Paciente *</label>
              <select required value={formData.patientId} onChange={e => setFormData({ ...formData, patientId: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="">Selecione o Paciente</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Data Prevista de Reavaliação</label>
              <input type="date" value={formData.reevaluationDate} onChange={e => setFormData({ ...formData, reevaluationDate: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="font-bold block text-indigo-900">1. Queixa Principal / Hipótese Diagnóstica *</label>
            <textarea required value={formData.complaint} onChange={e => setFormData({ ...formData, complaint: e.target.value })} className="w-full p-3 border rounded-xl" rows="2" placeholder="Ex: Atraso de fala, Dificuldade de concentração..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block text-indigo-900">2. Objetivos a Curto Prazo *</label>
              <textarea required value={formData.shortTermGoals} onChange={e => setFormData({ ...formData, shortTermGoals: e.target.value })} className="w-full p-3 border rounded-xl" rows="3" placeholder="O que esperamos nos próximos meses?"></textarea>
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-indigo-900">3. Objetivos a Longo Prazo *</label>
              <textarea required value={formData.longTermGoals} onChange={e => setFormData({ ...formData, longTermGoals: e.target.value })} className="w-full p-3 border rounded-xl" rows="3" placeholder="Onde queremos chegar no final da intervenção?"></textarea>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block text-indigo-900">4. Estratégias / Intervenções Clínicas *</label>
            <textarea required value={formData.strategies} onChange={e => setFormData({ ...formData, strategies: e.target.value })} className="w-full p-3 border rounded-xl" rows="3" placeholder="Quais ferramentas e técnicas serão utilizadas nas sessões?"></textarea>
          </div>

          <div className="space-y-1 w-1/3">
            <label className="font-bold block">Status do Plano</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
              <option value="Ativo">Ativo (Em andamento)</option>
              <option value="Concluído">Concluído (Alta)</option>
              <option value="Suspenso">Suspenso</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Salvar Plano</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}