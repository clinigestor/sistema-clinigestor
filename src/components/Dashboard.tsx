import React from 'react';
import { Calendar, Users, Clock, CheckCircle2, AlertCircle, ArrowRight, UserPlus, Phone, Activity, DollarSign, Check, Bell } from 'lucide-react';
import { Appointment, Patient, User, Clinic } from '../types';

interface DashboardProps {
  currentUser: User | null;
  currentClinic: Clinic | null;
  appointments: Appointment[];
  patients: Patient[];
  onNavigateTab: (tab: string) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  onConfirmPatientPayment?: (patientId: string, monthYear: string) => void;
  onCallPatient?: (apt: Appointment) => void;
}

export default function Dashboard({
  currentUser,
  currentClinic,
  appointments,
  patients,
  onNavigateTab,
  onUpdateAppointmentStatus,
  onConfirmPatientPayment,
  onCallPatient
}: DashboardProps) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentDay = now.getDate();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Pacientes particulares com mensalidade vencida neste mês
  const overduePatients = patients.filter(p => {
    if (p.paymentType !== 'Particular') return false;
    let day: number | null = null;
    if (p.dueDay) day = parseInt(String(p.dueDay));
    else if (p.dueDateParticular) {
      const parts = p.dueDateParticular.split('-');
      if (parts.length === 3) day = parseInt(parts[2]);
    }
    if (!day || isNaN(day)) return false;

    // Venceu se hoje for >= dia de vencimento e não foi registrado pagamento no mês atual
    const isDueOrPast = currentDay >= day;
    const isNotPaidThisMonth = p.lastPaidMonthYear !== currentMonthYear;
    return isDueOrPast && isNotPaidThisMonth;
  });

  const todayApts = appointments.filter(a => a.date === todayStr);

  const confirmedCount = todayApts.filter(a => a.status === 'Confirmado' || a.status === 'Atendido' || a.status === 'Concluído').length;
  const pendingCount = todayApts.filter(a => a.status === 'Agendado').length;

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {currentClinic?.name || 'Recepção do Dia'}
          </span>
          <h2 className="text-xl font-black mt-2">Bem-vindo(a), {currentUser?.name}!</h2>
          <p className="text-xs text-slate-300 mt-1">
            Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center space-x-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Agenda Completa</span>
          </button>
          <button
            onClick={() => onNavigateTab('patients')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pacientes</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold">Atendimentos de Hoje</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{todayApts.length}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Sessões programadas para hoje</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold">Confirmados / Atendidos</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{confirmedCount}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Pacientes confirmados</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold">Aguardando Confirmação</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Pendentes de check-in</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold">Total Pacientes Cadastrados</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{patients.length}</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">Na base desta clínica</div>
        </div>
      </div>

      {/* Alerta de Mensalidades Vencidas (Particular) */}
      {overduePatients.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rose-200/60 pb-3">
            <div className="flex items-center space-x-2 text-rose-900">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-rose-950">
                  Mensalidades Vencidas ({overduePatients.length} {overduePatients.length === 1 ? 'paciente' : 'pacientes'})
                </h3>
                <p className="text-[11px] text-rose-700 font-semibold">
                  Pacientes particulares com dia de vencimento ultrapassado no mês de {currentMonthName}.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-200/60 text-rose-900 font-black text-[10px] rounded-lg">
              Cobrança Pendente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overduePatients.map(patient => {
              const dueDay = patient.dueDay || (patient.dueDateParticular ? patient.dueDateParticular.split('-')[2] : '10');
              return (
                <div key={patient.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{patient.fullName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">CPF: {patient.cpfCnpj}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                      Venceu dia {dueDay}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-rose-700 flex items-center space-x-1">
                      <span>Status: Mensalidade Vencida</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onConfirmPatientPayment?.(patient.id, currentMonthYear)}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmar Pagamento Efetuado</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela da Recepção do Dia */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Fila de Atendimento do Dia</h3>
            <p className="text-[10px] text-slate-400">Controle de presença e status dos agendamentos de hoje.</p>
          </div>
          <button
            onClick={() => onNavigateTab('appointments')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Gerenciar na Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y text-xs">
          {todayApts.map((apt) => (
            <div key={apt.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="flex items-center space-x-4">
                <span className="font-mono font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                  {apt.time}
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm">{apt.patientName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Profissional: <strong className="text-slate-700">{apt.professionalName}</strong> • {apt.specialty}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                  apt.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                  apt.status === 'Atendido' ? 'bg-blue-100 text-blue-800' :
                  apt.status === 'Confirmado' ? 'bg-indigo-100 text-indigo-800' :
                  apt.status === 'Cancelado' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {apt.status}
                </span>

                {onCallPatient && (
                  <button
                    type="button"
                    onClick={() => onCallPatient(apt)}
                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold flex items-center space-x-1 transition cursor-pointer text-xs"
                    title="Chamar Paciente no Painel da TV da Recepção com Som e Voz"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chamar TV</span>
                  </button>
                )}

                <select
                  value={apt.status}
                  onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                  className="p-1.5 border rounded-xl bg-white text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Atendido">Em Atendimento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))}

          {todayApts.length === 0 && (
            <div className="p-10 text-center text-slate-400 font-bold space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
              <p>Nenhum atendimento agendado para o dia de hoje.</p>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="mt-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Criar Novo Agendamento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
