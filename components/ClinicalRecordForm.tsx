
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  PlusCircle, 
  Activity,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicalHistoryEntry } from '../types';
import { summarizeClinicalNotes, suggestDiagnosis } from '../services/geminiService';

interface SessionDraft {
  id: string;
  date: string;
  time: string;
}

interface ClinicalRecordFormProps {
  appointment: Appointment;
  onClose: () => void;
  onSaveRecord: (patientId: string, entry: ClinicalHistoryEntry) => void;
  onScheduleSessions: (apts: Appointment[]) => void;
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({ 
  appointment, 
  onClose, 
  onSaveRecord, 
  onScheduleSessions 
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isTreatmentPlan, setIsTreatmentPlan] = useState(false);
  const [numSessions, setNumSessions] = useState(3);
  const [sessions, setSessions] = useState<SessionDraft[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Generador automático de sesiones
  useEffect(() => {
    if (isTreatmentPlan && sessions.length === 0) {
      const drafts: SessionDraft[] = [];
      const startDate = new Date();
      for (let i = 1; i <= numSessions; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * 7)); // Una semana de diferencia cada una
        drafts.push({
          id: `draft-${i}`,
          date: nextDate.toISOString().split('T')[0],
          time: appointment.time
        });
      }
      setSessions(drafts);
    }
  }, [isTreatmentPlan, numSessions, appointment.time]);

