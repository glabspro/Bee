
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Appointment, Patient, Sede, User, UserRole, Professional, Company, ClinicalHistoryEntry } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentManager from './components/AppointmentManager';
import PatientDirectory from './components/PatientDirectory';
import PatientPortal from './components/PatientPortal';
import ScheduleManager from './components/ScheduleManager';
import ClinicalRecordForm from './components/ClinicalRecordForm';
import StaffManagement from './components/StaffManagement';
import SaasAdmin from './components/SaasAdmin';
import Login from './components/Login';
import { supabase } from './services/supabaseClient';

const CLINIC_ID = "feet-care-main";

const INITIAL_CLINIC_CONFIG: Company = {
  id: CLINIC_ID,
  name: "Feet Care",
  primaryColor: "#00BFA5",
  logo: "https://i.ibb.co/L6VvS9Z/bee-logo.png",
  portalHero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"
};

const generateUUID = () => crypto.randomUUID();

const formatSupabaseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err === 'string') return err;
  const message = err.message || err.error_description || err.error || "";
  const details = err.details || "";
  let fullMessage = message;
  if (details && details !== message) fullMessage += `\nDetalles: ${details}`;
  return fullMessage || JSON.stringify(err);
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ currentView: 'login' });
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clinicConfig, setClinicConfig] = useState<Company>(INITIAL_CLINIC_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // --- FILTRADO DE DATOS POR PRIVILEGIOS Y SEDE ---
  const filteredSedes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return sedes;
    return sedes.filter(s => currentUser.sedeIds?.includes(s.id));
  }, [sedes, currentUser]);

  const filteredAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return appointments;
    return appointments.filter(a => currentUser.sedeIds?.includes(a.sedeId));
  }, [appointments, currentUser]);

  const filteredProfessionals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return professionals;
    return professionals.filter(p => p.sedeIds.some(sid => currentUser.sedeIds?.includes(sid)));
  }, [professionals, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let { data: configData } = await supabase.from('companies').select('*').eq('id', CLINIC_ID).maybeSingle();
        if (configData) {
          setClinicConfig({
            id: configData.id,
            name: configData.name,
            primaryColor: configData.primary_color || "#00BFA5",
            logo: configData.logo || "https://i.ibb.co/L6VvS9Z/bee-logo.png",
            portalHero: configData.portal_hero
          });
        }

        const [sData, aData, pData, profData, userData] = await Promise.all([
          supabase.from('sedes').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('patients').select('*'),
          supabase.from('professionals').select('*'),
          supabase.from('users').select('*')
        ]);

        if (sData.data) setSedes(sData.data);
        if (pData.data) setPatients(pData.data.map(p => ({ ...p, documentId: p.document_id, birthDate: p.birth_date, history: [] })));
        if (profData.data) setProfessionals(profData.data.map(p => ({ ...p, sedeIds: p.sede_ids || [], userId: p.user_id })));
        
        if (userData.data) setUsers(userData.data.map(u => ({ 
          id: u.id,
          name: u.name,
          email: u.email,
          accessKey: u.access_key,
          role: u.role as UserRole,
          sedeIds: u.sede_ids || [],
          companyId: u.company_id,
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}`
        })));

        if (aData.data) setAppointments(aData.data.map(a => ({
          ...a,
          patientName: a.patient_name,
          patientPhone: a.patient_phone,
          patientDni: a.patient_dni,
          patientId: a.patient_id,
          serviceId: a.service_id,
          sedeId: a.sede_id,
          professionalId: a.professional_id,
          bookingCode: a.booking_code,
          companyId: a.company_id
        })));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewState({ currentView: 'dashboard' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewState({ currentView: 'login' });
  };

  const handleUpdateCompany = async (c: Company) => {
    try {
      const { error } = await supabase.from('companies').update({
        name: c.name,
        primary_color: c.primaryColor,
        logo: c.logo,
        portal_hero: c.portalHero
      }).eq('id', c.id);
      
      if (error) throw error;
      setClinicConfig(c);
    } catch (err: any) {
      alert(`Error al actualizar empresa: ${formatSupabaseError(err)}`);
    }
  };

  const handleAddUser = async (user: User) => {
    const userId = generateUUID();
    try {
      const { error } = await supabase.from('users').insert([{
        id: userId,
        name: user.name,
        email: user.email || null,
        access_key: user.accessKey,
        role: user.role,
        company_id: clinicConfig.id, 
        sede_ids: user.sedeIds || [],
        avatar: user.avatar
      }]);
      if (error) throw error;
      setUsers(prev => [...prev, { ...user, id: userId }]);
    } catch (err: any) { alert(`Error: ${formatSupabaseError(err)}`); }
  };

  const handleAddProfessional = async (p: Professional) => {
    try {
      const { error } = await supabase.from('professionals').insert([{
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        sede_ids: p.sedeIds,
        user_id: p.userId,
        company_id: clinicConfig.id,
        avatar: p.avatar
      }]);
      if (error) throw error;
      setProfessionals(prev => [...prev, p]);
    } catch (err: any) { alert(`Error: ${formatSupabaseError(err)}`); }
  };

  const handleUpdateSede = async (s: Sede) => {
    const { error } = await supabase.from('sedes').update({ name: s.name, address: s.address, phone: s.phone, whatsapp: s.whatsapp, availability: s.availability }).eq('id', s.id);
    if (!error) setSedes(prev => prev.map(it => it.id === s.id ? s : it));
  };

  const handleAddSede = async (s: Sede) => {
    const id = generateUUID();
    const { error } = await supabase.from('sedes').insert([{ id, name: s.name, address: s.address, phone: s.phone, whatsapp: s.whatsapp, availability: s.availability, company_id: clinicConfig.id }]);
    if (!error) { const res = { ...s, id, companyId: clinicConfig.id }; setSedes(prev => [...prev, res]); return res; }
    return null;
  };

  const handleUpdateUser = async (u: User) => {
    try {
      const { error } = await supabase.from('users').update({ 
        name: u.name, 
        email: u.email, 
        access_key: u.accessKey, 
        role: u.role, 
        sede_ids: u.sedeIds,
        avatar: u.avatar 
      }).eq('id', u.id);
      
      if (error) throw error;
      setUsers(prev => prev.map(it => it.id === u.id ? u : it));
    } catch (err: any) {
      alert(`Error al actualizar usuario: ${formatSupabaseError(err)}`);
    }
  };

  const handleAddAppointment = async (apt: Appointment) => {
    const { error } = await supabase.from('appointments').insert([{ id: apt.id, patient_name: apt.patientName, patient_phone: apt.patientPhone, patient_dni: apt.patientDni, date: apt.date, time: apt.time, status: apt.status, sede_id: apt.sedeId, professional_id: apt.professionalId, service_id: apt.serviceId, booking_code: apt.bookingCode, company_id: clinicConfig.id }]);
    if (!error) setAppointments(prev => [...prev, apt]);
  };

  const handleUpdateAppointment = async (apt: Appointment) => {
    const { error } = await supabase.from('appointments').update({ patient_name: apt.patientName, patient_phone: apt.patientPhone, patient_dni: apt.patientDni, status: apt.status, notes: apt.notes }).eq('id', apt.id);
    if (!error) setAppointments(prev => prev.map(it => it.id === apt.id ? apt : it));
  };

  const handleAddPatient = async (p: Patient) => {
    const { error } = await supabase.from('patients').insert([{ id: p.id, name: p.name, document_id: p.documentId, phone: p.phone, email: p.email, birth_date: p.birthDate, company_id: clinicConfig.id }]);
    if (!error) setPatients(prev => [...prev, p]);
  };

  const handleAddHistoryEntry = async (pid: string, e: ClinicalHistoryEntry) => {
    const { error } = await supabase.from('clinical_history').insert([{ id: e.id, patient_id: pid, date: e.date, diagnosis: e.diagnosis, notes: e.notes, recommendations: e.recommendations, professional_id: e.professionalId, appointment_id: e.appointmentId }]);
    if (!error) setPatients(prev => prev.map(p => p.id === pid ? { ...p, history: [e, ...p.history] } : p));
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-brand-bg">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-ubuntu font-bold text-brand-navy">Cargando Privilegios...</p>
      </div>
    );

    switch (viewState.currentView) {
      case 'dashboard': return <Dashboard appointments={filteredAppointments} onNavigate={(v) => setViewState({ currentView: v as any })} />;
      case 'appointments': return <AppointmentManager appointments={filteredAppointments} patients={patients} sedes={filteredSedes} onUpdateAppointment={handleUpdateAppointment} onAddAppointment={handleAddAppointment} onStartClinicalSession={(id) => setViewState({ currentView: 'clinical-record', activeAppointmentId: id })} onAddPatient={handleAddPatient} />;
      case 'patients': return <PatientDirectory patients={patients} onAddPatient={handleAddPatient} onAddHistoryEntry={handleAddHistoryEntry} onScheduleSessions={(f) => setAppointments(p => [...p, ...f])} sedes={filteredSedes} professionals={filteredProfessionals} />;
      case 'schedules': return <ScheduleManager sedes={filteredSedes} onUpdateSede={handleUpdateSede} onAddSede={handleAddSede} />;
      case 'staff-management': return <StaffManagement professionals={filteredProfessionals} users={users} sedes={filteredSedes} onAddProfessional={handleAddProfessional} onAddUser={handleAddUser} currentCompanyId={clinicConfig.id} userRole={currentUser?.role} />;
      case 'clinical-record':
        const activeApt = filteredAppointments.find(a => a.id === viewState.activeAppointmentId);
        if (!activeApt) return <Dashboard appointments={filteredAppointments} onNavigate={(v) => setViewState({ currentView: v as any })} />;
        return <ClinicalRecordForm appointment={activeApt} onClose={() => setViewState({ currentView: 'appointments' })} onSaveRecord={handleAddHistoryEntry} onScheduleSessions={(f) => setAppointments(p => [...p, ...f])} />;
      case 'saas-admin' as any: return <SaasAdmin companies={[clinicConfig]} users={users} sedes={sedes} onAddCompany={() => {}} onUpdateCompany={handleUpdateCompany} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} userRole={currentUser?.role} currentCompanyId={clinicConfig.id} />;
      default: return <Dashboard appointments={filteredAppointments} onNavigate={(v) => setViewState({ currentView: v as any })} />;
    }
  };

  if (viewState.currentView === 'login') return <Login users={users} onLogin={handleLogin} />;
  if (viewState.currentView === 'portal') return <PatientPortal company={clinicConfig} sedes={sedes} onBack={() => setViewState({ currentView: 'dashboard' })} onAppointmentCreated={handleAddAppointment} />;

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter">
      <Sidebar currentView={viewState.currentView} onViewChange={(v) => setViewState({ currentView: v })} userRole={currentUser?.role} onLogout={handleLogout} />
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
             <div className="flex flex-col">
               <span className="text-brand-navy font-bold text-sm tracking-tight leading-none">{clinicConfig.name}</span>
               <span className="text-[9px] text-brand-secondary font-bold uppercase tracking-widest mt-1">Sedes: {filteredSedes.length}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-brand-navy">{currentUser?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{currentUser?.role}</p>
             </div>
             <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl shadow-md border-2 border-white" alt="User" />
          </div>
        </header>
        <main className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
