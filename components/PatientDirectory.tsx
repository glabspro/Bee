
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  FileText, 
  ChevronRight, 
  Plus,
  History,
  Phone,
  Mail,
  Activity,
  Filter,
  ArrowUpAz,
  ArrowDownAz,
  Calendar,
  Stethoscope,
  X,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  IdCard,
  User as UserIcon,
  Save,
  Trash2,
  Clock,
  Zap,
  ChevronDown,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { Patient, ClinicalHistoryEntry, Appointment, AppointmentStatus, Sede, Professional } from '../types';

interface PatientDirectoryProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onAddHistoryEntry: (patientId: string, entry: ClinicalHistoryEntry) => void;
  onScheduleSessions?: (apts: Appointment[]) => void;
  sedes?: Sede[];
  professionals?: Professional[];
}

interface SessionDraft {
  id: string;
  date: string;
  time: string;
}

const PatientDirectory: React.FC<PatientDirectoryProps> = ({ 
  patients, 
  onAddPatient, 
  onAddHistoryEntry,
  onScheduleSessions,
  sedes = [],
  professionals = []
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados para modales
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);

  // Estados para formularios
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    documentId: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  const [newEntryForm, setNewEntryForm] = useState({
    diagnosis: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    isTreatmentPlan: false,
    numSessions: 3,
    frequency: 7, 
    sedeId: '',
    professionalId: '',
    sessions: [] as SessionDraft[]
  });

  // Inicializar selects
  useEffect(() => {
    if (sedes.length > 0 && !newEntryForm.sedeId) {
      setNewEntryForm(prev => ({ ...prev, sedeId: sedes[0].id }));
    }
    if (professionals.length > 0 && !newEntryForm.professionalId) {
      setNewEntryForm(prev => ({ ...prev, professionalId: professionals[0].id }));
    }
  }, [sedes, professionals, showNewEntryModal]);

  // Proyectar sesiones
  useEffect(() => {
    if (newEntryForm.isTreatmentPlan) {
      const drafts: SessionDraft[] = [];
      const startDate = new Date();
      for (let i = 1; i <= newEntryForm.numSessions; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * newEntryForm.frequency));
        drafts.push({
          id: `draft-${Date.now()}-${i}`,
          date: nextDate.toISOString().split('T')[0],
          time: "09:00"
        });
      }
      setNewEntryForm(prev => ({ ...prev, sessions: drafts }));
    } else {
      setNewEntryForm(prev => ({ ...prev, sessions: [] }));
    }
  }, [newEntryForm.isTreatmentPlan, newEntryForm.numSessions, newEntryForm.frequency]);

  const filteredAndSortedPatients = useMemo(() => {
    return patients
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.documentId.includes(searchTerm)
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'recent') {
          comparison = b.id.localeCompare(a.id);
        } else if (sortBy === 'age') {
          comparison = a.birthDate.localeCompare(b.birthDate);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [patients, searchTerm, sortBy, sortOrder]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const toggleSort = (type: 'name' | 'recent' | 'age') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: 'pat-' + Math.random().toString(36).substr(2, 9),
      name: newPatientForm.name,
      documentId: newPatientForm.documentId,
      email: newPatientForm.email || undefined,
      phone: newPatientForm.phone,
      birthDate: newPatientForm.birthDate,
      history: [],
      companyId: 'current-company' 
    };
    onAddPatient(newPatient);
    setNewPatientForm({ name: '', documentId: '', email: '', phone: '', birthDate: '' });
    setShowNewPatientModal(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    const newEntry: ClinicalHistoryEntry = {
      id: 'entry-' + Math.random().toString(36).substr(2, 9),
      date: newEntryForm.date,
      professionalId: newEntryForm.professionalId || 'p1',
      diagnosis: newEntryForm.diagnosis,
      notes: newEntryForm.notes,
      recommendations: newEntryForm.isTreatmentPlan ? `Plan de ${newEntryForm.sessions.length} sesiones.` : ''
    };
    
    onAddHistoryEntry(selectedPatient.id, newEntry);

    if (newEntryForm.isTreatmentPlan && onScheduleSessions) {
      const futureApts: Appointment[] = newEntryForm.sessions.map(s => ({
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientDni: selectedPatient.documentId,
        patientId: selectedPatient.id,
        serviceId: 's1',
        sedeId: newEntryForm.sedeId,
        professionalId: newEntryForm.professionalId,
        date: s.date,
        time: s.time,
        status: AppointmentStatus.CONFIRMED,
        bookingCode: 'BEE-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        companyId: selectedPatient.companyId
      }));
      onScheduleSessions(futureApts);
    }
    
    setNewEntryForm(prev => ({ 
      ...prev, 
      diagnosis: '', 
      notes: '', 
      isTreatmentPlan: false,
      sessions: [] 
    }));
    setShowNewEntryModal(false);
  };

  const updateSession = (id: string, field: keyof SessionDraft, value: string) => {
    setNewEntryForm(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="space-y-10 animate-fade-in h-[calc(100vh-10rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Directorio Clínico</h2>
          <p className="text-slate-500 font-medium mt-1">Gestión de expedientes y analítica de pacientes.</p>
        </div>
        <button 
          onClick={() => setShowNewPatientModal(true)}
          className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-brand-primary/90 shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Expediente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
        {/* Sidebar Lista Pacientes */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 border-b border-slate-100 space-y-4 bg-slate-50/20">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por DNI o Nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm outline-none shadow-sm transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleSort('name')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === 'name' ? 'bg-brand-navy text-white' : 'bg-white text-slate-400 border border-slate-100 hover:text-brand-navy'}`}>Nombre</button>
              <button onClick={() => toggleSort('age')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === 'age' ? 'bg-brand-navy text-white' : 'bg-white text-slate-400 border border-slate-100 hover:text-brand-navy'}`}>Edad</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {filteredAndSortedPatients.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                  selectedPatient?.id === p.id 
                    ? 'bg-brand-secondary/[0.04] border-brand-secondary shadow-md' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-ubuntu font-bold text-lg ${selectedPatient?.id === p.id ? 'bg-brand-secondary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {p.name.charAt(0)}
                </div>
                <div className="text-left flex-1 truncate">
                  <p className="font-bold text-brand-navy text-sm truncate">{p.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.documentId}</p>
                </div>
                <ChevronRight size={14} className={selectedPatient?.id === p.id ? 'text-brand-secondary' : 'text-slate-200'} />
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del Paciente */}
        <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2 h-full">
          {selectedPatient ? (
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 rounded-3xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-4xl font-ubuntu font-bold shadow-inner">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">{selectedPatient.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><IdCard size={14} className="text-brand-primary" /> {selectedPatient.documentId}</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-brand-accent" /> {calculateAge(selectedPatient.birthDate)} Años</span>
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-brand-secondary" /> {selectedPatient.phone}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNewEntryModal(true)}
                  className="bg-brand-navy text-white px-8 py-4 rounded-[2rem] font-bold text-xs flex items-center gap-3 hover:bg-brand-navy/90 shadow-xl transition-all active:scale-95"
                >
                  <ClipboardCheck size={18} className="text-brand-secondary" /> Evolución Manual
                </button>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                   <h4 className="font-ubuntu font-bold text-2xl text-brand-navy flex items-center gap-3">
                     <History className="text-brand-secondary" /> Historial Clínico
                   </h4>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">{selectedPatient.history.length} Registros</span>
                </div>
                <div className="space-y-10">
                  {selectedPatient.history.length > 0 ? (
                    selectedPatient.history.map((entry) => (
                      <div key={entry.id} className="relative pl-12 border-l-2 border-slate-100 last:border-transparent pb-10">
                        <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-brand-secondary shadow-sm"></div>
                        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-lightSecondary px-3 py-1 rounded-lg border border-brand-secondary/10 flex items-center gap-2">
                               <Calendar size={12} /> {entry.date}
                            </span>
                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                               <Stethoscope size={12} /> ID PROF: {entry.professionalId}
                            </span>
                          </div>
                          <h5 className="font-ubuntu font-bold text-brand-navy text-lg">{entry.diagnosis}</h5>
                          <p className="text-sm text-slate-500 italic leading-relaxed bg-white p-5 rounded-2xl border border-slate-50 shadow-inner">{entry.notes}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-300">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <FileText size={48} className="opacity-20" />
                      </div>
                      <p className="font-bold text-sm text-slate-400">No hay evoluciones registradas aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <Users size={80} className="mb-6 opacity-10" />
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy/20">Selecciona un Paciente</h3>
              <p className="mt-2 font-medium">Gestiona expedientes médicos de forma centralizada.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EVOLUCIÓN MANUAL - VENTANA DE PANTALLA COMPLETA PROFESIONAL */}
      {showNewEntryModal && selectedPatient && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/90 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-10 animate-fade-in">
          <div className="bg-white rounded-[4rem] w-full h-full max-w-[1400px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col">
             
             {/* Cabecera Superior - Barra de Herramientas */}
             <div className="px-12 py-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-brand-navy text-white rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-all">
                      <ClipboardList size={32} className="text-brand-secondary" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-3xl font-ubuntu font-bold text-brand-navy tracking-tight">Registro de Evolución Clínica</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente Activo:</span>
                         <span className="text-xs font-bold text-brand-secondary bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                           <UserIcon size={12} /> {selectedPatient.name}
                         </span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">DNI:</span>
                         <span className="text-xs font-bold text-slate-500">{selectedPatient.documentId}</span>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => setShowNewEntryModal(false)} 
                  className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:shadow-xl hover:bg-red-50 transition-all border border-slate-100"
                >
                  <X size={32} />
                </button>
             </div>
             
             {/* Área de Trabajo Principal */}
             <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Panel Central: Formulario Médico */}
                <form onSubmit={handleCreateEntry} className={`flex-1 p-12 space-y-10 overflow-y-auto custom-scrollbar bg-white ${newEntryForm.isTreatmentPlan ? 'lg:w-[65%] border-r border-slate-100' : 'w-full'}`}>
                   
                   {/* Interruptor de Plan de Tratamiento */}
                   <div className={`p-8 rounded-[2.5rem] border transition-all flex items-center justify-between ${newEntryForm.isTreatmentPlan ? 'bg-brand-secondary/[0.03] border-brand-secondary/20' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${newEntryForm.isTreatmentPlan ? 'bg-brand-secondary text-white scale-110' : 'bg-white text-slate-300'}`}>
                            <Zap size={28} />
                         </div>
                         <div>
                            <span className="text-lg font-ubuntu font-bold text-brand-navy block">¿Proyectar Plan de Tratamiento?</span>
                            <span className="text-xs text-slate-400 font-medium">Al activar, Bee agendará automáticamente las próximas sesiones en el calendario.</span>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer scale-150 mr-4">
                        <input 
                          type="checkbox" 
                          checked={newEntryForm.isTreatmentPlan} 
                          onChange={() => setNewEntryForm(p => ({...p, isTreatmentPlan: !p.isTreatmentPlan}))} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-secondary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                      </label>
                   </div>

                   {/* Campos de Entrada de Texto */}
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-brand-navy uppercase tracking-[0.2em] ml-2 flex items-center gap-3">
                           <IdCard size={16} className="text-brand-secondary" /> Diagnóstico Corto / Motivo
                        </label>
                        <input 
                           required 
                           placeholder="Ej: Evaluación de Ortodoncia Inicial" 
                           className="w-full px-8 py-6 bg-slate-50 border border-slate-50 rounded-[2rem] focus:ring-2 focus:ring-brand-secondary focus:bg-white font-ubuntu font-bold text-xl text-brand-navy shadow-inner outline-none transition-all placeholder:text-slate-200"
                           value={newEntryForm.diagnosis}
                           onChange={e => setNewEntryForm({...newEntryForm, diagnosis: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-brand-navy uppercase tracking-[0.2em] ml-2 flex items-center gap-3">
                           <FileText size={16} className="text-brand-primary" /> Evolución Clínica de Hoy (Notas Detalladas)
                        </label>
                        <textarea 
                           required 
                           placeholder="Escriba aquí los hallazgos médicos, procedimientos realizados y observaciones relevantes de la atención de hoy..." 
                           className="w-full px-8 py-8 bg-slate-50 border border-slate-50 rounded-[2.5rem] focus:ring-2 focus:ring-brand-primary focus:bg-white text-lg font-medium text-slate-700 min-h-[350px] shadow-inner resize-none outline-none transition-all placeholder:text-slate-200 leading-relaxed"
                           value={newEntryForm.notes}
                           onChange={e => setNewEntryForm({...newEntryForm, notes: e.target.value})}
                        />
                      </div>

                      {/* Configuración de Sede y Profesional */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-50">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                              <MapPin size={14} className="text-brand-accent" /> Centro de Atención
                           </label>
                           <div className="relative group">
                              <select 
                                 required 
                                 className="w-full pl-12 pr-12 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none font-bold text-sm appearance-none text-brand-navy shadow-sm cursor-pointer group-hover:border-brand-accent transition-all"
                                 value={newEntryForm.sedeId}
                                 onChange={e => setNewEntryForm({...newEntryForm, sedeId: e.target.value})}
                              >
                                 <option value="">Selecciona Sede</option>
                                 {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-accent transition-colors" />
                              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                              <UserIcon size={14} className="text-brand-secondary" /> Profesional Atendiendo
                           </label>
                           <div className="relative group">
                              <select 
                                 required 
                                 className="w-full pl-12 pr-12 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none font-bold text-sm appearance-none text-brand-navy shadow-sm cursor-pointer group-hover:border-brand-secondary transition-all"
                                 value={newEntryForm.professionalId}
                                 onChange={e => setNewEntryForm({...newEntryForm, professionalId: e.target.value})}
                              >
                                 <option value="">Selecciona Profesional</option>
                                 {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              <Stethoscope size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-secondary transition-colors" />
                              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="pt-6">
                      <button 
                        type="submit" 
                        className="w-full py-8 bg-brand-navy text-white rounded-[2.5rem] font-bold text-xl shadow-[0_25px_50px_rgba(13,13,75,0.3)] hover:bg-brand-navy/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-6 active:scale-95 border border-white/10"
                      >
                         <Save size={32} className="text-brand-secondary" /> Finalizar y Guardar Atención Clínica
                      </button>
                   </div>
                </form>

                {/* Panel Derecho: Planificador de Tratamiento */}
                {newEntryForm.isTreatmentPlan && (
                  <div className="lg:w-[35%] bg-slate-50/70 p-12 space-y-10 animate-fade-in overflow-y-auto custom-scrollbar border-l border-white shadow-inner">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-brand-secondary shadow-xl border border-slate-100">
                            <CalendarDays size={28} />
                         </div>
                         <div>
                            <h4 className="font-ubuntu font-bold text-2xl text-brand-navy leading-none">Agenda de Plan</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-[0.2em]">Sesiones de Continuidad</p>
                         </div>
                      </div>

                      {/* Controles de Planificación */}
                      <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100/50">
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº Sesiones</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="20"
                              className="w-full p-4 bg-slate-50 rounded-2xl text-lg font-bold border-none focus:ring-2 focus:ring-brand-secondary shadow-inner text-brand-navy" 
                              value={newEntryForm.numSessions} 
                              onChange={e => setNewEntryForm(p => ({...p, numSessions: parseInt(e.target.value) || 1}))} 
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Días Frecuencia</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="60"
                              className="w-full p-4 bg-slate-50 rounded-2xl text-lg font-bold border-none focus:ring-2 focus:ring-brand-secondary shadow-inner text-brand-navy" 
                              value={newEntryForm.frequency} 
                              onChange={e => setNewEntryForm(p => ({...p, frequency: parseInt(e.target.value) || 1}))} 
                            />
                         </div>
                      </div>

                      {/* Previsualización de Citas Futuras */}
                      <div className="space-y-5">
                         <div className="flex items-center justify-between px-2">
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Previsualización Automática</p>
                           <span className="text-[9px] font-bold text-brand-secondary bg-brand-lightSecondary px-3 py-1 rounded-lg">CALENDARIO ACTIVO</span>
                         </div>
                         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {newEntryForm.sessions.map((s, idx) => (
                              <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm group hover:border-brand-secondary hover:shadow-xl transition-all">
                                 <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white text-xs flex items-center justify-center font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                 </div>
                                 <div className="flex-1 space-y-3">
                                    <div className="relative">
                                       <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-secondary transition-colors" />
                                       <input 
                                         type="date" 
                                         value={s.date} 
                                         onChange={(e) => updateSession(s.id, 'date', e.target.value)} 
                                         className="bg-slate-50 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-brand-navy w-full outline-none focus:ring-1 focus:ring-brand-secondary transition-all" 
                                       />
                                    </div>
                                    <div className="relative">
                                       <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-secondary transition-colors" />
                                       <input 
                                         type="time" 
                                         value={s.time} 
                                         onChange={(e) => updateSession(s.id, 'time', e.target.value)} 
                                         className="bg-slate-50 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-brand-navy w-full outline-none focus:ring-1 focus:ring-brand-secondary transition-all" 
                                       />
                                    </div>
                                 </div>
                                 <button 
                                   type="button"
                                   onClick={() => setNewEntryForm(prev => ({...prev, sessions: prev.sessions.filter(it => it.id !== s.id)}))}
                                   className="text-slate-200 hover:text-red-500 transition-colors p-3 hover:bg-red-50 rounded-2xl"
                                 >
                                    <Trash2 size={20} />
                                 </button>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Notificación de Sistema */}
                      <div className="bg-brand-navy p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl mt-auto">
                         <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-brand-secondary/20 text-brand-secondary rounded-xl flex items-center justify-center">
                               <AlertTriangle size={20} />
                            </div>
                            <h5 className="font-ubuntu font-bold text-sm tracking-wide">Registro Maestro</h5>
                         </div>
                         <p className="text-[11px] leading-relaxed text-white/50 font-medium">
                            Al confirmar, el sistema registrará la evolución clínica actual y generará automáticamente los turnos futuros en estado **CONFIRMADO** para la sede seleccionada.
                         </p>
                      </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Expediente - Manteniendo Estilo */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-slate-100 relative">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">Nuevo Expediente</h3>
                 <button onClick={() => setShowNewPatientModal(false)} className="text-slate-300 hover:text-brand-navy"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreatePatient} className="space-y-6">
                 <div className="space-y-4">
                    <input required placeholder="Nombre Completo" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.name} onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})} />
                    <input required placeholder="DNI / Documento" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.documentId} onChange={e => setNewPatientForm({...newPatientForm, documentId: e.target.value})} />
                    <input placeholder="Correo Electrónico" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.email} onChange={e => setNewPatientForm({...newPatientForm, email: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <input required placeholder="Teléfono" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.phone} onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})} />
                       <input required type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-xs shadow-inner outline-none transition-all" value={newPatientForm.birthDate} onChange={e => setNewPatientForm({...newPatientForm, birthDate: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-brand-primary text-white rounded-[2rem] font-bold shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] transition-all mt-4">Desplegar Expediente Médico</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
