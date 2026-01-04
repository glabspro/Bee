
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
  Building
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

  const countryCodes = [
    { code: '+51', country: 'Perú' },
    { code: '+57', country: 'Colombia' },
    { code: '+56', country: 'Chile' },
    { code: '+52', country: 'México' },
    { code: '+1', country: 'USA' },
  ];

  const handleConfirmBooking = () => {
    const newAppointment: Appointment = {
      id: 'apt-' + Math.random().toString(36).substr(2, 9),
      patientName: booking.patientName,
      patientPhone: `${booking.countryCode}${booking.patientPhone}`,
      patientDni: booking.patientDni,
      patientEmail: booking.patientEmail || undefined,
      serviceId: 's1', 
      sedeId: booking.sede?.id || sedes[0].id,
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
    
    alert("¡Cita solicitada! Redirigiendo a WhatsApp...");
    onBack();
  };

  const steps: Step[] = ['sede', 'service', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
            {company.logo ? <img src={company.logo} alt="Logo" className="w-full h-full object-cover" /> : <Building className="text-slate-300" />}
          </div>
          <span className="font-ubuntu font-bold text-brand-navy text-xl">{company.name} <span className="text-[10px] text-brand-secondary uppercase block tracking-widest font-bold">Portal de Pacientes</span></span>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-brand-primary font-bold text-xs flex items-center gap-2 transition-colors uppercase tracking-widest">
          <ArrowLeft size={16} /> Salir del Portal
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Branding */}
        <div className="w-full h-64 relative overflow-hidden flex items-center justify-center bg-brand-navy">
           <img 
            src={company.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053&ixlib=rb-4.0.3"} 
            className="w-full h-full object-cover opacity-40 blur-[2px]" 
            alt="Hero" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
           <div className="relative z-10 text-center space-y-2">
              <h1 className="text-white text-5xl font-ubuntu font-bold tracking-tight">Cuidamos de ti</h1>
              <p className="text-white/70 font-medium">Agendamiento inteligente Bee Clinical System</p>
           </div>
        </div>

        <div className="max-w-4xl w-full -mt-20 relative z-20 px-6 pb-20">
            <div className="flex items-center justify-center gap-3 mb-12 overflow-x-auto py-4 bg-white/50 backdrop-blur-md rounded-3xl px-8 shadow-xl border border-white/20">
            {steps.map((s, idx) => (
                <div key={s} className="flex items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    idx <= currentIdx ? 'bg-brand-secondary text-white shadow-xl shadow-brand-secondary/30 scale-110' : 'bg-white text-slate-300 border border-slate-100'
                }`}>
                    {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                    <div className={`w-6 md:w-10 h-1 mx-2 rounded-full ${idx < currentIdx ? 'bg-brand-secondary' : 'bg-slate-200'}`} />
                )}
                </div>
            ))}
            </div>

            {step === 'sede' && (
            <div className="space-y-10 animate-fade-in">
                <div className="text-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-4xl font-ubuntu font-bold text-slate-800">Selecciona tu ubicación</h2>
                <p className="text-slate-500 mt-3 text-lg">Elige la sede más cercana para tu atención.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {sedes.filter(s => s.companyId === company.id).map(s => (
                    <button 
                    key={s.id}
                    onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('service'); }}
                    className="p-10 bg-white rounded-5xl border-2 border-transparent hover:border-brand-secondary hover:shadow-2xl transition-all text-left group flex flex-col items-center sm:items-start relative overflow-hidden shadow-sm"
                    >
                    <div className="absolute -right-8 -top-8 text-brand-lightSecondary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Hexagon size={120} />
                    </div>
                    <div className="w-20 h-20 rounded-3xl bg-brand-lightSecondary flex items-center justify-center text-brand-secondary mb-8 group-hover:scale-110 transition-transform shadow-inner">
                        <MapPin size={40} />
                    </div>
                    <h4 className="font-ubuntu font-bold text-slate-800 text-2xl mb-2">{s.name}</h4>
                    <p className="text-slate-400 font-medium mb-6">{s.address}</p>
                    <div className="flex items-center gap-2 text-brand-secondary font-bold uppercase tracking-widest text-xs">
                        Agendar Aquí <ChevronRight size={20} />
                    </div>
                    </button>
                ))}
                </div>
            </div>
            )}

            {step === 'service' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-4xl font-ubuntu font-bold text-slate-800">¿Qué necesitas hoy?</h2>
                <p className="text-slate-500 mt-3">Estamos listos para cuidar de tu salud.</p>
                </div>
                <button 
                onClick={() => setStep('info')}
                className="w-full p-10 bg-white rounded-5xl border-2 border-brand-accent shadow-xl transition-all text-left flex items-center gap-8 group"
                >
                <div className="w-20 h-20 rounded-3xl bg-brand-lightAccent flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                    <Stethoscope size={40} />
                </div>
                <div className="flex-1">
                    <h4 className="font-ubuntu font-bold text-slate-800 text-2xl mb-1">Consulta General</h4>
                    <p className="text-slate-500 font-medium italic">Evaluación profesional completa</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={24} />
                </div>
                </button>
                <button onClick={() => setStep('sede')} className="w-full text-slate-400 hover:text-brand-primary font-bold text-xs uppercase tracking-widest">Cambiar de sede</button>
            </div>
            )}

            {step === 'info' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-4xl font-ubuntu font-bold text-slate-800">Tus Datos</h2>
                <p className="text-slate-500 mt-3">Para poder confirmar tu espacio.</p>
                </div>
                <div className="bg-white p-10 rounded-5xl shadow-2xl border border-slate-100 space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1 flex items-center gap-2">
                    <UserIcon size={16} className="text-brand-secondary" /> Nombre Completo
                    </label>
                    <input 
                    type="text"
                    value={booking.patientName}
                    onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-medium text-lg shadow-inner"
                    placeholder="Tu nombre completo"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1 flex items-center gap-2">
                    <IdCard size={16} className="text-brand-primary" /> DNI / Identificación
                    </label>
                    <input 
                    type="text"
                    value={booking.patientDni}
                    onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value}))}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-medium text-lg shadow-inner"
                    placeholder="Número de documento"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1 flex items-center gap-2 text-slate-300">
                    <Mail size={16} /> Correo Electrónico (Opcional)
                    </label>
                    <input 
                    type="email"
                    value={booking.patientEmail}
                    onChange={(e) => setBooking(prev => ({...prev, patientEmail: e.target.value}))}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-medium text-lg shadow-inner"
                    placeholder="ejemplo@correo.com"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1">WhatsApp de contacto</label>
                    <div className="flex gap-3">
                    <select 
                        value={booking.countryCode}
                        onChange={(e) => setBooking(prev => ({...prev, countryCode: e.target.value}))}
                        className="bg-slate-50 border-none rounded-2xl py-5 pl-5 pr-10 focus:ring-2 focus:ring-brand-primary text-sm font-bold shadow-inner"
                    >
                        {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                        ))}
                    </select>
                    <div className="relative flex-1">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray" size={20} />
                        <input 
                        type="tel"
                        value={booking.patientPhone}
                        onChange={(e) => setBooking(prev => ({...prev, patientPhone: e.target.value}))}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-medium text-lg shadow-inner"
                        placeholder="900 000 000"
                        />
                    </div>
                    </div>
                </div>
                <button 
                    disabled={!booking.patientName || !booking.patientDni || booking.patientPhone.length < 7}
                    onClick={() => setStep('schedule')}
                    className="w-full py-6 bg-brand-navy text-white rounded-3xl font-bold text-xl hover:bg-brand-primary shadow-2xl shadow-brand-navy/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    Elegir Horario
                </button>
                </div>
            </div>
            )}

            {step === 'schedule' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-4xl font-ubuntu font-bold text-slate-800">Fecha y Hora</h2>
                <p className="text-slate-500 mt-3">Selecciona cuándo deseas tu cita.</p>
                </div>
                <div className="bg-white p-10 rounded-5xl shadow-2xl border border-slate-100 space-y-8">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1">Fecha de Cita</label>
                    <input 
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-medium text-lg shadow-inner"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-navy uppercase tracking-widest ml-1">Hora Preferida</label>
                    <div className="grid grid-cols-3 gap-3">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                        <button 
                        key={t}
                        onClick={() => setBooking(prev => ({...prev, time: t}))}
                        className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                            booking.time === t ? 'bg-brand-secondary text-white border-brand-secondary shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-brand-secondary'
                        }`}
                        >
                        {t}
                        </button>
                    ))}
                    </div>
                </div>
                <button 
                    disabled={!booking.date || !booking.time}
                    onClick={() => setStep('confirm')}
                    className="w-full py-6 bg-brand-navy text-white rounded-3xl font-bold text-xl hover:bg-brand-primary shadow-2xl shadow-brand-navy/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    Revisar Resumen
                </button>
                </div>
            </div>
            )}

            {step === 'confirm' && (
            <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                <div className="text-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-4xl font-ubuntu font-bold text-slate-800">Resumen Final</h2>
                <p className="text-slate-500 mt-3">Verifica los detalles antes de agendar.</p>
                </div>
                <div className="bg-white p-10 rounded-5xl shadow-2xl border border-slate-100 space-y-6">
                <div className="space-y-4 text-sm font-medium text-slate-600">
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                        <span className="text-slate-400">Paciente:</span>
                        <span className="text-brand-navy font-bold">{booking.patientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                        <span className="text-slate-400">Sede:</span>
                        <span className="text-brand-navy font-bold">{booking.sede?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-3">
                        <span className="text-slate-400">Fecha:</span>
                        <span className="text-brand-navy font-bold">{booking.date}</span>
                    </div>
                </div>
                
                <button 
                    onClick={handleConfirmBooking}
                    className="w-full py-6 bg-brand-secondary text-white rounded-3xl font-bold text-xl hover:bg-brand-secondary/90 shadow-2xl shadow-brand-secondary/20 transition-all active:scale-95 mt-6 flex items-center justify-center gap-3"
                >
                    <CheckCircle2 size={24} /> Confirmar Cita
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
