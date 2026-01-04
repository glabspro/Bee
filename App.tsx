
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Appointment, Patient, AppointmentStatus, Sede, AppNotification, ClinicalHistoryEntry } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentManager from './components/AppointmentManager';
import PatientDirectory from './components/PatientDirectory';
import PatientPortal from './components/PatientPortal';
import ScheduleManager from './components/ScheduleManager';
import ClinicalRecordForm from './components/ClinicalRecordForm';
import Login from './components/Login';
import { Bell, X, Check, Calendar, UserPlus, Clock } from 'lucide-react';
import { MOCK_PATIENTS as INITIAL_PATIENTS, INITIAL_SEDES } from './constants';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'login'
  });

  const [sedes, setSedes] = useState<Sede[]>(INITIAL_SEDES);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'a1',
      patientName: 'Lucía Méndez',
      patientPhone: '555-5678',
      serviceId: 's1',
      sedeId: 'sede1',
      professionalId: 'p1',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      status: AppointmentStatus.CONFIRMED,
      bookingCode: 'BEE-X9J'
    }
  ]);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUpcoming = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      appointments.forEach(apt => {
        if (apt.date === todayStr && apt.status === AppointmentStatus.CONFIRMED) {
          const [hours, minutes] = apt.time.split(':').map(Number);
          const aptDate = new Date();
          aptDate.setHours(hours, minutes, 0, 0);
          
          const diffInMinutes = (aptDate.getTime() - now.getTime()) / (1000 * 60);
          
          if (diffInMinutes > 0 && diffInMinutes <= 60 && !notifications.some(n => n.appointmentId === apt.id && n.type === 'UPCOMING')) {
            addNotification({
              id: 'notif-' + Math.random().toString(36).substr(2, 5),
              title: 'Cita Próxima',
              message: `El paciente ${apt.patientName} tiene cita en ${Math.round(diffInMinutes)} min.`,
              time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              type: 'UPCOMING',
              appointmentId: apt.id
            });
          }
        }
      });
    };

    const interval = setInterval(checkUpcoming, 30000);
    checkUpcoming();
    return () => clearInterval(interval);
  }, [appointments, notifications]);

  const addNotification = (notif: AppNotification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogin = () => {
    setViewState(prev => ({ ...prev, currentView: 'dashboard' }));
  };

  const handleViewChange = (view: ViewState['currentView']) => {
    setViewState(prev => ({ ...prev, currentView: view }));
  };

  const addAppointment = (newApt: Appointment, fromPortal = false) => {
    setAppointments(prev => [...prev, newApt]);
    if (fromPortal) {
      addNotification({
        id: 'notif-' + Math.random().toString(36).substr(2, 5),
        title: 'Nueva Cita Portal',
        message: `${newApt.patientName} ha agendado vía Web.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'NEW_PORTAL',
        appointmentId: newApt.id
      });
    }
  };

  const addMultipleAppointments = (newApts: Appointment[]) => {
    setAppointments(prev => [...prev, ...newApts]);
  };

  const addPatient = (p: Patient) => {
    setPatients(prev => [...prev, p]);
  };

  const addHistoryEntry = (patientId: string, entry: ClinicalHistoryEntry) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, history: [entry, ...p.history] }
        : p
    ));
  };

  const updateAppointment = (updatedApt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));
  };

  const startClinicalSession = (appointmentId: string) => {
    setAppointments(prev => prev.map(a => 
      a.id === appointmentId ? { ...a, status: AppointmentStatus.ATTENDED } : a
    ));
    setViewState(prev => ({ 
      ...prev, 
      currentView: 'clinical-record',
      activeAppointmentId: appointmentId 
    }));
  };

  if (viewState.currentView === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (viewState.currentView === 'portal') {
    return <PatientPortal 
      sedes={sedes}
      onBack={() => handleViewChange('dashboard')} 
      onAppointmentCreated={(apt) => {
        addAppointment(apt, true);
      }}
    />;
  }

  const renderContent = () => {
    switch (viewState.currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} onNavigate={handleViewChange} />;
      case 'appointments':
        return <AppointmentManager 
          appointments={appointments}
          patients={patients}
          sedes={sedes}
          onUpdateAppointment={updateAppointment}
          onAddAppointment={addAppointment}
          onStartClinicalSession={startClinicalSession} 
          onAddPatient={addPatient}
        />;
      case 'patients':
        return <PatientDirectory 
          patients={patients} 
          onAddPatient={addPatient}
          onAddHistoryEntry={addHistoryEntry}
          onScheduleSessions={addMultipleAppointments}
        />;
      case 'schedules':
        return <ScheduleManager 
          sedes={sedes} 
          onUpdateSede={(s) => setSedes(sedes.map(old => old.id === s.id ? s : old))} 
          onAddSede={(s) => setSedes([...sedes, s])} 
        />;
      case 'clinical-record':
        const currentApt = appointments.find(a => a.id === viewState.activeAppointmentId);
        return (
          <ClinicalRecordForm 
            appointment={currentApt!} 
            onClose={() => handleViewChange('appointments')}
            onSaveRecord={addHistoryEntry}
            onScheduleSessions={addMultipleAppointments}
          />
        );
      default:
        return <Dashboard appointments={appointments} onNavigate={handleViewChange} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter overflow-x-hidden">
      <Sidebar currentView={viewState.currentView} onViewChange={handleViewChange} />
      
      <div className="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/50">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">Sincronizado: Latam-Bee</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={`relative p-2.5 rounded-xl transition-all ${showNotifMenu ? 'bg-brand-lightSecondary text-brand-secondary' : 'text-slate-400 hover:text-brand-secondary hover:bg-slate-50'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-fade-in overflow-hidden z-50">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-brand-navy font-bold text-sm">Notificaciones</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Centro de Alertas</p>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-brand-secondary hover:text-brand-navy transition-colors flex items-center gap-1 uppercase tracking-widest"
                      >
                        <Check size={12} /> Marcar todo leído
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { handleViewChange('appointments'); setShowNotifMenu(false); }}
                          className={`p-6 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex gap-4 ${!n.read ? 'bg-brand-secondary/[0.02]' : ''}`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner ${
                            n.type === 'UPCOMING' ? 'bg-amber-100 text-amber-600' : 
                            n.type === 'NEW_PORTAL' ? 'bg-teal-100 text-teal-600' : 
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {n.type === 'UPCOMING' ? <Clock size={20} /> : <UserPlus size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="text-brand-navy font-bold text-xs truncate">{n.title}</h5>
                              <span className="text-[9px] text-slate-300 font-bold">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                          {!n.read && (
                            <div className="w-2 h-2 bg-brand-secondary rounded-full mt-1.5" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <Bell size={28} />
                         </div>
                         <p className="text-slate-400 text-xs font-medium">No hay avisos pendientes.</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { handleViewChange('appointments'); setShowNotifMenu(false); }}
                    className="w-full py-4 bg-white border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-brand-secondary transition-all"
                  >
                    Ver todas las citas
                  </button>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <div className="flex items-center gap-3 group cursor-pointer">
               <div className="text-right">
                  <p className="text-xs font-bold text-brand-navy">Dr. Admin Bee</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Lead</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden group-hover:border-brand-secondary transition-all">
                  <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
