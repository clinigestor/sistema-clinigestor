import React, { useState, useRef } from 'react';
import { 
  UserPlus, Search, User, Calendar, Phone, ShieldAlert, 
  Camera, Check, X, Building2, CreditCard, Clock, FileText, CheckCircle2, Edit2, Paperclip 
} from 'lucide-react';
import { Patient, Appointment, User as UserType, PatientAttachment } from '../types';
import { calculateExactAge, formatCpfCnpj, formatPhone, formatCpf } from '../utils/helpers';
import Modal from './Modal';
import PatientAttachmentsModal from './PatientAttachmentsModal';

interface PatientsProps {
  patients: Patient[];
  clinicalSpecialties?: string[];
  appointments?: Appointment[];
  professionals?: UserType[];
  clinicId: string;
  onSavePatient: (patient: Patient) => void;
  canRegisterPatients?: boolean;
  attachments?: PatientAttachment[];
  onSaveAttachment?: (attachment: PatientAttachment) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export default function Patients({
  patients = [],
  clinicalSpecialties = ['Psicologia', 'Fonoaudiologia', 'Psicopedagogia', 'Terapia Ocupacional', 'Nutrição'],
  appointments = [],
  professionals = [],
  clinicId,
  onSavePatient,
  canRegisterPatients = true,
  attachments = [],
  onSaveAttachment = () => {},
  onDeleteAttachment = () => {}
}: PatientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientForAttachments, setSelectedPatientForAttachments] = useState<Patient | null>(null);

