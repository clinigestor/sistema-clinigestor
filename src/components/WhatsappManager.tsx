import React, { useState } from 'react';
import { MessageCircle, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Appointment } from '../types';

interface WhatsappManagerProps {
  appointments: Appointment[];
}

export default function WhatsappManager({ appointments = [] }: WhatsappManagerProps) {
  const [config, setConfig] = useState({
    template: 'Olá {nome_responsavel}! Lembramos que {nome_paciente} tem atendimento na clínica no dia {data} às {horario} com {nome_profissional}.\n\nResponda:\n1️⃣ para CONFIRMAR\n2️⃣ para CANCELAR',
    leadTime: '24h',
    apiEndpoint: 'https://api.whatsapp-gateway.com/send'
  });

  const [emergencyMsg, setEmergencyMsg] = useState('Informamos que por motivos de força maior, a clínica não poderá realizar atendimentos presenciais hoje. Entraremos em contato para reagendamento.');
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === todayStr);

  const handleSendEmergency = () => {
    if (!confirm(`Deseja disparar a mensagem de aviso para os ${todayApts.length} pacientes agendados para hoje?`)) return;
    setIsSendingEmergency(true);
    setTimeout(() => {
      setIsSendingEmergency(false);
      alert(`Sucesso! Notificações enviadas para a fila de mensagens do dia.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b pb-3">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Configuração de Notificações WhatsApp API</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">Intervalo de Envio *</label>
            <select
              value={config.leadTime}
              onChange={e => setConfig({ ...config, leadTime: e.target.value })}
              className="w-full p-2.5 border rounded-xl bg-white text-xs font-bold"
            >
              <option value="24h">24 Horas Antes</option>
              <option value="48h">48 Horas Antes</option>
              <option value="24h_e_mesmo_dia">24 Horas Antes + Manhã do Dia</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">Gateway WhatsApp Endpoint *</label>
            <input
              type="text"
              value={config.apiEndpoint}
              onChange={e => setConfig({ ...config, apiEndpoint: e.target.value })}
              className="w-full p-2.5 border rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-xs text-slate-700 block">Template da Mensagem Automática *</label>
          <textarea
            rows={4}
            value={config.template}
            onChange={e => setConfig({ ...config, template: e.target.value })}
            className="w-full p-3 border rounded-xl text-xs font-mono bg-slate-50"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b pb-3 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Disparo de Mensagem Emergencial ou Imprevisto</span>
        </h3>

        <p className="text-xs text-slate-600">
          O sistema comunicará instantaneamente todos os <strong>{todayApts.length} pacientes</strong> agendados para a data de hoje:
        </p>

        <textarea
          rows={3}
          value={emergencyMsg}
          onChange={e => setEmergencyMsg(e.target.value)}
          className="w-full p-3 border rounded-xl text-xs bg-slate-50"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSendEmergency}
            disabled={isSendingEmergency || todayApts.length === 0}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSendingEmergency ? 'Enviando...' : `Disparar para ${todayApts.length} Pacientes`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
