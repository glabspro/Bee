
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
  Settings
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

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: UserRole.ADMIN,
    companyId: '',
    selectedSedes: [] as string[]
  });

  useEffect(() => {
    if (companies.length > 0 && !newUserForm.companyId) {
      setNewUserForm(prev => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies]);

  const currentCompany = useMemo(() => companies.find(c => c.id === currentCompanyId), [companies, currentCompanyId]);
  const [brandForm, setBrandForm] = useState<Partial<Company>>({});

  useEffect(() => {
    if (currentCompany) setBrandForm(currentCompany);
  }, [currentCompany]);

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandForm.id) {
      onUpdateCompany(brandForm as Company);
      alert("Marca sincronizada correctamente.");
    }
  };

  const availableSedes = useMemo(() => {
    return sedes.filter(s => s?.companyId === newUserForm.companyId);
  }, [sedes, newUserForm.companyId]);

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className="text-brand-secondary" /> 
             {isSuperAdmin ? 'Administración Global SaaS' : 'Identidad Corporativa'}
          </div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">
            {isSuperAdmin ? 'Ecosistema' : 'Personalización'}
          </h2>
        </div>

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
      </header>

      {isSuperAdmin && activeSubTab === 'tenants' && (
        <div className="space-y-10 px-4">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Clínicas Partners</h3>
              <button onClick={() => setShowCompanyModal(true)} className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 shadow-xl text-xs">
                <Plus size={18} /> Nueva Clínica
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map(c => (
                <div key={c.id} className="bg-white rounded-[3rem] border-b-4 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all" style={{ borderBottomColor: c.primaryColor }}>
                  <div className="h-24 bg-slate-50 relative">
                    <img src={c.portalHero} className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <img src={c.logo} className="w-12 h-12 rounded-xl shadow-xl p-1 bg-white object-contain" />
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-xl font-ubuntu font-bold text-brand-navy">{c.name}</h4>
                    <button onClick={() => onSelectCompany?.(c.id)} className="w-full mt-6 py-3 bg-brand-navy text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all">
                      Gestionar Clínica <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="max-w-4xl mx-auto px-4">
           <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 space-y-12">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-brand-lightPrimary rounded-[2rem] flex items-center justify-center text-brand-primary">
                    <Palette size={40} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Personalización del Portal</h3>
                    <p className="text-slate-400 font-medium">Define los colores y logos que verán tus pacientes.</p>
                 </div>
              </div>

              <form onSubmit={handleUpdateBrand} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12} /> Nombre Público</label>
                       <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none" value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={12} /> Color de Marca</label>
                       <div className="flex gap-4">
                          <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none" value={brandForm.primaryColor || ''} onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} />
                          <div className="w-14 h-14 rounded-2xl border border-slate-200 shadow-inner" style={{ backgroundColor: brandForm.primaryColor }}></div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> Imágenes (URLs)</label>
                    <input placeholder="URL Logo Principal" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-sm font-medium outline-none" value={brandForm.logo || ''} onChange={e => setBrandForm({...brandForm, logo: e.target.value})} />
                    <input placeholder="URL Banner del Portal" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-sm font-medium outline-none" value={brandForm.portalHero || ''} onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all">
                    <Save size={18} /> Guardar Cambios de Identidad
                 </button>
              </form>
           </div>
        </div>
      )}

      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-6">Nueva Clínica Partner</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  onAddCompany({ id: 'c-' + Math.random().toString(36).substr(2, 5), name: (e.target as any).elements.name.value, logo: '', portalHero: '', primaryColor: '#714B67', active: true });
                  setShowCompanyModal(false);
              }} className="space-y-4">
                 <input name="name" placeholder="Nombre de la Institución" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" />
                 <button type="submit" className="w-full py-4 bg-brand-navy text-white rounded-2xl font-bold">Activar Nuevo Tenant</button>
                 <button type="button" onClick={() => setShowCompanyModal(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancelar</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
