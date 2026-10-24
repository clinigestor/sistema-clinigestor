import React, { useState } from 'react';
import { Save, Palette, LayoutList, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

export default function SystemSettings({ activeClinicData, onSaveSystemConfig }) {
  const [theme, setTheme] = useState(activeClinicData?.theme || {
    primaryColor: '#059669', menuBgColor: '#0f172a', menuTextColor: '#cbd5e1', pageBgColor: '#f1f5f9', textColor: '#1e293b'
  });

  const defaultMenu = [
    { id: 'dashboard', label: 'Recepção do Dia', visible: true },
    { id: 'appointments', label: 'Agenda Geral', visible: true },
    { id: 'patients', label: 'Pacientes', visible: true },
    { id: 'waitingList', label: 'Lista de Espera', visible: true },
    { id: 'anamnesis', label: 'Anamneses', visible: true },
    { id: 'therapeuticPlan', label: 'Plano Terapêutico (PTI)', visible: true },
    { id: 'soap', label: 'Evolução (SOAP)', visible: true },
    { id: 'clinicalHistory', label: 'Histórico Clínico', visible: true },
    { id: 'financial', label: 'Financeiro', visible: true },
    { id: 'whatsapp', label: 'WhatsApp Notificações', visible: true },
    { id: 'telehealth', label: 'Teleconsulta', visible: true },
  ];

  const [menuConfig, setMenuConfig] = useState(activeClinicData?.menuConfig || defaultMenu);

  const handleThemeChange = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleMoveMenu = (index, direction) => {
    const newMenu = [...menuConfig];
    if (direction === 'up' && index > 0) {
      [newMenu[index - 1], newMenu[index]] = [newMenu[index], newMenu[index - 1]];
    } else if (direction === 'down' && index < newMenu.length - 1) {
      [newMenu[index + 1], newMenu[index]] = [newMenu[index], newMenu[index + 1]];
    }
    setMenuConfig(newMenu);
  };

  const handleToggleMenu = (index) => {
    const newMenu = [...menuConfig];
    newMenu[index].visible = !newMenu[index].visible;
    setMenuConfig(newMenu);
  };

  const handleSave = () => {
    onSaveSystemConfig({ theme, menuConfig });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm">Personalizar Sistema</h2>
          <p className="text-[10px] text-slate-400">Ajuste as cores e a organização visual dos menus da clínica.</p>
        </div>
        <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2">
          <Save className="w-4 h-4" /><span>Guardar Alterações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CORES */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 h-fit">
          <div className="flex items-center space-x-2 text-slate-800 border-b pb-3">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm">Cores e Identidade</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Cor Primária (Botões e Destaques)</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={theme.primaryColor || '#059669'} onChange={e => handleThemeChange('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={theme.primaryColor || '#059669'} onChange={e => handleThemeChange('primaryColor', e.target.value)} className="flex-1 p-2 border rounded-xl text-xs font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Cor de Fundo do Menu Lateral</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={theme.menuBgColor || '#0f172a'} onChange={e => handleThemeChange('menuBgColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={theme.menuBgColor || '#0f172a'} onChange={e => handleThemeChange('menuBgColor', e.target.value)} className="flex-1 p-2 border rounded-xl text-xs font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Cor do Texto do Menu Lateral</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={theme.menuTextColor || '#cbd5e1'} onChange={e => handleThemeChange('menuTextColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={theme.menuTextColor || '#cbd5e1'} onChange={e => handleThemeChange('menuTextColor', e.target.value)} className="flex-1 p-2 border rounded-xl text-xs font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">URL da Logomarca (Opcional)</label>
              <input type="text" placeholder="https://exemplo.com/logo.png" value={theme.logoUrl || ''} onChange={e => handleThemeChange('logoUrl', e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              <p className="text-[10px] text-slate-400 mt-1.5">Se preenchido, a imagem substitui o ícone padrão no topo do menu lateral.</p>
            </div>
          </div>
        </div>

        {/* ORGANIZAÇÃO DOS MENUS */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-slate-800 border-b pb-3">
            <LayoutList className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm">Organização dos Menus</h3>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg">
            Ajuste a ordem dos módulos usando as setas, ou oculte os módulos que a clínica não utiliza clicando no ícone de "Olho". Clique em Guardar para ver o menu lateral mudar na hora!
          </p>
          
          <div className="space-y-2">
            {menuConfig.map((item, index) => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition ${item.visible ? 'bg-white border-slate-200 hover:border-blue-300 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="flex items-center space-x-3">
                  <button type="button" onClick={() => handleToggleMenu(index)} className={`p-1.5 rounded-lg transition-colors ${item.visible ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`} title={item.visible ? 'Ocultar Módulo' : 'Mostrar Módulo'}>
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <span className={`text-xs font-extrabold ${item.visible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{item.label}</span>
                </div>
                
                <div className="flex space-x-1.5">
                  <button type="button" disabled={index === 0} onClick={() => handleMoveMenu(index, 'up')} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border disabled:opacity-20 disabled:cursor-not-allowed transition">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" disabled={index === menuConfig.length - 1} onClick={() => handleMoveMenu(index, 'down')} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border disabled:opacity-20 disabled:cursor-not-allowed transition">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}