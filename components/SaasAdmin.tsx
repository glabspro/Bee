
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Palette, 
  X,
  Save,
  ChevronRight,
  Users,
  UserPlus,
  Type,
  Image as ImageIcon,
  Settings,
  Mail,
  Shield,
  MapPin,
  Building,
  ArrowLeft,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Sparkles,
  MousePointer2
} from 'lucide-react';
import { Company, User, UserRole, Sede } from '../types';

interface SaasAdminProps {
  companies: Company[];
  users: User[];
  sedes: Sede[];
  onAddCompany: (c: Company) => void;
  onUpdateCompany: (c: Company) => void;
  onAddUser: (u: User) => void;
  onSelectCompany?: (companyId: string) => void;
  userRole?: UserRole;
  currentCompanyId?: string;
}

const SaasAdmin: React.FC<SaasAdminProps> = ({ 
  companies = [], 
  users = [],
  sedes = [],
  onAddCompany, 
  onUpdateCompany,
  onAddUser,
  onSelectCompany, 
  userRole = UserRole.ADMIN,
  currentCompanyId 
}) => {
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'users' | 'settings'>(isSuperAdmin ? 'tenants' : 'settings');
  
  // Estado para la clínica que se está gestionando activamente
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: UserRole.ADMIN,
    companyId: '',
    selectedSedes: [] as string[]
  });

  const editingClinic = useMemo(() => 
    companies.find(c => c.id === (editingClinicId || currentCompanyId)), 
    [companies, editingClinicId, currentCompanyId]
  );

  const [brandForm, setBrandForm] = useState<Partial<Company>>({});

  useEffect(() => {
    if (editingClinic) setBrandForm(editingClinic);
  }, [editingClinic]);

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandForm.id) {
      onUpdateCompany(brandForm as Company);
      alert("Identidad de la clínica actualizada correctamente.");
    }
  };

  const availableSedes = useMemo(() => {
    return sedes.filter(s => s?.companyId === (editingClinicId || newUserForm.companyId));
  }, [sedes, editingClinicId, newUserForm.companyId]);

  const handleManageClinic = (companyId: string) => {
    setEditingClinicId(companyId);
    onSelectCompany?.(companyId); // Sincroniza el contexto global
    setActiveSubTab('settings'); // Va directo a marca/configuración
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className="text-brand-secondary" /> 
             {isSuperAdmin ? 'Administración Global SaaS' : 'Identidad Corporativa'}
          </div>
          
          <div className="flex items-center gap-4">
            {editingClinicId && (
              <button 
                onClick={() => setEditingClinicId(null)}
                className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-navy hover:shadow-md transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">
              {editingClinicId ? editingClinic?.name : (isSuperAdmin ? 'Ecosistema' : 'Personalización')}
            </h2>
          </div>
        </div>

        {!editingClinicId && (
          <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
             {isSuperAdmin && (
               <>
                  <button onClick={() => setActiveSubTab('tenants')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'tenants' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                    <Building2 size={14} /> Clínicas
                  </button>
                  <button onClick={() => setActiveSubTab('users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'users' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                    <Users size={14} /> Identidades
                  </button>
               </>
             )}
             <button onClick={() => setActiveSubTab('settings')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'settings' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
               <Palette size={14} /> Marca
             </button>
          </div>
        )}
      </header>

      {/* VISTA DE LISTA DE CLÍNICAS (Si no hay una seleccionada) */}
      {isSuperAdmin && activeSubTab === 'tenants' && !editingClinicId && (
        <div className="space-y-10 px-4">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Clínicas Partners</h3>
              <button onClick={() => setShowCompanyModal(true)} className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 shadow-xl text-xs">
                <Plus size={18} /> Nueva Clínica
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map(c => (
                <div key={c.id} className="bg-white rounded-[3.5rem] border-b-8 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all relative" style={{ borderBottomColor: c.primaryColor }}>
                  <div className="h-28 bg-slate-50 relative overflow-hidden">
                    <img src={c.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"} className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 rounded-2xl bg-white shadow-xl p-2 flex items-center justify-center border border-slate-100">
                         <img src={c.logo || "https://placeholder.com/150"} className="w-full h-full object-contain" />
                       </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-ubuntu font-bold text-brand-navy">{c.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{c.id}</p>
                    
                    <button 
                      onClick={() => handleManageClinic(c.id)} 
                      className="w-full mt-8 py-4 bg-brand-navy text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all shadow-lg"
                    >
                      Gestionar Identidad <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* CENTRO DE MANDO DE CLÍNICA SELECCIONADA O TAB MARCA */}
      {(editingClinicId || activeSubTab === 'settings') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
          
          {/* PANEL DE IDENTIDAD VISUAL */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 space-y-12 h-full">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand-lightPrimary rounded-3xl flex items-center justify-center text-brand-primary">
                     <Palette size={32} />
                  </div>
                  <div>
                     <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Identidad de Marca</h3>
                     <p className="text-slate-400 font-medium">Configura cómo ven los pacientes tu clínica.</p>
                  </div>
               </div>

               <form onSubmit={handleUpdateBrand} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12} /> Nombre de la Institución</label>
                        <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none" value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={12} /> Color Corporativo</label>
                        <div className="flex gap-4">
                           <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none" value={brandForm.primaryColor || ''} onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} />
                           <div className="w-14 h-14 rounded-2xl border border-slate-100 shadow-inner shrink-0" style={{ backgroundColor: brandForm.primaryColor }}></div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL Logotipo (PNG/SVG)</label>
                        <input placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none" value={brandForm.logo || ''} onChange={e => setBrandForm({...brandForm, logo: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL Banner del Portal</label>
                        <input placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none" value={brandForm.portalHero || ''} onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} />
                     </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all">
                     <Save size={18} /> Sincronizar Identidad Bee
                  </button>
               </form>
            </div>
          </div>

          {/* PANEL DE PORTAL Y ACCESO RÁPIDO */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gradient-to-br from-brand-navy to-[#1a1a5e] rounded-[4rem] p-12 text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                     <Globe size={28} className="text-brand-secondary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-ubuntu font-bold">Portal Virtual</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Agenda para Pacientes</p>
                  </div>
               </div>

               <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 relative z-10">
                  <p className="text-xs text-white/60 font-medium leading-relaxed">Este es el enlace que debes compartir con tus pacientes para que agenden sus citas de forma autónoma.</p>
                  <div className="flex items-center gap-3 bg-brand-navy/50 p-4 rounded-xl border border-white/5">
                     <Globe size={14} className="text-brand-secondary shrink-0" />
                     <span className="text-[10px] font-mono font-bold truncate">bee-clinical.system/portal/{editingClinic?.id}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4 relative z-10">
                  <button 
                    onClick={() => window.open('/portal', '_blank')}
                    className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-secondary/90 transition-all"
                  >
                    <ExternalLink size={16} /> Previsualizar Portal
                  </button>
                  <button className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                     <MousePointer2 size={16} /> Copiar Enlace Directo
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 clinical-shadow space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-lightPrimary text-brand-primary rounded-2xl flex items-center justify-center">
                     <Sparkles size={24} />
                  </div>
                  <h4 className="font-ubuntu font-bold text-lg text-brand-navy">Estado del Tenant</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Sedes Activas</span>
                     <span className="text-brand-navy font-bold">{availableSedes.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Citas del Mes</span>
                     <span className="text-brand-navy font-bold">142</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-100">
                     <span className="text-[10px] font-bold text-green-600 uppercase">Estado</span>
                     <span className="text-green-600 font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Operativo
                     </span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA DE USUARIOS (IDENTIDADES) - Solo se muestra si no estamos editando una clínica */}
      {isSuperAdmin && activeSubTab === 'users' && !editingClinicId && (
        <div className="space-y-10 px-4">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Gestión de Accesos</h3>
              <button onClick={() => setShowUserModal(true)} className="bg-brand-secondary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 shadow-xl text-xs">
                <UserPlus size={18} /> Nuevo Acceso
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map(u => {
                const company = companies.find(c => c.id === u.companyId);
                return (
                  <div key={u.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner shrink-0">
                        <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-ubuntu font-bold text-lg text-brand-navy leading-tight">{u.name}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest mt-1 border ${
                          u.role === UserRole.SUPER_ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          u.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                          <Mail size={14} className="text-brand-secondary" /> {u.email}
                       </div>
                       <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                          <Building size={14} className="text-brand-primary" /> {company?.name || 'Bee Global'}
                       </div>
                       <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                          <MapPin size={14} className="text-brand-accent" /> {u.sedeIds ? `${u.sedeIds.length} Sedes` : 'Acceso Global'}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* MODAL NUEVA CLÍNICA */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-6">Nueva Clínica Partner</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onAddCompany({ id: 'c-' + Math.random().toString(36).substr(2, 5), name: (e.target as any).elements.name.value, logo: '', portalHero: '', primaryColor: '#714B67', active: true });
                  setShowCompanyModal(false);
              }} className="space-y-4">
                 <input name="name" placeholder="Nombre de la Institución" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                 <button type="submit" className="w-full py-4 bg-brand-navy text-white rounded-2xl font-bold shadow-xl">Activar Nuevo Tenant</button>
                 <button type="button" onClick={() => setShowCompanyModal(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Cancelar</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL NUEVO USUARIO */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-8 flex items-center gap-3">
                <UserPlus className="text-brand-secondary" /> Nuevo Acceso Identidad
              </h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onAddUser({ 
                    id: 'u-' + Math.random().toString(36).substr(2, 5), 
                    name: newUserForm.name, 
                    email: newUserForm.email, 
                    role: newUserForm.role, 
                    companyId: newUserForm.companyId, 
                    sedeIds: newUserForm.selectedSedes 
                  });
                  setShowUserModal(false);
              }} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input placeholder="Ej: Juan Pérez" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input type="email" placeholder="email@ejemplo.com" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium outline-none" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rol de Usuario</label>
                        <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none text-xs font-bold appearance-none" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}>
                            <option value={UserRole.ADMIN}>Administrador</option>
                            <option value={UserRole.RECEPCIONIST}>Recepcionista</option>
                            <option value={UserRole.SPECIALIST}>Especialista</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asignar Clínica</label>
                        <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none text-xs font-bold appearance-none" value={newUserForm.companyId} onChange={e => setNewUserForm({...newUserForm, companyId: e.target.value})}>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                 </div>

                 {availableSedes.length > 0 && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asignar Sedes (Opcional)</label>
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                        {availableSedes.map(s => (
                          <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 rounded text-brand-secondary focus:ring-brand-secondary border-slate-300"
                               onChange={(e) => {
                                 const newList = e.target.checked 
                                   ? [...newUserForm.selectedSedes, s.id] 
                                   : newUserForm.selectedSedes.filter(id => id !== s.id);
                                 setNewUserForm({...newUserForm, selectedSedes: newList});
                               }}
                             />
                             <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-navy">{s.name}</span>
                          </label>
                        ))}
                      </div>
                   </div>
                 )}

                 <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold shadow-xl hover:bg-brand-secondary transition-all">
                    Activar Credenciales Bee
                 </button>
                 <button type="button" onClick={() => setShowUserModal(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Cancelar Registro</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
