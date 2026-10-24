import React from 'react';
import { Video, Calendar, Clock, Phone, ExternalLink } from 'lucide-react';

export default function Telehealth({ appointments = [], currentUser }) {
  const onlineApts = appointments.filter(a => 
    a.attendanceType === 'Online' && 
    (currentUser.role === 'superadmin' || a.professionalId === currentUser.id)
  );

  const getWhatsappLink = (patientName, meetLink) => {
    const text = encodeURIComponent(`Olá! Segue o link da sua teleconsulta agendada no CliniGestor: ${meetLink || 'https://meet.google.com/abc-defg-hij'}`);
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border shadow-sm">
        <h2 className="font-extrabold text-slate-800 text-sm">Teleconsulta Meet • Meus Pacientes Online</h2>
        <p className="text-[10px] text-slate-400">Salas virtuais integradas e atalhos rápidos de atendimento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {onlineApts.map(apt => {
          const meetUrl = 'https://meet.google.com/abc-defg-hij';
          return (
            <div key={apt.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-slate-900 text-base">{apt.patientName}</h4>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">Online</span>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.date.split('-').reverse().join('/')} às {apt.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duração: 50 minutos</span>
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
                  <span>Entrar na Sala Google Meet</span>
                </a>

                <a
                  href={getWhatsappLink(apt.patientName, meetUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar Link pelo WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}

        {onlineApts.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-3xl border text-slate-400 font-bold">
            Nenhuma teleconsulta agendada para os seus pacientes no momento.
          </div>
        )}
      </div>
    </div>
  );
}