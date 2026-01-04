
import { AppointmentStatus, Service, Professional, Sede, Patient } from './types';

export const MOCK_SERVICES: Service[] = [
  // Added companyId to satisfy Service interface
  { id: 's1', name: 'Consulta General', duration: 30, price: 50, category: 'General', companyId: 'bee-main' },
  { id: 's2', name: 'Limpieza Dental', duration: 45, price: 80, category: 'Odontología', companyId: 'bee-main' },
  { id: 's3', name: 'Ortodoncia - Ajuste', duration: 20, price: 120, category: 'Odontología', companyId: 'bee-main' },
  { id: 's4', name: 'Blanqueamiento', duration: 60, price: 200, category: 'Estética', companyId: 'bee-main' },
];

export const MOCK_PROFESSIONALS: Professional[] = [
  // Added companyId and userId to satisfy Professional interface
  { id: 'p1', name: 'Dr. Alejandro Soto', specialty: 'Odontólogo General', avatar: 'https://i.pravatar.cc/150?u=p1', sedeIds: ['sede1'], companyId: 'bee-main', userId: 'u-1' },
  { id: 'p2', name: 'Dra. María García', specialty: 'Ortodoncista', avatar: 'https://i.pravatar.cc/150?u=p2', sedeIds: ['sede1', 'sede2'], companyId: 'bee-main', userId: 'u-2' },
  { id: 'p3', name: 'Dr. Juan Pérez', specialty: 'Cirujano Máxilo', avatar: 'https://i.pravatar.cc/150?u=p3', sedeIds: ['sede2'], companyId: 'bee-main', userId: 'u-3' },
];

export const INITIAL_SEDES: Sede[] = [
  // Added companyId to satisfy Sede interface
  { id: 'sede1', name: 'Sede Norte', address: 'Av. Principal 123', phone: '01 234 5678', whatsapp: '51900000001', companyId: 'bee-main' },
  { id: 'sede2', name: 'Sede Sur', address: 'Calle Secundaria 456', phone: '01 987 6543', whatsapp: '51900000002', companyId: 'bee-main' },
];

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
  [AppointmentStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
  [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
  [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
  [AppointmentStatus.NO_SHOW]: 'bg-slate-100 text-slate-600 border-slate-200',
  [AppointmentStatus.ATTENDED]: 'bg-teal-100 text-teal-700 border-teal-200',
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat1',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    phone: '555-1234',
    documentId: '12345678-9',
    birthDate: '1985-05-15',
    history: [],
    // Added companyId to satisfy Patient interface
    companyId: 'bee-main'
  },
  {
    id: 'pat2',
    name: 'Lucía Méndez',
    email: 'lucia@example.com',
    phone: '555-5678',
    documentId: '98765432-1',
    birthDate: '1992-08-22',
    history: [],
    // Added companyId to satisfy Patient interface
    companyId: 'bee-main'
  }
];
