import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, Lock, ChevronRight, AlertCircle, Eye, EyeOff, User as UserIcon, Calendar, FileText } from 'lucide-react';
import { formatCpf } from '../utils/helpers';
import Modal from './Modal';

interface LoginProps {
  loginUsername: string;
  setLoginUsername: (u: string) => void;
  loginPassword: string;
  setLoginPassword: (pass: string) => void;
  failedLoginAttempts: number;
  errorMessage: string;
  onLogin: (e: React.FormEvent) => void;
  onResetAttempts?: () => void;
  onRecoverPassword: (name: string, birthDate: string, cpf: string, newPass: string) => { success: boolean; message: string };
}

export default function Login({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  failedLoginAttempts,
  errorMessage,
  onLogin,
  onResetAttempts,
  onRecoverPassword
}: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Recovery form state
  const [recoverName, setRecoverName] = useState('');
  const [recoverBirthDate, setRecoverBirthDate] = useState('');
  const [recoverCpf, setRecoverCpf] = useState('');
  const [recoverNewPass, setRecoverNewPass] = useState('');
  const [recoverConfirmPass, setRecoverConfirmPass] = useState('');
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');

  const isLocked = failedLoginAttempts >= 3;

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError('');
    setRecoverSuccess('');

    if (recoverNewPass.length < 6) {
      setRecoverError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (recoverNewPass !== recoverConfirmPass) {
      setRecoverError('A confirmação de senha não coincide.');
      return;
    }

    const res = onRecoverPassword(recoverName, recoverBirthDate, recoverCpf, recoverNewPass);
    if (res.success) {
      setRecoverSuccess(res.message);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setRecoverName('');
        setRecoverBirthDate('');
        setRecoverCpf('');
        setRecoverNewPass('');
        setRecoverConfirmPass('');
        setRecoverSuccess('');
      }, 2500);
    } else {
      setRecoverError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CliniGestor</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Sistema de Gestão Inteligente</p>
        </div>

        <form onSubmit={onLogin} className="p-8 space-y-4 text-xs font-semibold">
          {/* Alertas de Tentativas e Bloqueio */}
          {isLocked ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-2 text-rose-900 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] leading-relaxed font-bold">
                    Limite de 3 tentativas atingido!
                  </p>
                  <p className="text-[10px] text-rose-700 mt-1">
                    Verifique se digitou seus dados corretamente.
                  </p>
                </div>
              </div>
              {onResetAttempts && (
                <button
                  type="button"
                  onClick={onResetAttempts}
                  className="w-full mt-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] transition cursor-pointer shadow-sm text-center"
                >
                  Desbloquear e Tentar Novamente
                </button>
              )}
            </div>
          ) : errorMessage ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] leading-relaxed font-bold">{errorMessage}</p>
                <p className="text-[10px] text-rose-700 mt-0.5">
                  Você possui {3 - failedLoginAttempts} tentativa{3 - failedLoginAttempts > 1 ? 's' : ''} restante{3 - failedLoginAttempts > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          ) : null}

          {/* Campo Login */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Login *</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type="text"
                maxLength={40}
                placeholder="Digite seu login"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value.toLowerCase().trim())}
                disabled={isLocked}
                className="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-700 block">Senha *</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLocked}
                className="w-full pl-9 pr-10 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center space-x-2 mt-3 cursor-pointer"
          >
            <span>Autenticar no CliniGestor</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modal Esqueci Minha Senha */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Recuperação de Senha por Confirmação de Dados"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecoverSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Para redefinir sua senha, informe exatamente o seu <strong>Nome Completo</strong>, <strong>Data de Nascimento</strong> e <strong>CPF</strong> cadastrados no sistema.
          </p>

          {recoverError && <div className="p-3 bg-rose-50 text-rose-800 rounded-xl font-bold">{recoverError}</div>}
          {recoverSuccess && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold">{recoverSuccess}</div>}

          <div className="space-y-1">
            <label className="font-bold block flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Nome Completo *</span>
            </label>
            <input
              required
              type="text"
              placeholder="Digite seu nome completo"
              value={recoverName}
              onChange={e => setRecoverName(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Data de Nascimento *</span>
            </label>
            <input
              required
              type="date"
              value={recoverBirthDate}
              onChange={e => setRecoverBirthDate(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>CPF (11 dígitos) *</span>
            </label>
            <input
              required
              type="text"
              placeholder="000.000.000-00"
              value={recoverCpf}
              onChange={e => setRecoverCpf(formatCpf(e.target.value))}
              className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white font-mono"
            />
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="space-y-1">
              <label className="font-bold block">Nova Senha (Mínimo 6 dígitos) *</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={recoverNewPass}
                onChange={e => setRecoverNewPass(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Confirmar Nova Senha *</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={recoverConfirmPass}
                onChange={e => setRecoverConfirmPass(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow"
            >
              Verificar & Redefinir Senha
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