  const [photoUrl, setPhotoUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    cpfCnpj: '',
    phone: '',
    isWhatsapp: true,
    attendanceType: 'Presencial' as Patient['attendanceType'],
    paymentType: 'Particular' as Patient['paymentType'],
    healthPlanName: '',
    dueDateParticular: '',
    dueDay: '' as string | number,
    specialties: [] as string[],
    guardianName: '',
    guardianCpf: '',
    guardianPhone: '',
    guardianIsWhatsapp: true
  });

  const ageInfo = calculateExactAge(formData.birthDate);

  const handleOpenNew = () => {
    setEditingPatientId(null);
    setPhotoUrl('');
    setFormData({
      fullName: '',
      birthDate: '',
      cpfCnpj: '',
      phone: '',
      isWhatsapp: true,
      attendanceType: 'Presencial',
      paymentType: 'Particular',
      healthPlanName: '',
      dueDateParticular: '',
      dueDay: '10',
      specialties: [],
      guardianName: '',
      guardianCpf: '',
      guardianPhone: '',
      guardianIsWhatsapp: true
    });
    setIsNewPatientModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setPhotoUrl(patient.photoUrl || '');
    
    // Resolve due day from dueDay or legacy dueDateParticular
    let resolvedDay = patient.dueDay ? String(patient.dueDay) : '';
    if (!resolvedDay && patient.dueDateParticular) {
      const parts = patient.dueDateParticular.split('-');
      if (parts.length === 3) {
        resolvedDay = String(parseInt(parts[2]));
      }
    }
    if (!resolvedDay && patient.paymentType === 'Particular') {
      resolvedDay = '10';
    }

    setFormData({
      fullName: patient.fullName || '',
      birthDate: patient.birthDate || '',
      cpfCnpj: formatCpfCnpj(patient.cpfCnpj || ''),
      phone: formatPhone(patient.phone || ''),
      isWhatsapp: patient.isWhatsapp !== false,
      attendanceType: patient.attendanceType || 'Presencial',
      paymentType: patient.paymentType || 'Particular',
      healthPlanName: patient.healthPlanName || '',
      dueDateParticular: patient.dueDateParticular || '',
      dueDay: resolvedDay,
      specialties: patient.specialties || [],
      guardianName: patient.guardianName || '',
      guardianCpf: formatCpfCnpj(patient.guardianCpf || ''),
      guardianPhone: formatPhone(patient.guardianPhone || ''),
      guardianIsWhatsapp: patient.guardianIsWhatsapp !== false
    });
    setIsNewPatientModalOpen(true);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Não foi possível acessar a webcam. Verifique as permissões de vídeo do seu navegador.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoUrl(canvas.toDataURL('image/png'));
    }
    
    if (video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const toggleSpecialty = (spec: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      return {
        ...prev,
        specialties: exists ? prev.specialties.filter(s => s !== spec) : [...prev.specialties, spec]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ageInfo.isUnder16 && (!formData.guardianName || !formData.guardianCpf)) {
      alert('Para pacientes menores de 16 anos, é obrigatório preencher o Nome e CPF do Responsável Legal.');
      return;
    }

    if (editingPatientId) {
      const existing = patients.find(p => p.id === editingPatientId);
      const updatedPatient: Patient = {
        ...existing,
        id: editingPatientId,
        clinicId: existing?.clinicId || clinicId,
        ...formData,
        dueDay: formData.paymentType === 'Particular' ? (formData.dueDay || '10') : undefined,
        photoUrl: photoUrl || existing?.photoUrl,
        createdAt: existing?.createdAt || new Date().toISOString()
      };
      onSavePatient(updatedPatient);
      alert('Cadastro do paciente atualizado com sucesso!');
    } else {
      const newPatient: Patient = {
        id: 'pat-' + Date.now(),
        clinicId: clinicId,
        ...formData,
        dueDay: formData.paymentType === 'Particular' ? (formData.dueDay || '10') : undefined,
        photoUrl,
        createdAt: new Date().toISOString()
      };
      onSavePatient(newPatient);
      alert('Novo paciente cadastrado com sucesso!');
    }

    setIsNewPatientModalOpen(false);
    setEditingPatientId(null);
    setFormData({
      fullName: '', birthDate: '', cpfCnpj: '', phone: '', isWhatsapp: true,
      attendanceType: 'Presencial', paymentType: 'Particular', healthPlanName: '',
      dueDateParticular: '', dueDay: '10', specialties: [], guardianName: '', guardianCpf: '', guardianPhone: '', guardianIsWhatsapp: true
    });
    setPhotoUrl('');
  };

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpfCnpj?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        
        {canRegisterPatients && (
          <button
            onClick={handleOpenNew}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Paciente</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm text-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase font-extrabold text-[10px] border-b text-slate-400">
            <tr>
              <th className="p-4">Paciente</th>
              <th className="p-4">Data Nasc. / Idade Exata</th>
              <th className="p-4">Faixa Etária</th>
              <th className="p-4">Especialidades</th>
              <th className="p-4">Atendimento / Plano</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPatients.map(patient => {
              const age = calculateExactAge(patient.birthDate);
              return (
                <tr key={patient.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {patient.photoUrl ? (
                        <img src={patient.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border shrink-0">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setSelectedPatientForDetail(patient)}
                          className="font-extrabold text-slate-900 hover:text-emerald-600 hover:underline text-xs text-left cursor-pointer"
                        >
                          {patient.fullName}
                        </button>
                        <span className="block text-[10px] text-slate-400 font-mono">CPF: {formatCpfCnpj(patient.cpfCnpj)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">
                      {patient.birthDate ? patient.birthDate.split('-').reverse().join('/') : 'N/D'}
                    </div>
                    <div className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                      {age.text || 'N/D'}
                    </div>
                  </td>
                  <td className="p-4">
                    {age.isUnder16 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                        Menor de 16 Anos
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border">
                        Maior de Idade
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {patient.specialties && patient.specialties.length > 0 ? (
                        patient.specialties.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[10px]">Nenhuma</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{patient.attendanceType}</div>
                    <div className="text-[10px] text-slate-500">
                      {patient.paymentType === 'Plano de Saúde' ? (
                        patient.healthPlanName
                      ) : (
                        <span>Particular {patient.dueDay ? `(Dia ${patient.dueDay})` : ''}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(patient)}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold rounded-xl text-[10px] transition cursor-pointer flex items-center space-x-1"
                        title="Editar Cadastro Completo do Paciente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setSelectedPatientForAttachments(patient)}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold rounded-xl text-[10px] transition cursor-pointer flex items-center space-x-1"
                        title="Ver e Anexar Exames / Laudos"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Anexos</span>
                      </button>
                      <button
                        onClick={() => setSelectedPatientForDetail(patient)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-[10px] transition cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                  Nenhum paciente cadastrado na clínica até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro de Novo Paciente / Edição */}
      <Modal 
        isOpen={isNewPatientModalOpen} 
        onClose={() => setIsNewPatientModalOpen(false)} 
        title={editingPatientId ? "Editar Cadastro do Paciente" : "Cadastrar Novo Paciente"} 
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700 max-h-[75vh] overflow-y-auto pr-2">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Nome Completo do Paciente *</label>
              <input
                required
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
                placeholder="Ex: João da Silva Santos"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Data de Nascimento *</label>
              <input
                required
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl bg-white"
              />
              {formData.birthDate && (
                <span className={`text-[10px] font-bold block mt-1 ${ageInfo.isUnder16 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {ageInfo.text} ({ageInfo.isUnder16 ? 'Menor de 16 Anos' : 'Maior de Idade'})
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold block">CPF ou CNPJ *</label>
              <input
                required
                type="text"
                value={formData.cpfCnpj}
                onChange={e => setFormData({ ...formData, cpfCnpj: formatCpfCnpj(e.target.value) })}
                className="w-full p-2.5 border rounded-xl bg-white font-mono"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Telefone de Contato *</label>
              <div className="flex items-center space-x-2">
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl bg-white font-mono"
                  placeholder="(00) 00000-0000"
                />
                <label className="flex items-center space-x-1 shrink-0 text-[10px] font-extrabold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isWhatsapp}
                    onChange={e => setFormData({ ...formData, isWhatsapp: e.target.checked })}
                    className="rounded"
                  />
                  <span>WhatsApp</span>
                </label>
              </div>
            </div>
          </div>

          {ageInfo.isUnder16 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Paciente Menor de 16 Anos - Preenchimento do Responsável Legal Obrigatório</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-rose-900 block">Nome do Responsável *</label>
                  <input
                    required
                    type="text"
                    value={formData.guardianName}
                    onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full p-2 border rounded-xl bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-900 block">CPF do Responsável *</label>
                  <input
                    required
                    type="text"
                    value={formData.guardianCpf}
                    onChange={e => setFormData({ ...formData, guardianCpf: formatCpfCnpj(e.target.value) })}
                    className="w-full p-2 border rounded-xl bg-white font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-900 block">Telefone do Responsável *</label>
                  <input
                    required
                    type="text"
                    value={formData.guardianPhone}
                    onChange={e => setFormData({ ...formData, guardianPhone: formatPhone(e.target.value) })}
                    className="w-full p-2 border rounded-xl bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-1">
              <label className="font-bold block">Preferência de Atendimento *</label>
              <select
                value={formData.attendanceType}
                onChange={e => setFormData({ ...formData, attendanceType: e.target.value as Patient['attendanceType'] })}
                className="w-full p-2.5 border rounded-xl bg-white font-bold"
              >
                <option value="Presencial">Presencial</option>
                <option value="Online">Online (Teleconsulta)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Modalidade de Pagamento *</label>
              <select
                value={formData.paymentType}
                onChange={e => setFormData({ ...formData, paymentType: e.target.value as Patient['paymentType'] })}
                className="w-full p-2.5 border rounded-xl bg-white font-bold"
              >
                <option value="Particular">Particular</option>
                <option value="Plano de Saúde">Plano de Saúde / Convênio</option>
              </select>
            </div>

            {formData.paymentType === 'Plano de Saúde' ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold block">Nome do Convênio / Plano de Saúde *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Unimed, Bradesco Saúde, Amil"
                  value={formData.healthPlanName}
                  onChange={e => setFormData({ ...formData, healthPlanName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white"
                />
              </div>
            ) : (
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold block text-slate-800">Dia do Vencimento *</label>
                <select
                  required
                  value={formData.dueDay || ''}
                  onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                >
                  <option value="">Selecione o Dia do Vencimento (1 a 31)</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Todo dia {d}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Todo mês, no dia {formData.dueDay ? formData.dueDay : 'definido'}, o paciente entrará automaticamente no Dashboard com alerta de mensalidade a receber.
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <label className="font-extrabold text-slate-800 block">Especialidades Clínicas de Interesse</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {clinicalSpecialties.map((spec, idx) => {
                const isSelected = formData.specialties.includes(spec);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsNewPatientModalOpen(false)}
              className="px-5 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              {editingPatientId ? "Salvar Alterações do Paciente" : "Salvar Novo Paciente"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cadastro Completo */}
      <Modal isOpen={!!selectedPatientForDetail} onClose={() => setSelectedPatientForDetail(null)} title="Prontuário e Cadastro do Paciente" maxWidth="max-w-2xl">
        {selectedPatientForDetail && (() => {
          const patientAge = calculateExactAge(selectedPatientForDetail.birthDate);
          return (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl border shrink-0">
                  {selectedPatientForDetail.fullName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedPatientForDetail.fullName}</h3>
                  <p className="text-[11px] font-bold text-emerald-600">
                    {patientAge.text} ({patientAge.isUnder16 ? 'Menor de 16 Anos' : 'Maior de Idade'})
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    CPF/CNPJ: {formatCpfCnpj(selectedPatientForDetail.cpfCnpj)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block">Telefone</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedPatientForDetail.phone}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block">Modalidade / Pagamento</span>
                  <span className="font-bold text-slate-800">
                    {selectedPatientForDetail.attendanceType} ({selectedPatientForDetail.paymentType}
                    {selectedPatientForDetail.healthPlanName ? ` - ${selectedPatientForDetail.healthPlanName}` : ''})
                  </span>
                </div>
              </div>

              {patientAge.isUnder16 && selectedPatientForDetail.guardianName && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-extrabold text-rose-900 block">Responsável Legal:</span>
                  <p className="text-[11px] text-rose-800">
                    <strong>{selectedPatientForDetail.guardianName}</strong> • CPF: {formatCpfCnpj(selectedPatientForDetail.guardianCpf || '')} • Tel: {selectedPatientForDetail.guardianPhone}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Modal de Anexos e Exames */}
      <PatientAttachmentsModal
        isOpen={!!selectedPatientForAttachments}
        onClose={() => setSelectedPatientForAttachments(null)}
        patient={selectedPatientForAttachments}
        attachments={attachments}
        onSaveAttachment={onSaveAttachment}
        onDeleteAttachment={onDeleteAttachment}
      />
    </div>
  );
}
