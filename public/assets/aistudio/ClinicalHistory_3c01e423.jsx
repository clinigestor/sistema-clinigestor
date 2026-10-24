import React, { useState } from 'react';
import { Activity, Clock, FileText, Target, User, Search, Stethoscope } from 'lucide-react';

export default function ClinicalHistory({ patients = [], evolutions = [], anamneses = [], plans = [], professionals = [] }) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const patient = patients.find(p => p.id === selectedPatientId);

  // Reúne todos os eventos clínicos numa única "Linha do Tempo"
  const getTimeline = () => {
    if (!selectedPatientId) return [];
    
    const events = [];
    
    anamneses.filter(a => a.patientId === selectedPatientId).forEach(a => {
      events.push({ id: a.id, type: 'Anamnese', date: a.date, icon: <FileText className="w-4 h-4 text-blue-600" />, color: 'bg-blue-100', title: 'Avaliação Inicial (Anamnese)', desc: 'Entrevista de admissão realizada.' });
    });

    plans.filter(p => p.patientId === selectedPatientId).forEach(p => {
      events.push({ id: p.id, type: 'Plano Terapêutico', date: p.date, icon: <Target className="w-4 h-4 text-indigo-600" />, color: 'bg-indigo-100', title: `PTI ${p.status}`, desc: `Queixa: ${p.complaint}` });
    });

    evolutions.filter(e => e.patientId === selectedPatientId).forEach(e => {
      events.push({ id: e.id, type: 'Evolução SOAP', date: e.date, icon: <Activity className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-100', title: `Evolução Clínica`, desc: `Subjetivo: ${e.subjective?.substring(0, 50)}...` });
    });

    // Ordenar da mais recente para a mais antiga
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const timelineEvents = getTimeline();

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Coluna Esquerda: Busca de Paciente */}
      <div className="w-1/3 bg-white border rounded-3xl p-5 flex flex-col shadow-sm">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4">Selecione o Paciente</h3>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input type="text" placeholder="Buscar paciente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredPatients.map(p => (
            <button key={p.id} onClick={() => setSelectedPatientId(p.id)} className={`w-full text-left p-3 rounded-xl border transition ${selectedPatientId === p.id ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100' : 'bg-white hover:bg-slate-50'}`}>
              <span className="font-bold text-slate-900 text-xs block">{p.name}</span>
              <span className="text-[10px] text-slate-500">CPF: {p.cpf}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Linha do Tempo do Paciente */}
      <div className="w-2/3 bg-white border rounded-3xl p-6 shadow-sm overflow-y-auto">
        {!selectedPatientId ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Clock className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-bold">Selecione um paciente para ver o Histórico Clínico</p>
          </div>
        ) : (
          <div>
            <div className="border-b pb-4 mb-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User className="w-6 h-6" /></div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{patient?.name}</h2>
                <p className="text-xs font-bold text-slate-500">Prontuário Unificado e Linha do Tempo</p>
              </div>
            </div>

            {timelineEvents.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 text-center py-10">Nenhum registro clínico encontrado para este paciente.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-10">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white ${evt.color} flex items-center justify-center shadow-sm`}>
                      {evt.icon}
                    </div>
                    <div className="bg-slate-50 border rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-sm text-slate-800">{evt.title}</h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border">{evt.date.split('-').reverse().join('/')}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{evt.desc}</p>
                      <span className="inline-block mt-3 text-[9px] font-black uppercase text-slate-400 bg-white border px-2 py-0.5 rounded">Módulo: {evt.type}</span>
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