import React, { useState } from 'react';
import { LifeBuoy, Plus, CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import Modal from './Modal';

export default function Helpdesk({ tickets = [], currentUser, onSaveTicket, onUpdateTicketStatus }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  const handleCreateTicket = (e) => {
    e.preventDefault();
    onSaveTicket({
      id: 'tkt-' + Date.now(),
      subject,
      description,
      status: 'Pendente', // Pendente | Em Andamento | Concluído
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      handlerName: '',
      feedback: '',
      createdAt: new Date().toLocaleDateString('pt-BR')
    });
    setIsModalOpen(false);
    setSubject('');
    setDescription('');
  };

  const handleTakeTicket = (ticketId) => {
    onUpdateTicketStatus(ticketId, {
      status: 'Em Andamento',
      handlerName: currentUser.name
    });
  };

  const handleFinishTicket = (e, ticketId) => {
    e.preventDefault();
    onUpdateTicketStatus(ticketId, {
      status: 'Concluído',
      handlerName: currentUser.name,
      feedback: feedbackInput
    });
    setSelectedTicket(null);
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Central de Suporte & Chamados (Helpdesk)</h2>
          <p className="text-[10px] text-slate-400">Envie relatos de problemas, solicitações de ajuste ou dúvidas técnicas.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-extrabold text-slate-900 text-sm">{ticket.subject}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  ticket.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                  ticket.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t text-[11px] text-slate-500">
              <div>
                <span className="block font-bold">Solicitante: {ticket.requesterName}</span>
                <span className="text-[10px] text-slate-400">Aberto em: {ticket.createdAt}</span>
              </div>

              {ticket.handlerName && (
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700 block">Atendido por: {ticket.handlerName}</span>
                  {ticket.feedback && <p className="text-[10px] text-emerald-700 mt-1"><strong>Feedback:</strong> {ticket.feedback}</p>}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-1">
                {ticket.status === 'Pendente' && (
                  <button onClick={() => handleTakeTicket(ticket.id)} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-[10px]">
                    Assumir Chamado
                  </button>
                )}
                {ticket.status === 'Em Andamento' && (
                  <button onClick={() => setSelectedTicket(ticket)} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[10px]">
                    Concluir com Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Chamado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Chamado de Suporte">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="font-bold block">Assunto / Problema Resumido *</label>
            <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2.5 border rounded-xl" placeholder="Ex: Erro ao gerar PDF de declaração" />
          </div>
          <div className="space-y-1">
            <label className="font-bold block">Descrição Detalhada *</label>
            <textarea required rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border rounded-xl" placeholder="Descreva os passos para reproduzir o problema..." />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Enviar Chamado</button>
          </div>
        </form>
      </Modal>

      {/* Modal Concluir Chamado com Feedback */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Concluir Chamado e Enviar Feedback">
        {selectedTicket && (
          <form onSubmit={(e) => handleFinishTicket(e, selectedTicket.id)} className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="font-extrabold text-slate-900 block">{selectedTicket.subject}</span>
              <p className="text-[11px] text-slate-600 mt-1">{selectedTicket.description}</p>
            </div>
            <div className="space-y-1">
              <label className="font-bold block text-emerald-800">Feedback de Resolução para o Solicitante *</label>
              <textarea required rows="3" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} className="w-full p-2.5 border rounded-xl" placeholder="Explique a correção efetuada ou orientação..." />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setSelectedTicket(null)} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Finalizar Chamado</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}