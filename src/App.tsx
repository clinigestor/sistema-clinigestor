import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { 
  User, Clinic, Patient, Appointment, WaitingListItem, 
  DevMember, HelpdeskTicket, TherapeuticPlanItem, AuditLog, ClinicTheme, MenuItemConfig, PatientAttachment 
} from './types';
import { 
  loadDatabase, saveDatabase, appendAuditLog, resetDatabaseToInitial, 
  INITIAL_FOUNDER_CPF, DEFAULT_INITIAL_PASSWORD 
} from './services/storage';
import { cleanCpf, formatCpf, generateShortLogin } from './utils/helpers';

// Components
import Login from './components/Login';
import FirstAccessModal from './components/FirstAccessModal';
import AuditLogsModal from './components/AuditLogsModal';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClinicsManager from './components/ClinicsManager';
import Staff from './components/Staff';
import Patients from './components/Patients';
import Agenda from './components/Agenda';
import WaitingList from './components/WaitingList';
import Anamnesis from './components/Anamnesis';
import TherapeuticPlan from './components/TherapeuticPlan';
import Evolutions from './components/Evolutions';
import ClinicalHistory from './components/ClinicalHistory';
import Financial from './components/Financial';
import WhatsappManager from './components/WhatsappManager';
import Telehealth from './components/Telehealth';
import DevsManager from './components/DevsManager';
import Helpdesk from './components/Helpdesk';
import SystemSettings from './components/SystemSettings';
import FounderAuditLogs from './components/FounderAuditLogs';
import Modal from './components/Modal';

const DEFAULT_THEME: ClinicTheme = {
  primaryColor: '#059669',
  menuBgColor: '#0f172a',
  menuTextColor: '#cbd5e1',
  pageBgColor: '#f8fafc',
  cardBgColor: '#ffffff',
  textColor: '#1e293b',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px'
};

