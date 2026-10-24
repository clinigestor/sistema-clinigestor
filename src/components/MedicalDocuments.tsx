import React, { useState } from 'react';
import { 
  FileText, Pill, Stethoscope, Receipt, Printer, Plus, Trash2, 
  Search, Calendar, UserCheck, ShieldCheck, Download, Eye, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { MedicalDocument, Patient, User, Clinic } from '../types';
import { formatCpfCnpj } from '../utils/helpers';
import Modal from './Modal';

interface MedicalDocumentsProps {
  documents: MedicalDocument[];
  patients: Patient[];
  professionals: User[];
  currentClinic: Clinic | null;
  currentUser: User | null;
  onSaveDocument: (doc: MedicalDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export default function MedicalDocuments({
  documents,
  patients,
  professionals,
  currentClinic,
  currentUser,
  onSaveDocument,
  onDeleteDocument
}: MedicalDocumentsProps) {
  const [activeTab, setActiveTab] = useState<'receita' | 'atestado' | 'exame' | 'recibo'>('receita');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocToPrint, setSelectedDocToPrint] = useState<MedicalDocument | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [professionalId, setProfessionalId] = useState(currentUser?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  
  // Specific fields
  const [cid, setCid] = useState('');
  const [restDays, setRestDays] = useState('1');
  const [companionName, setCompanionName] = useState('');
  const [isSpecialControl, setIsSpecialControl] = useState(false);
  const [dosageInstructions, setDosageInstructions] = useState('');
  const [amount, setAmount] = useState('250,00');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const selectedPatient = patients.find(p => p.id === patientId);
  const selectedProfessional = professionals.find(p => p.id === professionalId) || currentUser;

  const handleOpenNew = (type: 'receita' | 'atestado' | 'exame' | 'recibo') => {
    setActiveTab(type);
    setPatientId(patients[0]?.id || '');
    setProfessionalId(currentUser?.id || professionals[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setCid('');
    setRestDays('1');
    setCompanionName('');
    setIsSpecialControl(false);
    setDosageInstructions('');
    setAmount('250,00');
    setPaymentMethod('PIX');

    if (type === 'receita') {
      setTitle('Receituário Terapêutico');
      setContent('1. Dipirona 500mg -------- 1 caixa\n   Tomar 1 comprimido de 6 em 6 horas se dor ou febre.\n\n2. Paracetamol 750mg ---- 1 caixa\n   Tomar 1 comprimido a cada 8 horas em caso de dor moderada.');
      setDosageInstructions('Uso oral adulto. Ingerir com água após as refeições.');
    } else if (type === 'atestado') {
      setTitle('Atestado Médico de Afastamento');
      setContent('Atesto para os devidos fins que o(a) paciente esteve sob meus cuidados profissionais no dia de hoje, necessitando de repouso por motivo de saúde.');
    } else if (type === 'exame') {
      setTitle('Solicitação de Exames Complementares');
      setContent('- Hemograma completo com plaquetas\n- Glicemia de jejum e Hemoglobina Glicada (HbA1c)\n- Lipidograma completo (Colesterol Total, HDL, LDL, Triglicerídeos)\n- TSH e T4 Livre\n- Ureia e Creatinina');
    } else if (type === 'recibo') {
      setTitle('Recibo de Honorários Profissionais');
      setContent('Recebi a quantia referente aos serviços profissionais de consulta clínica prestados ao paciente acima qualificado.');
    }

    setIsNewModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Selecione um paciente cadastrado.');
      return;
    }

    const doc: MedicalDocument = {
      id: 'doc-' + Date.now(),
      clinicId: currentClinic?.id || 'system',
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      professionalId: selectedProfessional?.id || 'prof-01',
      professionalName: selectedProfessional?.name || 'Profissional',
      professionalRegistry: selectedProfessional?.registryNumber || 'CRM/CRP 00000',
      type: activeTab,
      title,
      date,
      content,
      cid: activeTab === 'atestado' ? cid : undefined,
      restDays: activeTab === 'atestado' && restDays ? parseInt(restDays) : undefined,
      companionName: activeTab === 'atestado' ? companionName : undefined,
      isSpecialControl: activeTab === 'receita' ? isSpecialControl : undefined,
      dosageInstructions: activeTab === 'receita' ? dosageInstructions : undefined,
      amount: activeTab === 'recibo' && amount ? parseFloat(amount.replace('.', '').replace(',', '.')) : undefined,
      paymentMethod: activeTab === 'recibo' ? paymentMethod : undefined,
      createdAt: new Date().toISOString()
    };

    onSaveDocument(doc);
    setIsNewModalOpen(false);
    setSelectedDocToPrint(doc);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.professionalName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Area - only visible on screen when preview modal open or when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-medical-doc, #printable-medical-doc * {
            visibility: visible;
          }
          #printable-medical-doc {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 2.5cm;
            background: white !important;
            color: black !important;
            font-size: 13pt;
            line-height: 1.6;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Documentos Clínicos, Receitas & Atestados</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissão rápida de receitas com posologia, atestados com CID-10, pedidos de exames e recibos para reembolso.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenNew('receita')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Pill className="w-4 h-4" />
            <span>Nova Receita</span>
          </button>

          <button
            onClick={() => handleOpenNew('atestado')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Novo Atestado</span>
          </button>

          <button
            onClick={() => handleOpenNew('exame')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Pedido de Exame</span>
          </button>

          <button
            onClick={() => handleOpenNew('recibo')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Recibo / Reembolso</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por paciente, documento ou profissional..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold">
          {filteredDocs.length} documento(s) emitido(s)
        </span>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-extrabold text-slate-700">Nenhum documento clínico emitido ainda</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Utilize os botões acima para emitir receitas com posologia, atestados médicos, requisições de exames ou recibos para reembolso.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase font-extrabold text-[10px] text-slate-400 border-b">
              <tr>
                <th className="p-4">Tipo & Título</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Profissional Emissor</th>
                <th className="p-4">Data Emissão</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocs.map(doc => {
                const badgeColor = 
                  doc.type === 'receita' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  doc.type === 'atestado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  doc.type === 'exame' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                  'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${badgeColor}`}>
                          {doc.type}
                        </span>
                        <span className="font-extrabold text-slate-800">{doc.title}</span>
                      </div>
                      {doc.isSpecialControl && (
                        <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                          ⚠️ Receita de Controle Especial
                        </span>
                      )}
                      {doc.cid && (
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          CID-10: {doc.cid} {doc.restDays ? `• ${doc.restDays} dia(s) de repouso` : ''}
                        </span>
                      )}
                      {doc.amount && (
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          Valor: R$ {doc.amount.toFixed(2)} ({doc.paymentMethod})
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{doc.patientName}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700 block">{doc.professionalName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.professionalRegistry || 'CRM/Registro'}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(doc.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDocToPrint(doc)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-extrabold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition"
                        title="Visualizar e Imprimir Documento"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o documento "${doc.title}"?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer transition inline-flex"
                        title="Excluir documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Documento */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title={`Emitir ${activeTab.toUpperCase()}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Paciente *</label>
              <select
                required
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white font-bold text-slate-800"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Profissional Emissor *</label>
              <select
                required
                value={professionalId}
                onChange={e => setProfessionalId(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white font-bold text-slate-800"
              >
                {professionals.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.registryNumber ? `(${u.registryNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Título do Documento *</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Data de Emissão</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Type specific fields */}
          {activeTab === 'receita' && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpecialControl}
                  onChange={e => setIsSpecialControl(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="font-extrabold text-amber-900">
                  Receita de Controle Especial (Notificação de Receita / 2 Vias)
                </span>
              </label>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Orientações Gerais de Uso / Posologia</label>
                <input
                  type="text"
                  placeholder="Ex: Uso contínuo. Tomar 30 minutos antes do almoço."
                  value={dosageInstructions}
                  onChange={e => setDosageInstructions(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'atestado' && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Dias de Afastamento</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={restDays}
                  onChange={e => setRestDays(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">CID-10 (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: J00, F41.1, M54.5"
                  value={cid}
                  onChange={e => setCid(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Nome do Acompanhante (Se houver)</label>
                <input
                  type="text"
                  placeholder="Apenas para declaração"
                  value={companionName}
                  onChange={e => setCompanionName(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'recibo' && (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Valor dos Honorários (R$)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white font-mono font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white font-bold"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro Espécie</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                </select>
              </div>
            </div>
          )}

          {/* Content field */}
          <div>
            <label className="block text-slate-700 mb-1 font-bold">
              {activeTab === 'receita' ? 'Prescrição (Medicamentos e Posologia) *' :
               activeTab === 'atestado' ? 'Texto do Atestado Médico *' :
               activeTab === 'exame' ? 'Relação de Exames Solicitados *' :
               'Descrição dos Serviços Clínicos *'}
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-3 border rounded-xl bg-white font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar e Visualizar Impressão</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal / Visualizador de Impressão Timbrado */}
      {selectedDocToPrint && (
        <Modal
          isOpen={!!selectedDocToPrint}
          onClose={() => setSelectedDocToPrint(null)}
          title="Documento Pronto para Impressão / PDF"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-2xl no-print">
              <span className="text-xs font-bold text-slate-600">
                Pressione o botão para imprimir ou salvar como PDF no navegador.
              </span>
              <button
                onClick={handleTriggerPrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora (PDF)</span>
              </button>
            </div>

            {/* Documento Timbrado */}
            <div
              id="printable-medical-doc"
              className="bg-white p-8 md:p-12 border rounded-2xl shadow-sm text-slate-800 space-y-8 font-serif leading-relaxed"
            >
              {/* Cabeçalho da Clínica */}
              <div className="border-b-2 border-emerald-800 pb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-emerald-950 font-sans tracking-tight">
                    {currentClinic?.name || 'Clínica Médica Especializada'}
                  </h1>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {currentClinic?.address ? `${currentClinic.address}, nº ${currentClinic.addressNumber}` : 'Endereço da Clínica'}
                    {currentClinic?.cnpj ? ` • CNPJ: ${formatCpfCnpj(currentClinic.cnpj)}` : ''}
                  </p>
                </div>
                {currentClinic?.theme?.logoUrl && (
                  <img src={currentClinic.theme.logoUrl} alt="Logo" className="max-h-12 object-contain" />
                )}
              </div>

              {/* Título do Documento */}
              <div className="text-center py-2">
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-slate-900 border-b inline-block px-8 pb-1">
                  {selectedDocToPrint.title}
                </h2>
                {selectedDocToPrint.isSpecialControl && (
                  <p className="text-xs font-bold text-rose-700 font-sans mt-1 uppercase">
                    1ª Via - Retenção da Farmácia / 2ª Via - Orientação do Paciente
                  </p>
                )}
              </div>

              {/* Dados do Paciente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-sans space-y-1">
                <p><strong>Paciente:</strong> {selectedDocToPrint.patientName}</p>
                <p><strong>Data de Emissão:</strong> {new Date(selectedDocToPrint.date).toLocaleDateString('pt-BR')}</p>
                {selectedDocToPrint.companionName && (
                  <p><strong>Acompanhante:</strong> {selectedDocToPrint.companionName}</p>
                )}
                {selectedDocToPrint.cid && (
                  <p><strong>Diagnóstico (CID-10):</strong> {selectedDocToPrint.cid}</p>
                )}
                {selectedDocToPrint.restDays !== undefined && (
                  <p><strong>Período de Afastamento:</strong> {selectedDocToPrint.restDays} dia(s)</p>
                )}
              </div>

              {/* Corpo do Documento */}
              <div className="min-h-[180px] text-sm whitespace-pre-wrap leading-relaxed px-2 font-mono">
                {selectedDocToPrint.content}
              </div>

              {selectedDocToPrint.dosageInstructions && (
                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-xs font-sans">
                  <strong>Orientações ao Paciente:</strong> {selectedDocToPrint.dosageInstructions}
                </div>
              )}

              {selectedDocToPrint.amount !== undefined && (
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 text-xs font-sans">
                  <strong>Valor Recebido:</strong> R$ {selectedDocToPrint.amount.toFixed(2)} ({selectedDocToPrint.paymentMethod})
                </div>
              )}

              {/* Rodapé e Assinatura */}
              <div className="pt-12 text-center">
                <div className="w-64 border-t border-slate-400 mx-auto mb-1"></div>
                <p className="font-bold text-sm font-sans">{selectedDocToPrint.professionalName}</p>
                <p className="text-xs text-slate-500 font-sans">
                  {selectedDocToPrint.professionalRegistry || 'CRM / CRP Especialista'}
                </p>
                <p className="text-[10px] text-slate-400 font-sans mt-6">
                  Documento emitido eletronicamente via Sistema CliniGestor em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
