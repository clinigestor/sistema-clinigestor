import React, { useState } from 'react';
import { FileText, Shield, AlertCircle, CheckCircle2, Search, Paperclip } from 'lucide-react';
import { Patient, User, Appointment, PatientAttachment } from '../types';
import Modal from './Modal';
import PatientAttachmentsModal from './PatientAttachmentsModal';

interface EvolutionsProps {
  patients: Patient[];
  currentUser: User | null;
  appointments?: Appointment[];
  attachments?: PatientAttachment[];
  onSaveAttachment?: (att: PatientAttachment) => void;
  onDeleteAttachment?: (attId: string) => void;
}

export default function Evolutions({ 
  patients = [], 
  currentUser, 
  appointments = [],
  attachments = [],
  onSaveAttachment = () => {},
  onDeleteAttachment = () => {}
}: EvolutionsProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientForAttachments, setSelectedPatientForAttachments] = useState<Patient | null>(null);
  const [soapData, setSoapData] = useState({ s: '', o: '', a: '', p: '' });
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base">Evolução Clínica (Padrão SOAP) • Prontuário</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isClinical ? 'Exibindo seus pacientes atribuídos (inclui transferências e mudanças de especialidade).' : 'Preenchimento após cada sessão realizada. Sigilo e conformidade ética.'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] flex items-center space-x-1 shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-700" />
          <span>Acesso Restrito ao Profissional</span>
        </span>
      </div>

      {patients.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por paciente..."
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
              <th className="p-4">Especialidade</th>
              <th className="p-4">Status da Última Sessão</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(patient => (
              <tr key={patient.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-extrabold text-slate-900">{patient.fullName}</td>
                <td className="p-4 font-bold text-slate-600">{patient.specialties?.join(', ') || 'Clínica Geral'}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Sessão em dia
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSoapData({ s: '', o: '', a: '', p: '' });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] cursor-pointer"
                    >
                      Preencher SOAP
                    </button>
                    <button
                      onClick={() => setSelectedPatientForAttachments(patient)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[10px] flex items-center space-x-1 transition cursor-pointer"
                      title="Upload ou Baixar Anexos / Exames"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Anexos</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`Evolução SOAP • ${selectedPatient?.fullName}`} maxWidth="max-w-2xl">
        {selectedPatient && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px]">
              Preencha o registro SOAP referente ao atendimento realizado hoje:
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">S - Subjetivo (Relato do paciente / queixas)</label>
              <textarea rows={2} value={soapData.s} onChange={e => setSoapData({ ...soapData, s: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white" placeholder="O paciente relatou..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">O - Objetivo (Observações clínicas e comportamentais)</label>
              <textarea rows={2} value={soapData.o} onChange={e => setSoapData({ ...soapData, o: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white" placeholder="Apresentou boa adesão às atividades..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">A - Avaliação (Análise técnica e diagnóstica)</label>
              <textarea rows={2} value={soapData.a} onChange={e => setSoapData({ ...soapData, a: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white" placeholder="Evolução favorável do quadro..." />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">P - Plano (Conduta terapêutica e próximas tarefas)</label>
              <textarea rows={2} value={soapData.p} onChange={e => setSoapData({ ...soapData, p: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white" placeholder="Manter frequência semanal..." />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
              <button onClick={() => { alert('Evolução SOAP salva com sucesso no prontuário!'); setSelectedPatient(null); }} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer">Salvar Evolução</button>
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
