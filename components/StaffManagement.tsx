
import React, { useState } from 'react';
import { 
  UserCog, 
  Stethoscope, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit,
  Shield,
  Briefcase,
  X,
  CheckCircle,
  Save,
  Building
} from 'lucide-react';
import { Professional, User, UserRole, Sede } from '../types';

interface StaffManagementProps {
  professionals: Professional[];
  users: User[];
  sedes: Sede[];
  onAddProfessional: (p: Professional) => void;
  onAddUser: (u: User) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ 
  professionals, 
  users, 
  sedes,
  onAddProfessional,
  onAddUser
}) => {
  const [activeTab, setActiveTab] = useState<'specialists' | 'staff'>('specialists');
  const [showModal, setShowModal] = useState<'specialist' | 'staff' | null>(null);
  
  const [specialistForm, setSpecialistForm] = useState({
    name: '',
    specialty: '',
    email: '',
    selectedSedes: [] as string[]
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: UserRole.RECEPCIONIST,
    selectedSedes: [] as string[]
  });

  const handleAddSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = 'u-' + Math.random().toString(36).substr(2, 5);
    const newProf: Professional = {
      id: 'p-' + Math.random().toString(36).substr(2, 5),
      name: specialistForm.name,
      specialty: specialistForm.specialty,
      sedeIds: specialistForm.selectedSedes,
      companyId: 'current-company',
      userId: userId,
      avatar: `https://i.pravatar.cc/150?u=${userId}`
    };
    onAddProfessional(newProf);
    setShowModal(null);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 5),
      name: staffForm.name,
      email: staffForm.email,
      role: staffForm.role,
      companyId: 'current-company',
      sedeIds: staffForm.selectedSedes,
      avatar: `https://i.pravatar.cc/150?u=${staffForm.email}`
    };
    onAddUser(newUser);
    setShowModal(null);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Gestión de Talento</h2>
          <p className="text-slate-500 font-medium mt-1">Administra especialistas médicos y personal administrativo.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
           <button 
            onClick={() => setActiveTab('specialists')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'specialists' ? 'bg-white text-brand-secondary shadow-md' : 'text-slate-400 hover:text-brand-navy'}`}
           >
             <Stethoscope size={14} /> Especialistas
           </button>
           <button 
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-white text-brand-navy shadow-md' : 'text-slate-400 hover:text-brand-navy'}`}
           >
             <UserCog size={14} /> Personal Staff
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Botón Añadir */}
        <button 
            onClick={() => setShowModal(activeTab === 'specialists' ? 'specialist' : 'staff')}
            className="group h-full min-h-[250px] bg-white rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-brand-secondary hover:bg-brand-secondary/[0.02] transition-all flex flex-col items-center justify-center p-10 space-y-4"
        >
            <div className="w-20 h-20 rounded-full bg-slate-50 group-hover:bg-brand-secondary/10 flex items-center justify-center text-slate-300 group-hover:text-brand-secondary transition-all">
                <Plus size={40} />
            </div>
            <div className="text-center">
                <p className="font-ubuntu font-bold text-slate-400 group-hover:text-brand-navy">Añadir {activeTab === 'specialists' ? 'Especialista' : 'Usuario'}</p>
                <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest mt-1">Registro de nuevo talento</p>
            </div>
        </button>

        {activeTab === 'specialists' ? (
          professionals.map(p => (
            <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 clinical-shadow group relative overflow-hidden">
               <div className="absolute right-0 top-0 p-6 flex gap-2 translate-x-10 group-hover:translate-x-0 transition-transform">
                  <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-secondary transition-colors"><Edit size={16} /></button>
                  <button className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
               </div>
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                     <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-ubuntu font-bold text-xl text-brand-navy">{p.name}</h4>
                    <p className="text-brand-secondary text-xs font-bold uppercase tracking-widest">{p.specialty}</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium bg-slate-50 p-3 rounded-2xl">
                     <Building size={16} /> {p.sedeIds.length} Sedes asignadas
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {p.sedeIds.map(sid => {
                        const sede = sedes.find(s => s.id === sid);
                        return <span key={sid} className="px-3 py-1 bg-brand-lightSecondary text-brand-secondary text-[9px] font-bold rounded-full border border-brand-secondary/20">{sede?.name || sid}</span>
                     })}
                  </div>
               </div>
            </div>
          ))
        ) : (
          users.map(u => (
            <div key={u.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 clinical-shadow group">
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                     <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-ubuntu font-bold text-xl text-brand-navy">{u.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Shield size={14} className="text-brand-accent" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</span>
                    </div>
                  </div>
               </div>
               <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                     <Mail size={16} /> {u.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                     <MapPin size={16} /> {u.sedeIds ? `${u.sedeIds.length} Sedes` : 'Acceso Global'}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Genérico para registro */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${activeTab === 'specialists' ? 'bg-brand-secondary/10 text-brand-secondary' : 'bg-brand-navy/10 text-brand-navy'} rounded-2xl flex items-center justify-center shadow-inner`}>
                       {activeTab === 'specialists' ? <Stethoscope size={28} /> : <UserCog size={28} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-ubuntu font-bold text-brand-navy leading-none">
                            {activeTab === 'specialists' ? 'Nuevo Especialista' : 'Nuevo Usuario Staff'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Configuración de Acceso</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(null)} className="text-slate-300 hover:text-brand-navy transition-colors p-2"><X size={32} /></button>
              </div>

              <form onSubmit={activeTab === 'specialists' ? handleAddSpecialist : handleAddStaff} className="p-10 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                       <input 
                         required 
                         className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner"
                         placeholder="Ej: Dr. Julian Casablancas"
                         value={activeTab === 'specialists' ? specialistForm.name : staffForm.name}
                         onChange={e => activeTab === 'specialists' ? setSpecialistForm({...specialistForm, name: e.target.value}) : setStaffForm({...staffForm, name: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                {activeTab === 'specialists' ? 'Especialidad' : 'Rol Administrativo'}
                            </label>
                            {activeTab === 'specialists' ? (
                                <input 
                                    required 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner"
                                    placeholder="Odontología..."
                                    value={specialistForm.specialty}
                                    onChange={e => setSpecialistForm({...specialistForm, specialty: e.target.value})}
                                />
                            ) : (
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-navy font-bold text-xs shadow-inner appearance-none"
                                    value={staffForm.role}
                                    onChange={e => setStaffForm({...staffForm, role: e.target.value as UserRole})}
                                >
                                    <option value={UserRole.ADMIN}>Administrador</option>
                                    <option value={UserRole.RECEPCIONIST}>Recepcionista</option>
                                </select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email de Acceso</label>
                            <input 
                                required type="email"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner"
                                placeholder="staff@beeclinic.com"
                                value={activeTab === 'specialists' ? specialistForm.email : staffForm.email}
                                onChange={e => activeTab === 'specialists' ? setSpecialistForm({...specialistForm, email: e.target.value}) : setStaffForm({...staffForm, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asignar Sedes (Múltiple)</label>
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                           {sedes.map(s => (
                             <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-200 text-brand-secondary focus:ring-brand-secondary"
                                    onChange={(e) => {
                                        const list = activeTab === 'specialists' ? specialistForm.selectedSedes : staffForm.selectedSedes;
                                        const newList = e.target.checked ? [...list, s.id] : list.filter(id => id !== s.id);
                                        activeTab === 'specialists' ? setSpecialistForm({...specialistForm, selectedSedes: newList}) : setStaffForm({...staffForm, selectedSedes: newList});
                                    }}
                                />
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-brand-navy transition-colors">{s.name}</span>
                             </label>
                           ))}
                        </div>
                    </div>
                 </div>

                 <button type="submit" className={`w-full py-5 ${activeTab === 'specialists' ? 'bg-brand-secondary shadow-brand-secondary/20' : 'bg-brand-navy shadow-brand-navy/20'} text-white rounded-[2rem] font-bold text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3`}>
                    <CheckCircle size={20} /> Registrar Miembro del Staff
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
