import React, { useState, useRef } from 'react';
import { 
  UserPlus, Search, User, Calendar, Phone, ShieldAlert, 
  Camera, Check, X, Building2, CreditCard, Clock, FileText, CheckCircle2 
} from 'lucide-react';
import { calculateExactAge, formatCpfCnpj, formatPhone } from '../utils/helpers';
import Modal from './Modal';

export default function Patients({
  patients = [],
  clinicalSpecialties = [],
  appointments = [],
  professionals = [],
  activeTheme,
  onSavePatient,
  canRegisterPatients
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);

  const [photoUrl, setPhotoUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    cpfCnpj: '',
    phone: '',
    isWhatsapp: true,
    attendanceType: 'Presencial',
    paymentType: 'Particular',
    healthPlanName: '',
    dueDateParticular: '',
    specialties: [],
    guardianName: '',
    guardianCpf: '',
    guardianPhone: '',
    guardianIsWhatsapp: true
  });

  const ageInfo = calculateExactAge(formData.birthDate);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Não foi possível acessar a webcam. Verifique as permissões.');
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
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoUrl(canvas.toDataURL('image/png'));
    
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const toggleSpecialty = (spec) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      return {
        ...prev,
        specialties: exists ? prev.specialties.filter(s => s !== spec) : [...prev.specialties, spec]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ageInfo.isUnder16 && (!formData.guardianName || !formData.guardianCpf)) {
      alert('Para pacientes menores de 16 anos, preencha o Nome e CPF do Responsável Legal.');
      return;
    }

    const newPatient = {
      id: 'pat-' + Date.now(),
      ...formData,
      photoUrl,
      createdAt: new Date().toISOString()
    };

    onSavePatient(newPatient);
    setIsNewPatientModalOpen(false);
    setFormData({
      fullName: '', birthDate: '', cpfCnpj: '', phone: '', isWhatsapp: true,
      attendanceType: 'Presencial', paymentType: 'Particular', healthPlanName: '',
      dueDateParticular: '', specialties: [], guardianName: '', guardianCpf: '', guardianPhone: '', guardianIsWhatsapp: true
    });
    setPhotoUrl('');
  };

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpfCnpj?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        {/* BLOQUEIO APLICADO AQUI: Somente equipe operacional vê o botão Novo Paciente */}
        {canRegisterPatients && (
          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
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
              <th className="p-4">Especialidades Desejadas</th>
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
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => setSelectedPatientForDetail(patient)}
                          className="font-extrabold text-slate-900 hover:text-emerald-600 hover:underline text-xs text-left"
                        >
                          {patient.fullName}
                        </button>
                        <span className="block text-[10px] text-slate-400">{patient.phone}</span>
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
                      {patient.paymentType === 'Plano de Saúde' ? patient.healthPlanName : 'Particular'}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedPatientForDetail(patient)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-[10px] transition"
                    >
                      Ver Cadastro
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">Nenhum paciente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro de Novo Paciente */}
      <Modal isOpen={isNewPatientModalOpen} onClose={() => setIsNewPatientModalOpen(false)} title="Cadastrar Novo Paciente" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
          <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
            <label className="font-extrabold text-slate-800 block">Foto do Paciente (WebCam)</label>
            <div className="flex items-center space-x-4">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 border">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              
              <div className="space-y-2">
                {!isCameraActive ? (
                  <button type="button" onClick={startCamera} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{photoUrl ? 'Tirar Outra Foto' : 'Abrir WebCam'}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay className="w-48 h-36 bg-black rounded-xl border" />
                    <button type="button" onClick={capturePhoto} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Capturar Foto</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Nome Completo *</label>
              <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-2.5 border rounded-xl" />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Data de Nascimento *</label>
              <input required type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-2.5 border rounded-xl" />
              {formData.birthDate && (
                <span className={`text-[10px] font-bold block mt-1 ${ageInfo.isUnder16 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {ageInfo.text} ({ageInfo.isUnder16 ? 'Menor de 16 Anos' : 'Maior de Idade'})
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold block">CPF ou CNPJ *</label>
              <input required type="text" value={formData.cpfCnpj} onChange={e => setFormData({ ...formData, cpfCnpj: formatCpfCnpj(e.target.value) })} className="w-full p-2.5 border rounded-xl" placeholder="000.000.000-00" />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Telefone de Contato *</label>
              <div className="flex items-center space-x-2">
                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} className="w-full p-2.5 border rounded-xl" placeholder="(00) 0 0000-0000" />
                <label className="flex items-center space-x-1 shrink-0 text-[10px] font-extrabold cursor-pointer">
                  <input type="checkbox" checked={formData.isWhatsapp} onChange={e => setFormData({ ...formData, isWhatsapp: e.target.checked })} className="rounded" />
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
                  <input required type="text" value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} className="w-full p-2 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-900 block">CPF do Responsável *</label>
                  <input required type="text" value={formData.guardianCpf} onChange={e => setFormData({ ...formData, guardianCpf: formatCpfCnpj(e.target.value) })} className="w-full p-2 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-rose-900 block">Telefone do Responsável *</label>
                  <input required type="text" value={formData.guardianPhone} onChange={e => setFormData({ ...formData, guardianPhone: formatPhone(e.target.value) })} className="w-full p-2 border rounded-xl" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-1">
              <label className="font-bold block">Preferência de Atendimento *</label>
              <select value={formData.attendanceType} onChange={e => setFormData({ ...formData, attendanceType: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Presencial">Presencial</option>
                <option value="Online">Online (Teleconsulta)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Tipo de Pagamento / Modalidade *</label>
              <select value={formData.paymentType} onChange={e => setFormData({ ...formData, paymentType: e.target.value })} className="w-full p-2.5 border rounded-xl bg-white">
                <option value="Particular">Particular</option>
                <option value="Plano de Saúde">Plano de Saúde</option>
              </select>
            </div>

            {formData.paymentType === 'Plano de Saúde' ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold block">Nome do Plano de Saúde *</label>
                <input required type="text" placeholder="Ex: Unimed, Bradesco Saúde, Amil" value={formData.healthPlanName} onChange={e => setFormData({ ...formData, healthPlanName: e.target.value })} className="w-full p-2.5 border rounded-xl" />
              </div>
            ) : (
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold block">Data / Dia de Vencimento do Atendimento Particular *</label>
                <input required type="date" value={formData.dueDateParticular} onChange={e => setFormData({ ...formData, dueDateParticular: e.target.value })} className="w-full p-2.5 border rounded-xl" />
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <label className="font-extrabold text-slate-800 block">Especialidades Desejadas / Procuradas *</label>
            <p className="text-[10px] text-slate-400">Exibindo apenas especialidades com profissionais cadastrados no Corpo Clínico.</p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {clinicalSpecialties.map((spec, idx) => {
                const isSelected = formData.specialties.includes(spec);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
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
              {clinicalSpecialties.length === 0 && (
                <p className="text-rose-500 font-bold text-xs">Nenhum profissional cadastrado no Corpo Clínico com especialidades ativas.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsNewPatientModalOpen(false)} className="px-5 py-2.5 border rounded-xl font-bold">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30">Salvar Paciente</button>
          </div>
        </form>
      </Modal>

      {/* Modal Cadastro Completo */}
      <Modal isOpen={!!selectedPatientForDetail} onClose={() => setSelectedPatientForDetail(null)} title="Prontuário e Cadastro do Paciente" maxWidth="max-w-2xl">
        {selectedPatientForDetail && (() => {
          const patientAge = calculateExactAge(selectedPatientForDetail.birthDate);
          
          const patientApts = appointments.filter(a => a.patientId === selectedPatientForDetail.id || a.patientName === selectedPatientForDetail.fullName);
          const linkedProfIds = [...new Set(patientApts.map(a => a.professionalId))];
          const linkedProfs = professionals.filter(p => linkedProfIds.includes(p.id));

          return (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border">
                {selectedPatientForDetail.photoUrl ? (
                  <img src={selectedPatientForDetail.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 font-black text-xl border">
                    {selectedPatientForDetail.fullName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedPatientForDetail.fullName}</h3>
                  <p className="text-[11px] font-bold text-emerald-600">{patientAge.text} ({patientAge.isUnder16 ? 'Menor de 16 Anos' : 'Maior de Idade'})</p>
                  <p className="text-[10px] text-slate-400">CPF/CNPJ: {selectedPatientForDetail.cpfCnpj}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Agendas e Profissionais Vinculados</span>
                </h4>
                {linkedProfs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {linkedProfs.map(prof => (
                      <div key={prof.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                        <span className="font-extrabold text-slate-900 block">{prof.name}</span>
                        <span className="text-[10px] text-emerald-700 font-bold block">{Array.isArray(prof.specialties) ? prof.specialties.join(', ') : prof.specialty}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">O paciente ainda não possui agendamentos ativos na agenda de nenhum profissional.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block">Telefone</span>
                  <span className="font-bold text-slate-800">{selectedPatientForDetail.phone}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] block">Modalidade / Atendimento</span>
                  <span className="font-bold text-slate-800">{selectedPatientForDetail.attendanceType} ({selectedPatientForDetail.paymentType})</span>
                </div>
              </div>

              {patientAge.isUnder16 && selectedPatientForDetail.guardianName && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-extrabold text-rose-900 block">Responsável Legal:</span>
                  <p className="text-[11px] text-rose-800">
                    <strong>{selectedPatientForDetail.guardianName}</strong> • CPF: {selectedPatientForDetail.guardianCpf} • Tel: {selectedPatientForDetail.guardianPhone}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}