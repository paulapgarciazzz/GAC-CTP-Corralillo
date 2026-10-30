import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ClipboardList, UserCheck } from 'lucide-react';
import { obtenerOcupacionPublica } from '../../Conteo/services/conteoService';

const INTERVALO_MS = 15000;

// Animación ligera con solo iconos de lucide-react + CSS (sin dependencias
// nuevas) para sugerir "una persona pasando lista": el clipboard flota, el
// badge de persona flota con un pequeño desfase, y los checks aparecen uno
// por uno en bucle, como si se fueran marcando personas de una lista.
function AnimacionConteo() {
    return (
        <div aria-hidden="true" className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
            <div className="flex h-24 w-24 animate-flotar items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:h-28 sm:w-28">
                <ClipboardList className="h-12 w-12 text-white/70 sm:h-14 sm:w-14" />
            </div>
            <div
                style={{ animationDelay: '0.4s' }}
                className="absolute -right-1 -top-1 flex h-10 w-10 animate-flotar items-center justify-center rounded-full bg-primary shadow-md sm:h-12 sm:w-12"
            >
                <UserCheck className="h-6 w-6 text-on-primary sm:h-7 sm:w-7" />
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{ animationDelay: `${i * 0.5}s` }}
                        className="flex h-5 w-5 animate-check items-center justify-center rounded-full bg-success-soft text-success"
                    >
                        <Check className="h-3 w-3" />
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Contador() {
    const [ocupacion, setOcupacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [desactualizado, setDesactualizado] = useState(false);

    const activoRef = useRef(true);
    const consultandoRef = useRef(false);

    const consultar = useCallback(async () => {
        if (consultandoRef.current) return;
        consultandoRef.current = true;

        const resultado = await obtenerOcupacionPublica();

        consultandoRef.current = false;
        if (!activoRef.current) return;

        if (resultado.success) {
            setOcupacion(resultado.data.ocupacion_estimada);
            setDesactualizado(false);
        } else {
            setDesactualizado(true);
        }

        setCargando(false);
    }, []);

    useEffect(() => {
        activoRef.current = true;

        (async () => {
            await consultar();
        })();

        const intervalo = setInterval(consultar, INTERVALO_MS);

        return () => {
            activoRef.current = false;
            clearInterval(intervalo);
        };
    }, [consultar]);

    const sinDatos = !cargando && ocupacion === null;
    const valorMostrado = ocupacion === null ? '--' : ocupacion;

    return (
        <section className="relative overflow-hidden bg-rail py-16 text-white sm:py-20">
            <div aria-hidden="true" className="patron-puntos absolute inset-0 mask-r-from-0% mask-r-to-60%" />
            <div className="relative container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
                <div className="text-center md:text-left">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/70">Sistema de conteo</p>
                    <p className="mb-1 text-lg font-medium text-white/90">Personas en la institución</p>
                    <p aria-live="polite" className={`font-display text-5xl font-bold tabular-nums sm:text-6xl ${cargando ? 'animate-pulse' : ''}`}>
                        {valorMostrado}
                    </p>
                    <p className="mx-auto mt-3 max-w-md text-sm text-white/70 md:mx-0">
                        Ocupación estimada. Información actualizada periódicamente.
                    </p>
                    {sinDatos && (
                        <p className="mx-auto mt-1 max-w-md text-xs text-white/50 md:mx-0">
                            Información no disponible por el momento.
                        </p>
                    )}
                    {!sinDatos && desactualizado && (
                        <p className="mx-auto mt-1 max-w-md text-xs italic text-white/50 md:mx-0">
                            Podría estar desactualizada.
                        </p>
                    )}
                </div>
                <AnimacionConteo />
            </div>
        </section>
    );
}
