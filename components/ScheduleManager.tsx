
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Save, 
  Plus, 
  Trash2, 
  CalendarCheck, 
  Settings2, 
  CheckCircle, 
  Edit, 
  Phone, 
  MessageCircle, 
  X,
  Copy,
  Zap,
  CalendarOff
} from 'lucide-react';
import { Sede, DayAvailability, TimeInterval } from '../types';

interface ScheduleManagerProps {
  sedes: Sede[];
  onUpdateSede: (sede: Sede) => void;
  onAddSede: (sede: Sede) => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ sedes, onUpdateSede, onAddSede }) => {
  const [selectedSede, setSelectedSede] = useState<Sede>(sedes[0]);
  const [showSedeModal, setShowSedeModal] = useState<'edit' | 'add' | null>(null);
  const [sedeForm, setSedeForm] = useState<Partial<Sede>>({});
  
  // Estado local para la disponibilidad actual de la sede seleccionada
  const [localAvailability, setLocalAvailability] = useState<Record<string, DayAvailability>>({});

  useEffect(() => {
    if (selectedSede) {
      // Inicializar disponibilidad si no existe
      const initial: Record<string, DayAvailability> = {};
      DAYS.forEach(day => {
        initial[day] = selectedSede.availability?.[day] || {
          isOpen: day !== 'Domingo',
          intervals: [{ start: '09:00', end: '18:00' }]
        };
      });
      setLocalAvailability(initial);
    }
  }, [selectedSede]);

  const handleToggleDay = (day: string) => {
    setLocalAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const addInterval = (day: string) => {
    setLocalAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: true,
        intervals: [...prev[day].intervals, { start: '14:00', end: '16:00' }]
      }
    }));
  };

  const removeInterval = (day: string, index: number) => {
    setLocalAvailability(prev => {
      const newIntervals = prev[day].intervals.filter((_, i) => i !== index);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          intervals: newIntervals.length > 0 ? newIntervals : [{ start: '09:00', end: '18:00' }],
          isOpen: newIntervals.length > 0 ? prev[day].isOpen : false
        }
      };
    });
  };

  const updateInterval = (day: string, index: number, field: keyof TimeInterval, value: string) => {
    setLocalAvailability(prev => {
      const newIntervals = [...prev[day].intervals];
      newIntervals[index] = { ...newIntervals[index], [field]: value };
      return {
        ...prev,
        [day]: { ...prev[day], intervals: newIntervals }
      };
    });
  };

  const copyToAll = (sourceDay: string) => {
    const sourceConfig = localAvailability[sourceDay];
    const newAvail: Record<string, DayAvailability> = {};
    DAYS.forEach(day => {
      newAvail[day] = JSON.parse(JSON.stringify(sourceConfig));
    });
    setLocalAvailability(newAvail);
    alert(`Configuración de ${sourceDay} aplicada a toda la semana.`);
  };

  const handleSaveAll = () => {
    const updatedSede = { ...selectedSede, availability: localAvailability };
    onUpdateSede(updatedSede);
    alert("¡Horarios de atención actualizados con éxito!");
  };

  const handleEditSede = (sede: Sede) => {
    setSedeForm(sede);
    setShowSedeModal('edit');
  };

  const handleAddSede = () => {
    setSedeForm({ name: '', address: '', phone: '', whatsapp: '' });
    setShowSedeModal('add');
  };

  const handleSaveSedeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSedeModal === 'edit') {
      onUpdateSede(sedeForm as Sede);
      setSelectedSede(sedeForm as Sede);
    } else {
      const newSede = { 
        ...sedeForm, 
        id: 'sede-' + Math.random().toString(36).substr(2, 9),
        availability: localAvailability 
      } as Sede;
      onAddSede(newSede);
      setSelectedSede(newSede);
    }
    setShowSedeModal(null);
  };
  
  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
            <Settings2 size={14} /> Arquitectura de Operaciones
          </div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Gestión de Sedes</h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">Configura la disponibilidad horaria y datos de contacto de tus sucursales.</p>
        </div>
        <button 
          onClick={handleAddSede}
          className="flex items-center gap-3 bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-brand-navy/90 transition-all text-xs shadow-xl shadow-brand-navy/10 active:scale-95"
        >
          <Plus size={18} className="text-brand-secondary" /> Añadir Nueva Sede
        </button>
      </header>

      <div className="flex items-center gap-2 border-b border-slate-100 overflow-x-auto custom-scrollbar whitespace-nowrap bg-white/50 backdrop-blur-sm rounded-t-[2.5rem] px-4">
        {sedes.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedSede(s)}
            className={`px-8 py-5 text-[11px] font-bold transition-all relative uppercase tracking-widest ${
              selectedSede.id === s.id 
              ? 'text-brand-navy border-b-2 border-brand-secondary' 
              : 'text-slate-300 hover:text-brand-navy'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info de la Sede Seleccionada */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 clinical-shadow space-y-8 relative overflow-hidden">
            <div className="absolute right-6 top-6">
              <button 
                onClick={() => handleEditSede(selectedSede)}
                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-brand-secondary hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all flex items-center justify-center shadow-sm"
              >
                <Edit size={18} />
              </button>
            </div>
            
            <div className="w-16 h-16 bg-brand-lightSecondary rounded-3xl flex items-center justify-center text-brand-secondary shadow-inner">
              <MapPin size={32} />
            </div>
            
            <div>
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">{selectedSede.name}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">{selectedSede.address}</p>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-50">
               <div className="flex items-center gap-4 text-slate-600 text-sm font-bold">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone size={14} className="text-brand-secondary" /></div>
                  {selectedSede.phone}
               </div>
               <div className="flex items-center gap-4 text-slate-600 text-sm font-bold">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><MessageCircle size={14} className="text-green-500" /></div>
                  WhatsApp: {selectedSede.whatsapp}
               </div>
            </div>

            <div className="bg-brand-lightPrimary/50 p-6 rounded-[2rem] border border-brand-primary/10">
               <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Zap size={12} /> Nota de Sede
               </p>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Los pacientes verán estos horarios al agendar desde el portal web.
               </p>
            </div>
          </div>
        </div>

        {/* Gestor de Horarios Avanzado */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3.5rem] border border-slate-100 clinical-shadow overflow-hidden flex flex-col h-full">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div>
                <h3 className="font-ubuntu font-bold text-2xl text-brand-navy flex items-center gap-3">
                  <Clock className="text-brand-secondary" /> Disponibilidad Semanal
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Múltiples intervalos por jornada</p>
              </div>
              <button 
                onClick={handleSaveAll}
                className="flex items-center gap-3 bg-brand-secondary text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-2xl hover:bg-brand-secondary/90 transition-all text-xs active:scale-95 shadow-lg shadow-brand-secondary/20"
              >
                 <Save size={18} /> Guardar Cambios
              </button>
            </div>

            <div className="p-0 flex-1 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-300 text-[10px] font-bold uppercase tracking-widest bg-white border-b border-slate-50">
                      <th className="py-6 px-10 w-40">Día</th>
                      <th className="py-6 px-4">Intervalos de Atención</th>
                      <th className="py-6 px-10 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {DAYS.map(day => {
                      const config = localAvailability[day] || { isOpen: false, intervals: [] };
                      return (
                        <tr key={day} className={`group transition-all ${!config.isOpen ? 'bg-slate-50/30 opacity-70' : 'hover:bg-slate-50/20'}`}>
                          <td className="py-8 px-10">
                            <div className="flex flex-col gap-1">
                               <span className={`text-base font-ubuntu font-bold ${config.isOpen ? 'text-brand-navy' : 'text-slate-300'}`}>{day}</span>
                               <button 
                                onClick={() => handleToggleDay(day)}
                                className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${config.isOpen ? 'text-brand-secondary' : 'text-slate-400 hover:text-brand-navy'}`}
                               >
                                  {config.isOpen ? <CheckCircle size={12} /> : <CalendarOff size={12} />}
                                  {config.isOpen ? 'Abierto' : 'Cerrado'}
                               </button>
                            </div>
                          </td>
                          <td className="py-8 px-4">
                             {config.isOpen ? (
                               <div className="flex flex-wrap gap-3 items-center">
                                  {config.intervals.map((interval, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2.5 rounded-2xl shadow-sm hover:border-brand-secondary transition-all group/slot">
                                       <div className="flex items-center gap-2">
                                          <input 
                                            type="time" 
                                            value={interval.start}
                                            onChange={(e) => updateInterval(day, idx, 'start', e.target.value)}
                                            className="bg-transparent border-none text-[11px] font-bold text-brand-navy p-0 focus:ring-0 w-14" 
                                          />
                                          <span className="text-slate-200">—</span>
                                          <input 
                                            type="time" 
                                            value={interval.end}
                                            onChange={(e) => updateInterval(day, idx, 'end', e.target.value)}
                                            className="bg-transparent border-none text-[11px] font-bold text-brand-navy p-0 focus:ring-0 w-14" 
                                          />
                                       </div>
                                       {config.intervals.length > 1 && (
                                         <button 
                                          onClick={() => removeInterval(day, idx)}
                                          className="text-slate-200 hover:text-red-500 ml-1 transition-colors p-1"
                                         >
                                           <Trash2 size={12} />
                                         </button>
                                       )}
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => addInterval(day)}
                                    className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-brand-secondary hover:text-brand-secondary hover:bg-brand-lightSecondary transition-all"
                                    title="Añadir otro horario"
                                  >
                                     <Plus size={20} />
                                  </button>
                               </div>
                             ) : (
                               <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">No se reciben citas este día</span>
                             )}
                          </td>
                          <td className="py-8 px-10 text-right">
                             {config.isOpen && (
                               <button 
                                onClick={() => copyToAll(day)}
                                className="p-2.5 text-slate-300 hover:text-brand-primary hover:bg-brand-lightPrimary rounded-xl transition-all inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100"
                               >
                                  <Copy size={14} /> Replicar Semana
                               </button>
                             )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CREAR/EDITAR SEDE */}
      {showSedeModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-slate-100">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
              <div>
                <h3 className="text-2xl font-ubuntu font-bold text-brand-navy leading-none">
                  {showSedeModal === 'edit' ? 'Editar Sede' : 'Nueva Sede'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Configuración Geográfica</p>
              </div>
              <button onClick={() => setShowSedeModal(null)} className="text-slate-300 hover:text-brand-navy p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSaveSedeModal} className="p-10 space-y-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Sede Miraflores"
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-bold text-brand-navy shadow-inner outline-none"
                    value={sedeForm.name}
                    onChange={e => setSedeForm({...sedeForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dirección Exacta</label>
                  <input 
                    type="text" 
                    placeholder="Av. Salud 456, Lima"
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none"
                    value={sedeForm.address}
                    onChange={e => setSedeForm({...sedeForm, address: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input 
                      type="text" 
                      placeholder="01 2345678"
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-bold text-xs shadow-inner outline-none"
                      value={sedeForm.phone}
                      onChange={e => setSedeForm({...sedeForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-bold text-xs shadow-inner outline-none"
                      placeholder="51900000000"
                      value={sedeForm.whatsapp}
                      onChange={e => setSedeForm({...sedeForm, whatsapp: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold text-sm shadow-2xl hover:bg-brand-navy/90 transition-all active:scale-95 flex items-center justify-center gap-3">
                <CheckCircle size={20} className="text-brand-secondary" />
                {showSedeModal === 'edit' ? 'Actualizar Sede' : 'Registrar Sede'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
