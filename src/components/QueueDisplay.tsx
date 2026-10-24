import React, { useState, useEffect } from 'react';
import { Tv, Volume2, Bell, Clock, Maximize2, UserCheck, Stethoscope, Plus, CheckCircle, RefreshCw } from 'lucide-react';
import { QueueCall, Clinic, User, Appointment, Patient } from '../types';
import Modal from './Modal';

interface QueueDisplayProps {
  queueCalls: QueueCall[];
  currentClinic: Clinic | null;
  currentUser: User | null;
  todayAppointments: Appointment[];
  patients: Patient[];
  onCallPatient: (call: QueueCall) => void;
  onClearQueue?: () => void;
}

export default function QueueDisplay({
  queueCalls,
  currentClinic,
  currentUser,
  todayAppointments,
  patients,
  onCallPatient,
  onClearQueue
}: QueueDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);

  // New call manual form
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualDoctorName, setManualDoctorName] = useState(currentUser?.name || '');
  const [manualRoom, setManualRoom] = useState('Consultório 01');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Play audio sound + voice synthesizer when a new call arrives
  const playCallAlert = (patientName: string, room: string, doctorName: string) => {
    try {
      // 1. Audio Ding using Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }

      // 2. Speech synthesis announcement in Portuguese
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `Atenção. Paciente ${patientName}. Favor dirigir-se ao ${room}. Com ${doctorName}.`
        );
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Audio call alert error:', err);
    }
  };

  const handleManualCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPatientName.trim()) return;

    const newCall: QueueCall = {
      id: 'call-' + Date.now(),
      clinicId: currentClinic?.id || 'system',
      patientName: manualPatientName.trim(),
      doctorName: manualDoctorName || 'Médico / Terapeuta',
      room: manualRoom,
      calledAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'chamando'
    };

    onCallPatient(newCall);
    playCallAlert(newCall.patientName, newCall.room, newCall.doctorName);
    setIsNewCallModalOpen(false);
    setManualPatientName('');
  };

  const handleCallFromAppointment = (apt: Appointment) => {
    const newCall: QueueCall = {
      id: 'call-' + Date.now(),
      clinicId: currentClinic?.id || 'system',
      patientName: apt.patientName,
      doctorName: apt.professionalName,
      room: 'Consultório Principal',
      calledAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'chamando'
    };

    onCallPatient(newCall);
    playCallAlert(newCall.patientName, newCall.room, newCall.doctorName);
  };

  const latestCall = queueCalls[0];
  const previousCalls = queueCalls.slice(1, 6);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto' : ''}`}>
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
            <Tv className="w-5 h-5 text-emerald-600" />
            <span>Painel de Chamada para TV (Recepção)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Exibição em tela cheia na TV da sala de espera com sintetizador de voz e sinal sonoro para consultórios.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsNewCallModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Chamar Paciente</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Modo TV / Tela Cheia'}</span>
          </button>
        </div>
      </div>

      {/* Main TV Screen Layout */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-800">
        {/* Top Header of the TV */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-2xl shadow-lg">
              {currentClinic?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight">
                {currentClinic?.name || 'CliniGestor Recepção'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">Chamada Eletrônica de Consultórios</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl md:text-3xl font-black font-mono text-white tracking-widest">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400 uppercase font-semibold">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>

        {/* Current Call (Big Center Highlight) */}
        {latestCall ? (
          <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-8 md:p-12 text-center shadow-inner relative overflow-hidden mb-8 animate-pulse">
            <div className="absolute top-4 right-4 flex items-center space-x-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700">
              <Volume2 className="w-4 h-4" />
              <span>Chamada Ativa ({latestCall.calledAt})</span>
            </div>

            <span className="text-sm md:text-base font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">
              Favor Dirigir-se ao Atendimento
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">
              {latestCall.patientName}
            </h2>

            <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-900/90 px-6 py-3 rounded-2xl border border-slate-700 text-sm md:text-lg">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <Stethoscope className="w-5 h-5 text-amber-400" />
                {latestCall.room}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-slate-200">
                Dr(a). {latestCall.doctorName}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 mb-8">
            <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">Aguardando próximas chamadas</h3>
            <p className="text-xs text-slate-500 mt-1">Os pacientes chamados pela recepção ou pelos médicos aparecerão aqui instantaneamente.</p>
          </div>
        )}

        {/* Previous Calls list */}
        {previousCalls.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Últimas Chamadas Anteriores</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {previousCalls.map(c => (
                <div key={c.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-white text-sm block truncate max-w-[180px]">
                      {c.patientName}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">{c.room}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-bold">{c.calledAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Call from Today's Appointments */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Chamar Pacientes Agendados para Hoje</span>
        </h3>
        
        {todayAppointments.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhum agendamento para hoje ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="p-3.5 border rounded-2xl bg-slate-50 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-800 block">{apt.patientName}</span>
                  <span className="text-[11px] text-slate-500">{apt.time} • {apt.specialty}</span>
                </div>
                <button
                  onClick={() => handleCallFromAppointment(apt)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow cursor-pointer transition flex items-center space-x-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Chamar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Chamar Paciente Manual */}
      <Modal
        isOpen={isNewCallModalOpen}
        onClose={() => setIsNewCallModalOpen(false)}
        title="Chamar Paciente no Painel da TV"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleManualCall} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Nome do Paciente *</label>
            <input
              required
              type="text"
              placeholder="Digite o nome completo"
              value={manualPatientName}
              onChange={e => setManualPatientName(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Local / Consultório *</label>
            <select
              value={manualRoom}
              onChange={e => setManualRoom(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white font-bold"
            >
              <option value="Consultório 01">Consultório 01</option>
              <option value="Consultório 02">Consultório 02</option>
              <option value="Consultório 03">Consultório 03</option>
              <option value="Sala de Terapia">Sala de Terapia</option>
              <option value="Sala de Triagem / Recepção">Sala de Triagem / Recepção</option>
              <option value="Sala de Procedimentos">Sala de Procedimentos</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Médico / Terapeuta Responsável</label>
            <input
              type="text"
              value={manualDoctorName}
              onChange={e => setManualDoctorName(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsNewCallModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer transition flex items-center space-x-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Emitir Chamada Sonora</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
