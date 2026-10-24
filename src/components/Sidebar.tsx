import React from 'react';
import { 
  Home, Users, Calendar, ListOrdered, DollarSign, FileText, 
  Activity, Target, Clock, MessageCircle, Video, Building2, 
  HelpCircle, Settings, LogOut, Key, UserCheck, Terminal, 
  BookMarked, ChevronDown, ShieldCheck, ShieldAlert,
  Stethoscope, Tv, BarChart3
} from 'lucide-react';
import { User, Clinic, ClinicTheme } from '../types';

interface SidebarProps {
  currentUser: User | null;
  currentClinicData: Clinic | null;
  currentClinicId?: string;
  clinics: Clinic[];
  activeTheme: ClinicTheme;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSelectClinic: (clinicId: string) => void;
  onLogout: () => void;
  onChangePassword: () => void;
  onOpenAuditLogs: () => void;
  todayAppointmentsCount?: number;
  patientsCount?: number;
  waitingListCount?: number;
  onNavigate?: () => void;
}

export default function Sidebar({
  currentUser,
  currentClinicData,
  currentClinicId,
  clinics,
  activeTheme,
  currentTab,
  setCurrentTab,
  onSelectClinic,
  onLogout,
  onChangePassword,
  onOpenAuditLogs,
  todayAppointmentsCount = 0,
  patientsCount = 0,
  waitingListCount = 0,
  onNavigate
}: SidebarProps) {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const effectiveClinicId = currentClinicId !== undefined ? currentClinicId : (currentUser?.clinicId || 'system');
  const isViewingAsClinic = isSuperAdmin && effectiveClinicId !== 'system';
  const isClinicAdmin = currentUser?.role === 'clinic_admin' || isViewingAsClinic;
  const userPerms = currentUser?.permissions || {};

  const NavButton = ({
    id,
    icon,
    label,
    badgeCount = 0,
    hide = false
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    badgeCount?: number;
    hide?: boolean;
  }) => {
    if (hide) return null;
    const isActive = currentTab === id;

    return (
      <button
        type="button"
        onClick={() => {
          setCurrentTab(id);
          onNavigate?.();
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer text-xs ${
          isActive
            ? 'text-white font-extrabold shadow-md'
            : 'text-slate-400 hover:bg-white/5 font-semibold hover:text-slate-200'
        }`}
        style={isActive ? { backgroundColor: activeTheme.primaryColor } : {}}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        {badgeCount > 0 && (
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-2 shrink-0">
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  const canAccessGenApt = userPerms.canAccessAppointments !== false;
  const canAccessMyApt = userPerms.canAccessMyAgenda !== false;
  const showAgenda = isSuperAdmin || (canAccessGenApt || canAccessMyApt);

  const canAccessTheme = isClinicAdmin || isSuperAdmin || userPerms.canAccessTheme !== false;

  const getUserCargoDisplay = () => {
    if (currentUser?.role === 'superadmin') return 'Fundador / Superadmin';
    if (currentUser?.role === 'clinic_admin') return currentUser?.cargo?.trim() || 'Administrador da Clínica';
    if (currentUser?.cargo && currentUser.cargo.trim()) return currentUser.cargo.trim();
    if (currentUser?.specialties && currentUser.specialties.length > 0) return currentUser.specialties.join(', ');
    if (currentUser?.specialty && currentUser.specialty.trim()) return currentUser.specialty.trim();
    if (currentUser?.group === 'corpo_clinico') return 'Profissional Clínico';
    return 'Colaborador Operacional';
  };

  const baseModules = [
    { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Recepção do Dia', badgeCount: todayAppointmentsCount, hide: userPerms.canAccessDashboard === false },
    { id: 'appointments', icon: <Calendar className="w-4 h-4" />, label: canAccessGenApt ? 'Agenda' : 'Agenda Individual', hide: !showAgenda },
    { id: 'patients', icon: <Users className="w-4 h-4" />, label: 'Pacientes', badgeCount: patientsCount, hide: userPerms.canAccessPatients === false },
    { id: 'waitingList', icon: <ListOrdered className="w-4 h-4" />, label: 'Lista de Espera', badgeCount: waitingListCount, hide: userPerms.canAccessWaitingList === false },
    { id: 'anamnesis', icon: <FileText className="w-4 h-4" />, label: 'Anamneses', hide: userPerms.canAccessAnamnesis === false },
    { id: 'therapeuticPlan', icon: <Target className="w-4 h-4" />, label: 'Plano Terapêutico (PTI)', hide: userPerms.canAccessGoalsPTI === false },
    { id: 'soap', icon: <Activity className="w-4 h-4" />, label: 'Evolução (SOAP)', hide: userPerms.canAccessSoap === false },
    { id: 'clinicalHistory', icon: <Clock className="w-4 h-4" />, label: 'Histórico Clínico', hide: userPerms.canAccessHistory === false },
    { id: 'financial', icon: <DollarSign className="w-4 h-4" />, label: 'Financeiro', hide: userPerms.canAccessFinancial === false },
    { id: 'whatsapp', icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp Notificações', hide: userPerms.canAccessWhatsapp === false },
    { id: 'telehealth', icon: <Video className="w-4 h-4" />, label: 'Teleconsulta', hide: userPerms.canAccessTelehealth === false },
    { id: 'systemConfig', icon: <Settings className="w-4 h-4" />, label: 'Personalização do Sistema', hide: userPerms.canAccessTheme === false }
  ];

  return (
    <aside
      className="w-full md:w-64 flex flex-col transition-colors duration-300 shadow-2xl z-20 shrink-0 select-none border-r border-white/5"
      style={{ backgroundColor: activeTheme.menuBgColor, color: activeTheme.menuTextColor }}
    >
      {/* Top Header */}
      <div className="p-5 flex flex-col items-center justify-center border-b border-white/10">
        {currentClinicData?.theme?.logoUrl && !isSuperAdmin ? (
          <img src={currentClinicData.theme.logoUrl} alt="Logo" className="max-h-12 object-contain mb-2" />
        ) : (
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg mb-2"
            style={{ backgroundColor: activeTheme.primaryColor }}
          >
            {isSuperAdmin && effectiveClinicId === 'system' ? (
              <BookMarked className="w-6 h-6 text-white" />
            ) : (
              <span className="text-white font-black text-lg">
                {currentClinicData?.name?.charAt(0) || 'C'}
              </span>
            )}
          </div>
        )}
        
        <h2 className="font-black text-sm text-center text-white truncate max-w-full px-2">
          {isSuperAdmin && effectiveClinicId === 'system'
            ? 'CliniGestor SaaS'
            : currentClinicData?.name || 'CliniGestor'}
        </h2>
        
        <span className="text-[9px] opacity-75 font-bold uppercase tracking-widest mt-0.5 text-center">
          {isViewingAsClinic
            ? 'Visualizando como Clínica'
            : isSuperAdmin && effectiveClinicId === 'system'
            ? 'Portal do Fundador'
            : isClinicAdmin
            ? 'Administração da Clínica'
            : 'Portal Clínico'}
        </span>

        {/* SuperAdmin Multi-Clinic Switcher */}
        {isSuperAdmin && clinics.length > 0 && (
          <div className="w-full mt-3 pt-3 border-t border-white/10">
            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
              Visualizar como Clínica:
            </label>
            <select
              value={effectiveClinicId}
              onChange={(e) => onSelectClinic(e.target.value)}
              className="w-full text-xs font-bold p-1.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
            >
              <option value="system" className="bg-slate-900 text-white">Central SaaS (Fundador)</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} {c.status !== 'Ativa' ? '(Bloqueada)' : ''}
                </option>
              ))}
            </select>
            {isViewingAsClinic && (
              <button
                type="button"
                onClick={() => onSelectClinic('system')}
                className="w-full mt-2 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center space-x-1 cursor-pointer transition shadow"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Voltar à Central SaaS</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {/* Modules Section */}
        {(!isSuperAdmin || effectiveClinicId !== 'system') && (
          <>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-1.5 mt-2 px-2 flex justify-between items-center">
              <span>Módulos do Sistema</span>
              {isViewingAsClinic && (
                <span className="text-emerald-400 font-extrabold text-[9px] lowercase bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  visualização
                </span>
              )}
            </div>
            {baseModules.map(mod => (
              <NavButton
                key={mod.id}
                id={mod.id}
                icon={mod.icon}
                label={mod.label}
                badgeCount={mod.badgeCount}
                hide={isViewingAsClinic ? false : mod.hide}
              />
            ))}
          </>
        )}

        {/* Management & Administration Section */}
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-1.5 mt-5 px-2">
          Gestão & Suporte
        </div>

        {/* Available to Clinic Admins & SuperAdmin inside a clinic */}
        {(isClinicAdmin || isViewingAsClinic) && (
          <NavButton id="staff" icon={<UserCheck className="w-4 h-4" />} label="Equipe & Profissionais" />
        )}

        {/* Exclusivo do Fundador no Portal Central SaaS */}
        {isSuperAdmin && effectiveClinicId === 'system' && (
          <>
            <NavButton id="clinics" icon={<Building2 className="w-4 h-4 text-blue-400" />} label="Gestão de Clínicas" />
            <NavButton id="founderAuditLogs" icon={<ShieldAlert className="w-4 h-4 text-amber-400" />} label="Auditoria & Rastreamento" />
            <NavButton id="devs" icon={<Terminal className="w-4 h-4 text-emerald-400" />} label="Central SaaS & TI" />
          </>
        )}

        <NavButton id="helpdesk" icon={<HelpCircle className="w-4 h-4" />} label="Suporte & Chamados" />
      </nav>

      {/* User Footer Profile & Actions */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center space-x-2.5 mb-2.5 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow"
            style={{ backgroundColor: activeTheme.primaryColor }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="block text-xs font-bold text-white truncate">{currentUser?.name}</span>
            <span className="block text-[10px] text-emerald-300 font-bold truncate" title={getUserCargoDisplay()}>
              {getUserCargoDisplay()}
            </span>
          </div>
        </div>

        <div className={`grid ${(isClinicAdmin || isSuperAdmin) ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
          <button
            type="button"
            onClick={onChangePassword}
            className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition cursor-pointer"
            title="Alterar Senha de Acesso"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          {(isClinicAdmin || isSuperAdmin) && (
            <button
              type="button"
              onClick={onOpenAuditLogs}
              className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
              title="Auditoria & Diagnóstico do BD"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
            title="Sair do Sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
