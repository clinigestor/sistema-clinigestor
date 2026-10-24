import React, { useState, useMemo } from 'react';
import { LifeBuoy, Plus, CheckCircle2, Clock, AlertCircle, Search, Filter, ShieldCheck, User, Wrench, Calendar, Check } from 'lucide-react';
import { HelpdeskTicket, User as UserType } from '../types';
import Modal from './Modal';

const MODULE_OPTIONS = [
  'Agenda',
  'Anamneses',
  'Recepção do Dia',
  'Pacientes',
  'Lista de Espera',
  'Plano Terapêutico (PTI)',
  'Evolução (SOAP)',
  'Histórico Clínico',
  'Financeiro',
  'WhatsApp Notificações',
  'Teleconsulta',
  'Configurações',
  'Outro / Geral'
];

const SEVERITY_OPTIONS = ['Baixa', 'Média', 'Alta', 'Crítica / URGENTE'] as const;

interface HelpdeskProps {
  tickets: HelpdeskTicket[];
  currentUser: UserType | null;
  clinicId: string;
  onSaveTicket: (ticket: HelpdeskTicket) => void;
  onUpdateTicketStatus: (ticketId: string, updates: Partial<HelpdeskTicket>) => void;
}

export default function Helpdesk({
  tickets = [],
  currentUser,
  clinicId,
  onSaveTicket,
  onUpdateTicketStatus
}: HelpdeskProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [severity, setSeverity] = useState<HelpdeskTicket['severity']>('Média');
  const [module, setModule] = useState('Agenda');
  const [description, setDescription] = useState('');

  // Filtering state
  const [searchRequester, setSearchRequester] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterSeverity, setFilterSeverity] = useState<string>('Todas');
  const [filterModule, setFilterModule] = useState<string>('Todos');
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD or YYYY-MM

  // Finish modal state
  const [finishingTicket, setFinishingTicket] = useState<HelpdeskTicket | null>(null);
  const [identifiedIssueInput, setIdentifiedIssueInput] = useState('');
  const [actionTakenInput, setActionTakenInput] = useState('');

  const isSystemTeam = currentUser?.role === 'superadmin' || currentUser?.clinicId === 'system';
  const isClinicAdmin = currentUser?.role === 'clinic_admin';

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: HelpdeskTicket = {
      id: 'tkt-' + Date.now(),
      clinicId: clinicId,
      subject,
      severity,
      module,
      description,
      status: 'Pendente',
      requesterName: currentUser?.name || 'Usuário',
      requesterEmail: currentUser?.email || 'contato@clinica.com',
      requesterRole: currentUser?.role === 'professional' ? 'Corpo Clínico' : currentUser?.role === 'clinic_admin' ? 'Administrador da Clínica' : 'Operacional',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onSaveTicket(newTicket);
    setIsModalOpen(false);
    setSubject('');
    setDescription('');
    setSeverity('Média');
    setModule('Agenda');
  };

  const handleReceiveTicket = (ticketId: string) => {
    onUpdateTicketStatus(ticketId, {
      status: 'Recebido',
      handlerName: currentUser?.name || 'Equipe de Suporte',
      receivedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleInProgressTicket = (ticketId: string) => {
    onUpdateTicketStatus(ticketId, {
      status: 'Em Andamento',
      handlerName: currentUser?.name || 'Equipe de Suporte'
    });
  };

  const handleFinishTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishingTicket) return;
    onUpdateTicketStatus(finishingTicket.id, {
      status: 'Concluído',
      handlerName: currentUser?.name || finishingTicket.handlerName || 'Equipe de Suporte',
      identifiedIssue: identifiedIssueInput,
      actionTaken: actionTakenInput,
      feedback: `Identificado: ${identifiedIssueInput} | Realizado: ${actionTakenInput}`
    });
    setFinishingTicket(null);
    setIdentifiedIssueInput('');
    setActionTakenInput('');
  };

  // Count finished tickets
  const finishedCount = tickets.filter(t => t.status === 'Concluído').length;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Search requester or subject
      const matchesSearch = searchRequester.trim() === '' || 
        t.requesterName.toLowerCase().includes(searchRequester.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchRequester.toLowerCase());

      const matchesStatus = filterStatus === 'Todos' || t.status === filterStatus;
      const matchesSeverity = filterSeverity === 'Todas' || t.severity === filterSeverity;
      const matchesModule = filterModule === 'Todos' || t.module === filterModule;
      
      const matchesDate = !filterDate || t.createdAt.startsWith(filterDate);

      return matchesSearch && matchesStatus && matchesSeverity && matchesModule && matchesDate;
    });
  }, [tickets, searchRequester, filterStatus, filterSeverity, filterModule, filterDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-emerald-600" />
            <span>Central de Suporte & Chamados (Helpdesk)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Abra chamados técnicos e acompanhe o andamento e resoluções da equipe corporativa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Contador de Chamados Finalizados para a Equipe de Gestão / Sistema */}
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div className="text-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Chamados Finalizados</span>
              <span className="font-black text-emerald-900 text-sm">{finishedCount}</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Novo Chamado</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filtros de Pesquisa & Organização</span>
          </h3>
          {(searchRequester || filterStatus !== 'Todos' || filterSeverity !== 'Todas' || filterModule !== 'Todos' || filterDate) && (
            <button
              onClick={() => {
                setSearchRequester('');
                setFilterStatus('Todos');
                setFilterSeverity('Todas');
                setFilterModule('Todos');
                setFilterDate('');
              }}
              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Buscar por Solicitante / Assunto */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por solicitante ou assunto..."
              value={searchRequester}
              onChange={e => setSearchRequester(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl bg-slate-50 text-xs font-semibold focus:bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded-xl bg-slate-50 text-xs font-bold"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Recebido">Recebido</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {/* Gravidade */}
          <div>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="w-full p-2 border rounded-xl bg-slate-50 text-xs font-bold"
            >
              <option value="Todas">Gravidade: Todas</option>
              {SEVERITY_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Módulo / Sessão */}
          <div>
            <select
              value={filterModule}
              onChange={e => setFilterModule(e.target.value)}
              className="w-full p-2 border rounded-xl bg-slate-50 text-xs font-bold"
            >
              <option value="Todos">Módulo: Todos</option>
              {MODULE_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Data (Dia, Mês, Ano) */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full p-2 border rounded-xl bg-slate-50 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.map(ticket => {
          const isUrgent = ticket.severity === 'Crítica / URGENTE';
          return (
            <div
              key={ticket.id}
              className={`bg-white p-5 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between ${
                isUrgent ? 'border-rose-300 ring-2 ring-rose-100' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {ticket.module}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{ticket.subject}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      ticket.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                      ticket.status === 'Recebido' ? 'bg-indigo-100 text-indigo-800' :
                      ticket.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                      ticket.severity === 'Baixa' ? 'bg-slate-100 text-slate-700' :
                      ticket.severity === 'Média' ? 'bg-blue-50 text-blue-700' :
                      ticket.severity === 'Alta' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-100 text-rose-800 font-black animate-pulse'
                    }`}>
                      {ticket.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {ticket.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t text-[11px] text-slate-500">
                <div className="flex justify-between items-center text-[10px]">
                  <div>
                    <strong className="text-slate-700 block">{ticket.requesterName}</strong>
                    <span className="text-slate-400">{ticket.requesterRole || 'Colaborador'}</span>
                  </div>
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg">Aberto em: {ticket.createdAt}</span>
                </div>

                {/* Status / Handler Info */}
                {ticket.handlerName && (
                  <div className="p-2.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Recebido por: {ticket.handlerName}</span>
                    </div>
                    {ticket.receivedAt && (
                      <span className="text-[10px] text-slate-400 block">Registrado em: {ticket.receivedAt}</span>
                    )}
                  </div>
                )}

                {/* Resolution / Feedback */}
                {ticket.status === 'Concluído' && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 text-[11px]">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Retorno Técnico da Solução:</span>
                    </span>
                    {ticket.identifiedIssue && (
                      <p className="text-emerald-900"><strong>Identificado:</strong> {ticket.identifiedIssue}</p>
                    )}
                    {ticket.actionTaken && (
                      <p className="text-emerald-900"><strong>Realizado:</strong> {ticket.actionTaken}</p>
                    )}
                  </div>
                )}

                {/* Notice for Clinic Admin */}
                {isClinicAdmin && (
                  <div className="text-[10px] font-bold text-slate-400 italic bg-slate-50 p-2 rounded-xl text-center border">
                    Visualização Informativa (Acompanhamento da Clínica)
                  </div>
                )}

                {/* Workflow Actions for Founder / System Support Team */}
                {isSystemTeam && (
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    {ticket.status === 'Pendente' && (
                      <button
                        onClick={() => handleReceiveTicket(ticket.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Marcar Recebido</span>
                      </button>
                    )}

                    {(ticket.status === 'Pendente' || ticket.status === 'Recebido') && (
                      <button
                        onClick={() => handleInProgressTicket(ticket.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Em Andamento</span>
                      </button>
                    )}

                    {ticket.status !== 'Concluído' && (
                      <button
                        onClick={() => setFinishingTicket(ticket)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Finalizar Chamado</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="col-span-full p-10 text-center bg-white rounded-3xl border text-slate-400 font-bold space-y-2">
            <LifeBuoy className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
            <p>Nenhum chamado de suporte encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* Modal: Abrir Novo Chamado */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Abrir Novo Chamado de Suporte" maxWidth="max-w-xl">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="font-bold block">Assunto do Problema ou Dúvida *</label>
            <input
              required
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white"
              placeholder="Ex: Erro ao salvar anamnese do paciente ou lentidão na agenda"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Módulo / Sessão Onde Ocorreu *</label>
              <select
                value={module}
                onChange={e => setModule(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white font-bold"
              >
                {MODULE_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Gravidade do Problema *</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full p-2.5 border rounded-xl bg-white font-bold"
              >
                {SEVERITY_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Descrição Detalhada do Problema *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white"
              placeholder="Explique detalhadamente o que aconteceu, passos para reproduzir ou dúvidas..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">Enviar Chamado</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Finalizar Chamado com Retorno Técnico */}
      <Modal isOpen={!!finishingTicket} onClose={() => setFinishingTicket(null)} title="Finalizar Chamado & Registrar Retorno Técnico" maxWidth="max-w-xl">
        {finishingTicket && (
          <form onSubmit={handleFinishTicketSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-2xl border space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">{finishingTicket.module} - {finishingTicket.severity}</span>
              <span className="font-extrabold text-slate-900 block text-sm">{finishingTicket.subject}</span>
              <p className="text-[11px] text-slate-600 mt-1"><strong>Solicitante:</strong> {finishingTicket.requesterName}</p>
              <p className="text-[11px] text-slate-600"><strong>Descrição:</strong> {finishingTicket.description}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold block text-slate-800">O que foi Identificado? (Diagnóstico) *</label>
              <textarea
                required
                rows={3}
                value={identifiedIssueInput}
                onChange={e => setIdentifiedIssueInput(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
                placeholder="Descreva a causa raiz ou o que foi diagnosticado..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block text-slate-800">O que foi Feito? (Ação Corretiva / Orientação) *</label>
              <textarea
                required
                rows={3}
                value={actionTakenInput}
                onChange={e => setActionTakenInput(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
                placeholder="Descreva a solução aplicada, correção realizada ou instrução repassada..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setFinishingTicket(null)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl cursor-pointer shadow-lg shadow-emerald-600/20">
                Concluir & Enviar Retorno
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
