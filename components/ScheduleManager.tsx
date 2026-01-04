
import React, { useState } from 'react';
import { Clock, MapPin, Save, Plus, Trash2, CalendarCheck, Settings2, CheckCircle, Edit, Phone, MessageCircle, X } from 'lucide-react';
import { Sede } from '../types';

interface ScheduleManagerProps {
  sedes: Sede[];
  onUpdateSede: (sede: Sede) => void;
  onAddSede: (sede: Sede) => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ sedes, onUpdateSede, onAddSede }) => {
  const [selectedSede, setSelectedSede] = useState<Sede>(sedes[0]);
  const [showSedeModal, setShowSedeModal] = useState<'edit' | 'add' | null>(null);
  const [sedeForm, setSedeForm] = useState<Partial<Sede>>({});
  
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleEditSede = (sede: Sede) => {
    setSedeForm(sede);
    setShowSedeModal('edit');
  };

  const handleAddSede = () => {
    setSedeForm({ name: '', address: '', phone: '', whatsapp: '' });
    setShowSedeModal('add');
  };

  const handleSaveSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSedeModal === 'edit') {
      onUpdateSede(sedeForm as Sede);
      setSelectedSede(sedeForm as Sede);
    } else {
      const newSede = { ...sedeForm, id: 'sede-' + Math.random().toString(36).substr(2, 9) } as Sede;
      onAddSede(newSede);
      setSelectedSede(newSede);
    }
    setShowSedeModal(null);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-xs uppercase tracking-widest mb-2">
            <Settings2 size={14} /> Configuración de Operaciones
          </div>
          <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Gestión de Sedes</h2>
          <p className="text-slate-500 text-sm mt-1">Configura los datos de contacto y disponibilidad de tus sucursales.</p>
        </div>
        <button 
          onClick={handleAddSede}
          className="flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-navy/90 transition-all text-sm shadow-lg shadow-brand-navy/10"
        >
          <Plus size={18} /> Añadir Sede
        </button>
      </header>

      <div className="flex items-center gap-2 border-b border-slate-100 overflow-x-auto custom-scrollbar whitespace-nowrap">
        {sedes.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedSede(s)}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${
              selectedSede.id === s.id 
              ? 'text-brand-secondary border-b-2 border-brand-secondary bg-teal-50/30' 
              : 'text-slate-400 hover:text-brand-navy hover:bg-slate-50'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info de la Sede Seleccionada */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-4xl border border-slate-200 clinical-shadow space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4">
              <button 
                onClick={() => handleEditSede(selectedSede)}
                className="p-2 text-slate-400 hover:text-brand-secondary hover:bg-slate-100 rounded-lg transition-all"
              >
                <Edit size={20} />
              </button>
            </div>
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-brand-secondary shadow-inner">
              <MapPin size={28} />
            </div>
            <div>
              <h3 className="text-xl font-ubuntu font-bold text-brand-navy">{selectedSede.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedSede.address}</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
               <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <Phone size={16} className="text-brand-secondary" /> {selectedSede.phone}
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <MessageCircle size={16} className="text-green-500" /> WhatsApp: {selectedSede.whatsapp}
               </div>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-4xl border border-slate-200 clinical-shadow overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-lg text-brand-navy flex items-center gap-2">
                <CalendarCheck size={20} /> Disponibilidad Semanal
              </h3>
              <button className="flex items-center gap-2 bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-xl transition-all text-xs">
                 <Save size={16} /> Guardar Horarios
              </button>
            </div>

            <div className="p-0">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white border-b border-slate-100">
                      <th className="py-5 px-8">Día</th>
                      <th className="py-5 px-8">Intervalos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {days.map(day => (
                      <tr key={day} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 px-8 font-bold text-slate-700">{day}</td>
                        <td className="py-6 px-8">
                           <div className="flex flex-wrap gap-3 items-center">
                              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg group/slot hover:border-brand-secondary transition-all">
                                 <input type="time" defaultValue="09:00" className="bg-transparent border-none text-xs font-bold text-slate-700 p-0 focus:ring-0 w-16" />
                                 <span className="text-slate-300">—</span>
                                 <input type="time" defaultValue="18:00" className="bg-transparent border-none text-xs font-bold text-slate-700 p-0 focus:ring-0 w-16" />
                                 <button className="text-slate-300 hover:text-red-500 ml-1 transition-colors"><Trash2 size={14} /></button>
                              </div>
                              <button className="w-9 h-9 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-brand-secondary hover:text-brand-secondary transition-all">
                                 <Plus size={18} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CREAR/EDITAR SEDE */}
      {showSedeModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-4xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-ubuntu font-bold text-brand-navy">
                {showSedeModal === 'edit' ? 'Editar Sede' : 'Nueva Sede'}
              </h3>
              <button onClick={() => setShowSedeModal(null)} className="text-slate-400 hover:text-brand-navy"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveSede} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre de la Sede</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium mt-1"
                    value={sedeForm.name}
                    onChange={e => setSedeForm({...sedeForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium mt-1"
                    value={sedeForm.address}
                    onChange={e => setSedeForm({...sedeForm, address: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium mt-1"
                      value={sedeForm.phone}
                      onChange={e => setSedeForm({...sedeForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp (Solo números)</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium mt-1"
                      placeholder="Ej: 51900000000"
                      value={sedeForm.whatsapp}
                      onChange={e => setSedeForm({...sedeForm, whatsapp: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold shadow-lg shadow-brand-secondary/20">
                {showSedeModal === 'edit' ? 'Actualizar Sede' : 'Crear Sede'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
