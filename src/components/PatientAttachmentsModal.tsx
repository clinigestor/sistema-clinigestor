import React, { useState } from 'react';
import { Paperclip, Plus, Trash2, FileText, Download, Eye, Image as ImageIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { PatientAttachment, Patient } from '../types';
import Modal from './Modal';

interface PatientAttachmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  attachments: PatientAttachment[];
  onSaveAttachment: (attachment: PatientAttachment) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

export default function PatientAttachmentsModal({
  isOpen,
  onClose,
  patient,
  attachments,
  onSaveAttachment,
  onDeleteAttachment
}: PatientAttachmentsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PatientAttachment['category']>('Exame de Sangue');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileData, setSelectedFileData] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');

  if (!patient) return null;

  const patientAttachments = attachments.filter(a => a.patientId === patient.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setSelectedFileType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFileData(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAttachment: PatientAttachment = {
      id: 'att-' + Date.now(),
      clinicId: patient.clinicId,
      patientId: patient.id,
      title: title.trim(),
      category,
      date,
      fileData: selectedFileData,
      fileName: selectedFileName || `${title}.pdf`,
      fileType: selectedFileType || 'application/pdf',
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    onSaveAttachment(newAttachment);
    setIsAdding(false);
    setTitle('');
    setNotes('');
    setSelectedFileName('');
    setSelectedFileData('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Anexos e Exames: ${patient.fullName}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
          <div>
            <span className="font-extrabold text-slate-800 text-sm block">Documentos & Exames Anexados</span>
            <span className="text-slate-400 text-[11px]">
              Laudos laboratoriais, imagens e arquivos externos vinculados ao prontuário do paciente.
            </span>
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow flex items-center space-x-1.5 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Anexar Novo Arquivo</span>
            </button>
          )}
        </div>

        {/* Form to add new attachment */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <h4 className="font-extrabold text-emerald-900 text-xs">Adicionar Novo Documento / Exame</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Título do Exame / Documento *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Hemograma Completo, Ressonância"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Categoria *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2 border rounded-xl bg-white font-bold"
                >
                  <option value="Exame de Sangue">Exame de Sangue</option>
                  <option value="Imagem (Raio-X/Ressonância)">Imagem (Raio-X/Ressonância)</option>
                  <option value="Laudo Externo">Laudo Externo</option>
                  <option value="Documento Pessoal">Documento Pessoal</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Data do Exame</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Selecionar Arquivo (PDF, JPEG, PNG)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-xl bg-white text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
              {selectedFileName && (
                <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                  Arquivo carregado: {selectedFileName}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Observações Clínicas do Exame</label>
              <textarea
                rows={2}
                placeholder="Ex: Valores alterados em glicemia, solicitado retorno com especialista..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2 border rounded-xl bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow"
              >
                Salvar Anexo
              </button>
            </div>
          </form>
        )}

        {/* List of Attachments */}
        {patientAttachments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-bold">Nenhum exame ou documento anexado para este paciente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {patientAttachments.map(att => (
              <div key={att.id} className="p-3.5 border rounded-2xl bg-white hover:bg-slate-50 transition flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    {att.category.includes('Imagem') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 text-xs block">{att.title}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {att.category}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      Data: {new Date(att.date).toLocaleDateString('pt-BR')}
                    </span>
                    {att.notes && (
                      <p className="text-[11px] text-slate-600 mt-0.5">{att.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {att.fileData && (
                    <a
                      href={att.fileData}
                      download={att.fileName || `${att.title}.pdf`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition inline-flex"
                      title="Baixar Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Excluir anexo "${att.title}"?`)) {
                        onDeleteAttachment(att.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition inline-flex cursor-pointer"
                    title="Excluir Anexo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
