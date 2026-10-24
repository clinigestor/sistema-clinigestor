import React, { useState } from 'react';
import { Terminal, Database, Users, ShieldAlert, CheckCircle2, RefreshCw, Copy, Check } from 'lucide-react';
import { User, Clinic, AuditLog } from '../types';
import { formatCpf } from '../utils/helpers';
import Modal from './Modal';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  clinics: Clinic[];
  auditLogs: AuditLog[];
  onResetDb?: () => void;
}

export default function AuditLogsModal({
  isOpen,
  onClose,
  users,
  clinics,
  auditLogs,
  onResetDb
}: AuditLogsModalProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'clinics'>('logs');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyDiagnostics = () => {
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      clinicsCount: clinics.length,
      usersCount: users.length,
      clinics: clinics.map(c => ({
        id: c.id,
        name: c.name,
        cnpj: c.cnpj,
        adminName: c.adminName,
        adminCpf: c.adminCpf,
        adminEmail: c.adminEmail,
        status: c.status
      })),
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        cpf: u.cpf,
        role: u.role,
        clinicId: u.clinicId,
        mustChangePassword: u.mustChangePassword,
        active: u.active
      })),
      recentLogs: auditLogs.slice(0, 15)
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Auditoria & Diagnóstico do Banco de Dados" maxWidth="max-w-4xl">
      <div className="space-y-4 text-xs">
        {/* Barra superior de abas e exportação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                activeTab === 'logs' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Logs de Eventos ({auditLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                activeTab === 'users' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuários no BD ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('clinics')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition ${
                activeTab === 'clinics' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Clínicas no BD ({clinics.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyDiagnostics}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center space-x-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Aba: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] max-h-96 overflow-y-auto space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="border-b border-slate-800 pb-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">[{log.type}]</span>
                    <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-100 mt-0.5">{log.details}</p>
                  {log.cpf && <span className="text-[10px] text-slate-400">CPF: {formatCpf(log.cpf)} | </span>}
                  {log.clinicId && <span className="text-[10px] text-slate-400">Clínica: {log.clinicId}</span>}
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-slate-500 italic text-center py-4">Nenhum evento registrado até o momento.</p>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo Aba: Usuários */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
                <tr>
                  <th className="p-3">Nome / E-mail</th>
                  <th className="p-3">CPF (Login)</th>
                  <th className="p-3">Perfil / Cargo</th>
                  <th className="p-3">Clínica ID</th>
                  <th className="p-3">1º Acesso Pendente?</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800">{formatCpf(u.cpf)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'clinic_admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role === 'superadmin' ? 'Fundador' : u.role === 'clinic_admin' ? 'Admin Clínica' : u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{u.clinicId}</td>
                    <td className="p-3">
                      {u.mustChangePassword ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Sim (Mudar123)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Não (Senha Pessoal)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${u.active ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u.active ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conteúdo Aba: Clínicas */}
        {activeTab === 'clinics' && (
          <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
                <tr>
                  <th className="p-3">Clínica / CNPJ</th>
                  <th className="p-3">Admin Responsável</th>
                  <th className="p-3">CPF Admin</th>
                  <th className="p-3">ID do Tenant</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-700">
                {clinics.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.cnpj}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block">{c.adminName}</span>
                      <span className="text-[10px] text-slate-400">{c.adminEmail}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-800">{formatCpf(c.adminCpf)}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{c.id}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Ativa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {clinics.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic font-bold">
                      Nenhuma clínica cadastrada no banco de dados. O Fundador cadastrará manualmente através do módulo "Gestão de Clínicas".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t">
          {onResetDb ? (
            <button
              onClick={() => {
                if (confirm('Atenção: Deseja redefinir a base de dados para o estado inicial de fábrica (Apenas Fundador, 0 clínicas)?')) {
                  onResetDb();
                }
              }}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Redefinir Banco de Dados</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </Modal>
  );
}
