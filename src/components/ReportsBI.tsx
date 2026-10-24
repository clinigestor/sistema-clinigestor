import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, Calendar, DollarSign, 
  CheckCircle2, XCircle, Clock, Award, Printer, ArrowUpRight, Filter 
} from 'lucide-react';
import { Appointment, Patient, User, Clinic } from '../types';

interface ReportsBIProps {
  appointments: Appointment[];
  patients: Patient[];
  professionals: User[];
  currentClinic: Clinic | null;
}

export default function ReportsBI({
  appointments,
  patients,
  professionals,
  currentClinic
}: ReportsBIProps) {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'today'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7); // "YYYY-MM"

  const filteredAppointments = appointments.filter(a => {
    if (filterPeriod === 'today') return a.date === todayStr;
    if (filterPeriod === 'month') return a.date.startsWith(currentMonthStr);
    return true;
  });

  const totalApts = filteredAppointments.length;
  const completedApts = filteredAppointments.filter(a => a.status === 'Atendido' || a.status === 'Concluído').length;
  const cancelledApts = filteredAppointments.filter(a => a.status === 'Cancelado').length;
  const scheduledApts = filteredAppointments.filter(a => a.status === 'Agendado' || a.status === 'Confirmado').length;

  const attendanceRate = totalApts > 0 ? Math.round((completedApts / totalApts) * 100) : 0;
  const noShowRate = totalApts > 0 ? Math.round((cancelledApts / totalApts) * 100) : 0;

  // Breakdown by professional
  const byProfessional: Record<string, { total: number; completed: number; name: string }> = {};
  filteredAppointments.forEach(a => {
    const profName = a.professionalName || 'Não especificado';
    if (!byProfessional[profName]) {
      byProfessional[profName] = { total: 0, completed: 0, name: profName };
    }
    byProfessional[profName].total += 1;
    if (a.status === 'Atendido' || a.status === 'Concluído') {
      byProfessional[profName].completed += 1;
    }
  });

  // Breakdown by specialty
  const bySpecialty: Record<string, number> = {};
  filteredAppointments.forEach(a => {
    const spec = a.specialty || 'Geral';
    bySpecialty[spec] = (bySpecialty[spec] || 0) + 1;
  });

  // Patient payment breakdown
  const particularCount = patients.filter(p => p.paymentType === 'Particular').length;
  const healthPlanCount = patients.filter(p => p.paymentType === 'Plano de Saúde').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Indicadores & Relatórios Gerenciais (BI)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Análise de taxa de comparecimento, faltas (no-show), produtividade da equipe e distribuição clínica.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${filterPeriod === 'today' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${filterPeriod === 'month' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${filterPeriod === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Geral (Tudo)
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Agendamentos</span>
            <span className="text-2xl font-black text-slate-800">{totalApts}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              {scheduledApts} em andamento
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Taxa Comparecimento</span>
            <span className="text-2xl font-black text-blue-700">{attendanceRate}%</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              {completedApts} consultas atendidas
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Taxa de Faltas (No-Show)</span>
            <span className="text-2xl font-black text-rose-700">{noShowRate}%</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              {cancelledApts} faltas/cancelamentos
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Base de Pacientes</span>
            <span className="text-2xl font-black text-slate-800">{patients.length}</span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              {particularCount} Particular • {healthPlanCount} Convênio
            </span>
          </div>
        </div>
      </div>

      {/* Detailed charts & breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por Profissional */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Produtividade por Profissional</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Consultas Realizadas</span>
          </div>

          {Object.keys(byProfessional).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Nenhum dado registrado no período.</p>
          ) : (
            <div className="space-y-3">
              {Object.values(byProfessional).map(item => {
                const percentage = totalApts > 0 ? Math.round((item.total / totalApts) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800 truncate">{item.name}</span>
                      <span className="text-slate-500 font-mono">
                        {item.completed}/{item.total} atendidos ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Distribuição por Especialidade */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Demanda por Especialidade</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Volume de Atendimentos</span>
          </div>

          {Object.keys(bySpecialty).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Nenhuma especialidade registrada no período.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(bySpecialty).map(([spec, count]) => {
                const percentage = totalApts > 0 ? Math.round((count / totalApts) * 100) : 0;
                return (
                  <div key={spec} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800">{spec}</span>
                      <span className="text-slate-500 font-mono">{count} consultas ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
