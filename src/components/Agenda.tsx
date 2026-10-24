import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, AlertTriangle, Plus, Trash2, CheckCircle2, Award, Timer } from 'lucide-react';
import { Appointment, Patient, User as UserType } from '../types';
import Modal from './Modal';

// Horários de 30 em 30 minutos (08:00 às 19:30)
const SLOTS_30_MIN = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

// Horários de 50 em 50 minutos (Blocos clínicos de 50 min)
const SLOTS_50_MIN = [
  '08:00', '08:50', '09:40', '10:30', '11:20', '12:10',
  '13:00', '13:50', '14:40', '15:30', '16:20', '17:10', '18:00', '18:50'
];

interface AgendaProps {
  professionals: UserType[];
  patients: Patient[];
  appointments: Appointment[];
  clinicId: string;
  onSaveAppointment: (appointments: Appointment[]) => void;
  onDeleteAppointments: (appointmentIds: string[]) => void;
  canManageAgenda?: boolean;
  currentUser?: UserType | null;
}

export default function Agenda({
  professionals = [],
  patients = [],
  appointments = [],
  clinicId,
  onSaveAppointment,
  onDeleteAppointments,
  canManageAgenda = true,
  currentUser = null
}: AgendaProps) {
  // Filtra apenas membros do corpo clínico
  const clinicalStaff = useMemo(() => 
    professionals.filter(p => (p.group || 'corpo_clinico') === 'corpo_clinico'), 
    [professionals]
  );
  
  const isClinicAdminOrSuper = currentUser?.role === 'clinic_admin' || currentUser?.role === 'superadmin';
  const isOperational = currentUser?.group === 'operacional';
  const canAccessGeneralAgenda = isClinicAdminOrSuper || isOperational || (currentUser?.permissions?.canAccessAppointments !== false);
  const canAccessMyAgenda = currentUser?.permissions?.canAccessMyAgenda !== false;

  const mustLockToSelf = !canAccessGeneralAgenda && canAccessMyAgenda;

  const [selectedProfId, setSelectedProfId] = useState(
    mustLockToSelf && currentUser ? currentUser.id : (clinicalStaff[0]?.id || '')
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modo de intervalo da grade: '30' ou '50' minutos
  const [intervalMode, setIntervalMode] = useState<'30' | '50'>('50');

  // Booking modal
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sessionDuration, setSessionDuration] = useState<'30' | '50'>('50');
  const [recurrenceInterval, setRecurrenceInterval] = useState('Semanal');
  const [durationMode, setDurationMode] = useState('Determinado');
  const [sessionCount, setSessionCount] = useState<number | string>(8);

  const [cancelTargetApt, setCancelTargetApt] = useState<Appointment | null>(null);

  const currentProf = clinicalStaff.find(p => p.id === selectedProfId) || clinicalStaff[0];

  // Resgata todas as especialidades para as quais este profissional está habilitado
  const currentProfSpecialties = useMemo(() => {
    if (!currentProf) return ['Clínica Geral'];
    if (Array.isArray(currentProf.specialties) && currentProf.specialties.length > 0) {
      return currentProf.specialties;
    }
    if (currentProf.specialty) return [currentProf.specialty];
    if (currentProf.role) return currentProf.role.split(',').map(s => s.trim());
    return ['Clínica Geral'];
  }, [currentProf]);

  // Agendamentos do dia do profissional selecionado
  const dayApts = useMemo(() => {
    return appointments.filter(a => a.professionalId === (currentProf?.id) && a.date === selectedDate);
  }, [appointments, currentProf, selectedDate]);

  // Gera lista unificada de horários com base no modo selecionado, incluindo qualquer agendamento já existente
  const activeTimeSlots = useMemo(() => {
    const baseSlots = intervalMode === '30' ? SLOTS_30_MIN : SLOTS_50_MIN;
    const existingTimes = dayApts.map(a => a.time);
    const combined = Array.from(new Set([...baseSlots, ...existingTimes]));
    return combined.sort();
  }, [intervalMode, dayApts]);

  const handleOpenBooking = (slot: string) => {
    setBookingSlot(slot);
    setSelectedPatientId('');
    setSelectedSpecialty(currentProfSpecialties[0] || 'Psicologia');
    setSessionDuration(intervalMode);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return alert('Selecione um paciente cadastrado.');

    const conflict = appointments.find(a => 
      a.patientId === patient.id &&
      a.date === selectedDate &&
      a.time === bookingSlot &&
      a.professionalId !== currentProf?.id
    );

    if (conflict) {
      alert(`CONFLITO DE AGENDA DETECTADO!\n\nO paciente ${patient.fullName} já possui um agendamento marcado no dia ${selectedDate.split('-').reverse().join('/')} às ${bookingSlot} com o(a) profissional ${conflict.professionalName}.\n\nEscolha outro horário ou data para prosseguir.`);
      return;
    }

    const generatedApts: Appointment[] = [];
    let numSessions = 1;
    if (durationMode === 'Determinado') {
      numSessions = parseInt(sessionCount as string) || 1;
    } else {
      // Prazo Indeterminado: cobertura contínua de 1 ano
      if (recurrenceInterval === 'Diária') numSessions = 365;
      else if (recurrenceInterval === 'Semanal') numSessions = 52;
      else if (recurrenceInterval === 'Mensal') numSessions = 12;
      else numSessions = 52;
    }

    let currentDate = new Date(selectedDate + 'T00:00:00');

    for (let i = 0; i < numSessions; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      generatedApts.push({
        id: 'apt-' + Date.now() + '-' + i,
        clinicId: clinicId,
        patientId: patient.id,
        patientName: patient.fullName,
        professionalId: currentProf?.id || 'prof-0',
        professionalName: currentProf?.name || 'Profissional',
        specialty: selectedSpecialty,
        date: dateStr,
        time: bookingSlot || '08:00',
        status: 'Agendado',
        attendanceType: patient.attendanceType || 'Presencial'
      });

      if (recurrenceInterval === 'Diária') currentDate.setDate(currentDate.getDate() + 1);
      else if (recurrenceInterval === 'Semanal') currentDate.setDate(currentDate.getDate() + 7);
      else if (recurrenceInterval === 'Mensal') currentDate.setMonth(currentDate.getMonth() + 1);
    }

    onSaveAppointment(generatedApts);
    setBookingSlot(null);
  };

  const handleCancelOption = (mode: 'single' | 'all') => {
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

  // Calcula o horário final estimado com base no tempo de início e duração
  const getSlotEndTime = (startStr: string, minutes: number) => {
    const [h, m] = startStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros & Controles */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        
        {/* Seleção de Profissional */}
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="w-full sm:w-auto">
            {mustLockToSelf ? (
              <div className="p-2.5 border rounded-xl font-extrabold text-xs bg-slate-100 text-slate-800 w-full sm:w-80 flex items-center justify-between">
                <span>{currentUser?.name || 'Profissional'} (Sua Agenda)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Individual</span>
              </div>
            ) : (
              <select
                value={selectedProfId || currentProf?.id || ''}
                onChange={(e) => setSelectedProfId(e.target.value)}
                className="p-2.5 border rounded-xl font-extrabold text-xs bg-slate-50 w-full sm:w-80"
              >
                {clinicalStaff.map(p => {
                  const specs = Array.isArray(p.specialties) && p.specialties.length > 0
                    ? p.specialties.join(', ')
                    : p.role;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({specs})
                    </option>
                  );
                })}
                {clinicalStaff.length === 0 && (
                  <option value="">Nenhum profissional no Corpo Clínico</option>
                )}
              </select>
            )}
          </div>
        </div>

        {/* Alternador de Intervalo (30 min vs 50 min) */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start lg:self-center">
          <span className="text-[10px] font-black uppercase text-slate-500 px-2 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-slate-600" />
            <span>Intervalo:</span>
          </span>
          <button
            type="button"
            onClick={() => setIntervalMode('30')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              intervalMode === '30'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 em 30 min
          </button>
          <button
            type="button"
            onClick={() => setIntervalMode('50')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              intervalMode === '50'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            50 em 50 min
          </button>
        </div>

        {/* Seleção de Data */}
        <div className="flex items-center space-x-2 self-start lg:self-center">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-xl text-xs font-bold bg-slate-50"
          />
        </div>
      </div>

      {/* Cartão de Informações do Profissional e Suas Especialidades */}
      {currentProf && (
        <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-black text-emerald-950 text-sm">{currentProf.name}</span>
              <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {currentProf.registryNumber || 'Corpo Clínico'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-800">Áreas Habilitadas na Agenda:</span>
              {currentProfSpecialties.map((spec, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-emerald-900 font-extrabold text-[10px] border border-emerald-300 shadow-2xs">
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border shrink-0">
            Grade atual: <strong>{intervalMode} minutos</strong> por bloco
          </span>
        </div>
      )}

      {/* Grade de Horários da Agenda */}
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Agenda de {currentProf?.name || 'Profissional'} • {selectedDate.split('-').reverse().join('/')}
            </h3>
            <p className="text-[10px] text-slate-400">
              Grade configurada para blocos de <strong>{intervalMode} minutos</strong>.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-50 px-2.5 py-1 rounded-xl border">
            {dayApts.length} Atendimento(s) Marcado(s)
          </span>
        </div>

        <div className="grid grid-cols-1 divide-y">
          {activeTimeSlots.map(slot => {
            const apt = dayApts.find(a => a.time === slot);
            const endTime = getSlotEndTime(slot, Number(intervalMode));

            return (
              <div key={slot} className="py-3 flex items-center justify-between hover:bg-slate-50 px-3 rounded-2xl transition">
                <div className="flex items-center space-x-4">
                  <div className="w-24 shrink-0">
                    <span className="font-mono font-black text-slate-900 text-xs block">{slot}</span>
                    <span className="text-[10px] text-slate-400 font-mono">até {endTime}</span>
                  </div>

                  {apt ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-emerald-900 text-xs">{apt.patientName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {apt.specialty}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        Status: {apt.status} • {apt.attendanceType || 'Presencial'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 font-medium text-xs italic">
                      Horário Livre ({intervalMode} min)
                    </span>
                  )}
                </div>

                {apt ? (
                  canManageAgenda && (
                    <button
                      onClick={() => setCancelTargetApt(apt)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-[10px] border border-rose-200 cursor-pointer"
                    >
                      Desagendar
                    </button>
                  )
                ) : (
                  canManageAgenda && currentProf ? (
                    <button
                      onClick={() => handleOpenBooking(slot)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center space-x-1 cursor-pointer transition shadow-sm"
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

      {/* Modal de Agendamento com Escolha de Especialidade e Duração */}
      <Modal isOpen={!!bookingSlot} onClose={() => setBookingSlot(null)} title={`Agendar Paciente • Início às ${bookingSlot}`}>
        <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-semibold text-slate-700">
          
          {/* Selecionar Paciente */}
          <div className="space-y-1">
            <label className="font-bold block text-slate-800">Selecionar Paciente Cadastrado *</label>
            <select
              required
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white font-medium"
            >
              <option value="">-- Selecione o Paciente --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} (CPF: {p.cpfCnpj})</option>
              ))}
            </select>
          </div>

          {/* Escolha da Especialidade entre as que o profissional atua */}
          <div className="space-y-1 p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
            <label className="font-bold block text-indigo-950 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Especialidade do Atendimento * (Habilitadas para {currentProf?.name})</span>
            </label>
            <select
              required
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="w-full p-2.5 border border-indigo-300 rounded-xl bg-white font-bold text-indigo-900"
            >
              {currentProfSpecialties.map((spec, i) => (
                <option key={i} value={spec}>{spec}</option>
              ))}
            </select>
            <p className="text-[10px] text-indigo-700 mt-1">
              Este profissional aceita atendimentos para todas as especialidades listadas acima.
            </p>
          </div>

          {/* Duração da Sessão (30 min ou 50 min) */}
          <div className="grid grid-cols-2 gap-3 border-t pt-3">
            <div className="space-y-1">
              <label className="font-bold block">Duração da Sessão *</label>
              <select
                value={sessionDuration}
                onChange={e => setSessionDuration(e.target.value as '30' | '50')}
                className="w-full p-2.5 border rounded-xl bg-white font-bold"
              >
                <option value="30">30 minutos</option>
                <option value="50">50 minutos</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Intervalo de Recorrência *</label>
              <select
                value={recurrenceInterval}
                onChange={e => setRecurrenceInterval(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="Semanal">Semanal (Padrão Clínico)</option>
                <option value="Diária">Diária</option>
                <option value="Mensal">Mensal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold block">Controle de Sessões *</label>
              <select
                value={durationMode}
                onChange={e => setDurationMode(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="Determinado">Quantidade Determinada</option>
                <option value="Indeterminado">Prazo Indeterminado (Contínuo)</option>
              </select>
            </div>

            {durationMode === 'Determinado' && (
              <div className="space-y-1">
                <label className="font-bold block">Número de Sessões *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={sessionCount}
                  onChange={e => setSessionCount(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setBookingSlot(null)}
              className="px-4 py-2 border rounded-xl font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              Confirmar Agendamento ({sessionDuration} min)
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal isOpen={!!cancelTargetApt} onClose={() => setCancelTargetApt(null)} title="Remover Agendamento da Agenda">
        {cancelTargetApt && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <p className="leading-relaxed">
              O paciente <strong>{cancelTargetApt.patientName}</strong> possui horário marcado na agenda de {cancelTargetApt.professionalName} para a especialidade <strong>{cancelTargetApt.specialty}</strong>.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              O paciente permanecerá cadastrado no sistema. Escolha como deseja proceder com o agendamento:
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCancelOption('single')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border text-center cursor-pointer"
              >
                Desagendar APENAS a sessão do dia {cancelTargetApt.date.split('-').reverse().join('/')} ({cancelTargetApt.time})
              </button>
              <button
                type="button"
                onClick={() => handleCancelOption('all')}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center shadow-md shadow-rose-600/20 cursor-pointer"
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
