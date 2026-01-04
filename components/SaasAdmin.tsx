
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
  MousePointer2,
  Lock,
  CheckCircle,
  Copy
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
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'users' | 'settings'>('tenants');
  
  // Pestaña interna cuando se gestiona una clínica
  const [clinicDetailTab, setClinicDetailTab] = useState<'brand' | 'portal' | 'access'>('brand');

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

  const clinicUsers = useMemo(() => 
    users.filter(u => u.companyId === editingClinicId),
    [users, editingClinicId]
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
    onSelectCompany?.(companyId);
    setClinicDetailTab('brand');
  };

  const copyPortalLink = () => {
    const link = `bee-clinical.system/portal/${editingClinic?.id}`;
    navigator.clipboard.writeText(link);
    alert("Enlace copiado al portapapeles");
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className="text-brand-secondary" /> 
             {isSuperAdmin ? 'Bee Global Clinical SaaS' : 'Identidad Corporativa'}
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

        {/* NAVEGACIÓN DE PESTAÑAS (Vista Global vs Vista Detalle) */}
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
           {!editingClinicId ? (
             <>
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
             </>
           ) : (
             <>
                <button onClick={() => setClinicDetailTab('brand')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${clinicDetailTab === 'brand' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                  <Palette size={14} /> Identidad
                </button>
                <button onClick={() => setClinicDetailTab('portal')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${clinicDetailTab === 'portal' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                  <Globe size={14} /> Portal Agenda
                </button>
                <button onClick={() => setClinicDetailTab('access')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${clinicDetailTab === 'access' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                  <Lock size={14} /> Accesos
                </button>
             </>
           )}
        </div>
      </header>

      {/* VISTA GLOBAL: LISTA DE CLÍNICAS */}
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">UUID: {c.id.toUpperCase()}</p>
                    <button 
                      onClick={() => handleManageClinic(c.id)} 
                      className="w-full mt-8 py-4 bg-brand-navy text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-secondary transition-all shadow-lg"
                    >
                      Gestionar Clínica <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* VISTA DETALLE: GESTIÓN DE CLÍNICA ESPECÍFICA */}
      {editingClinicId && (
        <div className="px-4">
          {clinicDetailTab === 'brand' && (
            <div className="max-w-4xl mx-auto bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 space-y-12 animate-fade-in">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand-lightPrimary rounded-3xl flex items-center justify-center text-brand-primary">
                     <Palette size={32} />
                  </div>
                  <div>
                     <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Personalización Visual</h3>
                     <p className="text-slate-400 font-medium">Define la cara pública de tu clínica ante los pacientes.</p>
                  </div>
               </div>

               <form onSubmit={handleUpdateBrand} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12} /> Nombre Público</label>
                        <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={12} /> Color de Marca</label>
                        <div className="flex gap-4">
                           <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.primaryColor || ''} onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} />
                           <div className="w-14 h-14 rounded-2xl border border-slate-100 shadow-inner shrink-0" style={{ backgroundColor: brandForm.primaryColor }}></div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL del Logotipo</label>
                        <input placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.logo || ''} onChange={e => setBrandForm({...brandForm, logo: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL Imagen de Banner Portal</label>
                        <input placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.portalHero || ''} onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} />
                     </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all">
                     <Save size={18} /> Guardar Cambios de Identidad
                  </button>
               </form>
            </div>
          )}

          {clinicDetailTab === 'portal' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
               <div className="bg-gradient-to-br from-brand-navy to-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                  <div className="absolute top-0 right-0 p-20 opacity-10"><Globe size={300} /></div>
                  <div className="relative z-10 max-w-2xl space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                           <Globe size={32} className="text-brand-secondary" />
                        </div>
                        <h3 className="text-4xl font-ubuntu font-bold">Portal de Agenda Virtual</h3>
                     </div>
                     <p className="text-xl text-white/60 leading-relaxed font-medium">Tus pacientes ahora pueden agendar desde cualquier dispositivo. Este es tu centro de acceso directo.</p>
                     
                     <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                        <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Enlace Público de tu Clínica</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1 bg-brand-navy/60 p-5 rounded-2xl border border-white/10 font-mono text-xs flex items-center gap-3 truncate">
                              <Globe size={14} className="text-brand-secondary" /> bee-clinical.system/portal/{editingClinic?.id}
                           </div>
                           <button onClick={copyPortalLink} className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-secondary hover:text-white transition-all">
                              <Copy size={16} /> Copiar
                           </button>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <button 
                          onClick={() => window.open('/portal', '_blank')}
                          className="px-10 py-5 bg-brand-secondary text-white rounded-[2rem] font-bold text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
                        >
                          <ExternalLink size={18} /> Previsualizar Portal
                        </button>
                        <button className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-[2rem] font-bold text-sm hover:bg-white/20 transition-all">
                           Configurar Servicios
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                     <div className="w-14 h-14 bg-brand-lightSecondary rounded-2xl flex items-center justify-center text-brand-secondary"><MousePointer2 size={24} /></div>
                     <h4 className="font-ubuntu font-bold text-brand-navy">Autoservicio 24/7</h4>
                     <p className="text-xs text-slate-400 font-medium">Tus pacientes no necesitan llamar para pedir cita.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                     <div className="w-14 h-14 bg-brand-lightPrimary rounded-2xl flex items-center justify-center text-brand-primary"><Sparkles size={24} /></div>
                     <h4 className="font-ubuntu font-bold text-brand-navy">Branding Total</h4>
                     <p className="text-xs text-slate-400 font-medium">El portal hereda tus colores y logo automáticamente.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                     <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><CheckCircle size={24} /></div>
                     <h4 className="font-ubuntu font-bold text-brand-navy">Agenda Real</h4>
                     <p className="text-xs text-slate-400 font-medium">Solo muestra los horarios que configures en Sedes.</p>
                  </div>
               </div>
            </div>
          )}

          {clinicDetailTab === 'access' && (
            <div className="space-y-10 animate-fade-in">
               <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><Lock size={24} /></div>
                     <div>
                        <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Identidades de Acceso</h3>
                        <p className="text-slate-400 text-sm font-medium">Usuarios registrados para {editingClinic?.name}.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => {
                       setNewUserForm({ ...newUserForm, companyId: editingClinicId! });
                       setShowUserModal(true);
                    }} 
                    className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 shadow-xl text-xs"
                  >
                    <UserPlus size={18} /> Crear Nuevo Acceso
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                  {clinicUsers.length > 0 ? (
                    clinicUsers.map(u => (
                      <div key={u.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner shrink-0 bg-slate-50">
                            <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-ubuntu font-bold text-lg text-brand-navy leading-tight">{u.name}</h4>
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest mt-1 border ${
                              u.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3 pt-6 mt-6 border-t border-slate-50">
                           <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                              <Mail size={14} className="text-brand-secondary" /> {u.email}
                           </div>
                           <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                              <MapPin size={14} className="text-brand-accent" /> {u.sedeIds ? `${u.sedeIds.length} Sedes` : 'Acceso Global'}
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                       <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">No hay usuarios asignados a esta clínica todavía.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA GLOBAL: GESTIÓN DE TODOS LOS USUARIOS (Solo si no estamos en detalle) */}
      {isSuperAdmin && activeSubTab === 'users' && !editingClinicId && (
        <div className="space-y-10 px-4 animate-fade-in">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Directorio de Identidades Global</h3>
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
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner shrink-0 bg-slate-50">
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
                          <Building size={14} className="text-brand-primary" /> {company?.name || 'Bee Ecosistema'}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* MODALES DE CREACIÓN */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-6">Nueva Clínica Partner</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onAddCompany({ id: 'c-' + Math.random().toString(36).substr(2, 5), name: (e.target as any).elements.name.value, logo: '', portalHero: '', primaryColor: '#714B67', active: true });
                  setShowCompanyModal(false);
              }} className="space-y-4">
                 <input name="name" placeholder="Nombre de la Institución" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" />
                 <button type="submit" className="w-full py-4 bg-brand-navy text-white rounded-2xl font-bold shadow-xl">Activar Nuevo Tenant</button>
                 <button type="button" onClick={() => setShowCompanyModal(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Cancelar</button>
              </form>
           </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-8 flex items-center gap-3">
                <UserPlus className="text-brand-secondary" /> {editingClinicId ? `Nuevo Acceso para ${editingClinic?.name}` : 'Nuevo Acceso Identidad'}
              </h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onAddUser({ 
                    id: 'u-' + Math.random().toString(36).substr(2, 5), 
                    name: newUserForm.name, 
                    email: newUserForm.email, 
                    role: newUserForm.role, 
                    companyId: editingClinicId || newUserForm.companyId, 
                    sedeIds: newUserForm.selectedSedes 
                  });
                  setShowUserModal(false);
              }} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input placeholder="Ej: Juan Pérez" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold outline-none shadow-inner" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input type="email" placeholder="email@ejemplo.com" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium outline-none shadow-inner" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rol de Usuario</label>
                        <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none text-xs font-bold appearance-none cursor-pointer" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}>
                            <option value={UserRole.ADMIN}>Administrador</option>
                            <option value={UserRole.RECEPCIONIST}>Recepcionista</option>
                            <option value={UserRole.SPECIALIST}>Especialista</option>
                        </select>
                    </div>
                    {!editingClinicId && (
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asignar Clínica</label>
                          <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl border-none text-xs font-bold appearance-none cursor-pointer" value={newUserForm.companyId} onChange={e => setNewUserForm({...newUserForm, companyId: e.target.value})}>
                              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                    )}
                 </div>

                 {availableSedes.length > 0 && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Permisos por Sede (Opcional)</label>
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner">
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
