
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
  Cake,
  Save,
  Trash2,
  Clock,
  Zap
} from 'lucide-react';
import { Patient, ClinicalHistoryEntry, Appointment, AppointmentStatus } from '../types';

interface PatientDirectoryProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onAddHistoryEntry: (patientId: string, entry: ClinicalHistoryEntry) => void;
  onScheduleSessions?: (apts: Appointment[]) => void; // Nueva prop para agendar desde aquí
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
  onScheduleSessions 
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

  // Estado extendido para Entrada Manual
  const [newEntryForm, setNewEntryForm] = useState({
    diagnosis: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    isTreatmentPlan: false,
    sessions: [] as SessionDraft[]
  });

  // Generador de sesiones cuando cambia el toggle o el número (basado en lógica de 1 sesión inicial)
  useEffect(() => {
    if (newEntryForm.isTreatmentPlan && newEntryForm.sessions.length === 0) {
      const drafts: SessionDraft[] = [];
      const startDate = new Date();
      for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * 7));
        drafts.push({
          id: `draft-${Date.now()}-${i}`,
          date: nextDate.toISOString().split('T')[0],
          time: "09:00"
        });
      }
      setNewEntryForm(prev => ({ ...prev, sessions: drafts }));
    }
  }, [newEntryForm.isTreatmentPlan]);

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
      history: []
    };
    onAddPatient(newPatient);
    setNewPatientForm({ name: '', documentId: '', email: '', phone: '', birthDate: '' });
    setShowNewPatientModal(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    // 1. Crear entrada histórica
    const newEntry: ClinicalHistoryEntry = {
      id: 'entry-' + Math.random().toString(36).substr(2, 9),
      date: newEntryForm.date,
      professionalId: 'p1',
      diagnosis: newEntryForm.diagnosis,
      notes: newEntryForm.notes,
      recommendations: newEntryForm.isTreatmentPlan ? `Iniciado plan de ${newEntryForm.sessions.length} sesiones.` : ''
    };
    
    onAddHistoryEntry(selectedPatient.id, newEntry);

    // 2. Si hay plan de tratamiento, agendar citas reales en la agenda
    if (newEntryForm.isTreatmentPlan && onScheduleSessions) {
      const futureApts: Appointment[] = newEntryForm.sessions.map(s => ({
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientDni: selectedPatient.documentId,
        patientId: selectedPatient.id,
        serviceId: 's1', // Servicio base
        sedeId: 'sede1', // Sede base
        professionalId: 'p1',
        date: s.date,
        time: s.time,
        status: AppointmentStatus.CONFIRMED,
        bookingCode: 'PLAN-' + Math.random().toString(36).substr(2, 4).toUpperCase()
      }));
      onScheduleSessions(futureApts);
    }
    
    // Reset
    setNewEntryForm({ 
      diagnosis: '', 
      notes: '', 
      date: new Date().toISOString().split('T')[0],
      isTreatmentPlan: false,
      sessions: []
    });
    setShowNewEntryModal(false);
  };

  const updateSession = (id: string, field: keyof SessionDraft, value: string) => {
    setNewEntryForm(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addSessionDraft = () => {
    const last = newEntryForm.sessions[newEntryForm.sessions.length - 1];
    const nextDate = new Date(last ? last.date : new Date());
    nextDate.setDate(nextDate.getDate() + 7);
    
    setNewEntryForm(prev => ({
      ...prev,
      sessions: [...prev.sessions, {
        id: `draft-${Date.now()}`,
        date: nextDate.toISOString().split('T')[0],
        time: "09:00"
      }]
    }));
  };

  return (
    <div className="space-y-10 animate-fade-in h-[calc(100vh-10rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Directorio Clínico</h2>
          <p className="text-slate-500 font-medium mt-1">Gestión avanzada de expedientes y analítica de pacientes.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-slate-100 text-slate-500 px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all text-sm border border-slate-200">
            <Filter size={18} /> Filtrar Base
          </button>
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/20 transition-all text-sm"
          >
            <Plus size={20} /> Nuevo Expediente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
        {/* Patient List Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 border-b border-slate-100 space-y-6 bg-slate-50/30">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-secondary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por DNI o Nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-secondary shadow-inner font-medium text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => toggleSort('name')} 
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${sortBy === 'name' ? 'bg-brand-navy text-white border-brand-navy shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Nombre {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUpAz size={12} /> : <ArrowDownAz size={12} />)}
              </button>
              <button 
                onClick={() => toggleSort('age')} 
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${sortBy === 'age' ? 'bg-brand-navy text-white border-brand-navy shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Edad {sortBy === 'age' && (sortOrder === 'asc' ? <ArrowUpAz size={12} /> : <ArrowDownAz size={12} />)}
              </button>
              <button 
                onClick={() => toggleSort('recent')} 
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${sortBy === 'recent' ? 'bg-brand-navy text-white border-brand-navy shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Recientes
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {filteredAndSortedPatients.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all relative border border-transparent ${
                  selectedPatient?.id === p.id 
                    ? 'bg-brand-secondary/[0.04] border-brand-secondary shadow-lg shadow-brand-secondary/5' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${
                   selectedPatient?.id === p.id ? 'bg-brand-secondary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {p.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-brand-navy text-sm mb-0.5 truncate">{p.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.documentId}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                   <span className="text-[10px] font-bold text-slate-400">{calculateAge(p.birthDate)} años</span>
                   <ChevronRight size={14} className={selectedPatient?.id === p.id ? 'text-brand-secondary' : 'text-slate-200'} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Clinical Detail View */}
        <div className="lg:col-span-8 h-full">
          {selectedPatient ? (
            <div className="h-full flex flex-col space-y-8 overflow-y-auto custom-scrollbar pb-20 pr-2 animate-fade-in">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-5xl font-ubuntu font-bold shadow-inner border-4 border-white">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-4xl font-ubuntu font-bold text-brand-navy">{selectedPatient.name}</h3>
                      <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-widest border border-green-200">Paciente Activo</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm font-medium">
                      <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Phone size={14} className="text-brand-secondary" /> {selectedPatient.phone}</span>
                      <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Mail size={14} className="text-brand-primary" /> {selectedPatient.email || 'No provisto'}</span>
                      <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm"><Calendar size={14} className="text-brand-accent" /> {selectedPatient.birthDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mb-2">Asistencias</p>
                    <div className="flex items-end justify-between">
                       <p className="text-3xl font-ubuntu font-bold text-brand-navy">{selectedPatient.history.length}</p>
                       <CheckCircle2 size={24} className="text-green-500 mb-1" />
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mb-2">Historial Pagos</p>
                    <div className="flex items-end justify-between">
                       <p className="text-3xl font-ubuntu font-bold text-brand-navy">$1,240</p>
                       <CreditCard size={24} className="text-brand-primary mb-1" />
                    </div>
                  </div>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 col-span-2">
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mb-2">DNI / Identificación</p>
                    <div className="flex items-end justify-between">
                       <p className="text-xl font-ubuntu font-bold text-brand-navy">{selectedPatient.documentId}</p>
                       <ShieldCheck size={24} className="text-brand-navy mb-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                  <h4 className="font-ubuntu font-bold text-2xl text-brand-navy flex items-center gap-4">
                    <History className="text-brand-secondary" size={28} /> Línea de Tiempo Clínica
                  </h4>
                  <button 
                    onClick={() => setShowNewEntryModal(true)}
                    className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-brand-navy/90 transition-all flex items-center gap-3 shadow-lg shadow-brand-navy/10"
                  >
                    <Plus size={18} /> Nueva Entrada Manual
                  </button>
                </div>

                <div className="p-10">
                  {selectedPatient.history.length > 0 ? (
                    <div className="space-y-12 relative before:absolute before:left-5 before:top-4 before:bottom-0 before:w-1 before:bg-slate-100">
                      {selectedPatient.history.map((entry) => (
                        <div key={entry.id} className="relative pl-16 group">
                          <div className="absolute left-0 top-1 w-11 h-11 rounded-2xl bg-white border-4 border-slate-50 z-10 group-hover:border-brand-secondary transition-all shadow-sm flex items-center justify-center">
                            <Activity size={20} className="text-slate-300 group-hover:text-brand-secondary" />
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-brand-secondary bg-brand-secondary/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-brand-secondary/20 shadow-sm">
                                {entry.date}
                              </span>
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Especialista ID: {entry.professionalId}</span>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] group-hover:shadow-xl transition-all border border-slate-100 space-y-6 group-hover:border-brand-secondary/20">
                              <div>
                                <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={12} /> Hallazgos y Evolución</h5>
                                <p className="text-brand-navy text-sm font-medium leading-relaxed">{entry.notes}</p>
                              </div>
                              {entry.diagnosis && (
                                <div className="pt-5 border-t border-slate-50 flex items-start gap-3">
                                   <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                                      <Stethoscope size={16} />
                                   </div>
                                   <div>
                                      <h5 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Diagnóstico Final</h5>
                                      <p className="text-brand-navy text-sm font-bold">{entry.diagnosis}</p>
                                   </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
                        <FileText size={48} />
                      </div>
                      <h3 className="text-2xl font-ubuntu font-bold text-slate-400 mb-2">Sin registros activos</h3>
                      <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">Aún no se han documentado atenciones clínicas para este paciente.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 p-20 text-center shadow-inner group">
              <div className="w-40 h-40 rounded-full bg-slate-50 flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-500">
                 <Users size={100} className="opacity-10" />
              </div>
              <h3 className="text-3xl font-ubuntu font-bold text-slate-300 mb-6 tracking-tight">Selecciona un Paciente</h3>
              <p className="max-w-md text-slate-300 font-medium text-lg leading-relaxed">Explora tu base de datos y selecciona un expediente.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO EXPEDIENTE */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
             <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center shadow-inner">
                     <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-ubuntu font-bold text-brand-navy leading-none">Nuevo Expediente</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Registro de Paciente</p>
                  </div>
                </div>
                <button onClick={() => setShowNewPatientModal(false)} className="text-slate-300 hover:text-brand-navy transition-colors"><X size={28} /></button>
             </div>
             
             <form onSubmit={handleCreatePatient} className="p-8 space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                       <input 
                         required 
                         className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-medium text-sm shadow-inner"
                         value={newPatientForm.name}
                         onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">DNI / Identificación</label>
                       <input 
                         required 
                         className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-medium text-sm shadow-inner"
                         value={newPatientForm.documentId}
                         onChange={e => setNewPatientForm({...newPatientForm, documentId: e.target.value})}
                       />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo (Opcional)</label>
                     <input 
                       type="email"
                       className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-medium text-sm shadow-inner"
                       value={newPatientForm.email}
                       onChange={e => setNewPatientForm({...newPatientForm, email: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Teléfono</label>
                       <input 
                         required 
                         className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-medium text-sm shadow-inner"
                         value={newPatientForm.phone}
                         onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha Nacimiento</label>
                       <input 
                         type="date"
                         required 
                         className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-medium text-sm shadow-inner"
                         value={newPatientForm.birthDate}
                         onChange={e => setNewPatientForm({...newPatientForm, birthDate: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 mt-4">
                   <Save size={18} /> Crear Expediente Clínico
                </button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA ENTRADA MANUAL + PLAN TRATAMIENTO */}
      {showNewEntryModal && selectedPatient && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className={`bg-white rounded-[2.5rem] w-full ${newEntryForm.isTreatmentPlan ? 'max-w-4xl' : 'max-w-lg'} overflow-hidden shadow-2xl animate-fade-in border border-slate-100 transition-all duration-500`}>
             <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-secondary/10 text-brand-secondary rounded-2xl flex items-center justify-center shadow-inner">
                     <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-ubuntu font-bold text-brand-navy leading-none">Entrada Manual Evolutiva</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Expediente de {selectedPatient.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowNewEntryModal(false)} className="text-slate-300 hover:text-brand-navy transition-colors"><X size={28} /></button>
             </div>
             
             <div className="flex flex-col md:flex-row">
                {/* Formulario de Entrada */}
                <form onSubmit={handleCreateEntry} className={`p-8 space-y-5 ${newEntryForm.isTreatmentPlan ? 'md:w-1/2 border-r border-slate-100' : 'w-full'}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Información Clínica</label>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">Plan Tratamiento</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={newEntryForm.isTreatmentPlan} 
                                    onChange={() => setNewEntryForm(p => ({...p, isTreatmentPlan: !p.isTreatmentPlan}))}
                                    className="sr-only peer" 
                                />
                                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-brand-secondary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                            </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">Fecha de la Sesión</label>
                        <input 
                          type="date"
                          required 
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner"
                          value={newEntryForm.date}
                          onChange={e => setNewEntryForm({...newEntryForm, date: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">Diagnóstico / Motivo</label>
                        <input 
                          required 
                          placeholder="Ej: Revisión Post-Op, Control Ortodoncia..."
                          className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner"
                          value={newEntryForm.diagnosis}
                          onChange={e => setNewEntryForm({...newEntryForm, diagnosis: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-1">Notas y Evolución</label>
                        <textarea 
                          required 
                          placeholder="Detalles técnicos de lo realizado hoy..."
                          className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner min-h-[140px] resize-none"
                          value={newEntryForm.notes}
                          onChange={e => setNewEntryForm({...newEntryForm, notes: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full py-5 bg-brand-secondary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all flex items-center justify-center gap-3 mt-4">
                      <CheckCircle2 size={18} /> {newEntryForm.isTreatmentPlan ? 'Confirmar y Agendar Plan' : 'Registrar en Historial'}
                    </button>
                </form>

                {/* Vista del Plan de Tratamiento */}
                {newEntryForm.isTreatmentPlan && (
                    <div className="md:w-1/2 bg-slate-50/50 p-8 flex flex-col animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-ubuntu font-bold text-brand-navy">Sesiones Proyectadas</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Bloqueo automático de agenda</p>
                            </div>
                            <button 
                                onClick={addSessionDraft}
                                className="w-10 h-10 bg-white border border-slate-200 text-brand-secondary rounded-xl flex items-center justify-center hover:shadow-md transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                            {newEntryForm.sessions.map((s, idx) => (
                                <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-5 shadow-sm group">
                                    <div className="w-10 h-10 rounded-xl bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-lg">
                                        {idx + 1}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 flex-1">
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Fecha</p>
                                            <input 
                                                type="date" 
                                                value={s.date} 
                                                onChange={e => updateSession(s.id, 'date', e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl py-1.5 px-3 text-[10px] font-bold text-brand-navy focus:ring-1 focus:ring-brand-secondary"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Hora</p>
                                            <input 
                                                type="time" 
                                                value={s.time} 
                                                onChange={e => updateSession(s.id, 'time', e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl py-1.5 px-3 text-[10px] font-bold text-brand-navy focus:ring-1 focus:ring-brand-secondary"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setNewEntryForm(prev => ({...prev, sessions: prev.sessions.filter(sess => sess.id !== s.id)}))}
                                        className="text-slate-200 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {newEntryForm.sessions.length === 0 && (
                                <div className="text-center py-10 opacity-30">
                                    <Zap size={32} className="mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Añade sesiones al plan</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 p-6 bg-brand-navy rounded-[2rem] text-white space-y-3 shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-brand-accent" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Recordatorio</span>
                            </div>
                            <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                                Al guardar, estas {newEntryForm.sessions.length} sesiones aparecerán en la agenda maestra. El sistema enviará recordatorios automáticos al paciente.
                            </p>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
