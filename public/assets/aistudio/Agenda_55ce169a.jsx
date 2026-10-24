import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, AlertTriangle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function Agenda({
  professionals = [],
  patients = [],
  appointments = [],
  onSaveAppointment,
  onDeleteAppointments,
  canManageAgenda
}) {
  const clinicalStaff = useMemo(() => professionals.filter(p => (p.group || 'corpo_clinico') === 'corpo_clinico'), [professionals]);
  
  const [selectedProfId, setSelectedProfId] = useState(clinicalStaff[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [bookingSlot, setBookingSlot] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState('Semanal');
  const [durationMode, setDurationMode] = useState('Determinado');
  const [sessionCount, setSessionCount] = useState(8);

  const [cancelTargetApt, setCancelTargetApt] = useState(null);

  const currentProf = clinicalStaff.find(p => p.id === selectedProfId) || clinicalStaff[0];

  const dayApts = useMemo(() => {
    return appointments.filter(a => a.professionalId === (currentProf?.id) && a.date === selectedDate);
  }, [appointments, currentProf, selectedDate]);

  const handleOpenBooking = (slot) => {
    setBookingSlot(slot);
    setSelectedPatientId('');
    setSelectedSpecialty(Array.isArray(currentProf?.specialties) ? currentProf.specialties[0] : '');
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return alert('Selecione um paciente cadastrado.');

    const conflict = appointments.find(a => 
      a.patientId === patient.id &&
      a.date === selectedDate &&
      a.time === bookingSlot &&
      a.professionalId !== currentProf.id
    );

    if (conflict) {
      alert(`⚠️ CONFLITO DE AGENDA DETECTADO!\n\nO paciente ${patient.fullName} já possui um agendamento marcado no dia ${selectedDate.split('-').reverse().join('/')} às ${bookingSlot} com o(a) profissional ${conflict.professionalName}.\n\nEscolha outro horário ou data para prosseguir.`);
      return;
    }

    const generatedApts = [];
    const numSessions = durationMode === 'Determinado' ? parseInt(sessionCount) : 26; 

    let currentDate = new Date(selectedDate + 'T00:00:00');

    for (let i = 0; i < numSessions; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      generatedApts.push({
        id: 'apt-' + Date.now() + '-' + i,
        patientId: patient.id,
        patientName: patient.fullName,
        professionalId: currentProf.id,
        professionalName: currentProf.name,
        specialty: selectedSpecialty,
        date: dateStr,
        time: bookingSlot,
        status: 'Agendado'
      });

      if (recurrenceInterval === 'Diária') currentDate.setDate(currentDate.getDate() + 1);
      else if (recurrenceInterval === 'Semanal') currentDate.setDate(currentDate.getDate() + 7);
      else if (recurrenceInterval === 'Mensal') currentDate.setMonth(currentDate.getMonth() + 1);
    }

    onSaveAppointment(generatedApts);
    setBookingSlot(null);
  };

  const handleCancelOption = (mode) => {
    if (!cancelTargetApt) return;
    if (mode === 'single') {
      onDeleteAppointments([cancelTargetApt.id]);
    } else {
      const idsToDelete = appointments
        .filter(a => a.patientId === cancelTargetApt.patientId && a.professionalId === cancelTargetApt.professionalId && a.date >= cancelTargetApt.date)
        .map(a => a.id);
      onDeleteAppointments(idsToDelete);
    }
    setCancelTargetApt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <select
            value={selectedProfId}
            onChange={(e) => setSelectedProfId(e.target.value)}
            className="p-2.5 border rounded-xl font-extrabold text-xs bg-slate-50 w-full sm:w-64"
          >
            {clinicalStaff.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({Array.isArray(p.specialties) ? p.specialties.join(', ') : p.specialty})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-xl text-xs font-bold bg-slate-50"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm p-4 space-y-3">
        <h3 className="font-extrabold text-slate-800 text-sm border-b pb-3">
          Agenda de {currentProf?.name} • {selectedDate.split('-').reverse().join('/')}
        </h3>

        <div className="grid grid-cols-1 divide-y">
          {TIME_SLOTS.map(slot => {
            const apt = dayApts.find(a => a.time === slot);
            return (
              <div key={slot} className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition">
                <div className="flex items-center space-x-4">
                  <span className="font-black text-slate-700 text-xs w-12">{slot}</span>
                  {apt ? (
                    <div>
                      <span className="font-extrabold text-emerald-900 text-xs block">{apt.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">{apt.specialty}</span>
                    </div>
                  ) : (
                    <span className="text-slate-300 font-medium text-xs italic">Horário Livre / Vago</span>
                  )}
                </div>

                {/* BLOQUEIO APLICADO AQUI: Somente equipe operacional consegue alterar */}
                {apt ? (
                  canManageAgenda && (
                    <button
                      onClick={() => setCancelTargetApt(apt)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[10px] border border-rose-200"
                    >
                      Desagendar
                    </button>
                  )
                ) : (
                  canManageAgenda ? (
                    <button
                      onClick={() => handleOpenBooking(slot)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agendar Paciente</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Livre</span>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Agendamento */}
      <Modal isOpen={!!bookingSlot} onClose={() => setBookingSlot(null)} title={`Agendar Paciente - Horário ${bookingSlot}`}>
        <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="font-bold block">Selecionar Paciente Cadastrado *</label>
            <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white">
              <option value="">-- Selecione o Paciente --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} (CPF: {p.cpfCnpj})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Especialidade do Atendimento *</label>
            <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white">
              {Array.isArray(currentProf?.specialties) ? (
                currentProf.specialties.map((s, i) => <option key={i} value={s}>{s}</option>)
              ) : (
                <option value={currentProf?.specialty}>{currentProf?.specialty}</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-3">
            <div className="space-y-1">
              <label className="font-bold block">Intervalo das Sessões *</label>
              <select value={recurrenceInterval} onChange={e => setRecurrenceInterval(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Diária">Diária</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Duração do Agendamento *</label>
              <select value={durationMode} onChange={e => setDurationMode(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Determinado">Quantidade Determinada</option>
                <option value="Indeterminado">Prazo Indeterminado</option>
              </select>
            </div>
          </div>

          {durationMode === 'Determinado' && (
            <div className="space-y-1">
              <label className="font-bold block">Número de Sessões *</label>
              <input type="number" min="1" max="52" value={sessionCount} onChange={e => setSessionCount(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setBookingSlot(null)} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Confirmar Agendamento</button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal isOpen={!!cancelTargetApt} onClose={() => setCancelTargetApt(null)} title="Remover Agendamento da Agenda">
        {cancelTargetApt && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <p className="leading-relaxed">
              O paciente <strong>{cancelTargetApt.patientName}</strong> possui sessões agendadas na agenda de {cancelTargetApt.professionalName}.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              O paciente permanecerá cadastrado no sistema. Escolha como deseja proceder com os horários:
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleCancelOption('single')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border text-center"
              >
                Desagendar APENAS a sessão do dia {cancelTargetApt.date.split('-').reverse().join('/')}
              </button>
              <button
                onClick={() => handleCancelOption('all')}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center shadow-md shadow-rose-600/20"
              >
                Desagendar ESTA e TODAS as sessões futuras
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}