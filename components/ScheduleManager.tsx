
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Save, 
  Plus, 
  Trash2, 
  Settings2, 
  CheckCircle, 
  Edit, 
  Phone, 
  MessageCircle, 
  X,
  Copy,
  Zap,
  CalendarOff,
  Layout,
  Loader2,
  Building
} from 'lucide-react';
import { Sede, DayAvailability, TimeInterval } from '../types';

interface ScheduleManagerProps {
  sedes: Sede[];
  onUpdateSede: (sede: Sede) => Promise<void>;
  onAddSede: (sede: Sede) => Promise<void>;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PRESETS = [
  { name: 'Mañana', intervals: [{ start: '08:00', end: '13:00' }] },
  { name: 'Tarde', intervals: [{ start: '14:00', end: '19:00' }] },
  { name: 'Partido', intervals: [{ start: '09:00', end: '13:00' }, { start: '15:00', end: '19:00' }] },
  { name: 'Completo', intervals: [{ start: '08:00', end: '18:00' }] }
];

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ sedes, onUpdateSede, onAddSede }) => {
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [showSedeModal, setShowSedeModal] = useState<'edit' | 'add' | null>(null);
  const [sedeForm, setSedeForm] = useState<Partial<Sede>>({ name: '', address: '', phone: '', whatsapp: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [localAvailability, setLocalAvailability] = useState<Record<string, DayAvailability>>({});

  useEffect(() => {
    if (sedes.length > 0 && !selectedSede) {
      setSelectedSede(sedes[0]);
    }
  }, [sedes, selectedSede]);

  useEffect(() => {
    if (selectedSede) {
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
    setLocalAvailability(prev => {
      const lastInterval = prev[day].intervals[prev[day].intervals.length - 1];
      const newStart = lastInterval ? lastInterval.end : '09:00';
      const newEnd = (parseInt(newStart.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          isOpen: true,
          intervals: [...prev[day].intervals, { start: newStart, end: newEnd }]
        }
      };
    });
  };

  const applyPreset = (day: string, intervals: TimeInterval[]) => {
    setLocalAvailability(prev => ({
      ...prev,
      [day]: { isOpen: true, intervals: [...intervals] }
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
          isOpen: newIntervals.length > 0
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

  const copyToWorkDays = (sourceDay: string) => {
    const sourceConfig = localAvailability[sourceDay];
    const newAvail: Record<string, DayAvailability> = { ...localAvailability };
    ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(day => {
      newAvail[day] = JSON.parse(JSON.stringify(sourceConfig));
    });
    setLocalAvailability(newAvail);
    alert(`Copiada la configuración de ${sourceDay} a los días laborables.`);
  };

  const handleSaveAll = async () => {
    if (!selectedSede) return;
    setIsSaving(true);
    try {
      const updatedSede = { ...selectedSede, availability: localAvailability };
      await onUpdateSede(updatedSede);
      alert("¡Sincronizado con la nube exitosamente!");
    } catch (e) {
      alert("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSede = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSede: Sede = {
      id: 'sede-' + Math.random().toString(36).substr(2, 5),
      name: sedeForm.name || 'Nueva Sede',
      address: sedeForm.address || '',
      phone: sedeForm.phone || '',
      whatsapp: sedeForm.whatsapp || '',
      companyId: '', // App.tsx maneja esto
      availability: localAvailability
    };
    await onAddSede(newSede);
    setShowSedeModal(null);
    setSedeForm({ name: '', address: '', phone: '', whatsapp: '' });
  };

  if (sedes.length === 0 && !showSedeModal) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 animate-fade-in bg-white rounded-[4rem] border-2 border-dashed border-slate-100 mx-4">
        <div className="w-24 h-24 bg-brand-lightSecondary rounded-full flex items-center justify-center text-brand-secondary mb-8">
          <Building size={48} />
        </div>
        <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">No hay sedes registradas</h3>
        <p className="text-slate-400 mt-4 max-w-md font-medium">Configura tu primer centro de atención para comenzar a gestionar horarios y citas.</p>
        <button 
          onClick={() => setShowSedeModal('add')}
          className="mt-10 bg-brand-navy text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-brand-secondary transition-all"
        >
          <Plus size={20} /> Registrar Primera Sede
        </button>
      </div>
    );
  }

  if (!selectedSede) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4 animate-fade-in">
        <Loader2 className="animate-spin text-brand-secondary" size={40} />
        <p className="font-ubuntu font-bold tracking-widest uppercase text-[10px]">Cargando Centros Bee...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <Layout size={14} /> Gestión de Operaciones
          </div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Sedes y Disponibilidad</h2>
          <p className="text-slate-500 font-medium text-sm mt-2">Configura los turnos específicos de atención para cada sucursal.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSedeModal('add')}
            className="flex items-center gap-2 bg-white text-brand-navy px-6 py-3 rounded-2xl font-bold border border-slate-200 hover:border-brand-secondary transition-all text-xs shadow-sm"
          >
            <Plus size={16} /> Nueva Sede
          </button>
          <button 
            disabled={isSaving}
            onClick={handleSaveAll}
            className="flex items-center gap-3 bg-brand-navy text-white px-8 py-3 rounded-2xl font-bold hover:shadow-2xl transition-all text-xs shadow-xl shadow-brand-navy/10 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : <><Save size={18} className="text-brand-secondary" /> Guardar Cambios</>}
          </button>
        </div>
      </header>

      <div className="flex bg-slate-100/50 p-1.5 rounded-[2.5rem] border border-slate-200/50 mx-4 overflow-x-auto no-scrollbar">
        {sedes.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedSede(s)}
            className={`px-8 py-3.5 rounded-[2rem] text-[11px] font-bold transition-all whitespace-nowrap ${
              selectedSede?.id === s.id 
              ? 'bg-white text-brand-navy shadow-sm border border-slate-100' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 clinical-shadow space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="w-16 h-16 bg-brand-lightSecondary rounded-3xl flex items-center justify-center text-brand-secondary shadow-inner">
                <MapPin size={32} />
              </div>
              <button 
                onClick={() => { if(selectedSede) { setSedeForm(selectedSede); setShowSedeModal('edit'); } }}
                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-brand-secondary hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all flex items-center justify-center"
              >
                <Edit size={18} />
              </button>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">{selectedSede.name}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">{selectedSede.address}</p>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-3 relative z-10">
               <div className="flex items-center gap-3 text-slate-600 text-[11px] font-bold">
                  <Phone size={14} className="text-brand-secondary" /> {selectedSede.phone}
               </div>
               <div className="flex items-center gap-3 text-slate-600 text-[11px] font-bold">
                  <MessageCircle size={14} className="text-green-500" /> WhatsApp: {selectedSede.whatsapp}
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3.5rem] border border-slate-100 clinical-shadow overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-ubuntu font-bold text-xl text-brand-navy flex items-center gap-2">
                <Clock className="text-brand-secondary" size={20} /> Turnos de Atención
              </h3>
              <button onClick={() => copyToWorkDays('Lunes')} className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all flex items-center gap-2 uppercase tracking-widest">
                <Copy size={12} /> Copiar Lunes
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              {DAYS.map(day => {
                const config = localAvailability[day] || { isOpen: false, intervals: [] };
                return (
                  <div key={day} className={`p-8 transition-all flex flex-col sm:flex-row gap-6 ${!config.isOpen ? 'bg-slate-50/30' : 'hover:bg-slate-50/10'}`}>
                    <div className="w-32 flex flex-col gap-2">
                      <span className={`text-lg font-ubuntu font-bold ${config.isOpen ? 'text-brand-navy' : 'text-slate-300'}`}>{day}</span>
                      <button 
                        onClick={() => handleToggleDay(day)}
                        className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${config.isOpen ? 'text-brand-secondary' : 'text-slate-300'}`}
                      >
                        {config.isOpen ? <CheckCircle size={14} /> : <CalendarOff size={14} />}
                        {config.isOpen ? 'Atendiendo' : 'Cerrado'}
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      {config.isOpen ? (
                        <>
                          <div className="flex flex-wrap gap-3">
                            {config.intervals.map((interval, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 pl-4 pr-2 py-2 rounded-2xl shadow-sm hover:border-brand-secondary transition-all group animate-fade-in">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="time" 
                                    value={interval.start}
                                    onChange={(e) => updateInterval(day, idx, 'start', e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-brand-navy p-0 focus:ring-0 w-16" 
                                  />
                                  <span className="text-slate-200 text-[10px]">—</span>
                                  <input 
                                    type="time" 
                                    value={interval.end}
                                    onChange={(e) => updateInterval(day, idx, 'end', e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-brand-navy p-0 focus:ring-0 w-16" 
                                  />
                                </div>
                                <button 
                                  onClick={() => removeInterval(day, idx)}
                                  className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => addInterval(day)}
                              className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-brand-secondary hover:text-brand-secondary hover:bg-brand-lightSecondary transition-all"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="h-20 flex items-center border border-dashed border-slate-200 rounded-3xl justify-center bg-slate-100/30">
                           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
                             <CalendarOff size={14} /> Sin turnos disponibles
                           </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showSedeModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-fade-in">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-ubuntu font-bold text-brand-navy">
                {showSedeModal === 'edit' ? 'Modificar Sede' : 'Registrar Nueva Sede'}
              </h3>
              <button onClick={() => setShowSedeModal(null)} className="text-slate-300 hover:text-brand-navy p-2"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateSede} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                  <input required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-bold text-brand-navy outline-none" value={sedeForm.name} onChange={e => setSedeForm({...sedeForm, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ubicación</label>
                  <input required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary font-medium text-sm outline-none" value={sedeForm.address} onChange={e => setSedeForm({...sedeForm, address: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-brand-navy text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2">
                <CheckCircle size={18} /> {showSedeModal === 'edit' ? 'Guardar Cambios' : 'Crear Sede'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
