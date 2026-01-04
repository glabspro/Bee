
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
  CheckCircle2
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

  // VISTA PARA ADMIN DE CLÍNICA (Personalización de Marca)
  if (!isSuperAdmin) {
    return (
      <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
        <header>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <Palette size={14} /> Marca Blanca & Identidad Visual
          </div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">Tu Portal Público</h2>
          <p className="text-slate-500 font-medium mt-3 text-lg">Personaliza cómo te ven tus pacientes en el portal de agendamiento web.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Formulario de Edición */}
           <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 clinical-shadow space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial de la Clínica</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-brand-navy shadow-inner"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL del Logotipo (PNG/JPG)</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs shadow-inner"
                    placeholder="https://ejemplo.com/logo.png"
                    value={editForm.logo}
                    onChange={e => setEditForm({...editForm, logo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fondo del Portal (Hero Image)</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-xs shadow-inner"
                    placeholder="https://ejemplo.com/fondo.jpg"
                    value={editForm.portalHero}
                    onChange={e => setEditForm({...editForm, portalHero: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color Principal de Marca</label>
                  <div className="flex gap-4">
                    <input 
                      type="color"
                      className="w-14 h-14 rounded-2xl border-none cursor-pointer overflow-hidden shadow-inner"
                      value={editForm.primaryColor}
                      onChange={e => setEditForm({...editForm, primaryColor: e.target.value})}
                    />
                    <input 
                      className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-mono text-xs font-bold text-slate-500 shadow-inner"
                      value={editForm.primaryColor}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleUpdate}
                className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold text-sm shadow-2xl shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all flex items-center justify-center gap-3 mt-6"
              >
                <Save size={20} /> Guardar Identidad de Clínica
              </button>
           </div>

           {/* Previsualización en Tiempo Real */}
           <div className="space-y-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                <Monitor size={14} /> Vista Previa del Portal
              </p>
              
              <div className="bg-slate-900 rounded-[3.5rem] p-5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-8 border-slate-800 relative aspect-video overflow-hidden group">
                 <div className="absolute inset-0 opacity-50 group-hover:scale-105 transition-transform duration-1000">
                    <img src={editForm.portalHero} className="w-full h-full object-cover" alt="Preview" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                 
                 <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-2xl mb-4 p-2 shadow-2xl transform group-hover:rotate-6 transition-transform">
                       <img src={editForm.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                    </div>
                    <h3 className="text-3xl font-ubuntu font-bold mb-2">{editForm.name}</h3>
                    <p className="text-xs text-white/70 mb-6 font-medium">Portal de Agendamiento Web</p>
                    <div className="px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl" style={{ backgroundColor: editForm.primaryColor }}>
                       Agendar Mi Cita
                    </div>
                 </div>
              </div>

              <div className="bg-brand-lightSecondary p-8 rounded-[2.5rem] border border-brand-secondary/20 flex gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary flex-shrink-0">
                    <Globe size={24} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-brand-navy text-sm font-bold">Portal Público Activo</p>
                    <p className="text-brand-secondary text-xs font-medium leading-relaxed">
                      Este portal es accesible para tus pacientes 24/7. Cualquier cambio aquí se aplica de forma inmediata a tu marca blanca.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // VISTA PARA SUPER ADMIN (Gestión Global de Tenencias)
  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-navy font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className="text-brand-secondary" /> SaaS Global Control
          </div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">Ecosistema de Clínicas</h2>
          <p className="text-slate-500 font-medium mt-3 text-lg">Administra todas las instancias, clientes y marca blanca del sistema.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-secondary text-white px-10 py-4 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-brand-secondary/90 shadow-2xl shadow-brand-secondary/30 transition-all text-sm group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Nueva Clínica Partner
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {companies.map(c => (
          <div key={c.id} className="bg-white rounded-[3.5rem] border border-slate-100 clinical-shadow group relative overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all">
             <div className="h-40 relative bg-slate-900 overflow-hidden">
                <img src={c.portalHero} className="w-full h-full object-cover opacity-60" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                   <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl p-2 border border-slate-50">
                      <img src={c.logo} className="w-full h-full object-contain rounded-2xl" alt="Logo" />
                   </div>
                   <div className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-bold rounded-full uppercase border border-green-200">Activo</div>
                </div>
             </div>
             <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-ubuntu font-bold text-brand-navy mb-1">{c.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Tenant ID: {c.id}</p>
                <button 
                  onClick={() => onSelectCompany && onSelectCompany(c.id)}
                  className="w-full py-4 bg-brand-navy text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20"
                >
                  <ExternalLink size={16} /> Entrar al Panel del Cliente
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear Nueva Clínica (SaaS) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] bg-brand-navy/70 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 shadow-2xl animate-fade-in border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Nuevo Tenant Clínico</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-brand-navy p-2"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreateNew} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input 
                      placeholder="Ej: Clínica Dental Premium" 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-sm shadow-inner outline-none"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color de Marca</label>
                    <input 
                      type="color"
                      className="w-full h-14 bg-slate-50 rounded-2xl cursor-pointer border-none"
                      value={editForm.primaryColor}
                      onChange={e => setEditForm({...editForm, primaryColor: e.target.value})}
                    />
                 </div>
                 <button type="submit" className="w-full py-5 bg-brand-secondary text-white rounded-2xl font-bold shadow-xl shadow-brand-secondary/20 flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} /> Desplegar Instancia Clínica
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
