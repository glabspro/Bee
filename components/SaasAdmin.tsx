
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
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'users' | 'settings'>(isSuperAdmin ? 'tenants' : 'settings');
  
  const [clinicDetailTab, setClinicDetailTab] = useState<'brand' | 'portal' | 'access'>('brand');
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);

  const activeClinic = useMemo(() => 
    companies.find(c => c.id === (editingClinicId || currentCompanyId)), 
    [companies, editingClinicId, currentCompanyId]
  );

  const [brandForm, setBrandForm] = useState<Partial<Company>>({});

  useEffect(() => {
    if (activeClinic) {
      setBrandForm(activeClinic);
    }
  }, [activeClinic]);

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandForm.id) {
      onUpdateCompany(brandForm as Company);
      alert("✅ ¡Identidad corporativa actualizada! Los pacientes verán los cambios en el portal.");
    }
  };

  const clinicUsers = useMemo(() => 
    users.filter(u => u.companyId === (editingClinicId || currentCompanyId)),
    [users, editingClinicId, currentCompanyId]
  );

  const availableSedes = useMemo(() => {
    return sedes.filter(s => s?.companyId === (editingClinicId || currentCompanyId));
  }, [sedes, editingClinicId, currentCompanyId]);

  const copyPortalLink = () => {
    const link = `https://bee-clinical.app/portal/${activeClinic?.id || 'main'}`;
    navigator.clipboard.writeText(link);
    alert("Enlace copiado al portapapeles");
  };

  const renderBrandingForm = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 space-y-12 animate-fade-in">
       <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-lightPrimary rounded-3xl flex items-center justify-center text-brand-primary shadow-inner">
             <Palette size={32} />
          </div>
          <div>
             <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Personalización de Marca</h3>
             <p className="text-slate-400 font-medium">Define cómo los pacientes perciben tu clínica.</p>
          </div>
       </div>

       <form onSubmit={handleUpdateBrand} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Type size={12} /> Nombre de la Clínica</label>
                <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Palette size={12} /> Color Principal (HEX)</label>
                <div className="flex gap-4">
                   <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.primaryColor || ''} onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} />
                   <div className="w-14 h-14 rounded-2xl border border-slate-100 shadow-inner shrink-0" style={{ backgroundColor: brandForm.primaryColor }}></div>
                </div>
             </div>
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL del Logotipo</label>
                <input placeholder="https://ejemplo.com/logo.png" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.logo || ''} onChange={e => setBrandForm({...brandForm, logo: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> URL Fondo del Portal (Banner)</label>
                <input placeholder="https://ejemplo.com/hero.jpg" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.portalHero || ''} onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} />
             </div>
          </div>
          <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all">
             <Save size={18} /> Guardar Identidad Corporativa
          </button>
       </form>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} /> 
             {isSuperAdmin ? 'Bee Global Clinical SaaS' : 'Identidad de la Clínica'}
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
              {editingClinicId ? activeClinic?.name : (isSuperAdmin ? 'Ecosistema' : 'Personalización')}
            </h2>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
           {!editingClinicId ? (
             <>
                {isSuperAdmin && (
                  <>
                    <button onClick={() => setActiveSubTab('tenants')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'tenants' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                      <Building2 size={14} /> Clínicas
                    </button>
                    <button onClick={() => setActiveSubTab('users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'users' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                      <Users size={14} /> Accesos
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
                  <Globe size={14} /> Portal
                </button>
             </>
           )}
        </div>
      </header>

      {/* VISTA SETTINGS (MARCA) PARA ADMINS LOCALES */}
      {!editingClinicId && activeSubTab === 'settings' && renderBrandingForm()}

      {/* VISTA TENANTS PARA SUPER ADMINS */}
      {isSuperAdmin && activeSubTab === 'tenants' && !editingClinicId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
           {companies.map(c => (
             <div key={c.id} className="bg-white rounded-[3.5rem] border-b-8 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all relative" style={{ borderBottomColor: c.primaryColor }}>
               <div className="h-28 bg-slate-50 relative overflow-hidden">
                 <img src={c.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"} className="w-full h-full object-cover opacity-20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl p-2 flex items-center justify-center border border-slate-100">
                      <img src={c.logo || "https://placeholder.com/150"} className="w-full h-full object-contain" />
                    </div>
                 </div>
               </div>
               <div className="p-8 text-center">
                 <h4 className="text-2xl font-ubuntu font-bold text-brand-navy">{c.name}</h4>
                 <button 
                   onClick={() => setEditingClinicId(c.id)} 
                   className="w-full mt-8 py-4 bg-brand-navy text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest hover:bg-brand-secondary transition-all"
                 >
                   Gestionar Marca <ChevronRight size={16} />
                 </button>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* VISTA DETALLE PARA SUPER ADMINS EDITANDO UNA CLÍNICA */}
      {editingClinicId && (
        <div className="px-4">
          {clinicDetailTab === 'brand' && renderBrandingForm()}
          {clinicDetailTab === 'portal' && (
            <div className="max-w-4xl mx-auto space-y-10">
               <div className="bg-brand-navy rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                  <div className="relative z-10 max-w-2xl space-y-8">
                     <h3 className="text-4xl font-ubuntu font-bold">Portal de Agenda Virtual</h3>
                     <p className="text-xl text-white/60 leading-relaxed font-medium">Este es el enlace que debes compartir con tus pacientes para que agenden solos.</p>
                     
                     <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                           <div className="flex-1 bg-brand-navy/60 p-5 rounded-2xl border border-white/10 font-mono text-xs flex items-center gap-3 truncate">
                              <Globe size={14} className="text-brand-secondary" /> bee-clinical.system/portal/{activeClinic?.id}
                           </div>
                           <button onClick={copyPortalLink} className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3">
                              <Copy size={16} /> Copiar
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
