export type UserRole = 'superadmin' | 'clinic_admin' | 'professional' | 'receptionist';
export type UserGroup = 'operacional' | 'corpo_clinico';

export interface UserPermissions {
  canAccessDashboard?: boolean;
  canAccessPatients?: boolean;
  canAccessWaitingList?: boolean;
  canAccessAppointments?: boolean;
  canAccessMyAgenda?: boolean;
  canAccessAnamnesis?: boolean;
  canAccessGoalsPTI?: boolean;
  canAccessSoap?: boolean;
  canAccessHistory?: boolean;
  canAccessFinancial?: boolean;
  canAccessTelehealth?: boolean;
  canAccessWhatsapp?: boolean;
  canAccessHelpdesk?: boolean;
  canAccessTheme?: boolean;
  canAccessMedicalDocs?: boolean;
  canAccessQueueDisplay?: boolean;
  canAccessReports?: boolean;
  [key: string]: boolean | undefined;
}

export interface User {
  id: string;
  name: string;
  cpf: string; // Stored cleaned digits (e.g., "13422470786")
  email: string;
  password: string; // Plaintext or hashed in this demo environment
  role: UserRole;
  group: UserGroup;
  clinicId: string; // "system" for Founder / Superadmin, or "clinic-xxx"
  birthDate?: string;
  phone?: string;
  login?: string;
  registryNumber?: string; // CRM, CRP, etc.
  specialties?: string[];
  specialty?: string;
  cargo?: string; // Specific operational cargo / job title
  mustChangePassword?: boolean; // True on first access
  active: boolean;
  createdAt?: string;
  permissions?: UserPermissions;
}

export interface ClinicTheme {
  primaryColor: string;
  menuBgColor: string;
  menuTextColor: string;
  pageBgColor: string;
  textColor: string;
  cardBgColor?: string;
  fontFamily?: string;
  fontSize?: string;
  logoUrl?: string;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  cep: string;
  address?: string;
  addressNumber: string;
  complement?: string;
  unitsCount: string;
  employeesCount: string;
  planValue: string;
  contractTime: string;
  monthlyFee: string;
  adminName: string;
  adminBirthDate?: string;
  adminPhone?: string;
  adminCpf: string;
  adminEmail: string;
  adminLogin?: string;
  status: 'Ativa' | 'Bloqueada';
  createdAt: string;
  theme?: ClinicTheme;
  menuConfig?: MenuItemConfig[];
}

export interface Patient {
  id: string;
  clinicId: string;
  fullName: string;
  birthDate: string;
  cpfCnpj: string;
  phone: string;
  isWhatsapp: boolean;
  attendanceType: 'Presencial' | 'Online';
  paymentType: 'Particular' | 'Plano de Saúde';
  healthPlanName?: string;
  dueDateParticular?: string;
  dueDay?: number | string;
  lastPaidMonthYear?: string;
  specialties: string[];
  guardianName?: string;
  guardianCpf?: string;
  guardianPhone?: string;
  guardianIsWhatsapp?: boolean;
  photoUrl?: string;
  createdAt: string;
  hasAnamnesis?: boolean;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Agendado' | 'Confirmado' | 'Atendido' | 'Concluído' | 'Cancelado';
  attendanceType?: 'Presencial' | 'Online';
}

export interface WaitingListItem {
  id: string;
  clinicId: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  isWhatsapp?: boolean;
  specialties: string[];
  preferredDays: string[];
  preferredTime: string;
  highlighted: boolean;
  createdAt: string;
}

export interface DevMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Ativo' | 'Inativo';
  accessLevel: 'Total' | 'Restrito';
}

export interface HelpdeskTicket {
  id: string;
  clinicId: string;
  subject: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica / URGENTE';
  module: string;
  description: string;
  status: 'Pendente' | 'Recebido' | 'Em Andamento' | 'Concluído';
  requesterName: string;
  requesterEmail: string;
  requesterRole?: string;
  handlerName?: string;
  receivedAt?: string;
  identifiedIssue?: string;
  actionTaken?: string;
  feedback?: string;
  createdAt: string;
}

export interface TherapeuticPlanItem {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  complaint: string;
  shortTermGoals: string;
  longTermGoals: string;
  strategies: string;
  reevaluationDate?: string;
  status: 'Ativo' | 'Concluído' | 'Suspenso';
  date: string;
}

export type AuditCategory = 
  | 'cadastro_clinica'        // Cadastros de Clínicas & Contratos
  | 'admin_sistema'           // Administradores do Sistema (Fundador / SaaS)
  | 'admin_clinica'           // Administradores das Clínicas
  | 'equipe_funcionarios'     // Equipe e Funcionários (Corpo Clínico & Recepção)
  | 'financeiro_pacientes'    // Cobranças e pagamentos de pacientes
  | 'seguranca_acesso';       // Logins, falhas, bloqueios

export interface AuditLog {
  id: string;
  timestamp: string;
  category: AuditCategory;
  action: string;
  performedByName: string;
  performedByRole: string;
  targetName?: string;
  targetId?: string;
  details: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'PASSWORD_CHANGED' | 'CLINIC_CREATED' | 'USER_CREATED' | 'CLINIC_UPDATED' | 'CLINIC_DELETED' | 'USER_DELETED' | 'PAYMENT_CONFIRMED';
  cpf?: string;
  clinicId?: string;
  userRole?: string;
}

export interface MedicalDocument {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  professionalRegistry?: string;
  type: 'receita' | 'atestado' | 'exame' | 'recibo';
  title: string;
  date: string;
  content: string;
  // Atestado fields
  cid?: string;
  restDays?: number;
  companionName?: string;
  // Receita fields
  isSpecialControl?: boolean;
  dosageInstructions?: string;
  // Recibo fields
  amount?: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface PatientAttachment {
  id: string;
  clinicId: string;
  patientId: string;
  title: string;
  category: 'Exame de Sangue' | 'Imagem (Raio-X/Ressonância)' | 'Laudo Externo' | 'Documento Pessoal' | 'Outro';
  date: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  notes?: string;
  createdAt: string;
}

export interface QueueCall {
  id: string;
  clinicId: string;
  patientName: string;
  doctorName: string;
  room: string;
  calledAt: string;
  status: 'chamando' | 'atendido';
}

