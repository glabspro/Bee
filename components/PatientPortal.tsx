
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
  Hexagon,
  Stethoscope,
  Building,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Sede, Appointment, AppointmentStatus, Company } from '../types';

type Step = 'sede' | 'service' | 'info' | 'schedule' | 'confirm';

interface PatientPortalProps {
  company: Company;
  sedes: Sede[];
  onBack: () => void;
  onAppointmentCreated: (apt: Appointment) => void;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ company, sedes, onBack, onAppointmentCreated }) => {
  const [step, setStep] = useState<Step>('sede');
  const [booking, setBooking] = useState({
    sede: null as Sede | null,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    countryCode: '+51',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });

  const primaryColor = company.primaryColor || '#00BFA5';

  const handleConfirmBooking = () => {
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      patientName: booking.patientName,
      patientPhone: `${booking.countryCode}${booking.patientPhone}`,
      patientDni: '', // Se deja vacío para registrar presencialmente
      patientEmail: booking.patientEmail || undefined,
      serviceId: 's1', 
      sedeId: booking.sede?.id || sedes[0]?.id || 'default',
      professionalId: 'p1', 
      date: booking.date,
      time: booking.time,
      status: AppointmentStatus.PENDING,
      bookingCode: 'BEE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      companyId: company.id
    };

    onAppointmentCreated(newAppointment);

    const clinicWhatsapp = booking.sede?.whatsapp || "51900000000"; 
    const message = `Hola! Me gustaría agendar una *Consulta General* en ${company.name}:\n\n👤 *Nombre:* ${booking.patientName}\n📱 *Teléfono:* ${booking.countryCode} ${booking.patientPhone}\n📍 *Sede:* ${booking.sede?.name}\n📅 *Fecha:* ${booking.date}\n⏰ *Hora:* ${booking.time}\n\nEspero su confirmación. Gracias!`;
    const waUrl = `https://wa.me/${clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    alert("¡Cita solicitada exitosamente! Te hemos redirigido a WhatsApp para finalizar la confirmación.");
    onBack();
  };

  const steps: Step[] = ['sede', 'service', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter overflow-x-hidden">
      {/* Navbar Minimalista */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Building className="text-slate-300" size={20} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-ubuntu font-bold text-brand-navy text-base sm:text-xl leading-none truncate max-w-[150px] sm:max-w-none">
                {company.name}
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: primaryColor }}>
                Portal Citas
            </span>
          </div>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-brand-navy font-bold text-[9px] sm:text-[10px] flex items-center gap-2 transition-colors uppercase tracking-widest border border-slate-200 px-3 sm:px-4 py-2 rounded-lg">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Volver</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Compacto y Profesional */}
        <div className="w-full h-[300px] sm:h-[400px] relative overflow-hidden flex items-center justify-center bg-[#0D0D33]">
           <img 
            src={company.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"} 
            className="w-full h-full object-cover opacity-50" 
            alt="Hero Background" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
           <div className="relative z-10 text-center space-y-4 px-6 max-w-4xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                 <Sparkles size={12} className="text-brand-primary" /> Reserva 100% Digital
              </div>
              <h1 className="text-white text-4xl sm:text-6xl font-ubuntu font-bold tracking-tight">
                Agenda tu cita <br className="hidden sm:block"/> en <span style={{ color: primaryColor }}>minutos</span>
              </h1>
           </div>
        </div>

        <div className="max-w-4xl w-full -mt-12 sm:-mt-16 relative z-20 px-4 sm:px-6 pb-20">
            {/* Indicador de Pasos Rediseñado */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 overflow-x-auto no-scrollbar py-6 bg-white rounded-2xl sm:rounded-3xl px-6 sm:px-10 shadow-xl border border-slate-100">
            {steps.map((s, idx) => (
                <div key={s} className="flex items-center flex-shrink-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 ${
                    idx <= currentIdx 
                    ? 'text-white shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-300 border border-slate-100'
                }`} style={{ backgroundColor: idx <= currentIdx ? primaryColor : undefined }}>
                    {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                    <div className={`w-6 sm:w-12 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${idx < currentIdx ? 'opacity-100' : 'bg-slate-100'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />
                )}
                </div>
            ))}
            </div>

            {/* Contenido de Pasos con Redondeo Profesional */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                {step === 'sede' && (
                <div className="p-8 sm:p-12 space-y-8 animate-fade-in">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-ubuntu font-bold text-brand-navy">Selecciona una Sede</h2>
                        <p className="text-slate-400 text-sm font-medium">Elige el centro médico más conveniente para ti.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sedes.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('service'); }}
                            className="p-6 sm:p-8 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-brand-primary hover:bg-white hover:shadow-xl transition-all text-left group flex flex-col items-start relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                                <MapPin size={24} />
                            </div>
                            <h4 className="font-ubuntu font-bold text-brand-navy text-xl mb-1">{s.name}</h4>
                            <p className="text-slate-400 font-medium text-xs mb-4 line-clamp-1">{s.address}</p>
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px]" style={{ color: primaryColor }}>
                                Seleccionar <ArrowRight size={14} />
                            </div>
                        </button>
                    ))}
                    </div>
                </div>
                )}

                {step === 'service' && (
                <div className="p-8 sm:p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-ubuntu font-bold text-brand-navy">¿Qué servicio necesitas?</h2>
                        <p className="text-slate-400 text-sm font-medium">Contamos con atención especializada para tus pies.</p>
                    </div>
                    <button 
                        onClick={() => setStep('info')}
                        className="w-full p-6 sm:p-8 bg-white rounded-2xl border-2 shadow-sm transition-all text-left flex items-center gap-6 group"
                        style={{ borderColor: primaryColor }}
                    >
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            <Stethoscope size={32} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-ubuntu font-bold text-brand-navy text-lg sm:text-xl">Consulta General</h4>
                            <p className="text-slate-400 text-xs font-medium">Evaluación integral y tratamiento</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: primaryColor }}>
                            <CheckCircle2 size={18} />
                        </div>
                    </button>
                    <button onClick={() => setStep('sede')} className="w-full text-slate-400 hover:text-brand-navy font-bold text-[10px] uppercase tracking-widest text-center">Regresar a sedes</button>
                </div>
                )}

                {step === 'info' && (
                <div className="p-8 sm:p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-ubuntu font-bold text-brand-navy">Tus Datos</h2>
                        <p className="text-slate-400 text-sm font-medium">Ingresa tu información para coordinar la cita.</p>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <UserIcon size={14} style={{ color: primaryColor }} /> Nombre Completo
                            </label>
                            <input 
                                type="text"
                                value={booking.patientName}
                                onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-lg text-brand-navy shadow-inner outline-none transition-all placeholder:text-slate-200"
                                style={{ '--tw-ring-color': primaryColor } as any}
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={14} style={{ color: primaryColor }} /> WhatsApp
                            </label>
                            <div className="flex gap-2">
                                <select 
                                    value={booking.countryCode}
                                    onChange={(e) => setBooking(prev => ({...prev, countryCode: e.target.value}))}
                                    className="bg-slate-50 border-none rounded-xl py-4 pl-4 pr-8 focus:ring-2 text-xs font-bold shadow-inner outline-none"
                                    style={{ '--tw-ring-color': primaryColor } as any}
                                >
                                    <option value="+51">🇵🇪 +51</option>
                                    <option value="+57">🇨🇴 +57</option>
                                    <option value="+52">🇲🇽 +52</option>
                                    <option value="+56">🇨🇱 +56</option>
                                </select>
                                <input 
                                    type="tel"
                                    value={booking.patientPhone}
                                    onChange={(e) => setBooking(prev => ({...prev, patientPhone: e.target.value}))}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-lg text-brand-navy shadow-inner outline-none transition-all placeholder:text-slate-200"
                                    style={{ '--tw-ring-color': primaryColor } as any}
                                    placeholder="900 000 000"
                                />
                            </div>
                        </div>
                        
                        <button 
                            disabled={!booking.patientName || booking.patientPhone.length < 8}
                            onClick={() => setStep('schedule')}
                            className="w-full py-5 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Ver Disponibilidad <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
                )}

                {step === 'schedule' && (
                <div className="p-8 sm:p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-ubuntu font-bold text-brand-navy">Fecha y Hora</h2>
                        <p className="text-slate-400 text-sm font-medium">Selecciona el momento ideal para tu visita.</p>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                            <input 
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={booking.date}
                                onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 font-bold text-lg text-brand-navy shadow-inner outline-none"
                                style={{ '--tw-ring-color': primaryColor } as any}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Turnos Disponibles</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setBooking(prev => ({...prev, time: t}))}
                                        className={`py-4 rounded-xl font-bold text-sm transition-all border-2 ${
                                            booking.time === t ? 'text-white shadow-md' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                                        }`}
                                        style={{ 
                                            backgroundColor: booking.time === t ? primaryColor : undefined,
                                            borderColor: booking.time === t ? primaryColor : undefined
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            disabled={!booking.date || !booking.time}
                            onClick={() => setStep('confirm')}
                            className="w-full py-5 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Revisar Resumen
                        </button>
                    </div>
                </div>
                )}

                {step === 'confirm' && (
                <div className="p-8 sm:p-12 space-y-8 animate-fade-in max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-ubuntu font-bold text-brand-navy">Confirmación</h2>
                        <p className="text-slate-400 text-sm font-medium">Estás a un paso de agendar tu cita.</p>
                    </div>
                    <div className="space-y-4 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</span>
                            <span className="font-bold text-brand-navy text-sm">{booking.patientName}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sede</span>
                            <span className="font-bold text-brand-navy text-sm truncate max-w-[150px]">{booking.sede?.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha y Hora</span>
                            <div className="text-right">
                                <span className="font-bold text-brand-navy text-sm block">{booking.date}</span>
                                <span className="font-bold text-xs" style={{ color: primaryColor }}>{booking.time} hrs</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleConfirmBooking}
                        className="w-full py-6 text-white rounded-xl font-bold text-lg shadow-2xl transition-all active:scale-95 mt-6 flex items-center justify-center gap-4 hover:brightness-105"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <MessageCircle size={24} /> Agendar vía WhatsApp
                    </button>

                    <p className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] px-4">
                        Al confirmar te enviaremos a WhatsApp para validar tu turno de forma oficial.
                    </p>
                </div>
                )}
            </div>
        </div>
      </main>
      
      {/* Footer del Portal Mejorado */}
      <footer className="py-10 bg-white border-t border-slate-100 text-center px-6">
         <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-brand-primary" />
            </div>
            <span className="font-ubuntu font-bold text-brand-navy tracking-tight text-base">Ecosistema Feet Care</span>
         </div>
         <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">© 2025 Plataforma de Gestión Clínica – Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default PatientPortal;
