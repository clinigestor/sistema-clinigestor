import React, { useState } from 'react';
import { Video, Calendar, Clock, Phone, ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { Appointment, User } from '../types';

interface TelehealthProps {
  appointments: Appointment[];
  currentUser: User | null;
}

export default function Telehealth({ appointments = [], currentUser }: TelehealthProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const onlineApts = appointments.filter(a => {
    const isOnline = a.attendanceType === 'Online' || a.specialty?.toLowerCase().includes('online');
    if (!isOnline) return false;
    // Exibe apenas as sessões do dia selecionado (padrão: hoje)
    return a.date === selectedDate;
  });

  const getWhatsappLink = (patientName: string, meetLink: string) => {
    const text = encodeURIComponent(`Olá! Segue o link da sua teleconsulta agendada no CliniGestor: ${meetLink}`);
    return `https://wa.me/?text=${text}`;
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-extrabold text-slate-800 text-base">Teleconsulta & Salas Virtuais Google Meet</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
              {isToday ? 'Sessões de Hoje' : 'Data Filtrada'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exibindo apenas os atendimentos virtuais do dia {selectedDate.split('-').reverse().join('/')}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Ir para Hoje
            </button>
          )}
          <div className="flex items-center space-x-1 border rounded-xl p-1 bg-slate-50">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent px-2 py-0.5 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {onlineApts.map(apt => {
          const meetUrl = 'https://meet.google.com/clinigestor-' + apt.id.slice(-6);
          return (
            <div key={apt.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-slate-900 text-sm">{apt.patientName}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">Online</span>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.date.split('-').reverse().join('/')} às {apt.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profissional: {apt.professionalName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Acessar Sala Google Meet</span>
                </a>

                <a
                  href={getWhatsappLink(apt.patientName, meetUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar Sala pelo WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}

        {onlineApts.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white rounded-3xl border text-slate-400 font-bold">
            Nenhuma teleconsulta online cadastrada nesta clínica no momento.
          </div>
        )}
      </div>
    </div>
  );
}
