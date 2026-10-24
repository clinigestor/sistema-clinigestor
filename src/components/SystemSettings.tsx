import React, { useState } from 'react';
import { Save, Palette, LayoutList, ArrowUp, ArrowDown, Eye, EyeOff, Type } from 'lucide-react';
import { Clinic, ClinicTheme, MenuItemConfig } from '../types';

const FONT_OPTIONS = [
  { label: 'Inter (Padrão)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial / Helvetica', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Roboto', value: '"Roboto", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Serif (Georgia / Times)', value: 'Georgia, serif' },
  { label: 'Monospace (Código)', value: 'ui-monospace, monospace' }
];

const FONT_SIZE_OPTIONS = [
  { label: 'Muito Pequena (11px)', value: '11px' },
  { label: 'Pequena (12px)', value: '12px' },
  { label: 'Compacta (13px)', value: '13px' },
  { label: 'Normal / Padrão (14px)', value: '14px' },
  { label: 'Média (15px)', value: '15px' },
  { label: 'Grande (16px)', value: '16px' },
  { label: 'Acessível (18px)', value: '18px' }
];

interface SystemSettingsProps {
  activeClinicData: Clinic | null;
  onSaveSystemConfig: (data: { theme: ClinicTheme; menuConfig: MenuItemConfig[] }) => void;
}

export default function SystemSettings({ activeClinicData, onSaveSystemConfig }: SystemSettingsProps) {
  const [theme, setTheme] = useState<ClinicTheme>(activeClinicData?.theme || {
    primaryColor: '#059669',
    menuBgColor: '#0f172a',
    menuTextColor: '#cbd5e1',
    pageBgColor: '#f8fafc',
    cardBgColor: '#ffffff',
    textColor: '#1e293b',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px'
  });

  const defaultMenu: MenuItemConfig[] = [
    { id: 'dashboard', label: 'Recepção do Dia', visible: true },
    { id: 'appointments', label: 'Agenda', visible: true },
    { id: 'patients', label: 'Pacientes', visible: true },
    { id: 'waitingList', label: 'Lista de Espera', visible: true },
    { id: 'anamnesis', label: 'Anamneses', visible: true },
    { id: 'therapeuticPlan', label: 'Plano Terapêutico (PTI)', visible: true },
    { id: 'soap', label: 'Evolução (SOAP)', visible: true },
    { id: 'clinicalHistory', label: 'Histórico Clínico', visible: true },
    { id: 'financial', label: 'Financeiro', visible: true },
    { id: 'whatsapp', label: 'WhatsApp Notificações', visible: true },
    { id: 'telehealth', label: 'Teleconsulta', visible: true },
    { id: 'systemConfig', label: 'Personalização do Sistema', visible: true },
    { id: 'helpdesk', label: 'Suporte & Chamados', visible: true }
  ];

  const [menuConfig, setMenuConfig] = useState<MenuItemConfig[]>(
    activeClinicData?.menuConfig && activeClinicData.menuConfig.length > 0 
      ? activeClinicData.menuConfig 
      : defaultMenu
  );

  const handleThemeChange = (key: keyof ClinicTheme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleMoveMenu = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...menuConfig];
    if (direction === 'up' && index > 0) {
      [newMenu[index - 1], newMenu[index]] = [newMenu[index], newMenu[index - 1]];
    } else if (direction === 'down' && index < newMenu.length - 1) {
      [newMenu[index + 1], newMenu[index]] = [newMenu[index], newMenu[index + 1]];
    }
    setMenuConfig(newMenu);
  };

  const handleToggleMenu = (index: number) => {
    const newMenu = [...menuConfig];
    newMenu[index].visible = !newMenu[index].visible;
    setMenuConfig(newMenu);
  };

  const handleSave = () => {
    onSaveSystemConfig({ theme, menuConfig });
    alert('Configurações visuais, cores e menus salvas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-base">Personalizar Cores, Fontes & Menus da Clínica</h2>
          <p className="text-xs text-slate-400 mt-0.5">Ajuste a identidade visual completa, cores do menu, página, tipografia e organize os módulos.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer transition"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CORES & TIPOGRAFIA */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 h-fit">
          <div className="flex items-center space-x-2 text-slate-800 border-b pb-3">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm">Cores e Identidade Visual</h3>
          </div>
          
          <div className="space-y-4 text-xs font-semibold">
            {/* Cor Primária */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cor Primária (Botões e Destaques)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.primaryColor || '#059669'}
                  onChange={e => handleThemeChange('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.primaryColor || '#059669'}
                  onChange={e => handleThemeChange('primaryColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Fundo do Menu Lateral */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fundo do Menu Lateral</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.menuBgColor || '#0f172a'}
                  onChange={e => handleThemeChange('menuBgColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.menuBgColor || '#0f172a'}
                  onChange={e => handleThemeChange('menuBgColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Cor do Texto do Menu Lateral */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cor do Texto do Menu Lateral</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.menuTextColor || '#cbd5e1'}
                  onChange={e => handleThemeChange('menuTextColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.menuTextColor || '#cbd5e1'}
                  onChange={e => handleThemeChange('menuTextColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Fundo da Página */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fundo Geral da Página</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.pageBgColor || '#f8fafc'}
                  onChange={e => handleThemeChange('pageBgColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.pageBgColor || '#f8fafc'}
                  onChange={e => handleThemeChange('pageBgColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Cor do Fundo dos Cartões / Blocos da Página */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fundo dos Cartões e Painéis da Página</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.cardBgColor || '#ffffff'}
                  onChange={e => handleThemeChange('cardBgColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.cardBgColor || '#ffffff'}
                  onChange={e => handleThemeChange('cardBgColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Cor do Texto Geral */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cor do Texto Principal da Página</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.textColor || '#1e293b'}
                  onChange={e => handleThemeChange('textColor', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={theme.textColor || '#1e293b'}
                  onChange={e => handleThemeChange('textColor', e.target.value)}
                  className="flex-1 p-2.5 border rounded-xl font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Tipografia: Fonte & Tamanho */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <Type className="w-4 h-4 text-emerald-600" />
                <h4 className="font-extrabold text-xs uppercase">Tipografia & Fontes</h4>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Família da Fonte</label>
                <select
                  value={theme.fontFamily || FONT_OPTIONS[0].value}
                  onChange={e => handleThemeChange('fontFamily', e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tamanho da Fonte</label>
                <select
                  value={theme.fontSize || '14px'}
                  onChange={e => handleThemeChange('fontSize', e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                >
                  {FONT_SIZE_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pré-visualização ao Vivo */}
            <div className="border-t pt-4 space-y-2">
              <span className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Pré-visualização em Tempo Real:
              </span>
              <div 
                className="p-4 rounded-2xl border space-y-3 shadow-inner"
                style={{ 
                  backgroundColor: theme.pageBgColor || '#f8fafc',
                  fontFamily: theme.fontFamily || 'inherit',
                  fontSize: theme.fontSize || '14px'
                }}
              >
                <div 
                  className="p-3 rounded-xl border shadow-sm flex items-center justify-between"
                  style={{
                    backgroundColor: theme.cardBgColor || '#ffffff',
                    color: theme.textColor || '#1e293b'
                  }}
                >
                  <div>
                    <h5 className="font-extrabold">Exemplo de Cartão</h5>
                    <p className="text-[11px] opacity-80">Texto de exemplo estilizado com a cor e fonte escolhidas.</p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow"
                    style={{ backgroundColor: theme.primaryColor || '#059669' }}
                  >
                    Botão
                  </button>
                </div>

                <div 
                  className="p-2.5 rounded-xl text-xs flex items-center justify-between font-bold"
                  style={{
                    backgroundColor: theme.menuBgColor || '#0f172a',
                    color: theme.menuTextColor || '#cbd5e1'
                  }}
                >
                  <span>Menu Lateral Simulado</span>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] text-white"
                    style={{ backgroundColor: theme.primaryColor || '#059669' }}
                  >
                    Ativo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ORGANIZAÇÃO DOS MENUS */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-slate-800 border-b pb-3">
            <LayoutList className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm">Organização e Visibilidade dos Módulos</h3>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            Oculte módulos que a clínica não utiliza ou reorganize a ordem usando as setas para cima e para baixo.
          </p>
          
          <div className="space-y-2">
            {menuConfig.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  item.visible ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleToggleMenu(index)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      item.visible ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <span className={`text-xs font-extrabold ${item.visible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {item.label}
                  </span>
                </div>
                
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveMenu(index, 'up')}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border disabled:opacity-20 transition cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === menuConfig.length - 1}
                    onClick={() => handleMoveMenu(index, 'down')}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border disabled:opacity-20 transition cursor-pointer"
                  >
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
