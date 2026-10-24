import React, { useState } from 'react';
import { Clock, FileText, Target, User as UserIcon, Search, Activity } from 'lucide-react';
import { Patient, TherapeuticPlanItem, User, Appointment } from '../types';
import { formatCpfCnpj } from '../utils/helpers';

interface ClinicalHistoryProps {
  patients: Patient[];
  plans?: TherapeuticPlanItem[];
  currentUser?: User | null;
  appointments?: Appointment[];
}

export default function ClinicalHistory({ patients = [], plans = [], currentUser = null, appointments = [] }: ClinicalHistoryProps) {
  const isClinical = currentUser?.group === 'corpo_clinico' || currentUser?.role === 'professional';
  const scopedPatients = isClinical && appointments
    ? patients.filter(p => appointments.some(a => a.professionalId === currentUser?.id && a.patientId === p.id))
    : patients;

  const [selectedPatientId, setSelectedPatientId] = useState<string>(scopedPatients[0]?.id || patients[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = scopedPatients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpfCnpj.includes(searchTerm)
  );

  const patient = patients.find(p => p.id === selectedPatientId);

  const getTimeline = () => {
    if (!selectedPatientId || !patient) return [];
    
    const events: Array<{ id: string; type: string; date: string; title: string; desc: string }> = [];

    if (patient.hasAnamnesis) {
      events.push({
        id: 'ev-anamnesis',
        type: 'Anamnese',
        date: patient.createdAt ? patient.createdAt.split('T')[0] : '2026-01-01',
        title: 'Entrevista de Admissão (Anamnese)',
        desc: 'Avaliação clínica inicial concluída pelo profissional responsável.'
      });
    }

    (plans || []).filter((p: TherapeuticPlanItem) => p.patientId === selectedPatientId).forEach((p: TherapeuticPlanItem) => {
      events.push({
        id: p.id,
        type: 'Plano Terapêutico (PTI)',
        date: p.date,
        title: `Plano Terapêutico • Status: ${p.status}`,
        desc: `Queixa: ${p.complaint} | Metas: ${p.shortTermGoals}`
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = getTimeline();

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6">
      {/* Coluna Esquerda: Busca de Paciente */}
      <div className="w-full md:w-1/3 bg-white border rounded-3xl p-5 flex flex-col shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-sm mb-1">Histórico Clínico • Pacientes</h3>
        <p className="text-[10px] text-slate-400 mb-4">
          {isClinical ? 'Exibindo apenas os seus pacientes atribuídos (inclui transferências e novas especialidades).' : 'Exibindo todos os pacientes da clínica.'}
        </p>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredPatients.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer ${
                selectedPatientId === p.id
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <span className="font-bold text-slate-900 text-xs block">{p.fullName}</span>
              <span className="text-[10px] text-slate-500 font-mono">CPF: {formatCpfCnpj(p.cpfCnpj)}</span>
            </button>
          ))}
          {filteredPatients.length === 0 && (
            <p className="text-center text-slate-400 text-xs py-6">Nenhum paciente encontrado para este profissional.</p>
          )}
        </div>
      </div>

      {/* Coluna Direita: Linha do Tempo */}
      <div className="w-full md:w-2/3 bg-white border rounded-3xl p-6 shadow-sm overflow-y-auto custom-scrollbar">
        {!patient ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Clock className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-bold text-sm">Selecione um paciente para ver o Histórico Clínico</p>
          </div>
        ) : (
          <div>
            <div className="border-b pb-4 mb-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-lg">
                {patient.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">{patient.fullName}</h2>
                <p className="text-xs font-bold text-slate-500 font-mono">CPF: {formatCpfCnpj(patient.cpfCnpj)} • Linha do Tempo Unificada</p>
              </div>
            </div>

            {timelineEvents.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 text-center py-12">
                Nenhum evento registrado ainda no prontuário deste paciente (anamnese ou plano terapêutico).
              </p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-6">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <div className="bg-slate-50 border rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-extrabold text-sm text-slate-800">{evt.title}</h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border">
                          {evt.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
