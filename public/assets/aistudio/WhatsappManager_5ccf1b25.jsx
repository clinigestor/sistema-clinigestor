import React, { useState } from 'react';
import { MessageCircle, Send, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function WhatsappManager({ appointments = [], activeTheme }) {
  const [config, setConfig] = useState({
    template: 'Olá {nome_responsavel}! Lembramos que {nome_paciente} tem atendimento na clínica no dia {data} às {horario} com {nome_profissional}.\n\nResponda:\n1️⃣ para CONFIRMAR\n2️⃣ para CANCELAR',
    leadTime: '24h', // 24h | 48h | 24h_e_mesmo_dia
    apiEndpoint: 'https://api.whatsapp-gateway.com/send'
  });

  // Mensagem Emergencial (Ex: Falta de Luz)
  const [emergencyMsg, setEmergencyMsg] = useState('Informamos que por motivos de força maior (falta de energia na região), a clínica não poderá realizar os atendimentos presenciais hoje. Entraremos em contato para reagendamento.');
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === todayStr);

  const handleSendEmergency = () => {
    if (!confirm(`Deseja disparar a mensagem emergencial para os ${todayApts.length} pacientes agendados para hoje via API do WhatsApp?`)) return;
    setIsSendingEmergency(true);
    setTimeout(() => {
      setIsSendingEmergency(false);
      alert(`Sucesso! ${todayApts.length} mensagens emergenciais disparadas via API.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Configuração de Lembretes Automáticos */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b pb-3">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Configuração de Lembretes Automáticos (WhatsApp API)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">Intervalo de Envio *</label>
            <select value={config.leadTime} onChange={e => setConfig({ ...config, leadTime: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white text-xs">
              <option value="24h">24 Horas Antes</option>
              <option value="48h">48 Horas Antes</option>
              <option value="24h_e_mesmo_dia">24 Horas Antes + Mesmo Dia da Sessão</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">Endpoint da API WhatsApp *</label>
            <input type="text" value={config.apiEndpoint} onChange={e => setConfig({ ...config, apiEndpoint: e.target.value })} className="w-full p-2.5 border rounded-xl text-xs" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-xs text-slate-700 block">Template da Mensagem (Variáveis: {'{nome_paciente}'}, {'{data}'}, {'{horario}'}, {'{nome_profissional}'}) *</label>
          <textarea rows="5" value={config.template} onChange={e => setConfig({ ...config, template: e.target.value })} className="w-full p-3 border rounded-xl text-xs font-mono" />
        </div>
      </div>

      {/* Disparo de Mensagem Emergencial */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 border-b pb-3 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Envio de Mensagem Emergencial (Ex: Falta de Luz / Imprevistos)</span>
        </h3>

        <p className="text-xs text-slate-600">
          O sistema lerá automaticamente os <strong>{todayApts.length} pacientes</strong> agendados para hoje e disparará a mensagem semi-pronta abaixo:
        </p>

        <textarea rows="3" value={emergencyMsg} onChange={e => setEmergencyMsg(e.target.value)} className="w-full p-3 border rounded-xl text-xs" />

        <div className="flex justify-end">
          <button
            onClick={handleSendEmergency}
            disabled={isSendingEmergency}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isSendingEmergency ? 'A enviar...' : `Disparar para ${todayApts.length} Pacientes do Dia`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}