export default function App() {
  const [db, setDb] = useState(loadDatabase());
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentClinicId, setCurrentClinicId] = useState<string>('system');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Login inputs
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Modals
  const [isFirstAccessModalOpen, setIsFirstAccessModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempPasswordUser, setTempPasswordUser] = useState<User | null>(null);

  // Sync db changes to localStorage
  const updateDb = (newDb: typeof db) => {
    setDb(newDb);
    saveDatabase(newDb);
  };

  // Find active clinic
  const currentClinicData = db.clinics.find(c => c.id === currentClinicId) || null;

  // Active theme based on current clinic
  const activeTheme = currentClinicData?.theme || DEFAULT_THEME;

  // Password Recovery handler
  const handleRecoverPassword = (recoverName: string, recoverBirthDate: string, recoverCpf: string, newPass: string) => {
    const cleanCpfTarget = cleanCpf(recoverCpf);
    const currentDb = loadDatabase();
    const targetUser = currentDb.users.find(u => 
      u.name.trim().toLowerCase() === recoverName.trim().toLowerCase() &&
      u.birthDate === recoverBirthDate &&
      cleanCpf(u.cpf) === cleanCpfTarget
    );

    if (!targetUser) {
      return { 
        success: false, 
        message: 'Dados não conferem. Nome completo, data de nascimento ou CPF não correspondem a nenhum cadastro existente.' 
      };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const updatedUsers = currentDb.users.map(u => u.id === targetUser.id ? { ...u, password: newPass, mustChangePassword: false } : u);
    updateDb({ ...currentDb, users: updatedUsers });
    
    appendAuditLog({
      category: 'seguranca_acesso',
      action: 'Recuperação de Senha por Confirmação de Dados',
      performedByName: targetUser.name,
      performedByRole: targetUser.role,
      targetName: targetUser.name,
      type: 'PASSWORD_RESET',
      details: `Senha redefinida com sucesso após confirmação de Nome, Data de Nascimento e CPF.`,
      cpf: targetUser.cpf,
      clinicId: targetUser.clinicId,
      userRole: targetUser.role
    });

    return { success: true, message: 'Senha redefinida com sucesso! Agora você pode fazer login com seu login curto e a nova senha.' };
  };

  // Handle Login by Login Curto & Password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (failedLoginAttempts >= 3) {
      setErrorMessage('Limite de 3 tentativas excedido. Acesso pausado.');
      return;
    }

    // Always ensure fresh database is loaded from storage
    const currentDb = loadDatabase();
    setDb(currentDb);

    const rawInput = loginUsername.trim().toLowerCase();
    if (!rawInput) {
      setErrorMessage('Por favor, digite o seu login curto.');
      return;
    }

    const cleanDigits = cleanCpf(loginUsername);

    // 1. Lookup user in currentDb.users by login, or fallback to clean CPF / email for backward compatibility
    let foundUser = currentDb.users.find(u => {
      if (u.login && u.login.toLowerCase() === rawInput) return true;
      const uCpfClean = cleanCpf(u.cpf);
      if (cleanDigits.length > 0 && uCpfClean === cleanDigits) return true;
      if (u.email && u.email.toLowerCase() === rawInput) return true;
      return false;
    });

    // 2. If not found in users, check if matches a registered clinic admin in currentDb.clinics
    if (!foundUser) {
      const matchingClinic = currentDb.clinics.find(c => {
        if (c.adminLogin && c.adminLogin.toLowerCase() === rawInput) return true;
        const adminCpfClean = cleanCpf(c.adminCpf);
        if (cleanDigits.length > 0 && adminCpfClean === adminCpfClean) return true;
        if (c.adminEmail && c.adminEmail.toLowerCase() === rawInput) return true;
        return false;
      });

      if (matchingClinic) {
        const resolvedCpf = cleanCpf(matchingClinic.adminCpf) || (cleanDigits.length === 11 ? cleanDigits : '00000000000');
        const adminLogin = matchingClinic.adminLogin || generateShortLogin(matchingClinic.adminName || 'Administrador', matchingClinic.adminBirthDate || '1990-01-01', resolvedCpf);
        const healedUser: User = {
          id: 'admin-' + matchingClinic.id,
          name: matchingClinic.adminName || 'Administrador da Clínica',
          birthDate: matchingClinic.adminBirthDate || '',
          phone: matchingClinic.adminPhone || '',
          login: adminLogin,
          cpf: resolvedCpf,
          email: matchingClinic.adminEmail || 'admin@' + matchingClinic.id + '.com',
          password: DEFAULT_INITIAL_PASSWORD,
          role: 'clinic_admin',
          group: 'operacional',
          cargo: 'Administrador da Clínica',
          clinicId: matchingClinic.id,
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
        const updatedUsers = [
          ...currentDb.users.filter(u => !(u.clinicId === matchingClinic.id && u.role === 'clinic_admin')),
          healedUser
        ];
        const newDb = { ...currentDb, users: updatedUsers };
        updateDb(newDb);
        foundUser = healedUser;
      }
    }

    if (!foundUser) {
      const newAttempts = failedLoginAttempts + 1;
      setFailedLoginAttempts(newAttempts);
      setErrorMessage('Login curto não encontrado no sistema. Verifique os dados digitados.');
      appendAuditLog({
        category: 'seguranca_acesso',
        action: 'Tentativa de Login (Não Encontrado)',
        performedByName: `Acesso: ${rawInput}`,
        performedByRole: 'Visitante',
        type: 'LOGIN_FAILED',
        details: `Tentativa de login com "${rawInput}": Usuário não localizado no banco de dados.`,
        cpf: cleanDigits
      });
      return;
    }

    // 3. Verify password
    if (foundUser.password !== loginPassword) {
      const newAttempts = failedLoginAttempts + 1;
      setFailedLoginAttempts(newAttempts);
      setErrorMessage('Senha incorreta para o CPF/usuário informado.');
      appendAuditLog({
        category: 'seguranca_acesso',
        action: 'Tentativa de Login (Senha Incorreta)',
        performedByName: foundUser.name,
        performedByRole: foundUser.role,
        targetName: foundUser.name,
        type: 'LOGIN_FAILED',
        details: `Tentativa de login para ${foundUser.name} (${foundUser.cpf}): Senha incorreta informada.`,
        cpf: cleanCpf(foundUser.cpf),
        clinicId: foundUser.clinicId,
        userRole: foundUser.role
      });
      return;
    }

    if (foundUser.active === false) {
      setErrorMessage('Este usuário foi desativado no sistema.');
      return;
    }

    // 4. If user belongs to a clinic, check if clinic is active
    if (foundUser.clinicId !== 'system') {
      const userClinic = currentDb.clinics.find(c => c.id === foundUser.clinicId);
      if (userClinic && userClinic.status === 'Bloqueada' && foundUser.role !== 'superadmin') {
        setErrorMessage('O acesso para esta clínica está temporariamente suspenso.');
        appendAuditLog({
          category: 'seguranca_acesso',
          action: 'Login Bloqueado (Clínica Suspensa)',
          performedByName: foundUser.name,
          performedByRole: foundUser.role,
          targetName: userClinic.name,
          type: 'LOGIN_FAILED',
          details: `Login bloqueado para ${foundUser.name}: Clínica "${userClinic.name}" está com status Bloqueada.`,
          cpf: cleanCpf(foundUser.cpf),
          clinicId: foundUser.clinicId,
          userRole: foundUser.role
        });
        return;
      }
    }

    // 5. Login successful
    appendAuditLog({
      category: 'seguranca_acesso',
      action: 'Login Autorizado com Sucesso',
      performedByName: foundUser.name,
      performedByRole: foundUser.role,
      targetName: foundUser.name,
      type: 'LOGIN_SUCCESS',
      details: `Login autorizado com sucesso para ${foundUser.name} (${foundUser.role}).`,
      cpf: cleanCpf(foundUser.cpf),
      clinicId: foundUser.clinicId,
      userRole: foundUser.role
    });

    setFailedLoginAttempts(0);
    setErrorMessage('');

    // Check if user has first access password change requirement
    if (foundUser.mustChangePassword || foundUser.password === DEFAULT_INITIAL_PASSWORD) {
      setTempPasswordUser(foundUser);
      setIsFirstAccessModalOpen(true);
      return;
    }

    loginFinalize(foundUser);
  };

  const loginFinalize = (user: User) => {
    const resolvedCargo = user.cargo 
      || (user.group === 'corpo_clinico' ? (user.specialties?.[0] || 'Profissional Clínico') : (user.role === 'clinic_admin' ? 'Administrador da Clínica' : 'Recepcionista'));

    const isCorpoClinico = user.group === 'corpo_clinico' || user.role === 'professional';

    const normalizedUser: User = {
      ...user,
      cargo: resolvedCargo,
      permissions: {
        canAccessDashboard: isCorpoClinico ? (user.permissions?.canAccessDashboard ?? false) : true,
        canAccessPatients: true,
        canAccessWaitingList: true,
        canAccessAppointments: true,
        canAccessMyAgenda: true,
        canAccessAnamnesis: true,
        canAccessGoalsPTI: true,
        canAccessSoap: true,
        canAccessHistory: true,
        canAccessFinancial: !isCorpoClinico,
        canAccessTelehealth: true,
        canAccessWhatsapp: true,
        canAccessHelpdesk: true,
        canAccessTheme: !isCorpoClinico,
        ...(user.permissions || {})
      }
    };

    setCurrentUser(normalizedUser);
    if (user.role === 'superadmin') {
      setCurrentClinicId('system');
      setCurrentTab('clinics');
    } else if (isCorpoClinico) {
      setCurrentClinicId(user.clinicId);
      setCurrentTab('appointments');
    } else {
      setCurrentClinicId(user.clinicId);
      setCurrentTab('dashboard');
    }
  };

  // Complete first access password change
  const handleSaveFirstAccessPassword = (newPassword: string) => {
    if (!tempPasswordUser) return;

    const updatedUsers = db.users.map(u => {
      if (u.id === tempPasswordUser.id) {
        return {
          ...u,
          password: newPassword,
          mustChangePassword: false
        };
      }
      return u;
    });

    const newDb = { ...db, users: updatedUsers };
    updateDb(newDb);

    appendAuditLog({
      category: 'seguranca_acesso',
      action: 'Definição de Nova Senha (1º Acesso Obrigatório)',
      performedByName: tempPasswordUser.name,
      performedByRole: tempPasswordUser.role,
      targetName: tempPasswordUser.name,
      type: 'PASSWORD_CHANGED',
      details: `Senha inicial padrão alterada com sucesso no primeiro acesso pelo usuário ${tempPasswordUser.name}.`,
      cpf: tempPasswordUser.cpf,
      clinicId: tempPasswordUser.clinicId,
      userRole: tempPasswordUser.role
    });

    const userWithNewPassword = {
      ...tempPasswordUser,
      password: newPassword,
      mustChangePassword: false
    };

    setIsFirstAccessModalOpen(false);
    setTempPasswordUser(null);
    loginFinalize(userWithNewPassword);
  };

  // Change password anytime
  const handleChangePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = db.users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, password: newPassword, mustChangePassword: false };
      }
      return u;
    });
    updateDb({ ...db, users: updatedUsers });
    setCurrentUser({ ...currentUser, password: newPassword, mustChangePassword: false });
    setIsChangePasswordModalOpen(false);
    appendAuditLog({
      category: 'seguranca_acesso',
      action: 'Alteração Voluntária de Senha',
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetName: currentUser.name,
      type: 'PASSWORD_CHANGED',
      details: `Senha de acesso alterada nas configurações pelo usuário ${currentUser.name}.`,
      cpf: currentUser.cpf,
      clinicId: currentUser.clinicId,
      userRole: currentUser.role
    });
    alert('Sua senha foi alterada com sucesso!');
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentClinicId('system');
    setLoginUsername('');
    setLoginPassword('');
    setErrorMessage('');
    setFailedLoginAttempts(0);
  };

  // Clinic actions (Founder only)
  const handleAddClinic = (newClinic: Clinic, newAdminUser: User) => {
    const rawAdminCpf = cleanCpf(newAdminUser.cpf);
    const sanitizedAdminUser: User = {
      ...newAdminUser,
      cpf: rawAdminCpf,
      cargo: newAdminUser.cargo || 'Administrador da Clínica'
    };
    const sanitizedClinic: Clinic = {
      ...newClinic,
      adminCpf: rawAdminCpf
    };

    const updatedClinics = [...db.clinics.filter(c => c.id !== newClinic.id), sanitizedClinic];
    // Filter out duplicate clinic admin user or same CPF to guarantee clean state
    const filteredUsers = db.users.filter(u => 
      !(u.clinicId === newClinic.id && u.role === 'clinic_admin') && 
      cleanCpf(u.cpf) !== rawAdminCpf
    );
    const updatedUsers = [...filteredUsers, sanitizedAdminUser];

    const newDb = {
      ...db,
      clinics: updatedClinics,
      users: updatedUsers
    };
    updateDb(newDb);

    appendAuditLog({
      category: 'cadastro_clinica',
      action: 'Cadastro de Nova Clínica e Administrador',
      performedByName: currentUser?.name || 'Fundador',
      performedByRole: currentUser?.role || 'superadmin',
      targetName: sanitizedClinic.name,
      type: 'CLINIC_CREATED',
      details: `Nova clínica "${sanitizedClinic.name}" (CNPJ: ${sanitizedClinic.cnpj}) cadastrada no sistema. Administrador responsável: ${sanitizedAdminUser.name} (CPF: ${formatCpf(sanitizedAdminUser.cpf)}), cadastrado com a senha padrão inicial ${DEFAULT_INITIAL_PASSWORD}.`,
      cpf: sanitizedAdminUser.cpf,
      clinicId: sanitizedClinic.id
    });

    alert(`Clínica "${sanitizedClinic.name}" cadastrada com sucesso!\n\nO Administrador ${sanitizedAdminUser.name} já pode fazer login utilizando:\nCPF: ${formatCpf(sanitizedAdminUser.cpf)} (ou e-mail: ${sanitizedAdminUser.email})\nSenha Inicial: ${sanitizedAdminUser.password}`);
  };

  const handleUpdateClinic = (clinicId: string, updatedData: Partial<Clinic>, newPassword?: string | null) => {
    const rawAdminCpf = updatedData.adminCpf ? cleanCpf(updatedData.adminCpf) : undefined;
    const sanitizedData = {
      ...updatedData,
      ...(rawAdminCpf ? { adminCpf: rawAdminCpf } : {})
    };

    const updatedClinics = db.clinics.map(c => c.id === clinicId ? { ...c, ...sanitizedData } : c);
    let updatedUsers = [...db.users];

    // Find and update or create admin user for this clinic
    const adminIndex = updatedUsers.findIndex(u => u.clinicId === clinicId && u.role === 'clinic_admin');
    if (adminIndex >= 0) {
      updatedUsers[adminIndex] = {
        ...updatedUsers[adminIndex],
        ...(sanitizedData.adminName ? { name: sanitizedData.adminName } : {}),
        ...(rawAdminCpf ? { cpf: rawAdminCpf } : {}),
        ...(sanitizedData.adminEmail ? { email: sanitizedData.adminEmail } : {}),
        cargo: 'Administrador da Clínica',
        ...(newPassword ? { password: newPassword, mustChangePassword: false } : {})
      };
    } else if (rawAdminCpf || sanitizedData.adminName) {
      // Create missing admin user in db.users
      const targetClinic = updatedClinics.find(c => c.id === clinicId);
      updatedUsers.push({
        id: 'admin-' + clinicId,
        name: sanitizedData.adminName || targetClinic?.adminName || 'Administrador da Clínica',
        cpf: rawAdminCpf || cleanCpf(targetClinic?.adminCpf || ''),
        email: sanitizedData.adminEmail || targetClinic?.adminEmail || 'admin@' + clinicId + '.com',
        password: newPassword || DEFAULT_INITIAL_PASSWORD,
        role: 'clinic_admin',
        group: 'operacional',
        cargo: 'Administrador da Clínica',
        clinicId: clinicId,
        active: true,
        mustChangePassword: !newPassword,
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
      });
    }

    const currentTargetClinic = db.clinics.find(c => c.id === clinicId);
    updateDb({ ...db, clinics: updatedClinics, users: updatedUsers });
    appendAuditLog({
      category: 'cadastro_clinica',
      action: 'Edição de Dados da Clínica',
      performedByName: currentUser?.name || 'Fundador',
      performedByRole: currentUser?.role || 'superadmin',
      targetName: currentTargetClinic?.name || updatedData.name || clinicId,
      type: 'CLINIC_UPDATED',
      details: `Dados cadastrais da clínica "${currentTargetClinic?.name || clinicId}" foram atualizados.`,
      clinicId
    });
    alert('Clínica e credenciais do Administrador atualizadas com sucesso!');
  };

  const handleToggleClinicStatus = (clinicId: string) => {
    const targetClinic = db.clinics.find(c => c.id === clinicId);
    if (!targetClinic) return;
    const newStatus: Clinic['status'] = targetClinic.status === 'Ativa' ? 'Bloqueada' : 'Ativa';

    const updatedClinics = db.clinics.map(c => c.id === clinicId ? { ...c, status: newStatus } : c);
    updateDb({ ...db, clinics: updatedClinics });

    appendAuditLog({
      category: 'cadastro_clinica',
      action: newStatus === 'Ativa' ? 'Reativação de Clínica' : 'Bloqueio de Clínica',
      performedByName: currentUser?.name || 'Fundador',
      performedByRole: currentUser?.role || 'superadmin',
      targetName: targetClinic.name,
      type: 'CLINIC_UPDATED',
      details: `Status operacional da clínica "${targetClinic.name}" alterado para ${newStatus}.`,
      clinicId
    });
  };

  const handleDeleteClinic = (clinicId: string) => {
    const targetClinic = db.clinics.find(c => c.id === clinicId);
    const clinicName = targetClinic?.name || `ID ${clinicId}`;

    const updatedClinics = db.clinics.filter(c => c.id !== clinicId);
    const updatedUsers = db.users.filter(u => u.clinicId !== clinicId);
    const updatedPatients = db.patients.filter(p => p.clinicId !== clinicId);
    const updatedAppointments = db.appointments.filter(a => a.clinicId !== clinicId);

    updateDb({
      ...db,
      clinics: updatedClinics,
      users: updatedUsers,
      patients: updatedPatients,
      appointments: updatedAppointments
    });

    appendAuditLog({
      category: 'cadastro_clinica',
      action: 'Exclusão Definitiva de Clínica',
      performedByName: currentUser?.name || 'Fundador',
      performedByRole: currentUser?.role || 'superadmin',
      targetName: clinicName,
      type: 'CLINIC_DELETED',
      details: `Clínica "${clinicName}" e todos os seus colaboradores, pacientes e agendamentos foram excluídos do sistema.`,
      clinicId
    });
  };

  const handleResetClinicAdminPassword = (clinicId: string, adminCpf: string, newPassword: string) => {
    const rawCpf = cleanCpf(adminCpf);
    let targetAdminName = 'Administrador da Clínica';
    let userFound = false;

    const updatedUsers = db.users.map(u => {
      if ((u.clinicId === clinicId && u.role === 'clinic_admin') || cleanCpf(u.cpf) === rawCpf) {
        targetAdminName = u.name;
        userFound = true;
        return { ...u, password: newPassword, mustChangePassword: false, cpf: rawCpf || cleanCpf(u.cpf) };
      }
      return u;
    });

    if (!userFound) {
      const targetClinic = db.clinics.find(c => c.id === clinicId);
      targetAdminName = targetClinic?.adminName || 'Administrador da Clínica';
      updatedUsers.push({
        id: 'admin-' + clinicId,
        name: targetAdminName,
        cpf: rawCpf,
        email: targetClinic?.adminEmail || 'admin@' + clinicId + '.com',
        password: newPassword,
        role: 'clinic_admin',
        group: 'operacional',
        cargo: 'Administrador da Clínica',
        clinicId: clinicId,
        active: true,
        mustChangePassword: false,
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
      });
    }

    updateDb({ ...db, users: updatedUsers });
    appendAuditLog({
      category: 'admin_clinica',
      action: 'Reset de Senha do Administrador da Clínica',
      performedByName: currentUser?.name || 'Fundador',
      performedByRole: currentUser?.role || 'superadmin',
      targetName: targetAdminName,
      type: 'PASSWORD_RESET',
      details: `Senha do Administrador ${targetAdminName} (CPF: ${formatCpf(rawCpf)}) redefinida para a senha inicial padrão ${DEFAULT_INITIAL_PASSWORD}.`,
      cpf: rawCpf,
      clinicId,
      userRole: 'clinic_admin'
    });
  };

  // Staff actions
  const handleSaveStaff = (staffUser: User) => {
    const exists = db.users.some(u => u.id === staffUser.id);
    let updatedUsers: User[];
    if (exists) {
      updatedUsers = db.users.map(u => u.id === staffUser.id ? staffUser : u);
    } else {
      updatedUsers = [...db.users, staffUser];
    }
    updateDb({ ...db, users: updatedUsers });
    if (currentUser && currentUser.id === staffUser.id) {
      setCurrentUser(staffUser);
    }
    const isClinicAdmin = staffUser.role === 'clinic_admin';
    appendAuditLog({
      category: isClinicAdmin ? 'admin_clinica' : 'equipe_funcionarios',
      action: exists ? 'Edição de Membro da Equipe' : 'Cadastro de Novo Membro da Equipe',
      performedByName: currentUser?.name || 'Administrador',
      performedByRole: currentUser?.role || 'clinic_admin',
      targetName: staffUser.name,
      type: 'USER_CREATED',
      details: `Profissional/Colaborador "${staffUser.name}" (${staffUser.role}) ${exists ? 'atualizado' : 'cadastrado'} com CPF: ${formatCpf(staffUser.cpf)}.`,
      cpf: staffUser.cpf,
      clinicId: staffUser.clinicId,
      userRole: staffUser.role
    });
  };

  const handleDeleteStaff = (userId: string) => {
    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) return;
    if (targetUser.role === 'clinic_admin') {
      alert('Operação Bloqueada: O Administrador da Clínica é o titular responsável pelo contrato e não pode ser excluído por aqui.');
      return;
    }
    const updatedUsers = db.users.filter(u => u.id !== userId);
    updateDb({ ...db, users: updatedUsers });
    appendAuditLog({
      category: 'equipe_funcionarios',
      action: 'Exclusão de Membro da Equipe',
      performedByName: currentUser?.name || 'Administrador',
      performedByRole: currentUser?.role || 'clinic_admin',
      targetName: targetUser.name,
      type: 'USER_DELETED',
      details: `Membro da equipe "${targetUser.name}" (CPF: ${formatCpf(targetUser.cpf)}, Cargo: ${targetUser.role}) foi excluído da clínica.`,
      cpf: targetUser.cpf,
      clinicId: targetUser.clinicId,
      userRole: targetUser.role
    });
  };

  const handleResetStaffPassword = (userId: string, newPassword: string) => {
    const targetUser = db.users.find(u => u.id === userId);
    const updatedUsers = db.users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
    updateDb({ ...db, users: updatedUsers });
    appendAuditLog({
      category: 'equipe_funcionarios',
      action: 'Reset de Senha do Membro da Equipe',
      performedByName: currentUser?.name || 'Administrador',
      performedByRole: currentUser?.role || 'clinic_admin',
      targetName: targetUser?.name || 'Colaborador',
      type: 'PASSWORD_RESET',
      details: `Senha de ${targetUser?.name || 'colaborador'} redefinida com sucesso para a senha padrão ${DEFAULT_INITIAL_PASSWORD}.`,
      cpf: targetUser?.cpf,
      clinicId: targetUser?.clinicId,
      userRole: targetUser?.role
    });
  };

  // Patients actions
  const handleSavePatient = (patient: Patient) => {
    const exists = db.patients.some(p => p.id === patient.id);
    const updatedPatients = exists
      ? db.patients.map(p => p.id === patient.id ? patient : p)
      : [...db.patients, patient];
    updateDb({ ...db, patients: updatedPatients });
  };

  const handleSaveAttachment = (att: PatientAttachment) => {
    const updated = [...db.patientAttachments, att];
    updateDb({ ...db, patientAttachments: updated });
  };

  const handleDeleteAttachment = (attId: string) => {
    const updated = db.patientAttachments.filter(a => a.id !== attId);
    updateDb({ ...db, patientAttachments: updated });
  };

  const handleUpdatePatientAnamnesis = (patientId: string, hasAnamnesis: boolean) => {
    const updated = db.patients.map(p => p.id === patientId ? { ...p, hasAnamnesis } : p);
    updateDb({ ...db, patients: updated });
  };

  const handleConfirmPatientPayment = (patientId: string, monthYear: string) => {
    const updatedPatients = db.patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          lastPaidMonthYear: monthYear
        };
      }
      return p;
    });
    updateDb({ ...db, patients: updatedPatients });
    const targetPatient = db.patients.find(p => p.id === patientId);
    appendAuditLog({
      category: 'financeiro_pacientes',
      action: 'Confirmação de Pagamento de Mensalidade',
      performedByName: currentUser?.name || 'Administrador',
      performedByRole: currentUser?.role || 'operacional',
      targetName: targetPatient?.fullName || 'Paciente',
      type: 'PAYMENT_CONFIRMED',
      details: `Mensalidade referente a ${monthYear} confirmada com sucesso para o paciente ${targetPatient?.fullName || patientId}.`,
      cpf: targetPatient?.cpfCnpj || '',
      clinicId: currentClinicId,
      userRole: currentUser?.role
    });
  };

  const handleSelectClinic = (cid: string) => {
    setCurrentClinicId(cid);
    if (currentUser?.role === 'superadmin') {
      setCurrentUser(prev => prev ? { ...prev, clinicId: cid } : null);
    }
    if (cid === 'system') {
      setCurrentTab('clinics');
    } else {
      setCurrentTab('dashboard');
    }
    setIsMobileMenuOpen(false);
  };

  // Appointments actions
  const handleSaveAppointments = (newApts: Appointment[]) => {
    updateDb({ ...db, appointments: [...db.appointments, ...newApts] });
  };

  const handleDeleteAppointments = (aptIds: string[]) => {
    const updated = db.appointments.filter(a => !aptIds.includes(a.id));
    updateDb({ ...db, appointments: updated });
  };

  const handleUpdateAppointmentStatus = (aptId: string, status: Appointment['status']) => {
    const updated = db.appointments.map(a => a.id === aptId ? { ...a, status } : a);
    updateDb({ ...db, appointments: updated });
  };

  // Waiting list actions
  const handleSaveWaitingListItem = (item: WaitingListItem) => {
    const exists = db.waitingList.some(w => w.id === item.id);
    const updated = exists
      ? db.waitingList.map(w => w.id === item.id ? item : w)
      : [...db.waitingList, item];
    updateDb({ ...db, waitingList: updated });
  };

  const handleDeleteWaitingListItem = (id: string) => {
    updateDb({ ...db, waitingList: db.waitingList.filter(w => w.id !== id) });
  };

  const handleToggleWaitingListHighlight = (id: string) => {
    const updated = db.waitingList.map(w => w.id === id ? { ...w, highlighted: !w.highlighted } : w);
    updateDb({ ...db, waitingList: updated });
  };

  // Plans actions
  const handleSavePlan = (plan: TherapeuticPlanItem) => {
    const exists = db.plans.some(p => p.id === plan.id);
    const updated = exists
      ? db.plans.map(p => p.id === plan.id ? plan : p)
      : [...db.plans, plan];
    updateDb({ ...db, plans: updated });
  };

  const handleDeletePlan = (id: string) => {
    updateDb({ ...db, plans: db.plans.filter(p => p.id !== id) });
  };

  // Devs actions
  const handleSaveDev = (dev: DevMember) => {
    const exists = db.devs.some(d => d.id === dev.id);
    const updated = exists
      ? db.devs.map(d => d.id === dev.id ? dev : d)
      : [...db.devs, dev];
    updateDb({ ...db, devs: updated });
  };

  const handleDeleteDev = (id: string) => {
    updateDb({ ...db, devs: db.devs.filter(d => d.id !== id) });
  };

  // Helpdesk actions
  const handleSaveTicket = (ticket: HelpdeskTicket) => {
    updateDb({ ...db, helpdeskTickets: [...db.helpdeskTickets, ticket] });
  };

  const handleUpdateTicketStatus = (ticketId: string, updates: Partial<HelpdeskTicket>) => {
    const updated = db.helpdeskTickets.map(t => t.id === ticketId ? { ...t, ...updates } : t);
    updateDb({ ...db, helpdeskTickets: updated });
  };

  // System visual settings
  const handleSaveSystemConfig = (data: { theme: ClinicTheme; menuConfig: MenuItemConfig[] }) => {
    if (!currentClinicId || currentClinicId === 'system') return;
    const updatedClinics = db.clinics.map(c => {
      if (c.id === currentClinicId) {
        return { ...c, theme: data.theme, menuConfig: data.menuConfig };
      }
      return c;
    });
    updateDb({ ...db, clinics: updatedClinics });
  };

  // Reset DB
  const handleResetDb = () => {
    const freshDb = resetDatabaseToInitial();
    setDb(freshDb);
    setCurrentUser(null);
    setCurrentClinicId('system');
    alert('Banco de dados redefinido com sucesso para as configurações originais!');
  };

  // Filter scoped data for current clinic
  const clinicScopedPatients = db.patients.filter(p => p.clinicId === currentClinicId);
  const clinicScopedAppointments = db.appointments.filter(a => a.clinicId === currentClinicId);
  const clinicScopedWaitingList = db.waitingList.filter(w => w.clinicId === currentClinicId);
  const clinicScopedProfessionals = db.users.filter(u => u.clinicId === currentClinicId);
  const clinicScopedPlans = db.plans.filter(p => p.clinicId === currentClinicId);
  const clinicScopedTickets = db.helpdeskTickets.filter(t => currentClinicId === 'system' || t.clinicId === currentClinicId);

  // Compute all unique specialties licensed to the clinical staff of this clinic
  const activeClinicalSpecialties = Array.from(new Set(
    clinicScopedProfessionals
      .filter(p => p.group === 'corpo_clinico')
      .flatMap(p => Array.isArray(p.specialties) && p.specialties.length > 0 ? p.specialties : [p.role || 'Psicologia'])
      .filter(Boolean)
  ));

  // If not logged in, show Login page
  if (!currentUser) {
    return (
      <>
        <Login
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          failedLoginAttempts={failedLoginAttempts}
          errorMessage={errorMessage}
          onLogin={handleLogin}
          onRecoverPassword={handleRecoverPassword}
          onResetAttempts={() => {
            setFailedLoginAttempts(0);
            setErrorMessage('');
          }}
        />

        <FirstAccessModal
          user={tempPasswordUser}
          isOpen={isFirstAccessModalOpen}
          onSaveNewPassword={handleSaveFirstAccessPassword}
          onCancel={() => {
            setIsFirstAccessModalOpen(false);
            setTempPasswordUser(null);
          }}
        />

        <AuditLogsModal
          isOpen={isAuditLogsModalOpen}
          onClose={() => setIsAuditLogsModalOpen(false)}
          users={db.users}
          clinics={db.clinics}
          auditLogs={db.auditLogs}
          onResetDb={handleResetDb}
        />
      </>
    );
  }

  // App Layout with Sidebar and Content View
  return (
    <div 
      className="flex flex-col md:flex-row min-h-screen relative"
      style={{
        backgroundColor: activeTheme.pageBgColor || '#f8fafc',
        color: activeTheme.textColor || '#1e293b',
        fontFamily: activeTheme.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: activeTheme.fontSize || '14px'
      }}
    >
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white z-30 shadow-md">
        <div className="flex items-center space-x-2.5 truncate">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow shrink-0"
            style={{ backgroundColor: activeTheme.primaryColor }}
          >
            {currentUser?.role === 'superadmin' && currentUser?.clinicId === 'system' ? 'S' : currentClinicData?.name?.charAt(0) || 'C'}
          </div>
          <span className="font-bold text-sm truncate">
            {currentUser?.role === 'superadmin' && currentUser?.clinicId === 'system' ? 'CliniGestor SaaS' : currentClinicData?.name || 'CliniGestor'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          aria-label="Abrir Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={`${isMobileMenuOpen ? 'block absolute inset-x-0 top-14 z-40 shadow-2xl' : 'hidden md:flex'} md:relative`}>
        <Sidebar
          currentUser={currentUser}
          currentClinicData={currentClinicData}
          currentClinicId={currentClinicId}
          clinics={db.clinics}
          activeTheme={activeTheme}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onSelectClinic={handleSelectClinic}
          onLogout={handleLogout}
          onChangePassword={() => {
            setIsChangePasswordModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenAuditLogs={() => {
            setIsAuditLogsModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          todayAppointmentsCount={clinicScopedAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
          patientsCount={clinicScopedPatients.length}
          waitingListCount={clinicScopedWaitingList.length}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen custom-scrollbar">
        {currentTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            currentClinic={currentClinicData}
            appointments={clinicScopedAppointments}
            patients={clinicScopedPatients}
            onNavigateTab={setCurrentTab}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onConfirmPatientPayment={handleConfirmPatientPayment}
          />
        )}

        {currentTab === 'clinics' && (
          <ClinicsManager
            clinics={db.clinics}
            users={db.users}
            onAddClinic={handleAddClinic}
            onUpdateClinic={handleUpdateClinic}
            onToggleClinicStatus={handleToggleClinicStatus}
            onDeleteClinic={handleDeleteClinic}
            onResetClinicAdminPassword={handleResetClinicAdminPassword}
            onSelectClinic={handleSelectClinic}
          />
        )}

        {currentTab === 'staff' && (
          <Staff
            professionals={clinicScopedProfessionals}
            clinicId={currentClinicId}
            clinicName={currentClinicData?.name || 'Clínica'}
            onSaveProfessional={handleSaveStaff}
            onDeleteProfessional={handleDeleteStaff}
            onResetPassword={handleResetStaffPassword}
          />
        )}

        {currentTab === 'patients' && (
          <Patients
            patients={clinicScopedPatients}
            clinicId={currentClinicId}
            onSavePatient={handleSavePatient}
            appointments={clinicScopedAppointments}
            professionals={clinicScopedProfessionals}
            clinicalSpecialties={activeClinicalSpecialties.length > 0 ? activeClinicalSpecialties : undefined}
          />
        )}

        {currentTab === 'appointments' && (
          <Agenda
            professionals={clinicScopedProfessionals}
            patients={clinicScopedPatients}
            appointments={clinicScopedAppointments}
            clinicId={currentClinicId}
            onSaveAppointment={handleSaveAppointments}
            onDeleteAppointments={handleDeleteAppointments}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'waitingList' && (
          <WaitingList
            waitingList={clinicScopedWaitingList}
            clinicId={currentClinicId}
            onSaveItem={handleSaveWaitingListItem}
            onDeleteItem={handleDeleteWaitingListItem}
            onToggleHighlight={handleToggleWaitingListHighlight}
          />
        )}

        {currentTab === 'anamnesis' && (
          <Anamnesis
            patients={clinicScopedPatients}
            currentUser={currentUser}
            appointments={clinicScopedAppointments}
            onUpdatePatientAnamnesis={handleUpdatePatientAnamnesis}
            attachments={db.patientAttachments.filter(a => a.clinicId === currentClinicId)}
            onSaveAttachment={handleSaveAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />
        )}

        {currentTab === 'therapeuticPlan' && (
          <TherapeuticPlan
            plans={clinicScopedPlans}
            patients={clinicScopedPatients}
            professionals={clinicScopedProfessionals}
            currentUser={currentUser}
            clinicId={currentClinicId}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {currentTab === 'soap' && (
          <Evolutions
            patients={clinicScopedPatients}
            currentUser={currentUser}
            appointments={clinicScopedAppointments}
            attachments={db.patientAttachments.filter(a => a.clinicId === currentClinicId)}
            onSaveAttachment={handleSaveAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />
        )}

        {currentTab === 'clinicalHistory' && (
          <ClinicalHistory
            patients={clinicScopedPatients}
            plans={clinicScopedPlans}
            currentUser={currentUser}
            appointments={clinicScopedAppointments}
          />
        )}

        {currentTab === 'financial' && (
          <Financial
            professionals={clinicScopedProfessionals}
            appointments={clinicScopedAppointments}
          />
        )}

        {currentTab === 'whatsapp' && (
          <WhatsappManager
            appointments={clinicScopedAppointments}
          />
        )}

        {currentTab === 'telehealth' && (
          <Telehealth
            appointments={clinicScopedAppointments}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'founderAuditLogs' && (
          <FounderAuditLogs auditLogs={db.auditLogs} />
        )}

        {currentTab === 'devs' && (
          <DevsManager
            devs={db.devs}
            onSaveDev={handleSaveDev}
            onDeleteDev={handleDeleteDev}
          />
        )}

        {currentTab === 'helpdesk' && (
          <Helpdesk
            tickets={clinicScopedTickets}
            currentUser={currentUser}
            clinicId={currentClinicId}
            onSaveTicket={handleSaveTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        )}

        {currentTab === 'systemConfig' && (
          <SystemSettings
            activeClinicData={currentClinicData}
            onSaveSystemConfig={handleSaveSystemConfig}
          />
        )}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSaveNewPassword={handleChangePassword}
      />

      {/* Audit Logs and Database Diagnostic Modal */}
      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
        users={db.users}
        clinics={db.clinics}
        auditLogs={db.auditLogs}
        onResetDb={handleResetDb}
      />
    </div>
  );
}

function ChangePasswordModal({
  isOpen,
  onClose,
  onSaveNewPassword
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewPassword: (p: string) => void;
}) {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (pwd.length < 6) {
      setErr('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (pwd !== confirm) {
      setErr('A confirmação não coincide.');
      return;
    }
    onSaveNewPassword(pwd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Senha de Acesso" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
        {err && <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl font-bold">{err}</div>}
        <div className="space-y-1">
          <label className="font-bold block">Nova Senha *</label>
          <input
            required
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
            placeholder="Mínimo 6 dígitos"
          />
        </div>
        <div className="space-y-1">
          <label className="font-bold block">Confirmar Nova Senha *</label>
          <input
            required
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white"
            placeholder="Repita a nova senha"
          />
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">Salvar Nova Senha</button>
        </div>
      </form>
    </Modal>
  );
}
