import React, { useState } from 'react';
import { FileCheck, AlertCircle, Upload, Plus } from 'lucide-react';
import Modal from './Modal';

export default function Anamnesis({ patients = [], professionals = [], currentUser }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [anamnesisText, setAnamnesisText] = useState('');

  const isOperational = ['superadmin', 'clinic_admin', 'equipe_operacional'].includes(currentUser.group) || currentUser.role === 'superadmin';

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border shadow-sm">
        <h2 className="font-extrabold text-slate-800 text-sm">Anamneses & Avaliações Clínicas</h2>
        <p className="text-[10px] text-slate-400">Pacientes sem anamneses preenchidas aparecem em destaque.</p>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Paciente</th>
              <th className="p-4">Especialidades</th>
              <th className="p-4">Status da Anamnese</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map(patient => {
              const hasAnamnesis = patient.hasAnamnesis || false;
              return (
                <tr key={patient.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-extrabold text-slate-900">{patient.fullName}</td>
                  <td className="p-4 font-bold text-slate-600">{patient.specialties?.join(', ') || 'Geral'}</td>
                  <td className="p-4">
                    {hasAnamnesis ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Preenchida</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] animate-pulse flex items-center space-x-1 w-max">
                        <AlertCircle className="w-3 h-3" />
                        <span>Pendente / Sem Anamnese</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedPatient(patient)} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[10px]">
                      {hasAnamnesis ? 'Ver / Editar' : 'Preencher Anamnese'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`Anamnese • ${selectedPatient?.fullName}`}>
        {selectedPatient && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="font-bold block">Histórico de Desenvolvimento & Queixa Principal *</label>
              <textarea rows="6" value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Insira os dados da anamnese ou histórico clínico..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Ou Anexar Documento PDF/Scan</label>
              <input type="file" className="w-full p-2 border rounded-xl bg-slate-50 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={() => { alert('Anamnese salva com sucesso!'); setSelectedPatient(null); }} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Salvar Anamnese</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}