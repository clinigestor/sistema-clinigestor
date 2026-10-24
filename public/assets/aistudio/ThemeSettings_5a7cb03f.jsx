import React, { useState, useRef } from 'react';
import { Palette, Upload, CheckCircle2, RotateCcw, Image as ImageIcon } from 'lucide-react';

const PRESET_PALETTES = [
  { name: 'Esmeralda (Padrão)', primaryColor: '#059669', menuBgColor: '#0f172a', menuTextColor: '#cbd5e1', pageBgColor: '#f1f5f9', textColor: '#1e293b' },
  { name: 'Oceano & Confiança', primaryColor: '#0284c7', menuBgColor: '#0c4a6e', menuTextColor: '#e0f2fe', pageBgColor: '#f0f9ff', textColor: '#0f172a' },
  { name: 'Violeta Neuro', primaryColor: '#7c3aed', menuBgColor: '#3b0764', menuTextColor: '#f3e8ff', pageBgColor: '#faf5ff', textColor: '#1e1b4b' },
  { name: 'Minimalista Dark', primaryColor: '#0d9488', menuBgColor: '#18181b', menuTextColor: '#f4f4f5', pageBgColor: '#e2e8f0', textColor: '#09090b' }
];

export default function ThemeSettings({ activeTheme, onSaveTheme }) {
  const [themeForm, setThemeForm] = useState(activeTheme);
  const fileInputRef = useRef(null);

  const handleColorChange = (key, value) => {
    setThemeForm(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setThemeForm({ ...themeForm, ...preset });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThemeForm(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTheme(themeForm);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2 mb-4 border-b pb-4">
          <Palette className="w-5 h-5 text-emerald-600" />
          <span>Personalizar Identidade Visual</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="font-bold text-sm text-slate-700 block">Logótipo da Clínica</label>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden shadow-inner">
                {themeForm.logoUrl ? (
                  <img src={themeForm.logoUrl} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-2">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition">
                  <Upload className="w-4 h-4" />
                  <span>Carregar Imagem</span>
                </button>
                <p className="text-[10px] text-slate-500 font-medium">Formatos recomendados: PNG ou JPG. Max 2MB.</p>
                {themeForm.logoUrl && (
                  <button type="button" onClick={() => handleColorChange('logoUrl', '')} className="text-[10px] text-rose-600 font-bold hover:underline">
                    Remover Logótipo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <label className="font-bold text-sm text-slate-700 block">Paletas de Cores Prontas</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_PALETTES.map((preset, idx) => (
                <button key={idx} type="button" onClick={() => applyPreset(preset)} className="p-3 border rounded-2xl hover:border-emerald-500 hover:shadow-md transition text-left space-y-2 group">
                  <span className="text-xs font-extrabold text-slate-700 block">{preset.name}</span>
                  <div className="flex rounded-lg overflow-hidden h-6 border">
                    <div style={{ backgroundColor: preset.menuBgColor }} className="flex-1"></div>
                    <div style={{ backgroundColor: preset.primaryColor }} className="flex-1"></div>
                    <div style={{ backgroundColor: preset.pageBgColor }} className="flex-1"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <label className="font-bold text-sm text-slate-700 block">Ajuste Manual de Cores (Avançado)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Cor Principal (Botões)</span>
                  <span className="block text-[10px] text-slate-500">{themeForm.primaryColor}</span>
                </div>
                <input type="color" value={themeForm.primaryColor} onChange={(e) => handleColorChange('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
              </div>

              <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Fundo do Menu Lateral</span>
                  <span className="block text-[10px] text-slate-500">{themeForm.menuBgColor}</span>
                </div>
                <input type="color" value={themeForm.menuBgColor} onChange={(e) => handleColorChange('menuBgColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
              </div>

              <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Fundo Geral da Página</span>
                  <span className="block text-[10px] text-slate-500">{themeForm.pageBgColor}</span>
                </div>
                <input type="color" value={themeForm.pageBgColor} onChange={(e) => handleColorChange('pageBgColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
              </div>

              <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Texto Base do Sistema</span>
                  <span className="block text-[10px] text-slate-500">{themeForm.textColor}</span>
                </div>
                <input type="color" value={themeForm.textColor} onChange={(e) => handleColorChange('textColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
              </div>

              <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700">Texto do Menu Lateral</span>
                  <span className="block text-[10px] text-slate-500">{themeForm.menuTextColor}</span>
                </div>
                <input type="color" value={themeForm.menuTextColor} onChange={(e) => handleColorChange('menuTextColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button type="button" onClick={() => applyPreset(PRESET_PALETTES[0])} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-2 transition">
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center space-x-2 transition">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aplicar Identidade Visual</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}