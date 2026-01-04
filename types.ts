
export enum AppointmentStatus {
  PENDING = 'POR CONFIRMAR',
  CONFIRMED = 'CONFIRMADO',
  CANCELLED = 'CANCELADO',
  COMPLETED = 'COMPLETADO',
  NO_SHOW = 'NO ASISTIÓ',
  ATTENDED = 'ATENDIDO'
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Administrador',
  RECEPCIONIST = 'Recepcionista',
  SPECIALIST = 'Especialista'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  companyId?: string;
}

export interface Sede {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  sedeIds: string[];
}

export interface Service {
  id: string;
  name: string;
  duration: number; 
  price: number;
  category: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  documentId: string;
  birthDate: string;
  history: ClinicalHistoryEntry[];
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
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'NEW_PORTAL' | 'UPCOMING' | 'SYSTEM';
  appointmentId?: string;
}

export interface ViewState {
  currentView: 'login' | 'dashboard' | 'appointments' | 'patients' | 'schedules' | 'portal' | 'clinical-record';
  activeAppointmentId?: string;
  user?: User;
}
