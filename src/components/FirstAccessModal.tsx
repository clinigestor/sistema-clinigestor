import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import Modal from './Modal';

interface FirstAccessModalProps {
  user: User | null;
  isOpen: boolean;
  onSaveNewPassword: (newPassword: string) => void;
  onCancel: () => void;
}

export default function FirstAccessModal({
  user,
  isOpen,
  onSaveNewPassword,
  onCancel
}: FirstAccessModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === 'Mudar123') {
      setError('A nova senha não pode ser a senha padrão "Mudar123". Escolha uma senha pessoal segura.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não coincide com a nova senha digitada.');
      return;
    }

    onSaveNewPassword(newPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Redefinição Obrigatória de Senha • Primeiro Acesso" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-xs">Atenção, {user.name}!</p>
            <p className="text-[11px] leading-relaxed mt-0.5">
              Por ser seu primeiro acesso utilizando a senha padrão do sistema (<strong>Mudar123</strong>), é obrigatório cadastrar uma nova senha pessoal antes de continuar.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-bold">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="font-bold text-slate-800 block">Nova Senha Pessoal *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha (mínimo 6 dígitos)"
              className="w-full pl-9 pr-10 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-800 block">Confirmar Nova Senha *</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente a nova senha"
              className="w-full pl-9 pr-10 py-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
          >
            Sair
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Senha & Acessar</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