  const handleAiAssistant = async () => {
    if (!notes || notes.length < 10) {
      alert("Por favor ingrese más detalles para que la IA pueda analizarlos.");
      return;
    }
    setIsAiLoading(true);
    try {
      const summary = await summarizeClinicalNotes(notes);
      const aiSuggestions = await suggestDiagnosis(notes);
      setRecommendations(prev => prev + (prev ? '\n\n' : '') + "--- Sugerencia IA ---\n" + summary);
      if (aiSuggestions?.suggestions) {
        setDiagnosis(prev => prev + (prev ? '\n' : '') + "Hallazgos IA: " + aiSuggestions.suggestions.join(', '));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    // 1. Guardar Entrada Histórica
    const entry: ClinicalHistoryEntry = {
      id: 'entry-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      professionalId: appointment.professionalId,
      diagnosis,
      notes,
      recommendations,
      appointmentId: appointment.id
    };
    onSaveRecord(appointment.patientId || 'unknown', entry);

    // 2. Si hay plan, crear citas futuras
    if (isTreatmentPlan && sessions.length > 0) {
      const futureApts: Appointment[] = sessions.map(s => ({
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        patientDni: appointment.patientDni,
        patientId: appointment.patientId,
        serviceId: appointment.serviceId,
        sedeId: appointment.sedeId,
        professionalId: appointment.professionalId,
        date: s.date,
        time: s.time,
        status: AppointmentStatus.CONFIRMED,
        bookingCode: 'BEE-PLAN-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        notes: `Sesión de Seguimiento: Plan de Tratamiento iniciado el ${entry.date}`,
        // Fix: Added missing companyId property to match the Appointment type
        companyId: appointment.companyId
      }));
      onScheduleSessions(futureApts);
    }

    alert("Atención finalizada. Historial actualizado y sesiones agendadas.");
    onClose();
  };

  const addSession = () => {
    const lastSession = sessions[sessions.length - 1];
    const newDate = lastSession ? new Date(lastSession.date) : new Date();
    newDate.setDate(newDate.getDate() + 7);
    
    setSessions([...sessions, {
      id: `draft-${Date.now()}`,
      date: newDate.toISOString().split('T')[0],
      time: appointment.time
    }]);
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const updateSession = (id: string, field: keyof SessionDraft, value: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-navy hover:shadow-lg transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Registro Clínico</h2>
            <div className="flex items-center gap-3 mt-1.5">
               <span className="bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-secondary/20">Sesión en Curso</span>
               <p className="text-slate-400 text-xs font-medium">Paciente: <span className="text-brand-navy font-bold">{appointment.patientName}</span></p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            disabled={isAiLoading}
            onClick={handleAiAssistant}
            className="flex items-center gap-3 bg-white border-2 border-slate-100 text-brand-navy px-8 py-4 rounded-2xl font-bold text-sm hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-50 group"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-brand-primary group-hover:scale-125 transition-transform" />}
            Asistente Copilot IA
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 bg-brand-navy text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-2xl shadow-brand-navy/30 hover:bg-brand-navy/90 active:scale-95 transition-all"
          >
            <Save size={20} /> Finalizar Atención
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Lado Izquierdo: Formulario Clínico */}
        <div className="xl:col-span-7 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm space-y-10">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-secondary/10 flex items-center justify-center text-brand-secondary"><FileText size={14} /></div>
                Evolución y Hallazgos
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe aquí los detalles clínicos encontrados hoy..."
                className="w-full p-8 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-brand-secondary min-h-[300px] text-brand-navy font-medium leading-relaxed placeholder:text-slate-300 shadow-inner resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary"><Stethoscope size={14} /></div>
                  Diagnóstico
                </label>
                <textarea 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Diagnóstico técnico..."
                  className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary min-h-[140px] text-sm font-bold text-brand-navy shadow-inner resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent"><AlertCircle size={14} /></div>
                  Recomendaciones
                </label>
                <textarea 
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Instrucciones post-atención..."
                  className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-accent min-h-[140px] text-sm font-medium text-slate-600 shadow-inner resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Plan de Tratamiento Avanzado */}
        <div className="xl:col-span-5 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-navy/5 text-brand-navy rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-ubuntu font-bold text-xl text-brand-navy">Plan Evolutivo</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestión de Continuidad</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isTreatmentPlan} onChange={() => setIsTreatmentPlan(!isTreatmentPlan)} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-100 rounded-full peer peer-checked:bg-brand-secondary transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner border border-slate-200"></div>
              </label>
            </div>

            {!isTreatmentPlan ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Calendar size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Activa el interruptor para proyectar sesiones futuras en la agenda automáticamente.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in flex-1 flex flex-col">
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número de Sesiones</label>
                    <span className="text-brand-navy font-ubuntu font-bold text-xl">{sessions.length}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={sessions.length}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value);
                      if (newCount > sessions.length) {
                         const toAdd = newCount - sessions.length;
                         const drafts = [...sessions];
                         for(let i=0; i<toAdd; i++) {
                            const last = drafts[drafts.length-1];
                            const nextDate = new Date(last ? last.date : new Date());
                            nextDate.setDate(nextDate.getDate() + 7);
                            drafts.push({ id: `draft-${Date.now()}-${i}`, date: nextDate.toISOString().split('T')[0], time: appointment.time });
                         }
                         setSessions(drafts);
                      } else {
                         setSessions(sessions.slice(0, newCount));
                      }
                    }}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-secondary"
                  />
                  <div className="flex justify-between mt-3 px-1">
                     {[1, 3, 6, 9, 12].map(n => <span key={n} className="text-[8px] font-bold text-slate-300">{n}</span>)}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[400px]">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="group relative bg-white p-5 rounded-2xl border border-slate-100 hover:border-brand-secondary transition-all flex items-center gap-6 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                        {index + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-1.5">
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha</span>
                           <input 
                             type="date" 
                             value={session.date}
                             onChange={(e) => updateSession(session.id, 'date', e.target.value)}
                             className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-[11px] font-bold text-brand-navy focus:ring-1 focus:ring-brand-secondary"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hora</span>
                           <input 
                             type="time" 
                             value={session.time}
                             onChange={(e) => updateSession(session.id, 'time', e.target.value)}
                             className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-[11px] font-bold text-brand-navy focus:ring-1 focus:ring-brand-secondary"
                           />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeSession(session.id)}
                        className="text-slate-200 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addSession}
                  className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:border-brand-secondary hover:text-brand-secondary transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={16} /> Añadir Sesión Manual
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-primary p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-brand-accent" />
                </div>
                <h4 className="font-ubuntu font-bold text-sm uppercase tracking-[0.2em]">Asistencia Técnica</h4>
             </div>
             <p className="text-white/60 text-xs leading-relaxed font-medium relative z-10">
                Al finalizar, las sesiones proyectadas se bloquearán automáticamente en la **Agenda Maestra** de la sede seleccionada, notificando al paciente por su canal de contacto.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordForm;
