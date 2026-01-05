
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft,
  Phone,
  User as UserIcon,
  MessageCircle,
  Building,
  ArrowRight,
  IdCard,
  Navigation,
  ChevronRight,
  CheckCircle2,
  Loader2,
  CalendarCheck,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Sede, Company } from '../types';

type Step = 'sede' | 'info' | 'schedule' | 'confirm';

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

  // Validación de teléfono: Debe tener exactamente 9 dígitos para Perú
  const isPhoneValid = useMemo(() => {
    const digits = booking.patientPhone.replace(/\D/g, '');
    return digits.length === 9;
  }, [booking.patientPhone]);

  const isInfoStepComplete = useMemo(() => {
    // Nombre obligatorio (mínimo 3 letras) y Teléfono obligatorio (9 dígitos)
    return booking.patientName.trim().length >= 3 && isPhoneValid;
  }, [booking.patientName, isPhoneValid]);

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
      onBack();
    }
    setIsSubmitting(false);
  };

  const getMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const steps: Step[] = ['sede', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-inter overflow-x-hidden text-brand-navy">
      {/* Header Fijo con Blur - Mobile Ready */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 md:px-12 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm transition-transform active:scale-95">
            <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-ubuntu font-bold text-brand-navy text-lg leading-none tracking-tight">{company.name}</span>
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-400 mt-0.5">Citas Online</span>
          </div>
        </div>
        <button 
          onClick={onBack} 
          className="text-slate-400 font-bold text-[9px] flex items-center gap-1.5 uppercase tracking-widest bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl active:bg-slate-100 transition-all"
        >
          <ArrowLeft size={12} /> Salir
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section - Centrado Total para móvil */}
        <div className="w-full h-[320px] md:h-[400px] relative overflow-hidden flex items-center justify-center bg-brand-navy">
           <img 
            src={company.portalHero} 
            className="w-full h-full object-cover opacity-40 scale-105" 
            alt="Clinic Hero" 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-brand-navy/50 to-[#F8FAFC]"></div>
           <div className="relative z-10 text-center px-6 max-w-2xl animate-fade-in flex flex-col items-center">
              <h1 className="text-white text-4xl md:text-6xl font-ubuntu font-bold tracking-tight drop-shadow-2xl text-balance leading-[1.1]">
                Cuidado experto <br/> para tus <span className="text-brand-primary italic">pies</span>
              </h1>
              <p className="text-white/90 font-medium text-sm md:text-xl mt-6 max-w-md mx-auto leading-relaxed drop-shadow-md">
                Agenda tu atención profesional hoy mismo desde tu celular.
              </p>
           </div>
        </div>

        {/* Flujo Principal - Contenedor Centrado */}
        <div className="max-w-4xl w-full -mt-12 relative z-20 px-4 pb-20">
            
            {/* Indicador de Progreso Odoo Style */}
            <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto no-scrollbar py-5 bg-white/95 backdrop-blur-md rounded-[2rem] px-6 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-white">
            {steps.map((s, idx) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                            idx < currentIdx ? 'bg-green-100 text-brand-primary' : 
                            idx === currentIdx ? 'text-white shadow-lg scale-110 ring-4 ring-brand-primary/10' : 
                            'bg-slate-100 text-slate-300'
                            }`} 
                            style={{ backgroundColor: idx === currentIdx ? primaryColor : undefined }}
                        >
                            {idx < currentIdx ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={`flex-1 min-w-[15px] h-[2px] rounded-full transition-all duration-500 ${idx < currentIdx ? 'opacity-100' : 'bg-slate-100'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />
                    )}
                </React.Fragment>
            ))}
            </div>

            {/* Card de Contenido */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Paso 1: Sedes */}
                {step === 'sede' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in flex-1">
                      <div className="text-center">
                        <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">¿Dónde te atenderás?</h2>
                        <p className="text-slate-400 text-sm font-medium mt-2">Selecciona la sede más cercana a ti.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sedes.map(s => (
                            <div key={s.id} className="group relative">
                              <div className="w-full p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all text-left flex flex-col h-full overflow-hidden">
                                  <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                        <MapPin size={24} />
                                    </div>
                                    <a 
                                      href={getMapsUrl(s.address)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-primary hover:text-white transition-all border border-slate-100"
                                      title="Google Maps"
                                    >
                                      <Navigation size={18} />
                                    </a>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-ubuntu font-bold text-xl group-hover:text-brand-primary transition-colors mb-2">{s.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.address}</p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Phone size={12} className="text-brand-primary" /> {s.phone || 'Sede Central'}
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('info'); }}
                                    className="mt-8 w-full py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    Elegir Sede <ArrowRight size={14} />
                                  </button>
                              </div>
                            </div>
                        ))}
                      </div>

                      {sedes.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center">
                           <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando centros de atención...</p>
                        </div>
                      )}
                  </div>
                )}

                {/* Paso 2: Datos del Paciente */}
                {step === 'info' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Tus Datos</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Ingresa tu información para tu atención en <b>Podología Integral</b>.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <UserIcon size={12} style={{ color: primaryColor }} /> Nombre Completo <span className="text-red-400">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={booking.patientName} 
                              onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))} 
                              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all" 
                              style={{ '--tw-ring-color': primaryColor } as any} 
                              placeholder="Ej: Juan Pérez" 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={12} style={{ color: primaryColor }} /> WhatsApp <span className="text-red-400">*</span>
                              </label>
                              <div className="flex gap-2">
                                <div className="bg-slate-50 px-4 py-4 rounded-2xl font-bold text-slate-400 shadow-inner flex items-center text-sm">+51</div>
                                <input 
                                  type="tel" 
                                  value={booking.patientPhone} 
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    setBooking(prev => ({...prev, patientPhone: val}));
                                  }} 
                                  className={`flex-1 px-6 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all ${
                                    booking.patientPhone.length > 0 && !isPhoneValid ? 'border-red-200' : 'border-transparent'
                                  }`} 
                                  style={{ '--tw-ring-color': primaryColor } as any} 
                                  placeholder="987654321" 
                                />
                              </div>
                              {booking.patientPhone.length > 0 && !isPhoneValid && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2 ml-1 flex items-center gap-1 animate-pulse">
                                  <AlertCircle size={12} /> El número debe tener 9 dígitos
                                </p>
                              )}
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <IdCard size={12} style={{ color: primaryColor }} /> DNI <span className="text-slate-300 font-normal italic lowercase">(Opcional)</span>
                              </label>
                              <input 
                                type="text" 
                                value={booking.patientDni} 
                                onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value.replace(/\D/g, '').slice(0, 12)}))} 
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all" 
                                style={{ '--tw-ring-color': primaryColor } as any} 
                                placeholder="Opcional" 
                              />
                          </div>
                        </div>

                        <div className="pt-6">
                          <button 
                            disabled={!isInfoStepComplete} 
                            onClick={() => setStep('schedule')} 
                            className="w-full py-5 text-white rounded-[1.5rem] font-bold text-base shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3" 
                            style={{ backgroundColor: primaryColor }}
                          >
                            Ver Disponibilidad <ArrowRight size={18} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setStep('sede')} 
                          className="w-full text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-brand-navy transition-colors mt-4"
                        >
                          <ArrowLeft size={12} /> Regresar a sedes
                        </button>
                    </div>
                  </div>
                )}

                {/* Paso 3: Horario */}
                {step === 'schedule' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-2xl mx-auto w-full text-center flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Horario Disponible</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Elige el día y la hora de tu preferencia.</p>
                    </div>

                    <div className="space-y-8">
                      <div className="relative max-w-xs mx-auto">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]} 
                          value={booking.date} 
                          onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))} 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none text-base shadow-inner appearance-none transition-all" 
                          style={{ '--tw-ring-color': primaryColor } as any} 
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setBooking(prev => ({...prev, time: t}))} 
                                className={`py-4 rounded-xl font-ubuntu font-bold text-base border-2 transition-all duration-300 active:scale-95 ${booking.time === t ? 'text-white shadow-lg' : 'bg-white text-slate-400 border-slate-50 hover:border-brand-primary/20'}`} 
                                style={{ 
                                  backgroundColor: booking.time === t ? primaryColor : undefined, 
                                  borderColor: booking.time === t ? primaryColor : undefined 
                                }}
                              >
                                {t}
                              </button>
                          ))}
                      </div>

                      <div className="pt-6">
                        <button 
                          disabled={!booking.time} 
                          onClick={() => setStep('confirm')} 
                          className="w-full py-5 text-white rounded-[1.5rem] font-bold text-base shadow-xl transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3" 
                          style={{ backgroundColor: primaryColor }}
                        >
                          Confirmar Selección <ArrowRight size={18} />
                        </button>
                        <button onClick={() => setStep('info')} className="mt-6 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:text-brand-navy transition-all">Regresar a mis datos</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 4: Resumen */}
                {step === 'confirm' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Confirmación</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Verifica los detalles de tu cita profesional.</p>
                    </div>

                    <div className="bg-slate-50/70 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner space-y-6">
                        <div className="flex items-center gap-5 pb-6 border-b border-slate-200">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-sm border border-slate-100 font-ubuntu font-bold text-2xl">
                            {booking.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</p>
                            <p className="text-xl font-ubuntu font-bold text-brand-navy">{booking.patientName}</p>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary border border-slate-100 shadow-sm shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sede de Atención</p>
                                <p className="font-bold text-brand-navy text-base leading-tight mt-0.5">{booking.sede?.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{booking.sede?.address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary border border-slate-100 shadow-sm shrink-0">
                                <CalendarCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha y Horario</p>
                                <p className="font-ubuntu font-bold text-lg mt-0.5" style={{ color: primaryColor }}>{booking.date} — {booking.time}</p>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                      <button 
                        disabled={isSubmitting} 
                        onClick={handleConfirmBooking} 
                        className="w-full py-6 text-white rounded-[2rem] font-bold text-lg shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50" 
                        style={{ backgroundColor: '#22C55E' }}
                      >
                          {isSubmitting ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <><MessageCircle size={28} /> Finalizar en WhatsApp</>
                          )}
                      </button>
                      <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest leading-relaxed px-4">
                         Al confirmar se enviará una solicitud directa a la sede para validar disponibilidad de su atención de <b>Podología Integral</b>.
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer de Marca */}
            <div className="mt-12 text-center animate-fade-in">
              <div className="inline-flex flex-col items-center gap-4">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-1 text-balance px-6">Healthcare Management Ecosystem</p>
                <a 
                  href="https://gaorsystem.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-11 h-11 bg-brand-navy rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                     <Zap className="text-brand-primary fill-brand-primary" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Desarrollado con excelencia por</p>
                    <p className="text-base font-ubuntu font-bold text-brand-navy group-hover:text-brand-purple transition-colors">Gaor<span className="text-brand-purple">System</span></p>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-purple group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
