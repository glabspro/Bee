
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
  Activity,
  Building2,
  UserCog,
  Palette,
  Settings
} from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState['currentView'];
  onViewChange: (view: ViewState['currentView']) => void;
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userRole = UserRole.ADMIN }) => {
  // El SUPER_ADMIN ahora tiene acceso a TODOS los módulos
  const isGodMode = userRole === UserRole.SUPER_ADMIN;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONIST] },
    { id: 'appointments', icon: CalendarDays, label: 'Agenda Maestra', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONIST, UserRole.SPECIALIST] },
    { id: 'patients', icon: Users, label: 'Expedientes', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPCIONIST, UserRole.SPECIALIST] },
    { id: 'staff-management', icon: UserCog, label: 'Personal & Staff', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'schedules', icon: Clock, label: 'Sedes y Horarios', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'saas-admin', icon: Building2, label: 'SaaS Global', roles: [UserRole.SUPER_ADMIN] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 h-screen sidebar-gradient flex flex-col text-white fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300">
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
      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-5 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Módulos de Gestión</p>
        {visibleItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-white text-brand-navy shadow-xl scale-[1.02]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-brand-secondary' : 'group-hover:text-brand-secondary transition-colors'} />
              <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-brand-navy' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-secondary" />
              )}
            </button>
          );
        })}

        {/* Sección de Marca Blanca: Visible para ADMIN y SUPER_ADMIN */}
        {(userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) && (
          <div className="pt-6 mt-6 border-t border-white/10 space-y-1.5">
            <p className="px-5 text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Personalización</p>
            <button
              onClick={() => onViewChange('saas-admin')} 
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                currentView === 'saas-admin' && !isGodMode ? 'bg-white text-brand-navy shadow-xl' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette size={20} className={currentView === 'saas-admin' ? 'text-brand-accent' : ''} />
              <span className="font-bold text-sm tracking-tight">Portal & Marca</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Actions Section */}
      <div className="p-6 space-y-3 mb-4">
        <button 
          onClick={() => onViewChange('portal')}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all text-[11px] font-bold shadow-lg group"
        >
          <span>Previsualizar Portal</span>
          <ExternalLink size={14} className="opacity-40 group-hover:text-brand-secondary transition-all" />
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="w-full flex items-center gap-4 px-6 py-4 text-white/20 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-[0.2em] group"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
