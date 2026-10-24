import React, { useState } from 'react';
import { Menu, MoveUp, MoveDown, Save, RotateCcw, FolderTree } from 'lucide-react';

export default function MenuSettings({ activeClinicData, onSaveMenuConfig }) {
  // Configuração padrão dos itens de menu e separadores
  const defaultSections = [
    {
      id: 'reception',
      separatorName: 'Recepção & Atendimento',
      items: [
        { id: 'dashboard', label: 'Recepção do Dia' },
        { id: 'appointments', label: 'Agenda' },
        { id: 'patients', label: 'Cadastro de Pacientes' },
        { id: 'waitingList', label: 'Lista de Espera' },
        { id: 'staff', label: 'Equipe & Profissionais' }
      ]
    },
    {
      id: 'clinical',
      separatorName: 'Prontuário & Documentos',
      items: [
        { id: 'history', label: 'Histórico Clínico' },
        { id: 'goalsPTI', label: 'Plano Terapêutico (PTI/PEI)' },
        { id: 'soap', label: 'Evolução (SOAP)' },
        { id: 'anamnesis', label: 'Anamneses & Avaliação' }
      ]
    },
    {
      id: 'management',
      separatorName: 'Gestão & Configuração',
      items: [
        { id: 'financial', label: 'Financeiro & Repasses' },
        { id: 'theme', label: 'Personalizar Tema' },
        { id: 'menuConfig', label: 'Organizar Menus' }
      ]
    },
    {
      id: 'tools',
      separatorName: 'Ferramentas',
      items: [
        { id: 'telehealth', label: 'Teleconsulta' },
        { id: 'whatsapp', label: 'Notificações WhatsApp' },
        { id: 'helpdesk', label: 'Suporte & Ajuda' }
      ]
    }
  ];

  const [sections, setSections] = useState(activeClinicData?.menuConfig || defaultSections);

  const handleSeparatorNameChange = (sectionIndex, newName) => {
    const updated = [...sections];
    updated[sectionIndex].separatorName = newName;
    setSections(updated);
  };

  const moveItem = (sectionIndex, itemIndex, direction) => {
    const updated = [...sections];
    const items = [...updated[sectionIndex].items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[itemIndex];
    items[itemIndex] = items[targetIndex];
    items[targetIndex] = temp;

    updated[sectionIndex].items = items;
    setSections(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveMenuConfig(sections);
  };

  const handleReset = () => {
    setSections(defaultSections);
    onSaveMenuConfig(defaultSections);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2 mb-4 border-b pb-4">
          <FolderTree className="w-5 h-5 text-emerald-600" />
          <span>Organização de Menus e Separadores</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Personalize a ordem dos itens dentro de cada separador e altere os nomes dos títulos da barra lateral da sua clínica.
        </p>

        <form onSubmit={handleSave} className="space-y-8">
          {sections.map((section, sIndex) => (
            <div key={section.id} className="p-4 bg-slate-50 border rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider w-full sm:w-auto">Nome do Separador:</label>
                <input
                  type="text"
                  value={section.separatorName}
                  onChange={(e) => handleSeparatorNameChange(sIndex, e.target.value)}
                  className="w-full sm:w-80 p-2 border rounded-xl text-xs bg-white font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2 pl-0 sm:pl-4 border-l-2 border-emerald-500">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Itens deste Separador (Ordem de Exibição):</span>
                {section.items.map((item, iIndex) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-white border rounded-xl shadow-sm text-xs">
                    <span className="font-extrabold text-slate-800">{item.label}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => moveItem(sIndex, iIndex, 'up')}
                        disabled={iIndex === 0}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 font-bold"
                        title="Mover para cima"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(sIndex, iIndex, 'down')}
                        disabled={iIndex === section.items.length - 1}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700 font-bold"
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center space-x-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ordem dos Menus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}