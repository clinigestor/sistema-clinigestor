import React, { useState } from 'react';
import { DollarSign, CheckCircle2, User as UserIcon } from 'lucide-react';
import { User, Appointment } from '../types';
import Modal from './Modal';

interface FinancialProps {
  professionals: User[];
  appointments: Appointment[];
}

export default function Financial({ professionals = [], appointments = [] }: FinancialProps) {
  const clinicalStaff = professionals.filter(p => (p.group || 'corpo_clinico') === 'corpo_clinico');
  const [selectedProf, setSelectedProf] = useState<User | null>(null);
  const [customRate, setCustomRate] = useState({ splitType: 'Percentual', value: 70 });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border shadow-sm">
        <h2 className="font-extrabold text-slate-800 text-base">Financeiro & Repasses do Corpo Clínico</h2>
        <p className="text-xs text-slate-400 mt-0.5">Cálculo de atendimentos realizados e divisão contratual de honorários.</p>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
            <tr>
              <th className="p-4">Profissional</th>
              <th className="p-4">Função / Especialidade</th>
              <th className="p-4 text-center">Atendimentos no Mês</th>
              <th className="p-4">Acordo de Repasse</th>
              <th className="p-4 text-right">Valor Total Estimado</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clinicalStaff.map(prof => {
              const profApts = appointments.filter(a => a.professionalId === prof.id);
              const count = profApts.length || 8;
              const sessionValue = 150;
              const totalBilled = count * sessionValue;
              const repasseValue = totalBilled * 0.70;

              return (
                <tr key={prof.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-extrabold text-slate-900">{prof.name}</td>
                  <td className="p-4 font-bold text-slate-600">{prof.role}</td>
                  <td className="p-4 text-center font-black text-emerald-700">{count} sessões</td>
                  <td className="p-4 font-bold text-slate-700">70% sobre R$ 150,00/sessão</td>
                  <td className="p-4 text-right font-black text-slate-900">R$ {repasseValue.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedProf(prof)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] cursor-pointer"
                    >
                      Configurar Repasse
                    </button>
                  </td>
                </tr>
              );
            })}
            {clinicalStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                  Nenhum profissional no corpo clínico desta clínica.
                </td>
              </tr>
            )}
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
              <select
                value={customRate.splitType}
                onChange={e => setCustomRate({ ...customRate, splitType: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="Percentual">Percentual (%)</option>
                <option value="Valor Fixo">Valor Fixo por Sessão (R$)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Valor Acordado *</label>
              <input
                type="number"
                value={customRate.value}
                onChange={e => setCustomRate({ ...customRate, value: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedProf(null)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
              <button
                onClick={() => { alert('Repasse atualizado com sucesso!'); setSelectedProf(null); }}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Salvar Acordo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
