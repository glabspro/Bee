
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  Phone,
  User as UserIcon,
  MessageCircle,
  CheckCircle2,
  Building,
  Sparkles,
  ArrowRight,
  IdCard
} from 'lucide-react';
import { Sede, Appointment, AppointmentStatus, Company } from '../types';

type Step = 'sede' | 'service' | 'info' | 'schedule' | 'confirm';

interface PatientPortalProps {
  company: Company;
  sedes: Sede[];
  onBack: () => void;
  onPortalBooking: (data: any) => Promise<boolean>;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ company, sedes, onBack, onPortalBooking }) => {
  const [step, setStep] = useState<Step>('sede');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState({
    sede: null as Sede | null,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientDni: '',
    countryCode: '+51',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });

  const primaryColor = company.primaryColor || '#00BFA5';

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const success = await onPortalBooking({
      patientName: booking.patientName,
      patientPhone: `${booking.countryCode}${booking.patientPhone}`,
      patientEmail: booking.patientEmail,
      patientDni: booking.patientDni,
      date: booking.date,
      time: booking.time,
      sedeId: booking.sede?.id
    });

    if (success) {
      const clinicWhatsapp = booking.sede?.whatsapp || "51900000000"; 
      const message = `Hola! Reservé una cita en ${company.name}:\n\n👤 *Nombre:* ${booking.patientName}\n📍 *Sede:* ${booking.sede?.name}\n📅 *Fecha:* ${booking.date}\n⏰ *Hora:* ${booking.time}\n\nEspero confirmación!`;
      const waUrl = `https://wa.me/${clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      alert("¡Cita registrada! Redirigiendo a WhatsApp para confirmación final.");
      onBack();
    }
    setIsSubmitting(false);
  };

  const steps: Step[] = ['sede', 'service', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter overflow-x-hidden">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
            <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex flex-col">
            <span className="font-ubuntu font-bold text-brand-navy text-lg leading-none">{company.name}</span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: primaryColor }}>Portal Citas</span>
          </div>
        </div>
        <button onClick={onBack} className="text-slate-500 font-bold text-[10px] flex items-center gap-2 uppercase tracking-widest border border-slate-200 px-4 py-2 rounded-lg">
          <ArrowLeft size={14} /> Salir
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        <div className="w-full h-[300px] relative overflow-hidden flex items-center justify-center bg-[#0D0D33]">
           <img src={company.portalHero} className="w-full h-full object-cover opacity-50 blur-[1px]" alt="Hero" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
           <div className="relative z-10 text-center px-6 animate-fade-in">
              <h1 className="text-white text-4xl sm:text-6xl font-ubuntu font-bold tracking-tight">
                Agenda tu cita <br/> en <span style={{ color: primaryColor }}>minutos</span>
              </h1>
           </div>
        </div>

        <div className="max-w-4xl w-full -mt-16 relative z-20 px-4 pb-20">
            <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto no-scrollbar py-6 bg-white rounded-3xl px-10 shadow-xl border border-slate-100">
            {steps.map((s, idx) => (
                <div key={s} className="flex items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${idx <= currentIdx ? 'text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`} style={{ backgroundColor: idx <= currentIdx ? primaryColor : undefined }}>{idx + 1}</div>
                  {idx < steps.length - 1 && <div className={`w-12 h-1 mx-4 rounded-full ${idx < currentIdx ? 'opacity-100' : 'bg-slate-100'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />}
                </div>
            ))}
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden min-h-[500px]">
                {step === 'sede' && (
                  <div className="p-12 space-y-8 animate-fade-in text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Selecciona una Sede</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sedes.map(s => (
                            <button key={s.id} onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('service'); }} className="p-8 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-brand-primary hover:bg-white hover:shadow-xl transition-all text-left group">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}><MapPin size={24} /></div>
                                <h4 className="font-ubuntu font-bold text-brand-navy text-xl">{s.name}</h4>
                                <p className="text-slate-400 font-medium text-xs mt-2">{s.address}</p>
                            </button>
                        ))}
                      </div>
                  </div>
                )}

                {step === 'service' && (
                  <div className="p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full text-center">
                    <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">¿Qué necesitas?</h2>
                    <button onClick={() => setStep('info')} className="w-full p-8 bg-white rounded-2xl border-2 shadow-sm transition-all text-left flex items-center gap-6" style={{ borderColor: primaryColor }}>
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}><Building size={32} /></div>
                        <div>
                            <h4 className="font-ubuntu font-bold text-brand-navy text-xl">Atención Podológica</h4>
                            <p className="text-slate-400 text-xs font-medium">Evaluación integral profesional</p>
                        </div>
                    </button>
                    <button onClick={() => setStep('sede')} className="text-slate-400 font-bold text-[10px] uppercase">Volver</button>
                  </div>
                )}

                {step === 'info' && (
                  <div className="p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full">
                    <h2 className="text-3xl font-ubuntu font-bold text-brand-navy text-center">Tus Datos</h2>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><UserIcon size={14} style={{ color: primaryColor }} /> Nombre</label>
                            <input type="text" value={booking.patientName} onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-brand-navy outline-none" style={{ '--tw-ring-color': primaryColor } as any} placeholder="Nombre completo" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={14} style={{ color: primaryColor }} /> WhatsApp</label>
                              <input type="tel" value={booking.patientPhone} onChange={(e) => setBooking(prev => ({...prev, patientPhone: e.target.value}))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-brand-navy outline-none" style={{ '--tw-ring-color': primaryColor } as any} placeholder="900000000" />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><IdCard size={14} style={{ color: primaryColor }} /> DNI / Rut</label>
                              <input type="text" value={booking.patientDni} onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value}))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-brand-navy outline-none" style={{ '--tw-ring-color': primaryColor } as any} placeholder="Opcional" />
                          </div>
                        </div>
                        <button disabled={!booking.patientName || !booking.patientPhone} onClick={() => setStep('schedule')} className="w-full py-5 text-white rounded-xl font-bold text-lg shadow-xl mt-4" style={{ backgroundColor: primaryColor }}>Siguiente</button>
                    </div>
                  </div>
                )}

                {step === 'schedule' && (
                  <div className="p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full text-center">
                    <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Fecha y Hora</h2>
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={booking.date} onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-brand-navy outline-none mb-6" style={{ '--tw-ring-color': primaryColor } as any} />
                    <div className="grid grid-cols-3 gap-2">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                            <button key={t} onClick={() => setBooking(prev => ({...prev, time: t}))} className={`py-4 rounded-xl font-bold text-sm border-2 ${booking.time === t ? 'text-white' : 'bg-white text-slate-400 border-slate-50'}`} style={{ backgroundColor: booking.time === t ? primaryColor : undefined, borderColor: booking.time === t ? primaryColor : undefined }}>{t}</button>
                        ))}
                    </div>
                    <button disabled={!booking.time} onClick={() => setStep('confirm')} className="w-full py-5 text-white rounded-xl font-bold text-lg shadow-xl mt-8" style={{ backgroundColor: primaryColor }}>Confirmar</button>
                  </div>
                )}

                {step === 'confirm' && (
                  <div className="p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full text-center">
                    <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Casi Listo</h2>
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left space-y-4">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Paciente</span>
                            <span className="font-bold text-brand-navy">{booking.patientName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sede</span>
                            <span className="font-bold text-brand-navy">{booking.sede?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Horario</span>
                            <span className="font-bold" style={{ color: primaryColor }}>{booking.date} @ {booking.time}</span>
                        </div>
                    </div>
                    <button disabled={isSubmitting} onClick={handleConfirmBooking} className="w-full py-6 text-white rounded-xl font-bold text-lg shadow-2xl flex items-center justify-center gap-4" style={{ backgroundColor: primaryColor }}>
                        {isSubmitting ? 'Registrando...' : <><MessageCircle size={24} /> Confirmar vía WhatsApp</>}
                    </button>
                  </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
