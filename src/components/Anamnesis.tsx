import React, { useState } from 'react';
import { AlertCircle, FileCheck, Plus, Search, Paperclip } from 'lucide-react';
import { Patient, User, Appointment, PatientAttachment } from '../types';
import Modal from './Modal';
import PatientAttachmentsModal from './PatientAttachmentsModal';

interface AnamnesisProps {
  patients: Patient[];
  currentUser: User | null;
  appointments?: Appointment[];
  onUpdatePatientAnamnesis: (patientId: string, hasAnamnesis: boolean, anamnesisNotes?: string) => void;
  attachments?: PatientAttachment[];
  onSaveAttachment?: (att: PatientAttachment) => void;
  onDeleteAttachment?: (attId: string) => void;
}

export default function Anamnesis({ 
  patients = [], 
  currentUser, 
  appointments = [], 
  onUpdatePatientAnamnesis,
  attachments = [],
  onSaveAttachment = () => {},
  onDeleteAttachment = () => {}
}: AnamnesisProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientForAttachments, setSelectedPatientForAttachments] = useState<Patient | null>(null);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = (p: Patient) => {
    setSelectedPatient(p);
    setAnamnesisText('');
  };

  const handleSave = () => {
    if (!selectedPatient) return;
    onUpdatePatientAnamnesis(selectedPatient.id, true, anamnesisText);
    alert('Anamnese salva com sucesso!');
    setSelectedPatient(null);
  };

  const isClinical = currentUser?.group === 'corpo_clinico' || currentUser?.role === 'professional';
  const scopedPatients = isClinical && appointments
    ? patients.filter(p => appointments.some(a => a.professionalId === currentUser?.id && a.patientId === p.id))
    : patients;

  const filtered = scopedPatients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpfCnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base">Anamneses & Avaliações Clínicas Iniciais</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isClinical ? 'Exibindo seus pacientes atribuídos (inclui transferências e mudanças de especialidade).' : 'Pacientes sem anamnese preenchida aparecem com indicador de pendência.'}
          </p>
        </div>
      </div>

      {patients.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por paciente ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

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
            {filtered.map(patient => {
              const hasAnamnesis = patient.hasAnamnesis || false;
              return (
                <tr key={patient.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-extrabold text-slate-900">{patient.fullName}</td>
                  <td className="p-4 font-bold text-slate-600">{patient.specialties?.join(', ') || 'Geral'}</td>
                  <td className="p-4">
                    {hasAnamnesis ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Preenchida</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center space-x-1 w-max">
                        <AlertCircle className="w-3 h-3" />
                        <span>Pendente / Sem Anamnese</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpen(patient)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition cursor-pointer"
                      >
                        {hasAnamnesis ? 'Ver / Editar' : 'Preencher Anamnese'}
                      </button>
                      <button
                        onClick={() => setSelectedPatientForAttachments(patient)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[10px] flex items-center space-x-1 transition cursor-pointer"
                        title="Fazer Upload ou Baixar Anexos / Exames"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Anexos</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                  Nenhum paciente atribuído encontrado para este profissional.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`Anamnese • ${selectedPatient?.fullName}`}>
        {selectedPatient && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="font-bold block">Histórico de Desenvolvimento & Queixa Principal *</label>
              <textarea
                rows={6}
                value={anamnesisText}
                onChange={e => setAnamnesisText(e.target.value)}
                className="w-full p-3 border rounded-xl bg-white"
                placeholder="Insira os dados da anamnese, marcos do desenvolvimento, queixa principal e histórico familiar..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 border rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
              >
                Salvar Anamnese
              </button>
            </div>
          </div>
        )}
      </Modal>

      <PatientAttachmentsModal
        isOpen={!!selectedPatientForAttachments}
        onClose={() => setSelectedPatientForAttachments(null)}
        patient={selectedPatientForAttachments}
        attachments={attachments}
        onSaveAttachment={onSaveAttachment}
        onDeleteAttachment={onDeleteAttachment}
      />
    </div>
  );
}
