import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Search, Filter, Calendar, User, Building2, 
  KeyRound, Trash2, Edit3, CheckCircle2, UserCheck, Terminal, 
  Clock, Download, RefreshCw 
} from 'lucide-react';
import { AuditLog, AuditCategory } from '../types';
import { formatCpf } from '../utils/helpers';

interface FounderAuditLogsProps {
  auditLogs: AuditLog[];
  onClearLogs?: () => void;
}

export default function FounderAuditLogs({ auditLogs = [] }: FounderAuditLogsProps) {
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos os Registros', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'cadastro_clinica', label: 'Cadastros de Clínicas', icon: <Building2 className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'admin_sistema', label: 'Administradores do Sistema', icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'admin_clinica', label: 'Administradores das Clínicas', icon: <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'equipe_funcionarios', label: 'Equipe & Funcionários', icon: <User className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'seguranca_acesso', label: 'Segurança & Logins', icon: <KeyRound className="w-3.5 h-3.5 text-rose-500" /> }
  ];

  // Filter logs by category, name, and action type
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // Action type filter
      if (selectedActionType !== 'all' && log.type !== selectedActionType) {
        return false;
      }

      // Search term filter (searches in performer name, target name, details, action, and CPF)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inPerformer = log.performedByName?.toLowerCase().includes(query);
        const inTarget = log.targetName?.toLowerCase().includes(query);
        const inDetails = log.details?.toLowerCase().includes(query);
        const inAction = log.action?.toLowerCase().includes(query);
        const inCpf = log.cpf?.includes(query.replace(/\D/g, ''));
        return inPerformer || inTarget || inDetails || inAction || inCpf;
      }

      return true;
    });
  }, [auditLogs, selectedCategory, searchTerm, selectedActionType]);

  const getCategoryBadge = (cat: AuditCategory) => {
    switch (cat) {
      case 'cadastro_clinica':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Cadastro de Clínica</span>;
      case 'admin_sistema':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">Admin do Sistema</span>;
      case 'admin_clinica':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">Admin da Clínica</span>;
      case 'equipe_funcionarios':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">Equipe / Funcionário</span>;
      case 'seguranca_acesso':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">Segurança & Acesso</span>;
      default:
        return null;
    }
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `clinigestor-auditoria-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner exclusivo do Fundador */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
              Área Exclusiva do Fundador
            </span>
          </div>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <span>Central de Auditoria & Rastreamento de Alterações</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Logs segmentados por categoria e nome. Identifique quem realizou qualquer alteração, data/hora e o cadastro afetado.
          </p>
        </div>

        <button
          onClick={exportLogsAsJson}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl flex items-center space-x-2 border border-slate-700 transition cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar Relatório ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Abas de Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="text-[10px] opacity-70 ml-1 bg-white/20 px-1.5 py-0.2 rounded-full">
              {cat.id === 'all' 
                ? auditLogs.length 
                : auditLogs.filter(l => l.category === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de Pesquisa por Nome e Ação */}
      <div className="bg-white p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por Nome (quem fez ou quem sofreu a alteração), CPF ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="p-2 border rounded-xl bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Todas as Ações</option>
            <option value="CLINIC_CREATED">Criação de Clínicas</option>
            <option value="CLINIC_UPDATED">Atualização de Clínicas</option>
            <option value="CLINIC_DELETED">Exclusão de Clínicas</option>
            <option value="USER_CREATED">Criação de Usuários</option>
            <option value="PASSWORD_RESET">Reset de Senhas</option>
            <option value="PASSWORD_CHANGED">Troca de Senhas</option>
            <option value="LOGIN_SUCCESS">Logins com Sucesso</option>
            <option value="LOGIN_FAILED">Tentativas com Falha</option>
          </select>
        </div>
      </div>

      {/* Lista de Logs de Auditoria */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center text-xs">
          <span className="font-extrabold text-slate-700">
            Exibindo {filteredLogs.length} registro(s) de alteração
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[11px] text-blue-600 hover:underline font-bold"
            >
              Limpar busca
            </button>
          )}
        </div>

        <div className="divide-y text-xs">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50 transition space-y-2.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {getCategoryBadge(log.category)}
                  <span className="font-mono font-black text-slate-800 text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg border">
                    {log.action}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Linha de Rastreabilidade (Quem fez vs Quem sofreu) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Autor da Alteração:
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <strong className="text-slate-900">{log.performedByName}</strong>
                    <span className="text-slate-500 font-mono">({log.performedByRole})</span>
                  </div>
                </div>

                {log.targetName && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Alvo / Cadastro Afetado:
                    </span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <strong className="text-indigo-900">{log.targetName}</strong>
                      {log.cpf && (
                        <span className="text-slate-500 font-mono">CPF: {formatCpf(log.cpf)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição Detalhada da Ação */}
              <p className="text-xs text-slate-700 leading-relaxed pl-1">
                {log.details}
              </p>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-bold space-y-2">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
              <p>Nenhum log encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
