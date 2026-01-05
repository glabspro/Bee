
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
  Copy,
  Eye
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
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'users' | 'settings'>(isSuperAdmin ? 'tenants' : 'settings');
  const [clinicDetailTab, setClinicDetailTab] = useState<'brand' | 'portal'>('brand');
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
      alert("✅ ¡Identidad corporativa actualizada! Los cambios son visibles en el portal de pacientes de inmediato.");
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Reemplaza espacios con -
      .replace(/[^\w\-]+/g, '')       // Elimina caracteres no alfanuméricos
      .replace(/\-\-+/g, '-')         // Reemplaza múltiples - con uno solo
      .replace(/^-+/, '')             // Elimina - al inicio
      .replace(/-+$/, '');            // Elimina - al final
  };

  const currentOrigin = window.location.origin;
  const businessSlug = activeClinic ? slugify(activeClinic.name) : 'portal';
  const portalFullUrl = `${currentOrigin}/${businessSlug}`;

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalFullUrl);
    alert("✅ Enlace profesional copiado: " + portalFullUrl);
  };

  const renderBrandingForm = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-fade-in">
       {/* Formulario de Configuración */}
       <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-brand-lightPrimary rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                <Palette size={28} />
             </div>
             <div>
                <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Personalización de Marca</h3>
                <p className="text-slate-400 text-xs font-medium">Define la identidad visual de tu clínica.</p>
             </div>
          </div>

          <form onSubmit={handleUpdateBrand} className="space-y-8">
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Type size={12} /> Nombre de la Clínica
                   </label>
                   <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" 
                    value={brandForm.name || ''} 
                    onChange={e => setBrandForm({...brandForm, name: e.target.value})} 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Palette size={12} /> Color de Marca (HEX)
                   </label>
                   <div className="flex gap-4">
                      <input 
                        className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" 
                        value={brandForm.primaryColor || ''} 
                        onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} 
                      />
                      <div className="w-14 h-14 rounded-2xl border border-slate-100 shadow-inner shrink-0" style={{ backgroundColor: brandForm.primaryColor }}></div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <ImageIcon size={12} /> URL del Logotipo (PNG/JPG)
                   </label>
                   <input 
                    placeholder="https://tudominio.com/logo.png" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" 
                    value={brandForm.logo || ''} 
                    onChange={e => setBrandForm({...brandForm, logo: e.target.value})} 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <ImageIcon size={12} /> Imagen de Portada Portal (Banner)
                   </label>
                   <input 
                    placeholder="https://tudominio.com/hero.jpg" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" 
                    value={brandForm.portalHero || ''} 
                    onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} 
                   />
                </div>
             </div>

             <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all">
                <Save size={18} /> Guardar Cambios de Identidad
             </button>
          </form>
       </div>

       {/* Previsualización en Vivo */}
       <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between">
             <div className="absolute inset-0 opacity-40">
                <img 
                  src={brandForm.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"} 
                  className="w-full h-full object-cover blur-[2px]" 
                  alt="Preview Hero"
                />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
             
             <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[9px] font-bold uppercase tracking-widest">
                   Previsualización Portal
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl">
                   <img src={brandForm.logo || "https://placeholder.com/150"} className="max-w-full max-h-full object-contain" alt="Preview Logo" />
                </div>
             </div>

             <div className="relative z-10 space-y-4 text-center">
                <h4 className="text-4xl font-ubuntu font-bold">{brandForm.name || 'Tu Clínica'}</h4>
                <div className="flex justify-center gap-2">
                   <div className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/30" style={{ backgroundColor: brandForm.primaryColor }}>
                      Botón de Acción
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex items-center gap-6">
             <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} />
             </div>
             <div className="flex-1">
                <p className="text-xs font-bold text-brand-navy">URL Personalizada</p>
                <p className="text-[10px] text-slate-400 font-medium">Tus pacientes verán: <span className="text-brand-secondary font-bold">/{businessSlug}</span></p>
             </div>
             <button onClick={() => setClinicDetailTab('portal')} className="text-brand-secondary text-[10px] font-bold uppercase tracking-widest hover:underline">
                Ver Enlace
             </button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} /> 
             {isSuperAdmin ? 'Bee Global Clinical SaaS' : 'Panel de Control Local'}
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
                <button onClick={() => { setActiveSubTab('settings'); setClinicDetailTab('portal'); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'settings' && clinicDetailTab === 'portal' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
                  <Globe size={14} /> Enlace Portal
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

      {/* CONTENIDO DINÁMICO */}
      <div className="px-4">
        {!editingClinicId && activeSubTab === 'settings' && (
           clinicDetailTab === 'brand' ? renderBrandingForm() : (
             <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
                <div className="bg-brand-navy rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                   <div className="relative z-10 max-w-2xl space-y-8">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                         <Globe size={32} className="text-brand-secondary" />
                      </div>
                      <h3 className="text-4xl font-ubuntu font-bold">Configuración de Portal Externo</h3>
                      <p className="text-xl text-white/60 leading-relaxed font-medium">
                        Este es el enlace profesional para {activeClinic?.name}. Cópialo y pégalo en tu biografía de Instagram o estados de WhatsApp.
                      </p>
                      
                      <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-brand-navy/60 p-5 rounded-2xl border border-white/10 font-mono text-sm flex items-center gap-3 truncate text-brand-secondary font-bold">
                               <Globe size={14} /> {portalFullUrl}
                            </div>
                            <button onClick={copyPortalLink} className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-secondary hover:text-white transition-all">
                               <Copy size={16} /> Copiar Enlace
                            </button>
                         </div>
                      </div>
                   </div>
                   <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-secondary/20 rounded-full blur-3xl"></div>
                </div>
             </div>
           )
        )}

        {/* VISTA TENANTS (SÓLO SUPER ADMIN) */}
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

        {/* VISTA DETALLE PARA SUPER ADMINS EDITANDO UNA CLÍNICA ESPECÍFICA */}
        {editingClinicId && (
          <div className="animate-fade-in">
            {clinicDetailTab === 'brand' ? renderBrandingForm() : (
              <div className="max-w-4xl mx-auto space-y-10">
                 <div className="bg-brand-navy rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="relative z-10 max-w-2xl space-y-8">
                       <h3 className="text-4xl font-ubuntu font-bold">Configuración de Portal Externo</h3>
                       <p className="text-xl text-white/60 leading-relaxed font-medium">Link de acceso para {activeClinic?.name}.</p>
                       <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                             <div className="flex-1 bg-brand-navy/60 p-5 rounded-2xl border border-white/10 font-mono text-sm flex items-center gap-3 truncate text-brand-secondary font-bold">
                                <Globe size={14} /> {portalFullUrl}
                             </div>
                             <button onClick={copyPortalLink} className="bg-white text-brand-navy px-8 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-secondary hover:text-white transition-all">
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
    </div>
  );
};

export default SaasAdmin;
