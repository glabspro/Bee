
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
import { supabase } from './services/supabaseClient';

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
    }
  ]);

  const [currentCompanyId, setCurrentCompanyId] = useState('bee-main');
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS.map(p => ({...p, companyId: 'bee-main'})));
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS.map(p => ({...p, companyId: 'bee-main', userId: 'u-1'})));
  const [users, setUsers] = useState<User[]>([
    { id: 'u-0', name: 'SaaS Super Admin', email: 'global@bee.com', role: UserRole.SUPER_ADMIN, companyId: 'bee-global' },
    { id: 'u-1', name: 'Dr. Admin Principal', email: 'admin@bee.com', role: UserRole.ADMIN, companyId: 'bee-main' } 
  ]);

  // --- CARGA DE DATOS DESDE SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sedesData, error: sedesError } = await supabase
          .from('sedes')
          .select('*');
        
        if (sedesError) throw sedesError;

        if (sedesData && sedesData.length > 0) {
          const mappedSedes: Sede[] = sedesData.map(s => ({
             id: s.id,
             companyId: s.company_id,
             name: s.name,
             address: s.address,
             phone: s.phone,
             whatsapp: s.whatsapp,
             availability: s.availability
          }));
          setSedes(mappedSedes);
        } else {
          setSedes(INITIAL_SEDES.map(s => ({...s, companyId: 'bee-main'})));
        }
      } catch (error) {
        console.warn("Supabase no disponible o tablas no creadas. Cargando datos locales de respaldo.");
        setSedes(INITIAL_SEDES.map(s => ({...s, companyId: 'bee-main'})));
      }
    };

    fetchData();
  }, []);

  const handleUpdateSede = async (sede: Sede) => {
    setSedes(prev => prev.map(s => s.id === sede.id ? sede : s));
    try {
      await supabase
        .from('sedes')
        .update({
          name: sede.name,
          address: sede.address,
          phone: sede.phone,
          whatsapp: sede.whatsapp,
          availability: sede.availability
        })
        .eq('id', sede.id);
    } catch (e) {
      console.error("Error al sincronizar con Supabase:", e);
    }
  };

  const handleAddSede = async (sede: Sede) => {
    try {
      const { data, error } = await supabase
        .from('sedes')
        .insert([{
          company_id: currentCompanyId,
          name: sede.name,
          address: sede.address,
          phone: sede.phone,
          whatsapp: sede.whatsapp,
          availability: sede.availability
        }])
        .select();

      if (data) {
        const newSede: Sede = {
          id: data[0].id,
          companyId: data[0].company_id,
          name: data[0].name,
          address: data[0].address,
          phone: data[0].phone,
          whatsapp: data[0].whatsapp,
          availability: data[0].availability
        };
        setSedes(prev => [...prev, newSede]);
      }
    } catch (error) {
      console.error("Error al crear sede en Supabase, usando ID local temporal.");
      const tempSede = { ...sede, id: 'temp-' + Date.now() };
      setSedes(prev => [...prev, tempSede]);
    }
  };

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role) || users[1];
    setCurrentUser(user);
    const targetView = role === UserRole.SUPER_ADMIN ? 'saas-admin' : 'dashboard';
    setViewState(prev => ({ ...prev, currentView: targetView }));
  };

  const handleViewChange = (view: ViewState['currentView']) => {
    setViewState(prev => ({ ...prev, currentView: view }));
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
          onAddAppointment={(a) => setAppointments([...appointments, a])}
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
          onAddHistoryEntry={(pid, e) => setPatients(patients.map(p => p.id === pid ? {...p, history: [e, ...p.history]} : p))}
          onScheduleSessions={(apts) => setAppointments([...appointments, ...apts])}
          sedes={contextSedes}
          professionals={contextProfs}
        />;
      case 'schedules':
        return <ScheduleManager 
          sedes={contextSedes} 
          onUpdateSede={handleUpdateSede} 
          onAddSede={handleAddSede} 
        />;
      case 'saas-admin':
        return <SaasAdmin 
            companies={companies} 
            onAddCompany={(c) => setCompanies([...companies, c])}
            onSelectCompany={(id) => { setCurrentCompanyId(id); setViewState(prev => ({...prev, currentView: 'dashboard'})); }}
            userRole={currentUser?.role}
            currentCompanyId={currentCompanyId}
        />;
      case 'clinical-record':
        const currentApt = appointments.find(a => a.id === viewState.activeAppointmentId);
        return (
          <ClinicalRecordForm 
            appointment={currentApt!} 
            onClose={() => handleViewChange('appointments')}
            onSaveRecord={(pid, e) => setPatients(patients.map(p => p.id === pid ? {...p, history: [e, ...p.history]} : p))}
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
      company={companies.find(c => c.id === currentCompanyId) || companies[0]}
      sedes={sedes.filter(s => s.companyId === currentCompanyId)}
      onBack={() => handleViewChange('dashboard')} 
      onAppointmentCreated={(apt) => setAppointments([...appointments, {...apt, companyId: currentCompanyId}])}
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
               <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">{companies.find(c => c.id === currentCompanyId)?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-brand-navy">{currentUser?.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{currentUser?.role}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden">
                <img src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`} alt="Avatar" className="w-full h-full object-cover" />
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
