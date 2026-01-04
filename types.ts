
export enum AppointmentStatus {
  PENDING = 'POR CONFIRMAR',
  CONFIRMED = 'CONFIRMADO',
  CANCELLED = 'CANCELADO',
  COMPLETED = 'COMPLETADO',
  NO_SHOW = 'NO ASISTIÓ',
  ATTENDED = 'ATENDIDO'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMINISTRADOR',
  RECEPCIONIST = 'RECEPCIONISTA',
  SPECIALIST = 'ESPECIALISTA'
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  portalHero?: string;
  primaryColor: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  sedeIds?: string[]; // Si es null, tiene acceso a todas
  avatar?: string;
}

export interface TimeInterval {
  start: string;
  end: string;
}

export interface DayAvailability {
  isOpen: boolean;
  intervals: TimeInterval[];
}

export interface Sede {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  companyId: string;
  availability?: Record<string, DayAvailability>;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  sedeIds: string[];
  companyId: string;
  userId: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; 
  price: number;
  category: string;
  companyId: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  documentId: string;
  birthDate: string;
  history: ClinicalHistoryEntry[];
  companyId: string;
}

export interface ClinicalHistoryEntry {
  id: string;
  date: string;
  professionalId: string;
  diagnosis: string;
  notes: string;
  recommendations: string;
  medications?: { name: string; instructions: string }[];
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  patientDni?: string;
  patientId?: string;
  serviceId: string;
  sedeId: string;
  professionalId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  bookingCode: string;
  companyId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'NEW_PORTAL' | 'UPCOMING' | 'SYSTEM';
  appointmentId?: string;
  companyId: string;
}

export interface ViewState {
  currentView: 'login' | 'dashboard' | 'appointments' | 'patients' | 'schedules' | 'portal' | 'clinical-record' | 'saas-admin' | 'staff-management';
  activeAppointmentId?: string;
  user?: User;
}
