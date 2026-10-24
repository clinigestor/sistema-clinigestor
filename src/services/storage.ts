import { User, Clinic, Patient, Appointment, WaitingListItem, DevMember, HelpdeskTicket, TherapeuticPlanItem, AuditLog, MedicalDocument, PatientAttachment, QueueCall } from '../types';
import { cleanCpf } from '../utils/helpers';

const STORAGE_KEY = 'clinigestor_database_v2';

export interface DatabaseState {
  users: User[];
  clinics: Clinic[];
  patients: Patient[];
  appointments: Appointment[];
  waitingList: WaitingListItem[];
  devs: DevMember[];
  helpdeskTickets: HelpdeskTicket[];
  plans: TherapeuticPlanItem[];
  auditLogs: AuditLog[];
  medicalDocuments: MedicalDocument[];
  patientAttachments: PatientAttachment[];
  queueCalls: QueueCall[];
}

export const INITIAL_FOUNDER_CPF = '13422470786';
export const DEFAULT_INITIAL_PASSWORD = 'Mudar123';

const INITIAL_DATABASE: DatabaseState = {
  users: [
    {
      id: 'founder-01',
      name: 'Fundador CliniGestor',
      cpf: INITIAL_FOUNDER_CPF,
      email: 'clinigestor@gmail.com',
      password: DEFAULT_INITIAL_PASSWORD,
      role: 'superadmin',
      group: 'operacional',
      clinicId: 'system',
      mustChangePassword: true,
      active: true,
      createdAt: new Date().toISOString(),
      permissions: {
        canAccessDashboard: true,
        canAccessPatients: true,
        canAccessWaitingList: true,
        canAccessAppointments: true,
        canAccessMyAgenda: true,
        canAccessAnamnesis: true,
        canAccessGoalsPTI: true,
        canAccessSoap: true,
        canAccessHistory: true,
        canAccessFinancial: true,
        canAccessTelehealth: true,
        canAccessWhatsapp: true,
        canAccessHelpdesk: true,
        canAccessTheme: true
      }
    }
  ],
  clinics: [], // Zero clinics initially registered - Founder registers them manually
  patients: [],
  appointments: [],
  waitingList: [],
  devs: [
    {
      id: 'dev-01',
      name: 'Equipe de Engenharia CliniGestor',
      email: 'dev@clinigestor.com',
      role: 'Fullstack / Security',
      department: 'Técnico (Dev)',
      status: 'Ativo',
      accessLevel: 'Total'
    }
  ],
  helpdeskTickets: [],
  plans: [],
  auditLogs: [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      category: 'admin_sistema',
      action: 'Inicialização do Sistema',
      performedByName: 'Sistema / Fundador',
      performedByRole: 'superadmin',
      targetName: 'Fundador CliniGestor',
      targetId: 'founder-01',
      details: 'Sistema inicializado com usuário Fundador (CPF 13422470786). Nenhuma clínica pré-cadastrada.',
      type: 'USER_CREATED',
      cpf: INITIAL_FOUNDER_CPF,
      clinicId: 'system',
      userRole: 'superadmin'
    }
  ],
  medicalDocuments: [],
  patientAttachments: [],
  queueCalls: []
};

export function loadDatabase(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw) as DatabaseState;
    // Guarantee founder exists and clinics is an array
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = INITIAL_DATABASE.users;
    }
    if (!parsed.clinics) {
      parsed.clinics = [];
    }
    if (!parsed.auditLogs) {
      parsed.auditLogs = [];
    }
    if (!parsed.medicalDocuments) {
      parsed.medicalDocuments = [];
    }
    if (!parsed.patientAttachments) {
      parsed.patientAttachments = [];
    }
    if (!parsed.queueCalls) {
      parsed.queueCalls = [];
    }

    // Auto-heal: ensure every clinic in parsed.clinics has its admin user properly synchronized in parsed.users
    let userAdded = false;
    for (const c of parsed.clinics) {
      if (c.adminCpf) {
        const cleanedAdminCpf = cleanCpf(c.adminCpf);
        // Find existing admin for this clinic or with matching CPF
        const existingAdmin = parsed.users.find(u => 
          (u.clinicId === c.id && u.role === 'clinic_admin') || 
          cleanCpf(u.cpf) === cleanedAdminCpf
        );

        if (existingAdmin) {
          // Keep admin fields in sync with clinic data
          let changed = false;
          if (cleanCpf(existingAdmin.cpf) !== cleanedAdminCpf) {
            existingAdmin.cpf = cleanedAdminCpf;
            changed = true;
          }
          if (c.adminName && existingAdmin.name !== c.adminName) {
            existingAdmin.name = c.adminName;
            changed = true;
          }
          if (c.adminEmail && existingAdmin.email !== c.adminEmail) {
            existingAdmin.email = c.adminEmail;
            changed = true;
          }
          if (existingAdmin.clinicId !== c.id) {
            existingAdmin.clinicId = c.id;
            changed = true;
          }
          if (!existingAdmin.cargo) {
            existingAdmin.cargo = 'Administrador da Clínica';
            changed = true;
          }
          if (changed) userAdded = true;
        } else {
          const newAdminUser: User = {
            id: 'admin-' + c.id,
            name: c.adminName || 'Administrador da Clínica',
            cpf: cleanedAdminCpf,
            email: c.adminEmail || 'admin@' + c.id + '.com',
            password: DEFAULT_INITIAL_PASSWORD,
            role: 'clinic_admin',
            group: 'operacional',
            cargo: 'Administrador da Clínica',
            clinicId: c.id,
            active: true,
            mustChangePassword: true,
            createdAt: new Date().toISOString(),
            permissions: {
              canAccessDashboard: true,
              canAccessPatients: true,
              canAccessWaitingList: true,
              canAccessAppointments: true,
              canAccessMyAgenda: true,
              canAccessAnamnesis: true,
              canAccessGoalsPTI: true,
              canAccessSoap: true,
              canAccessHistory: true,
              canAccessFinancial: true,
              canAccessTelehealth: true,
              canAccessWhatsapp: true,
              canAccessHelpdesk: true,
              canAccessTheme: true
            }
          };
          parsed.users.push(newAdminUser);
          userAdded = true;
        }
      }
    }
    if (userAdded) {
      saveDatabase(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error loading database, resetting to initial state:', err);
    saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(data: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

export function appendAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  try {
    const db = loadDatabase();
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      ...log
    };
    db.auditLogs.unshift(newLog);
    // Keep last 100 logs
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100);
    }
    saveDatabase(db);
  } catch (err) {
    console.error('Error appending audit log:', err);
  }
}

export function resetDatabaseToInitial(): DatabaseState {
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}
