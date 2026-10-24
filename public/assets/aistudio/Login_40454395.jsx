import React from 'react';
import { Stethoscope, User, Lock, ChevronRight, AlertCircle, AlertTriangle } from 'lucide-react';

export default function Login({
  loginIdentifier,
  setLoginIdentifier,
  loginPassword,
  setLoginPassword,
  failedLoginAttempts,
  onLogin
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CliniGestor</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Sistema de Gestão Clínica</p>
        </div>

        <form onSubmit={onLogin} className="p-8 space-y-4 text-xs font-semibold">
          {failedLoginAttempts >= 3 ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-bold">
                Usuário ou senha incorreto. Você atingiu o limite de tentativas. Por favor, entre em contato com o Administrador.
              </p>
            </div>
          ) : failedLoginAttempts > 0 ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-bold">
                Usuário ou senha incorreto. Você possui {3 - failedLoginAttempts} tentativa{3 - failedLoginAttempts > 1 ? 's' : ''} restante{3 - failedLoginAttempts > 1 ? 's' : ''} antes do bloqueio.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-medium text-center">
              Você tem <strong>3 tentativas</strong> antes do bloqueio de acesso.
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">E-mail ou CPF Cadastrado *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="text"
                placeholder="seu.email@exemplo.com ou 000.000.000-00"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Senha de Acesso *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center space-x-2 mt-2"
          >
            <span>Acessar Painel Clínico</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}