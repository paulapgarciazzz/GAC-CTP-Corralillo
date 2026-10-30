import { useState } from "react";
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from "../../../auth/hooks/useAuth";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import ModalRecuperarPassword from "./ModalRecuperarPassword";
import escudoOriginal from '../../../assets/escudo.webp';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { BOTON_PRIMARIO_CLASS, INPUT_CLASS, LABEL_CLASS } from '../../../utils/formulario';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
    const { login } = useAuth();
    const { landing, apariencia } = usePersonalizacion();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            if(result.success){
                navigate({to:'/dashboard'});
            }else{
                setError(result.error || 'Error al iniciar sesion');
            }
        } catch {
            setError('Error al iniciar sesion');
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="min-h-screen flex items-center justify-center bg-rail p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Volver a la landing */}
        <Link
          to="/"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="bg-surface rounded-2xl p-8 shadow-xl border border-border space-y-6 sm:p-10">
        {/* Encabezado */}
        <div className="text-center space-y-3">
          <img src={apariencia.escudo_url || escudoOriginal} alt="" width="64" height="64" className="mx-auto h-16 w-16 object-contain" />
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">{landing.nombre_institucion}</p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-sm text-foreground-soft">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Campo Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className={LABEL_CLASS}
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
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className={INPUT_CLASS}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className={LABEL_CLASS}
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
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                className={`${INPUT_CLASS} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-foreground-soft hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Enlace "¿Olvidaste tu contraseña?" */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarRecuperacion(true)}
              className="rounded text-sm font-semibold text-primary hover:text-primary-hover hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div
              id="login-error"
              role="alert"
              className="px-4 py-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm text-center font-medium"
            >
              {error}
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className={`${BOTON_PRIMARIO_CLASS} min-h-11 text-base`}
          >
            {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        </div>
      </div>

      {mostrarRecuperacion && (
        <ModalRecuperarPassword emailInicial={email} onClose={() => setMostrarRecuperacion(false)} />
      )}
    </main>
    );
};

export default Login;
