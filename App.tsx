
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Appointment, Patient, AppointmentStatus, Sede, AppNotification, ClinicalHistoryEntry, Company, User, UserRole, Professional } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentManager from './components/AppointmentManager';
import PatientDirectory from './components/PatientDirectory';
import PatientPortal from './components/PatientPortal';
import ScheduleManager from './components/ScheduleManager';
import ClinicalRecordForm from './components/ClinicalRecordForm';
import SaasAdmin from './components/SaasAdmin';
import StaffManagement from './components/StaffManagement';
import Login from './components/Login';
import { Bell, X, Check, Calendar, UserPlus, Clock } from 'lucide-react';
import { MOCK_PATIENTS as INITIAL_PATIENTS, INITIAL_SEDES, MOCK_PROFESSIONALS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    currentView: 'login'
  });

  const [companies, setCompanies] = useState<Company[]>([
    {
        id: 'bee-main',
        name: 'Bee Medical Center',
        logo: 'https://images.unsplash.com/photo-1631217816660-ad4830193ca5?auto=format&fit=crop&q=80&w=200',
        portalHero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053',
        primaryColor: '#714B67',
        active: true
    },
    {
      id: 'dent-pro',
      name: 'Dental Pro Network',
      logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=200',
      portalHero: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2053',
      primaryColor: '#017E84',
      active: true
    }
  ]);

  const [currentCompanyId, setCurrentCompanyId] = useState('bee-main');
  const [sedes, setSedes] = useState<Sede[]>(INITIAL_SEDES.map(s => ({...s, companyId: 'bee-main'})));
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
      bookingCode: 'BEE-X9J',
      companyId: 'bee-main'
    }
  ]);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS.map(p => ({...p, companyId: 'bee-main'})));
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS.map(p => ({...p, companyId: 'bee-main', userId: 'u-1'})));
  const [users, setUsers] = useState<User[]>([
    { id: 'u-0', name: 'SaaS Super Admin', email: 'global@bee.com', role: UserRole.SUPER_ADMIN, companyId: 'bee-global' },
    { id: 'u-1', name: 'Dr. Admin Principal', email: 'admin@bee.com', role: UserRole.ADMIN, companyId: 'bee-main' } 
  ]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addNotification = (notif: AppNotification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role) || users[1];
    setCurrentUser(user);
    // Si es super admin, lo enviamos a la vista de SaaS Admin por defecto
    const targetView = role === UserRole.SUPER_ADMIN ? 'saas-admin' : 'dashboard';
    setViewState(prev => ({ ...prev, currentView: targetView }));
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
        appointmentId: newApt.id,
        companyId: newApt.companyId
      });
    }
  };

  const addHistoryEntry = (patientId: string, entry: ClinicalHistoryEntry) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, history: [entry, ...p.history] } : p
    ));
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => {
        const exists = prev.find(c => c.id === updatedCompany.id);
        if (exists) {
            return prev.map(c => c.id === updatedCompany.id ? updatedCompany : c);
        }
        return [...prev, updatedCompany];
    });
  };

  const renderContent = () => {
    const contextApts = appointments.filter(a => a.companyId === currentCompanyId);
    const contextPatients = patients.filter(p => p.companyId === currentCompanyId);
    const contextSedes = sedes.filter(s => s.companyId === currentCompanyId);
    const contextProfs = professionals.filter(p => p.companyId === currentCompanyId);

    switch (viewState.currentView) {
      case 'dashboard':
        return <Dashboard appointments={contextApts} onNavigate={handleViewChange} />;
      case 'appointments':
        return <AppointmentManager 
          appointments={contextApts}
          patients={contextPatients}
          sedes={contextSedes}
          onUpdateAppointment={(a) => setAppointments(appointments.map(old => old.id === a.id ? a : old))}
          onAddAppointment={addAppointment}
          onStartClinicalSession={(id) => {
            setAppointments(appointments.map(a => a.id === id ? {...a, status: AppointmentStatus.ATTENDED} : a));
            setViewState(prev => ({ ...prev, currentView: 'clinical-record', activeAppointmentId: id }));
          }}
          onAddPatient={(p) => setPatients([...patients, {...p, companyId: currentCompanyId}])}
        />;
      case 'patients':
        return <PatientDirectory 
          patients={contextPatients} 
          onAddPatient={(p) => setPatients([...patients, {...p, companyId: currentCompanyId}])}
          onAddHistoryEntry={addHistoryEntry}
          onScheduleSessions={(apts) => setAppointments([...appointments, ...apts])}
          sedes={contextSedes}
          professionals={contextProfs}
        />;
      case 'staff-management':
        return <StaffManagement 
          professionals={contextProfs}
          users={users.filter(u => u.companyId === currentCompanyId)}
          sedes={contextSedes}
          onAddProfessional={(p) => setProfessionals([...professionals, {...p, companyId: currentCompanyId}])}
          onAddUser={(u) => setUsers([...users, {...u, companyId: currentCompanyId}])}
        />;
      case 'saas-admin':
        return <SaasAdmin 
            companies={companies} 
            onAddCompany={handleUpdateCompany}
            onSelectCompany={(id) => { setCurrentCompanyId(id); setViewState(prev => ({...prev, currentView: 'dashboard'})); }}
            userRole={currentUser?.role}
            currentCompanyId={currentCompanyId}
        />;
      case 'schedules':
        return <ScheduleManager 
          sedes={contextSedes} 
          onUpdateSede={(s) => setSedes(sedes.map(old => old.id === s.id ? s : old))} 
          onAddSede={(s) => setSedes([...sedes, {...s, companyId: currentCompanyId}])} 
        />;
      case 'clinical-record':
        const currentApt = appointments.find(a => a.id === viewState.activeAppointmentId);
        return (
          <ClinicalRecordForm 
            appointment={currentApt!} 
            onClose={() => handleViewChange('appointments')}
            onSaveRecord={addHistoryEntry}
            onScheduleSessions={(apts) => setAppointments([...appointments, ...apts])}
          />
        );
      default:
        return <Dashboard appointments={contextApts} onNavigate={handleViewChange} />;
    }
  };

  if (viewState.currentView === 'login') return <Login onLogin={handleLogin} />;
  
  if (viewState.currentView === 'portal') {
    return <PatientPortal 
      company={currentCompany}
      sedes={sedes.filter(s => s.companyId === currentCompanyId)}
      onBack={() => handleViewChange('dashboard')} 
      onAppointmentCreated={(apt) => addAppointment({...apt, companyId: currentCompanyId}, true)}
    />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter overflow-x-hidden">
      <Sidebar 
        currentView={viewState.currentView} 
        onViewChange={handleViewChange} 
        userRole={currentUser?.role} 
      />
      
      <div className="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">{currentCompany.name}</span>
            </div>
            {currentUser?.role === UserRole.SUPER_ADMIN && (
              <div className="bg-brand-navy text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-lg">
                Modo SaaS Admin
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifMenu(!showNotifMenu)} className="relative p-2.5 rounded-xl text-slate-400 hover:text-brand-secondary hover:bg-slate-50 transition-all">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce">{notifications.filter(n => !n.read).length}</span>}
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleViewChange('dashboard')}>
               <div className="text-right">
                  <p className="text-xs font-bold text-brand-navy">{currentUser?.name || 'Admin'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.role}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden group-hover:border-brand-secondary transition-all">
                  <img src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`} alt="Avatar" className="w-full h-full object-cover" />
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
