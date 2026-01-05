
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
  IdCard,
  Mail,
  Building,
  Sparkles
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
    patientDni: '',
    patientEmail: '',
    patientPhone: '',
    countryCode: '+51',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });

  const primaryColor = company.primaryColor || '#714B67';

  const handleConfirmBooking = () => {
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      patientName: booking.patientName,
      patientPhone: `${booking.countryCode}${booking.patientPhone}`,
      patientDni: booking.patientDni,
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
    const message = `Hola ${company.name}! Me gustaría agendar una *Consulta General*:\n\n👤 *Nombre:* ${booking.patientName}\n🆔 *DNI:* ${booking.patientDni}\n📱 *Teléfono:* ${booking.countryCode} ${booking.patientPhone}\n📍 *Sede:* ${booking.sede?.name}\n📅 *Fecha:* ${booking.date}\n⏰ *Hora:* ${booking.time}\n\nEspero su confirmación. Gracias!`;
    const waUrl = `https://wa.me/${clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    alert("¡Cita solicitada exitosamente! Estamos redirigiéndote a WhatsApp para finalizar la confirmación.");
    onBack();
  };

  const steps: Step[] = ['sede', 'service', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      {/* Navbar Dinámico */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Building className="text-slate-300" />
            )}
          </div>
          <span className="font-ubuntu font-bold text-brand-navy text-xl">
            {company.name} 
            <span className="text-[10px] uppercase block tracking-widest font-bold" style={{ color: primaryColor }}>
              Portal de Pacientes
            </span>
          </span>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-brand-navy font-bold text-xs flex items-center gap-2 transition-colors uppercase tracking-widest">
          <ArrowLeft size={16} /> Salir del Portal
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Dinámico */}
        <div className="w-full h-[400px] relative overflow-hidden flex items-center justify-center bg-brand-navy">
           <img 
            src={company.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"} 
            className="w-full h-full object-cover opacity-60 blur-[1px]" 
            alt="Hero Background" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent"></div>
           <div className="relative z-10 text-center space-y-4 px-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest">
                 <Sparkles size={14} className="text-brand-accent" /> Reserva tu cita hoy
              </div>
              <h1 className="text-white text-6xl font-ubuntu font-bold tracking-tight drop-shadow-2xl">Cuidamos de ti</h1>
              <p className="text-white/90 text-xl font-medium max-w-lg mx-auto">Reserva tu atención de forma rápida y sencilla en nuestra plataforma digital.</p>
           </div>
        </div>

        <div className="max-w-4xl w-full -mt-24 relative z-20 px-6 pb-20">
            {/* Indicador de Pasos */}
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto py-6 bg-white/70 backdrop-blur-xl rounded-[3rem] px-10 shadow-2xl border border-white/50">
            {steps.map((s, idx) => (
                <div key={s} className="flex items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    idx <= currentIdx 
                    ? 'text-white shadow-xl scale-110' 
                    : 'bg-white text-slate-300 border border-slate-100'
                }`} style={{ backgroundColor: idx <= currentIdx ? primaryColor : undefined }}>
                    {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                    <div className={`w-6 md:w-12 h-1.5 mx-3 rounded-full transition-all duration-500 ${idx < currentIdx ? 'opacity-100' : 'bg-slate-200'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />
                )}
                </div>
            ))}
            </div>

            {step === 'sede' && (
            <div className="space-y-10 animate-fade-in">
                <div className="text-center bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Selecciona tu ubicación</h2>
                  <p className="text-slate-500 mt-4 text-lg">Elige la sede que te resulte más conveniente.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {sedes.filter(s => s.companyId === company.id).map(s => (
                    <button 
                    key={s.id}
                    onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('service'); }}
                    className="p-10 bg-white rounded-[3.5rem] border-2 border-transparent hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all text-left group flex flex-col items-center sm:items-start relative overflow-hidden shadow-sm"
                    style={{ '--hover-color': primaryColor } as any}
                    >
                    <div className="absolute -right-8 -top-8 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Hexagon size={140} />
                    </div>
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 mb-8 group-hover:scale-110 transition-all shadow-inner" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>
                        <MapPin size={40} />
                    </div>
                    <h4 className="font-ubuntu font-bold text-brand-navy text-2xl mb-2">{s.name}</h4>
                    <p className="text-slate-400 font-medium mb-6">{s.address}</p>
                    <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs" style={{ color: primaryColor }}>
                        Agendar Aquí <ChevronRight size={20} />
                    </div>
                    </button>
                ))}
                </div>
            </div>
            )}

            {step === 'service' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">¿Qué servicio necesitas?</h2>
                  <p className="text-slate-500 mt-4">Nuestros especialistas están listos para atenderte.</p>
                </div>
                <button 
                onClick={() => setStep('info')}
                className="w-full p-10 bg-white rounded-[3.5rem] border-2 shadow-xl transition-all text-left flex items-center gap-8 group"
                style={{ borderColor: primaryColor }}
                >
                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                    <Stethoscope size={40} />
                </div>
                <div className="flex-1">
                    <h4 className="font-ubuntu font-bold text-brand-navy text-2xl mb-1">Consulta General</h4>
                    <p className="text-slate-500 font-medium italic">Atención médica integral</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                    <CheckCircle2 size={24} />
                </div>
                </button>
                <button onClick={() => setStep('sede')} className="w-full text-slate-400 hover:text-brand-navy font-bold text-xs uppercase tracking-widest text-center">Cambiar de sede</button>
            </div>
            )}

            {step === 'info' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Tus Datos</h2>
                  <p className="text-slate-500 mt-4">Ingresa tu información de contacto.</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8">
                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <UserIcon size={16} style={{ color: primaryColor }} /> Nombre Completo
                      </label>
                      <input 
                      type="text"
                      value={booking.patientName}
                      onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))}
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-medium text-lg shadow-inner outline-none transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="Tu nombre completo"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <IdCard size={16} style={{ color: primaryColor }} /> DNI / Identificación
                      </label>
                      <input 
                      type="text"
                      value={booking.patientDni}
                      onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value}))}
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-medium text-lg shadow-inner outline-none transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="Número de documento"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Phone size={16} style={{ color: primaryColor }} /> WhatsApp de contacto
                      </label>
                      <div className="flex gap-3">
                        <select 
                            value={booking.countryCode}
                            onChange={(e) => setBooking(prev => ({...prev, countryCode: e.target.value}))}
                            className="bg-slate-50 border-none rounded-2xl py-5 pl-5 pr-10 focus:ring-2 text-sm font-bold shadow-inner outline-none"
                            style={{ '--tw-ring-color': primaryColor } as any}
                        >
                            <option value="+51">🇵🇪 +51</option>
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+52">🇲🇽 +52</option>
                        </select>
                        <input 
                          type="tel"
                          value={booking.patientPhone}
                          onChange={(e) => setBooking(prev => ({...prev, patientPhone: e.target.value}))}
                          className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-medium text-lg shadow-inner outline-none transition-all"
                          style={{ '--tw-ring-color': primaryColor } as any}
                          placeholder="900 000 000"
                        />
                      </div>
                  </div>
                  
                  <button 
                      disabled={!booking.patientName || !booking.patientDni || booking.patientPhone.length < 7}
                      onClick={() => setStep('schedule')}
                      className="w-full py-6 text-white rounded-[2rem] font-bold text-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                      style={{ backgroundColor: primaryColor }}
                  >
                      Siguiente: Horarios
                  </button>
                </div>
            </div>
            )}

            {step === 'schedule' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Fecha y Hora</h2>
                  <p className="text-slate-500 mt-4">Selecciona cuándo deseas venir.</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8">
                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de la Cita</label>
                      <input 
                      type="date"
                      value={booking.date}
                      onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))}
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-medium text-lg shadow-inner outline-none"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      />
                  </div>
                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hora Disponible</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                            <button 
                            key={t}
                            onClick={() => setBooking(prev => ({...prev, time: t}))}
                            className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                                booking.time === t ? 'text-white shadow-lg' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
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
                      className="w-full py-6 text-white rounded-[2rem] font-bold text-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 mt-4"
                      style={{ backgroundColor: primaryColor }}
                  >
                      Ver Resumen
                  </button>
                </div>
            </div>
            )}

            {step === 'confirm' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Confirmación</h2>
                  <p className="text-slate-500 mt-4">Verifica los detalles antes de solicitar.</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8">
                  <div className="space-y-4 text-brand-navy">
                      <div className="flex justify-between border-b border-slate-50 pb-4">
                          <span className="text-slate-400 font-medium">Paciente:</span>
                          <span className="font-bold">{booking.patientName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-4">
                          <span className="text-slate-400 font-medium">Sede:</span>
                          <span className="font-bold">{booking.sede?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-4">
                          <span className="text-slate-400 font-medium">Fecha y Hora:</span>
                          <span className="font-bold">{booking.date} a las {booking.time}</span>
                      </div>
                  </div>
                  
                  <button 
                      onClick={handleConfirmBooking}
                      className="w-full py-7 text-white rounded-[2.5rem] font-bold text-2xl shadow-2xl transition-all active:scale-95 mt-6 flex items-center justify-center gap-4"
                      style={{ backgroundColor: primaryColor }}
                  >
                      <MessageCircle size={28} /> Solicitar vía WhatsApp
                  </button>
                </div>
            </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
