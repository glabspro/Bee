
import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Clock, 
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState['currentView'];
  onViewChange: (view: ViewState['currentView']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'appointments', icon: CalendarDays, label: 'Agenda Maestra' },
    { id: 'patients', icon: Users, label: 'Pacientes' },
    { id: 'schedules', icon: Clock, label: 'Sedes y Horarios' },
  ];

  return (
    <div className="w-64 h-screen sidebar-gradient flex flex-col text-white fixed left-0 top-0 z-50 shadow-[10px_0_40px_rgba(13,13,75,0.15)] transition-all duration-300">
      {/* Brand Header */}
      <div className="px-8 pt-10 pb-12 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
          <Activity size={28} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-ubuntu font-bold tracking-tight leading-none">Bee</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mt-2">Clinical OS</p>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-5 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">Módulos</p>
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative ${
                isActive 
                  ? 'bg-white text-brand-navy shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-105' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-brand-secondary' : 'group-hover:text-brand-secondary transition-colors'} />
              <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-brand-navy' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="absolute right-5 w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_12px_rgba(1,126,132,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions Section */}
      <div className="p-6 space-y-4 mb-4">
        <button 
          onClick={() => onViewChange('portal')}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all text-[11px] font-bold shadow-lg group"
        >
          <span>Portal Público</span>
          <ExternalLink size={16} className="opacity-40 group-hover:text-brand-secondary transition-all" />
        </button>
        
        <div className="flex items-center gap-4 px-5 py-3.5 bg-brand-navy/30 rounded-2xl border border-white/5 backdrop-blur-md">
           <ShieldCheck size={20} className="text-brand-accent animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[10px] text-white font-bold tracking-widest uppercase">SafeNode</span>
              <span className="text-[10px] text-white/40 font-medium">256-bit AES</span>
           </div>
        </div>

        <button className="w-full flex items-center gap-4 px-6 py-4 text-white/30 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-[0.2em] group mt-2">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
