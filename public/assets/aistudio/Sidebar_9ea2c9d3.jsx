import React from 'react';
import { 
  Home, Users, Calendar, ListOrdered, DollarSign, FileText, 
  Activity, Target, Clock, MessageCircle, Video, Building2, 
  HelpCircle, Settings, LogOut, Key, UserCheck, Terminal, 
  BookMarked 
} from 'lucide-react';

export default function Sidebar({ currentUser, currentClinicData, activeTheme, currentTab, setCurrentTab, isSuperAdmin, isClinicAdmin, userPerms, todayAppointmentsCount, patientsCount, waitingListCount, onLogout, onChangePassword }) {

  const NavButton = ({ id, icon, label, badgeCount = 0, hide = false }) => {
    if (hide) return null;
    const isActive = currentTab === id;
    
    return (
      <button onClick={() => setCurrentTab(id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${isActive ? 'text-white font-extrabold shadow-md' : 'text-slate-400 hover:bg-slate-800 font-semibold hover:text-slate-200'}`} style={isActive ? { backgroundColor: activeTheme.primaryColor } : {}}>
        <div className="flex items-center space-x-3">{icon}<span className="text-xs">{label}</span></div>
        {badgeCount > 0 && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{badgeCount}</span>}
      </button>
    );
  };

  const baseOperationalModules = [
    { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Recepção do Dia', badgeCount: todayAppointmentsCount, hide: !userPerms?.canAccessDashboard },
    { id: 'appointments', icon: <Calendar className="w-4 h-4" />, label: 'Agenda Geral', hide: !userPerms?.canAccessAppointments },
    { id: 'patients', icon: <Users className="w-4 h-4" />, label: 'Pacientes', badgeCount: patientsCount, hide: !userPerms?.canAccessPatients },
    { id: 'waitingList', icon: <ListOrdered className="w-4 h-4" />, label: 'Lista de Espera', badgeCount: waitingListCount, hide: !userPerms?.canAccessWaitingList },
    { id: 'anamnesis', icon: <FileText className="w-4 h-4" />, label: 'Anamneses', hide: !userPerms?.canAccessAnamnesis },
    { id: 'therapeuticPlan', icon: <Target className="w-4 h-4" />, label: 'Plano Terapêutico (PTI)' },
    { id: 'soap', icon: <Activity className="w-4 h-4" />, label: 'Evolução (SOAP)', hide: !userPerms?.canAccessSoap },
    { id: 'clinicalHistory', icon: <Clock className="w-4 h-4" />, label: 'Histórico Clínico' },
    { id: 'financial', icon: <DollarSign className="w-4 h-4" />, label: 'Financeiro', hide: !userPerms?.canAccessFinancial },
    { id: 'whatsapp', icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp Notificações', hide: !userPerms?.canAccessWhatsapp },
    { id: 'telehealth', icon: <Video className="w-4 h-4" />, label: 'Teleconsulta', hide: !userPerms?.canAccessTelehealth }
  ];

  let renderModules = [...baseOperationalModules];
  if (currentClinicData?.menuConfig && Array.isArray(currentClinicData.menuConfig)) {
    renderModules = currentClinicData.menuConfig
      .filter(mc => mc.visible !== false)
      .map(mc => baseOperationalModules.find(m => m.id === mc.id))
      .filter(Boolean);
  }

  return (
    <aside className="w-full md:w-64 flex flex-col transition-colors duration-300 shadow-xl z-10" style={{ backgroundColor: activeTheme.menuBgColor, color: activeTheme.menuTextColor }}>
      
      <div className="p-6 flex flex-col items-center justify-center border-b border-white/10">
        {currentClinicData?.theme?.logoUrl && !isSuperAdmin ? (
          <img src={currentClinicData.theme.logoUrl} alt="Logo" className="max-h-16 object-contain mb-3" />
        ) : (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-3" style={{ backgroundColor: activeTheme.primaryColor }}>
            {isSuperAdmin ? (
              <BookMarked className="w-7 h-7 text-white" />
            ) : (
              <span className="text-white font-black text-xl">{currentClinicData?.name?.charAt(0) || 'C'}</span>
            )}
          </div>
        )}
        <h2 className="font-black text-sm text-center text-white">
          {isSuperAdmin && currentUser?.clinicId === 'system' ? 'CliniGestor' : (currentClinicData?.name || 'Clínica')}
        </h2>
        <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">
          {isSuperAdmin && currentUser?.clinicId === 'system' ? 'Gestão de Clínicas' : 'Painel da Clínica'}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 mt-4 px-2">Módulos da Clínica</div>
        
        {renderModules.map(mod => (
          <NavButton key={mod.id} id={mod.id} icon={mod.icon} label={mod.label} badgeCount={mod.badgeCount} hide={mod.hide} />
        ))}

        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 mt-6 px-2">Gestão & Sistema</div>
        
        {/* AGORA VISÍVEL PARA O ADMIN DA CLÍNICA E O SUPERADMIN */}
        <NavButton id="staff" icon={<UserCheck className="w-4 h-4" />} label="Equipe & Profissionais" hide={!isSuperAdmin && !isClinicAdmin} />
        <NavButton id="systemConfig" icon={<Settings className="w-4 h-4" />} label="Personalizar" hide={!isSuperAdmin && !isClinicAdmin} />
        
        {/* EXCLUSIVO DO FUNDADOR / SUPERADMIN */}
        <NavButton id="clinics" icon={<Building2 className="w-4 h-4" />} label="Gestão de Clínicas" hide={!isSuperAdmin || currentUser?.clinicId !== 'system'} />
        <NavButton id="helpdesk" icon={<HelpCircle className="w-4 h-4" />} label="Suporte Técnico" hide={!userPerms?.canAccessHelpdesk} />
        <NavButton id="devs" icon={<Terminal className="w-4 h-4" />} label="Central SaaS" hide={!isSuperAdmin || currentUser?.clinicId !== 'system'} />
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">{currentUser?.name?.charAt(0)}</div>
          <div className="flex-1 overflow-hidden">
            <span className="block text-xs font-bold text-white truncate">{currentUser?.name}</span>
            <span className="block text-[10px] opacity-60 truncate">{currentUser?.role === 'superadmin' ? 'Fundador / Superadmin' : currentUser?.role === 'clinic_admin' ? 'Administrador da Clínica' : 'Profissional'}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={onChangePassword} className="flex-1 flex justify-center items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition" title="Alterar Senha"><Key className="w-4 h-4" /></button>
          <button onClick={onLogout} className="flex-1 flex justify-center items-center p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition" title="Sair"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}