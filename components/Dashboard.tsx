
import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowRight,
  Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../constants';
import { AppointmentStatus, Appointment, ViewState } from '../types';

const data = [
  { name: 'Lun', citas: 12, ingresos: 600 },
  { name: 'Mar', citas: 19, ingresos: 950 },
  { name: 'Mie', citas: 15, ingresos: 750 },
  { name: 'Jue', citas: 22, ingresos: 1200 },
  { name: 'Vie', citas: 18, ingresos: 900 },
  { name: 'Sab', citas: 8, ingresos: 400 },
];

const StatCard = ({ icon: Icon, label, value, colorClass, iconColorClass, trend, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-8 rounded-5xl border border-slate-100 clinical-shadow hover:shadow-2xl hover:-translate-y-1 transition-all text-left group w-full"
  >
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-3xl ${colorClass} ${iconColorClass} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={28} />
      </div>
      <div className="flex flex-col items-end">
        {trend && (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
    <p className="text-brand-gray text-[10px] font-ubuntu font-bold uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-4xl font-ubuntu font-bold text-brand-navy mt-2">{value}</h3>
    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
       Gestionar <ArrowRight size={12} />
    </div>
  </button>
);

interface DashboardProps {
  appointments: Appointment[];
  onNavigate: (view: ViewState['currentView']) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, onNavigate }) => {
  const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">Ecosistema Bee</h2>
          <p className="text-slate-500 mt-3 text-lg font-medium">Panel de control unificado y análisis operativo.</p>
        </div>
        <div className="hidden md:flex bg-brand-lightSecondary p-2 rounded-2xl border border-brand-secondary/20">
           <span className="px-5 py-2 text-xs font-bold text-brand-secondary uppercase tracking-widest">Estado: Operativo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={CalendarCheck} 
          label="Citas hoy" 
          value={appointments.length.toString()} 
          colorClass="bg-brand-lightSecondary" 
          iconColorClass="text-brand-secondary"
          trend={12} 
          onClick={() => onNavigate('appointments')} 
        />
        <StatCard 
          icon={Users} 
          label="Pacientes" 
          value="1.248" 
          colorClass="bg-brand-lightPrimary" 
          iconColorClass="text-brand-primary"
          trend={8} 
          onClick={() => onNavigate('patients')} 
        />
        <StatCard 
          icon={CreditCard} 
          label="Citas Web" 
          value={pendingCount.toString()} 
          colorClass="bg-brand-lightAccent" 
          iconColorClass="text-brand-accent"
          trend={-2} 
          onClick={() => onNavigate('appointments')} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Ocupación" 
          value="92%" 
          colorClass="bg-brand-navy/5" 
          iconColorClass="text-brand-navy"
          onClick={() => onNavigate('schedules')} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 clinical-shadow">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-ubuntu font-bold text-3xl text-brand-navy">Tendencias Clínicas</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">Comparativa de flujo de pacientes e ingresos proyectados.</p>
            </div>
            <select className="bg-slate-50 border border-slate-100 rounded-[1.25rem] px-6 py-3.5 text-xs font-bold text-brand-navy outline-none shadow-sm cursor-pointer hover:bg-white transition-all">
              <option>Últimos 7 días</option>
              <option>Este mes</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#714B67" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#714B67" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#017E84" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#017E84" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgba(13,13,75,0.1)', padding: '20px'}}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#714B67" strokeWidth={4} fillOpacity={1} fill="url(#colorPrimary)" />
                <Area type="monotone" dataKey="citas" stroke="#017E84" strokeWidth={4} fillOpacity={1} fill="url(#colorSecondary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 clinical-shadow flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-ubuntu font-bold text-3xl text-brand-navy leading-tight">Turnos</h3>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Próximas 24h</p>
            </div>
            <button onClick={() => onNavigate('appointments')} className="w-12 h-12 bg-brand-lightSecondary text-brand-secondary rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-inner">
              <Plus size={24} />
            </button>
          </div>
          <div className="space-y-6 flex-1">
            {appointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex items-center gap-5 group cursor-pointer hover:bg-slate-50 p-4 rounded-[2rem] transition-all border border-transparent hover:border-slate-100">
                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-lightSecondary flex-shrink-0 flex items-center justify-center text-brand-secondary shadow-inner font-ubuntu font-bold text-xl">
                  {apt.patientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-navy truncate text-sm">{apt.patientName}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1.5">
                    <Clock size={12} className="text-brand-secondary" /> {apt.time}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[apt.status]}`}>
                  {apt.status === AppointmentStatus.PENDING ? 'WEB' : 'OK'}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <CalendarCheck size={32} />
                 </div>
                 <p className="text-slate-400 text-sm font-medium">No hay citas<br/>programadas.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate('appointments')}
            className="w-full mt-10 py-6 bg-brand-navy text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-navy/90 rounded-[2rem] transition-all shadow-2xl shadow-brand-navy/20 active:scale-95"
          >
            Ver Agenda Completa <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
