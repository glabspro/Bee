
import React, { useState } from 'react';
import { Key, ArrowRight, Activity, ShieldCheck, Layers, UserCircle, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Simulación de validación (Clave: BEE-2025)
    setTimeout(() => {
      if (accessCode.toUpperCase() === 'BEE-2025' || accessCode.toUpperCase() === 'CL-8829-XP') {
        onLogin();
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-inter">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(13,13,75,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100 animate-fade-in">
        
        {/* Left Side: Gradient Info */}
        <div className="md:w-5/12 p-12 text-white relative flex flex-col justify-between overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #017E84 0%, #0d0d4b 100%)' }}>
          
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <Activity size={32} />
            </div>
            <h1 className="text-5xl font-ubuntu font-bold mb-6 tracking-tight">Bee</h1>
            <p className="text-white/70 text-lg font-medium leading-relaxed max-w-xs">
              Gestión clínica inteligente y unificada para tu ecosistema médico.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 group hover:bg-white/15 transition-all">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Layers size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Multi-Sede</p>
                <p className="text-xs text-white/50">Gestión de datos centralizada</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 group hover:bg-white/15 transition-all">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Seguridad Avanzada</p>
                <p className="text-xs text-white/50">Control de acceso por roles clínicos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-7/12 p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-4xl font-ubuntu font-bold text-brand-navy mb-3">Bienvenido</h2>
            <p className="text-slate-400 mb-12 font-medium">Accede a tu panel de control clínico personalizado.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-brand-navy tracking-wide">Clave de Acceso</label>
                  {error && (
                    <span className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> Clave incorrecta
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-brand-secondary'}`}>
                    <Key size={20} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="password"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      if (error) setError(false);
                    }}
                    placeholder="BEE-2025"
                    className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-medium text-brand-navy placeholder:text-slate-300 shadow-sm ${
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
                    : 'bg-brand-secondary hover:shadow-[0_10px_25px_-5px_rgba(1,126,132,0.4)] hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? 'Verificando...' : 'Ingresar al Dashboard'}
                {!isLoading && <ArrowRight size={22} />}
              </button>
            </form>

            <div className="mt-16 pt-10 border-t border-slate-100 flex justify-center">
              <button className="flex items-center gap-2 text-slate-400 hover:text-brand-navy font-bold text-xs uppercase tracking-widest transition-colors group">
                <UserCircle size={18} className="group-hover:scale-110 transition-transform" />
                Soy Administrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
