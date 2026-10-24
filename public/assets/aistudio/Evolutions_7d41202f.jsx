import React, { useState } from 'react';
import { FileText, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function Evolutions({ patients = [], currentUser }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [soapData, setSoapData] = useState({ s: '', o: '', a: '', p: '' });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border shadow-sm flex justify-between items-center">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Evolução Clínica (Padrão SOAP) • Sigilo Absoluto</h2>
          <p className="text-[10px] text-slate-400">Preenchimento obrigatório por sessão realizada. Sessões sem evolução acumulam pendência.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Acesso Restrito ao Profissional Responsável</span>
        </span>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Paciente</th>
              <th className="p-4">Sessões Realizadas</th>
              <th className="p-4">Evoluções Pendentes</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map(patient => (
              <tr key={patient.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-extrabold text-slate-900">{patient.fullName}</td>
                <td className="p-4 font-bold text-slate-700">3 sessões este mês</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] animate-pulse">
                    ⚠️ 1 Sessão Pendente de Evolução
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => setSelectedPatient(patient)} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[10px]">
                    Preencher SOAP
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={`Evolução SOAP • ${selectedPatient?.fullName}`} maxWidth="max-w-2xl">
        {selectedPatient && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
              Preencha os campos abaixo referentes à última sessão realizada. Caso haja sessões anteriores pendentes, preencha uma a uma.
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">S - Subjetivo (Relato do paciente/família)</label>
              <textarea rows="2" value={soapData.s} onChange={e => setSoapData({ ...soapData, s: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">O - Objetivo (Observações clínicas e comportamentais)</label>
              <textarea rows="2" value={soapData.o} onChange={e => setSoapData({ ...soapData, o: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">A - Avaliação (Análise técnica e progresso)</label>
              <textarea rows="2" value={soapData.a} onChange={e => setSoapData({ ...soapData, a: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-slate-900">P - Plano (Conduta e próximos passos)</label>
              <textarea rows="2" value={soapData.p} onChange={e => setSoapData({ ...soapData, p: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={() => { alert('Evolução SOAP salva com sucesso!'); setSelectedPatient(null); }} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Salvar Evolução</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}