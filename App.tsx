
import React, { useState, useEffect } from 'react';
import { ViewState, Appointment, Patient, AppointmentStatus, Sede, Company, User, UserRole, Professional } from './types';
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
import { supabase } from './services/supabaseClient';

// Generador de UUID robusto para entornos con y sin HTTPS
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para entornos no seguros (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ currentView: 'login' });
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('');
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const { data: cos } = await supabase.from('companies').select('*');
        if (cos) {
          setCompanies(cos.map(c => ({
            ...c,
            portalHero: c.portal_hero,
            primaryColor: c.primary_color
          })));
        }
        
        const { data: usrs } = await supabase.from('users').select('*');
        if (usrs) {
          setUsers(usrs.map(u => ({
            ...u,
            companyId: u.company_id,
            sedeIds: u.sede_ids
          })));
        }
      } catch (e) {
        console.error("Fetch Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  useEffect(() => {
    if (!currentCompanyId) return;

    const fetchBusinessData = async () => {
      try {
        const { data: sd } = await supabase.from('sedes').select('*').eq('company_id', currentCompanyId);
        setSedes(sd ? sd.map(s => ({ ...s, companyId: s.company_id })) : []);

        const { data: pts } = await supabase.from('patients').select('*').eq('company_id', currentCompanyId);
        setPatients(pts ? pts.map(p => ({ ...p, companyId: p.company_id, documentId: p.document_id, birthDate: p.birth_date })) : []);

        const { data: apts } = await supabase.from('appointments').select('*').eq('company_id', currentCompanyId);
        setAppointments(apts ? apts.map(a => ({ 
          ...a, 
          companyId: a.company_id, 
          patientName: a.patient_name, 
          patientPhone: a.patient_phone, 
          patientDni: a.patient_dni, 
          patientId: a.patient_id, 
          serviceId: a.service_id, 
          sedeId: a.sede_id, 
          professionalId: a.professional_id, 
          bookingCode: a.booking_code 
        })) : []);

        const { data: profs } = await supabase.from('professionals').select('*').eq('company_id', currentCompanyId);
        setProfessionals(profs ? profs.map(p => ({ ...p, companyId: p.company_id, sedeIds: p.sede_ids, userId: p.user_id })) : []);
      } catch (err) {
        console.error("Error fetching business data:", err);
      }
    };

    fetchBusinessData();
  }, [currentCompanyId]);

  const handleAddCompany = async (company: Company) => {
    const payload = { id: company.id, name: company.name, logo: company.logo, portal_hero: company.portalHero, primary_color: company.primaryColor, active: company.active };
    const { data } = await supabase.from('companies').insert([payload]).select();
    if (data) setCompanies(prev => [...prev, { ...data[0], portalHero: data[0].portal_hero, primaryColor: data[0].primary_color }]);
  };

  const handleUpdateCompany = async (company: Company) => {
    const payload = { name: company.name, logo: company.logo, portal_hero: company.portalHero, primary_color: company.primaryColor, active: company.active };
    await supabase.from('companies').update(payload).eq('id', company.id);
    setCompanies(prev => prev.map(c => c.id === company.id ? company : c));
  };

  const handleAddUser = async (user: User) => {
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.companyId, sede_ids: user.sedeIds, avatar: user.avatar };
    const { data } = await supabase.from('users').insert([payload]).select();
    if (data) setUsers(prev => [...prev, { ...data[0], companyId: data[0].company_id, sedeIds: data[0].sede_ids }]);
  };

  const handleAddProfessional = async (prof: Professional) => {
    const payload = { 
      id: prof.id, 
      name: prof.name, 
      specialty: prof.specialty, 
      avatar: prof.avatar, 
      sede_ids: prof.sedeIds, 
      user_id: prof.userId, 
      company_id: currentCompanyId 
    };
    const { data } = await supabase.from('professionals').insert([payload]).select();
    if (data) setProfessionals(prev => [...prev, { ...data[0], companyId: data[0].company_id, sedeIds: data[0].sede_ids, userId: data[0].user_id }]);
  };

  const handleAddSede = async (sede: Sede) => {
    if (!currentCompanyId) {
      alert("⚠️ Error: No hay una clínica activa en la sesión. Por favor re-inicia sesión.");
      return null;
    }
    
    try {
      // Generamos el ID usando el nuevo generador robusto
      const newId = generateUUID();
      
      const payload = { 
        id: newId,
        name: sede.name,
        address: sede.address,
        phone: sede.phone || '',
        whatsapp: sede.whatsapp || '',
        availability: sede.availability || {},
        company_id: currentCompanyId 
      };

      const { data, error } = await supabase.from('sedes').insert([payload]).select();
      
      if (error) {
        const supabaseError = error.message || "Error desconocido en Supabase";
        const supabaseDetail = error.details ? ` Detalles: ${error.details}` : "";
        console.error("Supabase Error Response:", error);
        alert(`❌ Error de Base de Datos: ${supabaseError}${supabaseDetail}`);
        return null;
      }
      
      if (data && data[0]) {
        const createdSede = { ...data[0], companyId: data[0].company_id };
        setSedes(prev => [...prev, createdSede]);
        return createdSede;
      }
      return null;
    } catch (err: any) {
      const catchMsg = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error("Exception in handleAddSede:", err);
      alert(`🚨 Error Fatal: ${catchMsg}`);
      return null;
    }
  };

  const handleUpdateSede = async (sede: Sede) => {
    try {
      const payload = { 
        name: sede.name,
        address: sede.address,
        phone: sede.phone,
        whatsapp: sede.whatsapp,
        availability: sede.availability,
        company_id: currentCompanyId 
      };
      const { error } = await supabase.from('sedes').update(payload).eq('id', sede.id);
      if (error) throw error;
      setSedes(prev => prev.map(s => s.id === sede.id ? sede : s));
    } catch (err) {
      console.error("Supabase error updating sede:", err);
      alert("Error al sincronizar los cambios de la sede.");
      throw err;
    }
  };

  const handleAddPatient = async (patient: Patient) => {
    const payload = { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone, document_id: patient.documentId, birth_date: patient.birthDate, history: patient.history, company_id: currentCompanyId };
    const { data } = await supabase.from('patients').insert([payload]).select();
    if (data) setPatients(prev => [...prev, { ...data[0], companyId: data[0].company_id, documentId: data[0].document_id, birthDate: data[0].birth_date }]);
  };

  const handleAddAppointment = async (apt: Appointment) => {
    const payload = { id: apt.id, patient_name: apt.patientName, patient_phone: apt.patientPhone, patient_dni: apt.patientDni, patient_id: apt.patientId, service_id: apt.serviceId, sede_id: apt.sedeId, professional_id: apt.professionalId, date: apt.date, time: apt.time, status: apt.status, notes: apt.notes, booking_code: apt.bookingCode, company_id: currentCompanyId };
    await supabase.from('appointments').insert([payload]);
    setAppointments(prev => [...prev, apt]);
  };

  const handleUpdateAppointment = async (apt: Appointment) => {
    const payload = { patient_name: apt.patientName, status: apt.status, notes: apt.notes };
    await supabase.from('appointments').update(payload).eq('id', apt.id);
    setAppointments(prev => prev.map(a => a.id === apt.id ? apt : a));
  };

  const handleLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (!user) {
      const fallbackCompanyId = companies.length > 0 ? companies[0].id : 'bee-main';
      setCurrentCompanyId(fallbackCompanyId);
      setCurrentUser({
        id: 'u-admin',
        name: role === UserRole.SUPER_ADMIN ? 'Super Bee' : 'Admin Bee',
        email: 'admin@bee.com',
        role: role,
        companyId: fallbackCompanyId,
        avatar: 'https://i.pravatar.cc/150?u=admin'
      });
    } else {
      setCurrentUser(user);
      const targetId = user.companyId || (companies.length > 0 ? companies[0].id : '');
      setCurrentCompanyId(targetId);
    }
    setViewState({ currentView: role === UserRole.SUPER_ADMIN ? 'saas-admin' : 'dashboard' });
  };

  const handleViewChange = (view: ViewState['currentView']) => {
    setViewState(prev => ({ ...prev, currentView: view }));
  };

  const renderContent = () => {
    if (isLoading) return <div className="h-screen flex flex-col items-center justify-center font-bold text-brand-navy gap-4">
      <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      Sincronizando Ecosistema Bee...
    </div>;

    switch (viewState.currentView) {
      case 'dashboard': return <Dashboard appointments={appointments} onNavigate={handleViewChange} />;
      case 'appointments': return <AppointmentManager appointments={appointments} patients={patients} sedes={sedes} onUpdateAppointment={handleUpdateAppointment} onAddAppointment={handleAddAppointment} onStartClinicalSession={(id) => setViewState({ ...viewState, currentView: 'clinical-record', activeAppointmentId: id })} onAddPatient={handleAddPatient} />;
      case 'patients': return <PatientDirectory patients={patients} onAddPatient={handleAddPatient} onAddHistoryEntry={(pid, e) => {
          const p = patients.find(it => it.id === pid);
          if(p) {
            const updated = {...p, history: [e, ...p.history]};
            supabase.from('patients').update({ history: updated.history }).eq('id', pid).then(() => setPatients(patients.map(it => it.id === pid ? updated : it)));
          }
      }} onScheduleSessions={(apts) => apts.forEach(handleAddAppointment)} sedes={sedes} professionals={professionals} />;
      case 'staff-management': return <StaffManagement professionals={professionals} users={users} sedes={sedes} onAddProfessional={handleAddProfessional} onAddUser={handleAddUser} />;
      case 'schedules': return <ScheduleManager sedes={sedes} onUpdateSede={handleUpdateSede} onAddSede={handleAddSede} />;
      case 'saas-admin': return <SaasAdmin companies={companies} users={users} sedes={sedes} onAddCompany={handleAddCompany} onAddUser={handleAddUser} onSelectCompany={(id) => { setCurrentCompanyId(id); setViewState({ currentView: 'dashboard' }); }} userRole={currentUser?.role} currentCompanyId={currentCompanyId} onUpdateCompany={handleUpdateCompany} />;
      case 'clinical-record':
        const currentApt = appointments.find(a => a.id === viewState.activeAppointmentId);
        return <ClinicalRecordForm appointment={currentApt!} onClose={() => handleViewChange('appointments')} onSaveRecord={(pid, e) => {
            const p = patients.find(it => it.id === pid);
            if(p) {
              const updated = {...p, history: [e, ...p.history]};
              supabase.from('patients').update({ history: updated.history }).eq('id', pid).then(() => setPatients(patients.map(it => it.id === pid ? updated : it)));
            }
        }} onScheduleSessions={(apts) => apts.forEach(handleAddAppointment)} />;
      default: return <Dashboard appointments={appointments} onNavigate={handleViewChange} />;
    }
  };

  if (viewState.currentView === 'login') return <Login onLogin={handleLogin} />;
  
  if (viewState.currentView === 'portal') {
    const comp = companies.find(c => c.id === currentCompanyId) || companies[0];
    if (!comp) return <div>Cargando Portal...</div>;
    return <PatientPortal company={comp} sedes={sedes} onBack={() => handleViewChange('dashboard')} onAppointmentCreated={handleAddAppointment} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter overflow-x-hidden">
      <Sidebar currentView={viewState.currentView} onViewChange={handleViewChange} userRole={currentUser?.role} />
      <div className="flex-1 ml-64 min-h-screen flex flex-col transition-all duration-300">
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">{companies.find(c => c.id === currentCompanyId)?.name || 'Ecosistema Global'}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-brand-navy">{currentUser?.name || 'Cargando...'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{currentUser?.role || 'User'}</p>
             </div>
             <img src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id || 'default'}`} className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md object-cover" />
          </div>
        </header>
        <main className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full flex-1">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
