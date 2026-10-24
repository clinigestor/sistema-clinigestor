/**
 * Utility helpers for CliniGestor
 */

export function cleanCpf(cpf: string = ''): string {
  return cpf.replace(/\D/g, '');
}

export function formatCpf(cpf: string = ''): string {
  const digits = cleanCpf(cpf).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatCpfCnpj(val: string = ''): string {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 11) {
    return formatCpf(digits);
  }
  // CNPJ 00.000.000/0000-00
  const c = digits.slice(0, 14);
  if (c.length <= 2) return c;
  if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
  if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
  if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
}

export function formatPhone(val: string = ''): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function calculateExactAge(birthDateStr: string = ''): {
  years: number;
  months: number;
  days: number;
  text: string;
  isUnder16: boolean;
} {
  if (!birthDateStr) {
    return { years: 0, months: 0, days: 0, text: '', isUnder16: false };
  }

  const birthDate = new Date(birthDateStr + 'T00:00:00');
  const now = new Date();

  if (isNaN(birthDate.getTime())) {
    return { years: 0, months: 0, days: 0, text: '', isUnder16: false };
  }

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (days > 0 && years === 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

  const text = parts.join(' e ') || 'Recém-nascido';
  const isUnder16 = years < 16;

  return { years, months, days, text, isUnder16 };
}

export function validateCpf(cpf: string = ''): boolean {
  const clean = cleanCpf(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
}

export function generateShortLogin(name: string, birthDate: string, cpf: string): string {
  const parts = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ').filter(Boolean);
  const firstName = parts[0] || 'user';
  const lastName = parts[parts.length - 1] || '';
  const birthYear = birthDate ? new Date(birthDate).getFullYear() || birthDate.split('-')[0] || '' : '';
  const cpfDigits = cleanCpf(cpf);
  const last4 = cpfDigits.slice(-4) || '1234';
  
  const base = lastName && lastName !== firstName ? `${firstName}.${lastName}` : firstName;
  return `${base}${birthYear || last4}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
}

export function generateSecurePassword(name: string, birthDate: string, cpf: string): string {
  const specials = ['$', '#', '@', '!'];
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowers = 'abcdefghijklmnopqrstuvwxyz';

  const firstLetter = name.trim().charAt(0).toUpperCase() || 'A';
  const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
  const cpfDigits = cleanCpf(cpf);
  const numPart = cpfDigits.slice(-3) || '123';
  const birthYear = birthDate ? (new Date(birthDate).getFullYear() || '').toString().slice(-2) : '26';
  const randomLower = lowers[Math.floor(Math.random() * lowers.length)];
  const randomUpper = uppers[Math.floor(Math.random() * uppers.length)];

  let pass = `${firstLetter}${randomSpecial}${randomLower}${randomUpper}${numPart}${birthYear}`;
  if (pass.length < 8) {
    pass += '9#A';
  }
  return pass.slice(0, 8);
}

