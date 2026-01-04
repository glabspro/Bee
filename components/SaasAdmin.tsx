
import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  Palette, 
  Image as ImageIcon, 
  Globe,
  Settings,
  X,
  Save,
  Activity,
  Monitor,
  CheckCircle2,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { Company, UserRole } from '../types';

interface SaasAdminProps {
  companies: Company[];
  onAddCompany: (c: Company) => void;
  onSelectCompany?: (companyId: string) => void;
  userRole?: UserRole;
  currentCompanyId?: string;
}

const SaasAdmin: React.FC<SaasAdminProps> = ({ 
  companies, 
  onAddCompany, 
  onSelectCompany, 
  userRole = UserRole.ADMIN,
  currentCompanyId 
}) => {
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'settings'>(isSuperAdmin ? 'tenants' : 'settings');

  // Seleccionar la compañía actual para edición (Contexto de Clínica)
  const myCompany = companies.find(c => c.id === currentCompanyId) || companies[0];

  const [editForm, setEditForm] = useState({
    name: myCompany?.name || '',
    logo: myCompany?.logo || '',
    portalHero: myCompany?.portalHero || '',
    primaryColor: myCompany?.primaryColor || '#714B67'
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Company = {
      ...myCompany,
      name: editForm.name,
      logo: editForm.logo,
      portalHero: editForm.portalHero,
      primaryColor: editForm.primaryColor,
    };
    onAddCompany(updated);
    alert("¡Identidad de clínica actualizada correctamente!");
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const newComp: Company = {
      id: 'comp-' + Math.random().toString(36).substr(2, 5),
      name: editForm.name,
      logo: editForm.logo || 'https://images.unsplash.com/photo-1631217816660-ad4830193ca5?auto=format&fit=crop&q=80&w=200',
      portalHero: editForm.portalHero || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053',
      primaryColor: editForm.primaryColor,
      active: true
    };
    onAddCompany(newComp);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Header Contextual */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className={isSuperAdmin ? 'text-brand-secondary' : 'text-brand-primary'} /> 
             {isSuperAdmin ? 'Panel SaaS Global' : 'Configuración de Marca'}
          </div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">
            {isSuperAdmin ? 'Ecosistema Bee' : 'Identidad Clínica'}
          </h2>
          <p className="text-slate-500 font-medium mt-3 text-lg max-w-2xl">
            {isSuperAdmin 
              ? 'Gestión centralizada de todos los centros médicos asociados a tu red.' 
              : 'Personaliza la experiencia visual que tienen tus pacientes al agendar citas.'}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
             <button 
              onClick={() => setActiveSubTab('tenants')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'tenants' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}
             >
               <LayoutGrid size={14} /> Red de Clínicas
             </button>
             <button 
              onClick={() => setActiveSubTab('settings')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'settings' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}
             >
               <Palette size={14} /> Marca Blanca
             </button>
          </div>
        )}
      </header>

      {/* Vista de Gestión de Red (Solo Super Admin) */}
      {isSuperAdmin && activeSubTab === 'tenants' && (
        <div className="space-y-10 animate-fade-in">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Clínicas Registradas</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-brand-navy/90 shadow-xl transition-all"
              >
                <Plus size={20} /> Nueva Clínica Partner
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {companies.map(c => (
                <div key={c.id} className="bg-white rounded-[3.5rem] border border-slate-100 clinical-shadow group overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all">
                  <div className="h-40 relative bg-slate-900">
                    <img src={c.portalHero} className="w-full h-full object-cover opacity-60" alt="Hero" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                      <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-2xl p-2 border border-slate-50 translate-y-4">
                        <img src={c.logo} className="w-full h-full object-contain" alt="Logo" />
                      </div>
                      <div className="px-3 py-1 bg-green-500 text-white text-[9px] font-bold rounded-lg uppercase tracking-widest shadow-lg">Activo</div>
                    </div>
                  </div>
                  <div className="p-10 pt-14 flex-1 flex flex-col">
                    <h4 className="text-2xl font-ubuntu font-bold text-brand-navy mb-1">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">ID: {c.id}</p>
                    
                    <button 
                      onClick={() => onSelectCompany && onSelectCompany(c.id)}
                      className="w-full py-4 bg-slate-50 text-brand-navy border border-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-navy hover:text-white transition-all group/btn"
                    >
                      Entrar a Gestión Clínica <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Vista de Personalización de Marca (Admin & Super Admin) */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
           <div className="bg-white rounded-[3.5rem] border border-slate-100 p-12 clinical-shadow space-y-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial de la Clínica</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-brand-navy shadow-inner"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL del Logotipo</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs shadow-inner"
                    value={editForm.logo}
                    onChange={e => setEditForm({...editForm, logo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hero del Portal</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs shadow-inner"
                    value={editForm.portalHero}
                    onChange={e => setEditForm({...editForm, portalHero: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color Temático</label>
                  <div className="flex gap-4">
                    <input 
                      type="color"
                      className="w-14 h-14 rounded-2xl border-none cursor-pointer shadow-inner"
                      value={editForm.primaryColor}
                      onChange={e => setEditForm({...editForm, primaryColor: e.target.value})}
                    />
                    <input 
                      className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-mono text-xs font-bold text-slate-500"
                      value={editForm.primaryColor}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleUpdate}
                className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold text-sm shadow-2xl hover:bg-brand-navy/90 transition-all flex items-center justify-center gap-3 mt-6"
              >
                <Save size={20} /> Guardar Identidad Corporativa
              </button>
           </div>

           {/* Preview Section */}
           <div className="space-y-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                <Monitor size={14} /> Vista Previa en Tiempo Real
              </p>
              
              <div className="bg-slate-900 rounded-[3.5rem] p-5 shadow-2xl border-8 border-slate-800 relative aspect-video overflow-hidden group">
                 <div className="absolute inset-0 opacity-40">
                    <img src={editForm.portalHero} className="w-full h-full object-cover" alt="Preview" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                 
                 <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8">
                    <div className="w-16 h-16 bg-white rounded-2xl mb-4 p-2 shadow-2xl">
                       <img src={editForm.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                    </div>
                    <h3 className="text-2xl font-ubuntu font-bold mb-1">{editForm.name}</h3>
                    <p className="text-[9px] text-white/50 mb-6 font-bold uppercase tracking-widest">Portal de Pacientes</p>
                    <div className="px-6 py-2.5 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-xl" style={{ backgroundColor: editForm.primaryColor }}>
                       Agendar Mi Cita
                    </div>
                 </div>
              </div>

              <div className="bg-brand-lightPrimary/50 p-8 rounded-[3rem] border border-brand-primary/10 flex gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                    <Settings size={24} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-brand-navy text-sm font-bold">Instancia Federada</p>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Los cambios de marca se propagan instantáneamente a todos los subdominios y correos de notificación del sistema Bee.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal Nueva Clínica (Tenant) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/70 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-slate-100 relative">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Nuevo Tenant Clínico</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-brand-navy p-2"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreateNew} className="space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                        <input 
                            placeholder="Ej: OdontoPlus Centro Médico" 
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-sm shadow-inner outline-none"
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Paleta de Marca (Base)</label>
                        <input 
                            type="color"
                            className="w-full h-14 bg-slate-50 rounded-2xl cursor-pointer border-none shadow-inner"
                            value={editForm.primaryColor}
                            onChange={e => setEditForm({...editForm, primaryColor: e.target.value})}
                        />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-brand-secondary text-white rounded-[2rem] font-bold shadow-2xl flex items-center justify-center gap-3 hover:bg-brand-secondary/90 transition-all">
                    <CheckCircle2 size={20} /> Desplegar Nueva Instancia
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
