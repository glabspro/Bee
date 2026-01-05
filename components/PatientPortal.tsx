
import React, { useState } from 'react';
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
  Info,
  ExternalLink,
  CheckCircle2,
  Loader2,
  CalendarCheck
} from 'lucide-react';
import { Sede, Company } from '../types';

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
      onBack();
    }
    setIsSubmitting(false);
  };

  const getMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const steps: Step[] = ['sede', 'service', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-inter overflow-x-hidden text-brand-navy">
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105">
            <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-2" />
          </div>
          <div className="flex flex-col">
            <span className="font-ubuntu font-bold text-brand-navy text-xl leading-none tracking-tight">{company.name}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400">Portal de Agendamiento</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onBack} 
          className="text-slate-400 font-bold text-[10px] flex items-center gap-2 uppercase tracking-widest border border-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-navy transition-all"
        >
          <ArrowLeft size={14} /> Salir
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Banner Rediseñado */}
        <div className="w-full h-[320px] md:h-[400px] relative overflow-hidden flex items-center justify-center bg-brand-navy">
           <img 
            src={company.portalHero} 
            className="w-full h-full object-cover opacity-60 scale-105" 
            alt="Hero Background" 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-navy/30 to-[#FDFDFF]"></div>
           <div className="relative z-10 text-center px-6 max-w-2xl animate-fade-in">
              <h1 className="text-white text-5xl md:text-7xl font-ubuntu font-bold tracking-tight drop-shadow-2xl">
                Cuidado experto <br/> para tus <span className="text-brand-primary italic">pies</span>
              </h1>
              <p className="text-white/80 font-medium text-lg mt-6 max-w-lg mx-auto">
                Agenda tu cita profesional en menos de 2 minutos con los mejores especialistas.
              </p>
           </div>
        </div>

        {/* Contenedor de Flujo Principal */}
        <div className="max-w-5xl w-full -mt-24 relative z-20 px-4 pb-24">
            
            {/* Indicador de Progreso Odoo Style */}
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto no-scrollbar py-6 bg-white/90 backdrop-blur-md rounded-[2.5rem] px-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/50">
            {steps.map((s, idx) => (
                <div key={s} className="flex items-center flex-shrink-0">
                  <div 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                      idx < currentIdx ? 'bg-green-100 text-brand-primary' : 
                      idx === currentIdx ? 'text-white shadow-xl scale-110 ring-4 ring-brand-primary/10' : 
                      'bg-slate-50 text-slate-300'
                    }`} 
                    style={{ backgroundColor: idx === currentIdx ? primaryColor : undefined }}
                  >
                    {idx < currentIdx ? <CheckCircle2 size={20} /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-8 h-[2px] mx-3 rounded-full transition-all duration-500 ${idx < currentIdx ? 'opacity-100' : 'bg-slate-100'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />
                  )}
                </div>
            ))}
            </div>

            {/* Card de Contenido Dinámico */}
            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden min-h-[600px] flex flex-col">
                
                {step === 'sede' && (
                  <div className="p-10 md:p-16 space-y-12 animate-fade-in flex-1 flex flex-col">
                      <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Selecciona una Sede</h2>
                        <p className="text-slate-400 font-medium mt-3">Elige el centro médico más conveniente para tu atención.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {sedes.map(s => (
                            <div key={s.id} className="group relative">
                              <div className="w-full p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-primary/20 transition-all text-left flex flex-col h-full relative overflow-hidden">
                                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                    <MapPin size={32} />
                                  </div>
                                  
                                  <div className="flex-1 space-y-5">
                                    <h4 className="font-ubuntu font-bold text-2xl group-hover:text-brand-primary transition-colors">{s.name}</h4>
                                    
                                    <div className="space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-primary shrink-0 mt-0.5">
                                          <Navigation size={16} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dirección Exacta</p>
                                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{s.address}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-primary shrink-0">
                                          <Phone size={16} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contacto Directo</p>
                                          <p className="text-sm font-bold text-slate-700">{s.phone || 'Central de Citas'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between w-full">
                                    <button 
                                      onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('service'); }}
                                      className="px-10 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                      style={{ backgroundColor: primaryColor }}
                                    >
                                      Elegir Sede <ArrowRight size={14} />
                                    </button>
                                    
                                    <a 
                                      href={getMapsUrl(s.address)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white transition-all shadow-sm border border-slate-100 group/map"
                                      title="Cómo llegar"
                                    >
                                      <ExternalLink size={20} className="group-hover/map:rotate-12 transition-transform" />
                                    </a>
                                  </div>
                              </div>
                            </div>
                        ))}
                      </div>

                      {sedes.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center">
                           <Loader2 className="animate-spin text-brand-primary mb-6" size={48} />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando centros disponibles...</p>
                        </div>
                      )}
                  </div>
                )}

                {step === 'service' && (
                  <div className="p-10 md:p-16 space-y-12 animate-fade-in max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Servicio Especializado</h2>
                      <p className="text-slate-400 font-medium mt-3">Ofrecemos los mejores tratamientos para tu salud podológica.</p>
                    </div>

                    <button 
                      onClick={() => setStep('info')} 
                      className="w-full p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl transition-all text-left flex items-center gap-8 group hover:scale-[1.02] active:scale-95 border-l-8 border-l-brand-primary"
                    >
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                          <Building size={40} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-ubuntu font-bold text-brand-navy text-2xl">Podología Clínica Integral</h4>
                            <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                                Evaluación completa, profilaxis, tratamiento de onicocriptosis y cuidados especializados.
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-brand-primary font-bold text-[10px] uppercase tracking-widest">
                                <Clock size={12} /> Duración aprox: 45 min
                            </div>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" size={32} />
                    </button>

                    <button onClick={() => setStep('sede')} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-brand-navy transition-colors">
                      <ArrowLeft size={14} /> Regresar a sedes
                    </button>
                  </div>
                )}

                {step === 'info' && (
                  <div className="p-10 md:p-16 space-y-12 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Tus Datos</h2>
                      <p className="text-slate-400 font-medium mt-3">Información necesaria para confirmar tu identidad y registro.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <UserIcon size={14} style={{ color: primaryColor }} /> Nombre y Apellidos
                            </label>
                            <input 
                              type="text" 
                              value={booking.patientName} 
                              onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))} 
                              className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-lg placeholder:text-slate-200 transition-all" 
                              style={{ '--tw-ring-color': primaryColor } as any} 
                              placeholder="Ej: Carlos Silva" 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={14} style={{ color: primaryColor }} /> WhatsApp de Contacto
                              </label>
                              <div className="flex gap-2">
                                <div className="bg-slate-50 px-4 py-5 rounded-2xl font-bold text-slate-400 shadow-inner flex items-center">+51</div>
                                <input 
                                  type="tel" 
                                  value={booking.patientPhone} 
                                  onChange={(e) => setBooking(prev => ({...prev, patientPhone: e.target.value}))} 
                                  className="flex-1 px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-lg placeholder:text-slate-200 transition-all" 
                                  style={{ '--tw-ring-color': primaryColor } as any} 
                                  placeholder="900000000" 
                                />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <IdCard size={14} style={{ color: primaryColor }} /> DNI / Identificación
                              </label>
                              <input 
                                type="text" 
                                value={booking.patientDni} 
                                onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value}))} 
                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-lg placeholder:text-slate-200 transition-all" 
                                style={{ '--tw-ring-color': primaryColor } as any} 
                                placeholder="8 dígitos" 
                              />
                          </div>
                        </div>

                        <div className="pt-8">
                          <button 
                            disabled={!booking.patientName || !booking.patientPhone} 
                            onClick={() => setStep('schedule')} 
                            className="w-full py-6 text-white rounded-[2.5rem] font-bold text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3" 
                            style={{ backgroundColor: primaryColor }}
                          >
                            Seleccionar Fecha <ArrowRight size={22} />
                          </button>
                        </div>
                    </div>
                  </div>
                )}

                {step === 'schedule' && (
                  <div className="p-10 md:p-16 space-y-12 animate-fade-in max-w-2xl mx-auto w-full text-center flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Disponibilidad</h2>
                      <p className="text-slate-400 font-medium mt-3">Selecciona el día y la hora que mejor te acomode.</p>
                    </div>

                    <div className="space-y-10">
                      <div className="relative max-w-xs mx-auto">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={24} />
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]} 
                          value={booking.date} 
                          onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))} 
                          className="w-full pl-16 pr-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 font-bold text-brand-navy outline-none text-xl shadow-inner appearance-none transition-all" 
                          style={{ '--tw-ring-color': primaryColor } as any} 
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setBooking(prev => ({...prev, time: t}))} 
                                className={`py-5 rounded-2xl font-ubuntu font-bold text-lg border-2 transition-all duration-300 ${booking.time === t ? 'text-white shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-50 hover:border-brand-primary/40'}`} 
                                style={{ 
                                  backgroundColor: booking.time === t ? primaryColor : undefined, 
                                  borderColor: booking.time === t ? primaryColor : undefined 
                                }}
                              >
                                {t}
                              </button>
                          ))}
                      </div>

                      <div className="pt-8">
                        <button 
                          disabled={!booking.time} 
                          onClick={() => setStep('confirm')} 
                          className="w-full py-6 text-white rounded-[2.5rem] font-bold text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3" 
                          style={{ backgroundColor: primaryColor }}
                        >
                          Confirmar mi cita <ArrowRight size={22} />
                        </button>
                        <button onClick={() => setStep('info')} className="w-full mt-6 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:text-brand-navy transition-colors">Regresar a mis datos</button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'confirm' && (
                  <div className="p-10 md:p-16 space-y-12 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">Confirmación Final</h2>
                      <p className="text-slate-400 font-medium mt-3">Por favor revisa los detalles antes de agendar.</p>
                    </div>

                    <div className="bg-slate-50/80 rounded-[3rem] p-10 border border-slate-100 shadow-inner space-y-8">
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-200">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-sm border border-slate-100 font-ubuntu font-bold text-3xl">
                            {booking.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente registrado</p>
                            <p className="text-2xl font-ubuntu font-bold text-brand-navy">{booking.patientName}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-start gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
                               <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lugar de Atención</p>
                                <p className="font-bold text-brand-navy text-lg leading-tight">{booking.sede?.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{booking.sede?.address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
                               <CalendarCheck size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha y Horario</p>
                                <p className="font-ubuntu font-bold text-xl" style={{ color: primaryColor }}>{booking.date} — {booking.time}</p>
                            </div>
                          </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                      <button 
                        disabled={isSubmitting} 
                        onClick={handleConfirmBooking} 
                        className="w-full py-8 text-white rounded-[3rem] font-bold text-xl shadow-[0_25px_60px_-15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
                        style={{ backgroundColor: '#22C55E' }}
                      >
                          {isSubmitting ? (
                            <Loader2 size={28} className="animate-spin" />
                          ) : (
                            <><MessageCircle size={32} /> Confirmar en WhatsApp</>
                          )}
                      </button>
                      
                      <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">
                         Se abrirá un chat directo con la sede seleccionada.
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Créditos y Branding Footer */}
            <div className="mt-16 text-center animate-fade-in">
              <div className="inline-flex flex-col items-center gap-4">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Powered by Healthcare Solutions</p>
                <a 
                  href="https://gaorsystem.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 bg-white px-10 py-5 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#FDFDFF] rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <img src="https://gaorsystem.vercel.app/favicon.ico" alt="Gaor" className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Desarrollado con excelencia por</p>
                    <p className="text-lg font-ubuntu font-bold text-brand-navy group-hover:text-brand-purple transition-colors">Gaor<span className="text-brand-purple">System</span></p>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-brand-purple group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
