
import React, { useState } from 'react';
import { Key, ArrowRight, Activity, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Validación de roles por código (ahora más flexibles)
    setTimeout(() => {
      const code = accessCode.toLowerCase();
      if (code === 'super123') {
        onLogin(UserRole.SUPER_ADMIN);
      } else if (code === 'admin123') {
        onLogin(UserRole.ADMIN);
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-inter">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(13,13,75,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100 animate-fade-in">
        
        {/* Lado Izquierdo: Branding & Info */}
        <div className="md:w-5/12 p-12 text-white relative flex flex-col justify-between overflow-hidden sidebar-gradient">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <Activity size={32} />
            </div>
            <h1 className="text-5xl font-ubuntu font-bold mb-6 tracking-tight">Bee</h1>
            <p className="text-white/70 text-lg font-medium leading-relaxed max-w-xs">
              SaaS de gestión clínica inteligente para consultorios modernos.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} className="text-brand-accent" />
              </div>
              <div>
                <p className="font-bold text-sm">Seguridad Bee</p>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Acceso Jerárquico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="md:w-7/12 p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-4xl font-ubuntu font-bold text-brand-navy mb-3">Bienvenido</h2>
            <p className="text-slate-400 mb-12 font-medium">Ingresa tu clave de acceso personalizada.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-brand-navy uppercase tracking-widest ml-1">Clave de Acceso</label>
                  {error && (
                    <span className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
                      <AlertCircle size={12} /> Código Inválido
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-brand-secondary'}`}>
                    <Key size={20} />
                  </div>
                  <input 
                    type="password"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder="Clave de acceso"
                    className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-bold text-brand-navy placeholder:text-slate-200 shadow-inner ${
                      error ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-brand-secondary'
                    }`}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !accessCode}
                className={`w-full py-5 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                  isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-brand-navy hover:shadow-[0_15px_30px_rgba(13,13,75,0.2)]'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Entrar'}
                {!isLoading && <ArrowRight size={22} className="text-brand-secondary" />}
              </button>
            </form>

            <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col gap-4">
              <p className="text-[9px] font-bold text-slate-300 uppercase text-center tracking-[0.3em]">Credenciales Bee</p>
              <div className="flex justify-center gap-3">
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-400 border border-slate-100 uppercase tracking-tighter">
                  Admin: <span className="text-brand-navy ml-1 font-ubuntu">admin123</span>
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-400 border border-slate-100 uppercase tracking-tighter">
                  Super: <span className="text-brand-navy ml-1 font-ubuntu">super123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
