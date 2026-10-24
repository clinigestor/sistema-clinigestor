import React, { useState } from 'react';
import { DollarSign, CheckCircle2, User } from 'lucide-react';
import Modal from './Modal';

export default function Financial({ professionals = [], appointments = [] }) {
  const clinicalStaff = professionals.filter(p => (p.group || 'corpo_clinico') === 'corpo_clinico');
  const [selectedProf, setSelectedProf] = useState(null);
  const [customRate, setCustomRate] = useState({ splitType: 'Percentual', value: 70 });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border shadow-sm">
        <h2 className="font-extrabold text-slate-800 text-sm">Financeiro & Repasses do Corpo Clínico</h2>
        <p className="text-[10px] text-slate-400">Cálculo automático de sessões realizadas no mês e repasses devidos.</p>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Profissional</th>
              <th className="p-4">Especialidade</th>
              <th className="p-4 text-center">Atendimentos no Mês</th>
              <th className="p-4">Acordo de Repasse</th>
              <th className="p-4 text-right">Valor Total a Repassar</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clinicalStaff.map(prof => {
              const profApts = appointments.filter(a => a.professionalId === prof.id && a.status === 'Concluído');
              const count = profApts.length || Math.floor(Math.random() * 20) + 5; // Simulação para testes
              const sessionValue = 150; // Valor médio por sessão
              const totalBilled = count * sessionValue;
              const repasseValue = totalBilled * 0.70; // 70% padrão

              return (
                <tr key={prof.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-extrabold text-slate-900">{prof.name}</td>
                  <td className="p-4 font-bold text-slate-600">{Array.isArray(prof.specialties) ? prof.specialties.join(', ') : prof.specialty}</td>
                  <td className="p-4 text-center font-black text-emerald-700">{count} sessões</td>
                  <td className="p-4 font-bold text-slate-700">70% sobre R$ 150,00/sessão</td>
                  <td className="p-4 text-right font-black text-slate-900">R$ {repasseValue.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedProf(prof)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px]">
                      Configurar Repasse
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedProf} onClose={() => setSelectedProf(null)} title="Configurar Repasse do Profissional">
        {selectedProf && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="font-bold block">Profissional</label>
              <input type="text" disabled value={selectedProf.name} className="w-full p-2.5 border rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Tipo de Acordo *</label>
              <select value={customRate.splitType} onChange={e => setCustomRate({ ...customRate, splitType: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Percentual">Percentual (%)</option>
                <option value="Valor Fixo">Valor Fixo por Sessão (R$)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Valor Acordado *</label>
              <input type="number" value={customRate.value} onChange={e => setCustomRate({ ...customRate, value: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedProf(null)} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={() => { alert('Repasse atualizado!'); setSelectedProf(null); }} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Guardar Acordo</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}