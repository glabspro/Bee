
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Stethoscope, 
  Calendar as CalendarIcon,
  CheckCircle,
  UserPlus,
  Edit,
  X,
  AlertCircle,
  Search,
  User,
  IdCard,
  Cake,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Clock,
  MapPin,
  FileText,
  Mail
} from 'lucide-react';
import { Appointment, AppointmentStatus, Patient, Sede } from '../types';
import { MOCK_SERVICES, STATUS_COLORS } from '../constants';

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  sedes: Sede[];
  onUpdateAppointment: (apt: Appointment) => void;
  onAddAppointment: (apt: Appointment) => void;
  onStartClinicalSession: (appointmentId: string) => void;
  onAddPatient: (patient: Patient) => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ 
  appointments, 
  patients,
  sedes,
  onUpdateAppointment, 
  onAddAppointment, 
  onStartClinicalSession,
  onAddPatient 
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'TODOS'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Appointment | null>(null);
  const [showCreatePatientModal, setShowCreatePatientModal] = useState<Appointment | null>(null);
  const [newPatientData, setNewPatientData] = useState({ dni: '', birthDate: '', email: '' });

  const [formData, setFormData] = useState({
    patientName: '',
    patientDni: '',
    patientEmail: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    sedeId: sedes[0]?.id || '',
    notes: ''
  });

  // --- Lógica de Calendario ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const { firstDay, days } = getDaysInMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= days) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    }
    return null;
  });

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesStatus = statusFilter === 'TODOS' || apt.status === statusFilter;
      const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            apt.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const handleDayClick = (date: string) => {
    setFormData(prev => ({ 
      ...prev, 
      date,
      patientName: '',
      patientDni: '',
      patientEmail: '',
      notes: ''
    }));
    setShowAddModal(true);
  };

  const handleUpdateStatus = (apt: Appointment, status: AppointmentStatus) => {
    onUpdateAppointment({ ...apt, status });
    setShowEditModal(null);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreatePatientModal) return;

    const newPatient: Patient = {
      id: 'pat-' + Math.random().toString(36).substr(2, 9),
      name: showCreatePatientModal.patientName,
      phone: showCreatePatientModal.patientPhone,
      email: newPatientData.email || undefined,
      documentId: newPatientData.dni,
      birthDate: newPatientData.birthDate,
      history: []
    };

    onAddPatient(newPatient);
    onUpdateAppointment({ ...showCreatePatientModal, patientId: newPatient.id });
    setShowCreatePatientModal(null);
    setNewPatientData({ dni: '', birthDate: '', email: '' });
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: 'apt-' + Math.random().toString(36).substr(2, 9),
      patientName: formData.patientName,
      patientPhone: '', 
      patientDni: formData.patientDni,
      patientEmail: formData.patientEmail || undefined,
      serviceId: MOCK_SERVICES[0].id, 
      sedeId: formData.sedeId,
      professionalId: 'p1', 
      date: formData.date,
      time: formData.time,
      status: AppointmentStatus.CONFIRMED,
      notes: formData.notes,
      bookingCode: 'BEE-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    };
    onAddAppointment(newApt);
    setShowAddModal(false);
  };

  const renderCalendarView = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden clinical-shadow animate-fade-in">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-6">
          <div>
             <h3 className="text-2xl font-ubuntu font-bold text-brand-navy capitalize leading-none">{monthName}</h3>
             <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1.5">Agenda Interactiva</p>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-white text-slate-400 hover:text-brand-secondary transition-all rounded-lg"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-[9px] font-bold text-brand-navy hover:text-brand-secondary transition-all uppercase tracking-widest">Hoy</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-white text-slate-400 hover:text-brand-secondary transition-all rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-brand-secondary text-white rounded-xl flex items-center justify-center hover:bg-brand-secondary/90 transition-all shadow-md shadow-brand-secondary/10">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="py-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-32 border-b border-r border-slate-50 bg-slate-50/[0.1]" />;
          
          const dateStr = date.toISOString().split('T')[0];
          const dayAppointments = appointments.filter(a => a.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div 
              key={dateStr} 
              className={`h-32 border-b border-r border-slate-100 p-2.5 transition-all group relative overflow-hidden ${
                isToday ? 'bg-brand-secondary/[0.02]' : 'hover:bg-slate-50/20'
              }`}
            >
              <div 
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={() => handleDayClick(dateStr)}
              />

              <div className="relative z-10 flex justify-between items-start mb-2 pointer-events-none">
                <span className={`text-xs font-ubuntu font-bold w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                  isToday 
                  ? 'bg-brand-secondary text-white shadow-lg' 
                  : 'text-slate-400 group-hover:text-brand-navy'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              
              <div className="relative z-10 space-y-1 overflow-y-auto max-h-[60px] custom-scrollbar pr-0.5">
                {dayAppointments.map(apt => (
                  <button 
                    key={apt.id} 
                    onClick={(e) => { e.stopPropagation(); setShowEditModal(apt); }}
                    className={`w-full px-2 py-1.5 rounded-lg text-[8px] font-bold truncate text-left transition-all hover:scale-[1.02] border shadow-sm ${STATUS_COLORS[apt.status]}`}
                  >
                    {apt.time} {apt.patientName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((apt) => {
          const sede = sedes.find(s => s.id === apt.sedeId);
          const isPending = apt.status === AppointmentStatus.PENDING;

          return (
            <div 
              key={apt.id} 
              className={`bg-white rounded-[1.5rem] border p-6 transition-all group relative clinical-shadow ${
                isPending ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100 hover:border-brand-secondary'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ${
                    isPending ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {apt.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-lg leading-tight truncate max-w-[140px]">
                      {apt.patientName}
                    </h4>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                       {apt.bookingCode}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-bold border tracking-widest ${STATUS_COLORS[apt.status]}`}>
                  {apt.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-[10px]">
                <div className="flex items-center justify-between">
                   <span className="text-slate-400 font-bold uppercase tracking-widest">Horario</span>
                   <span className="text-brand-navy font-bold">{apt.date} • {apt.time}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-slate-400 font-bold uppercase tracking-widest">Sede</span>
                   <span className="text-brand-secondary font-bold uppercase">{sede?.name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isPending ? (
                  <button 
                    onClick={() => handleUpdateStatus(apt, AppointmentStatus.CONFIRMED)}
                    className="w-full py-3 bg-brand-secondary text-white rounded-xl font-bold text-xs hover:shadow-lg transition-all"
                  >
                    Confirmar Cita
                  </button>
                ) : (
                  <button 
                    onClick={() => onStartClinicalSession(apt.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      apt.status === AppointmentStatus.ATTENDED 
                      ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-lg'
                    }`}
                  >
                    <Stethoscope size={16} /> {apt.status === AppointmentStatus.ATTENDED ? 'Atendiendo' : 'Atender'}
                  </button>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowEditModal(apt)}
                    className="flex-1 py-3 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold text-[10px] hover:bg-slate-50 transition-all"
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
          <p className="text-slate-400 text-sm font-medium">No se encontraron turnos activos.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Agenda Maestra</h2>
          <p className="text-slate-400 font-medium mt-2 text-sm">Panel operativo de agendamiento clínico.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
             <button onClick={() => setViewMode('calendar')} className={`px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-brand-navy'}`}>
                <CalendarIcon size={14} /> Calendario
             </button>
             <button onClick={() => setViewMode('list')} className={`px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold transition-all ${viewMode === 'list' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-brand-navy'}`}>
                <LayoutGrid size={14} /> Lista
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['TODOS', ...Object.values(AppointmentStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${
                statusFilter === status 
                  ? 'bg-brand-secondary text-white border-brand-secondary shadow-lg' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-brand-secondary hover:text-brand-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs w-full md:w-56 focus:ring-1 focus:ring-brand-secondary outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="min-h-[500px]">
        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      </div>

      {/* QUICK ADD MODAL - MEJORADO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-lightSecondary text-brand-secondary rounded-xl flex items-center justify-center shadow-inner">
                   <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-ubuntu font-bold text-brand-navy leading-none">Agendar Cita</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Registro Directo</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-brand-navy transition-colors p-2"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveAppointment} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
               <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <User size={12} className="text-brand-secondary" /> Nombre del Paciente
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: Carlos Rodríguez" 
                      required 
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm outline-none shadow-inner"
                      value={formData.patientName}
                      onChange={e => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <IdCard size={12} className="text-brand-primary" /> DNI / Identificación
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: 12345678-K" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs font-bold outline-none shadow-inner"
                        value={formData.patientDni}
                        onChange={e => setFormData({...formData, patientDni: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 text-slate-300">
                         <Mail size={12} /> Email (Opcional)
                      </label>
                      <input 
                        type="email" 
                        placeholder="ejemplo@correo.com" 
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs font-medium outline-none shadow-inner"
                        value={formData.patientEmail}
                        onChange={e => setFormData({...formData, patientEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <CalendarIcon size={12} className="text-brand-primary" /> Fecha
                      </label>
                      <input 
                        type="date" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs font-bold outline-none shadow-inner"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Clock size={12} className="text-brand-accent" /> Hora
                      </label>
                      <input 
                        type="time" 
                        required 
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs font-bold outline-none shadow-inner"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <MapPin size={12} className="text-brand-secondary" /> Centro de Atención
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs font-bold outline-none shadow-inner appearance-none"
                      value={formData.sedeId}
                      onChange={e => setFormData({...formData, sedeId: e.target.value})}
                    >
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <FileText size={12} className="text-brand-primary" /> Nota / Observación
                    </label>
                    <textarea 
                      placeholder="Detalles adicionales o motivo de consulta..." 
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-xs outline-none shadow-inner min-h-[80px] resize-none"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
               </div>
               
               <button type="submit" className="w-full py-5 bg-brand-secondary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <CheckCircle size={18} /> Confirmar Agendamiento
               </button>
            </form>
          </div>
        </div>
      )}

      {showCreatePatientModal && (
        <div className="fixed inset-0 z-[70] bg-brand-navy/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-ubuntu font-bold text-brand-navy">Nueva Ficha</h3>
              <button onClick={() => setShowCreatePatientModal(null)} className="text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreatePatient} className="space-y-4">
               <input 
                  type="text" 
                  placeholder="DNI / ID"
                  required 
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-bold text-sm shadow-inner"
                  value={newPatientData.dni}
                  onChange={e => setNewPatientData({...newPatientData, dni: e.target.value})}
               />
               <input 
                  type="email" 
                  placeholder="Email (Opcional)"
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-inner"
                  value={newPatientData.email}
                  onChange={e => setNewPatientData({...newPatientData, email: e.target.value})}
               />
               <input 
                  type="date" 
                  required 
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary text-xs font-bold shadow-inner"
                  value={newPatientData.birthDate}
                  onChange={e => setNewPatientData({...newPatientData, birthDate: e.target.value})}
               />
               <button type="submit" className="w-full py-4 bg-brand-navy text-white rounded-xl font-bold text-sm">Crear Expediente</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in space-y-6 border border-slate-100">
             <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-2xl text-slate-300 shadow-inner">
                    {showEditModal.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-ubuntu font-bold text-brand-navy leading-tight">{showEditModal.patientName}</h3>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={12} className="text-brand-secondary" /> {showEditModal.time}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(null)} className="text-slate-300 hover:text-slate-500 p-2"><X size={28} /></button>
             </div>

             {showEditModal.notes && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                   <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <FileText size={10} /> Nota de agendamiento
                   </p>
                   <p className="text-[11px] text-amber-800 font-medium italic">{showEditModal.notes}</p>
                </div>
             )}
             
             <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleUpdateStatus(showEditModal, AppointmentStatus.CONFIRMED)} className="w-full py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold border border-blue-100 text-[11px] flex items-center justify-center gap-3 hover:bg-blue-100 transition-all">
                  <CheckCircle size={18} /> Confirmar Turno
                </button>
                <button onClick={() => handleUpdateStatus(showEditModal, AppointmentStatus.CANCELLED)} className="w-full py-4 bg-red-50 text-red-700 rounded-2xl font-bold border border-red-100 text-[11px] flex items-center justify-center gap-3 hover:bg-red-100 transition-all">
                  <X size={18} /> Anular Cita
                </button>
             </div>
             
             <button onClick={() => { onStartClinicalSession(showEditModal.id); setShowEditModal(null); }} className="w-full py-5 bg-brand-navy text-white rounded-2xl font-bold text-sm mt-4 flex items-center justify-center gap-3 hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20">
                <Stethoscope size={22} /> Iniciar Atención Clínica
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
