import { useState } from "react";
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from "../../../auth/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        setLoading(true);
        if(result.success){
            navigate({to:'/dashboard'});
        }else{
            setError(result.error || 'Error al iniciar sesion');
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rail to-[#05070f] p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10 space-y-6">
 
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-sm text-gray-400">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Campo Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-gray-300 uppercase tracking-wider block"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ecdda] focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-gray-300 uppercase tracking-wider block"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ecdda] focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
 
          {/* Enlace "¿Olvidaste tu contraseña?" */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-[#7ecdda] hover:text-[#a8e2ea] transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
 
          {/* Alerta de Error */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-[#e75c50]/10 border border-[#e75c50]/30 rounded-xl text-[#e75c50] text-sm text-center font-medium"
            >
              {error}
            </div>
          )}
 
          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#45ac75] hover:bg-[#6bc596] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
    );
};

export default Login;