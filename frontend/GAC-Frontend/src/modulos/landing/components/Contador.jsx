import { Check, ClipboardList, UserCheck } from 'lucide-react';

// Animación ligera con solo iconos de lucide-react + CSS (sin dependencias
// nuevas) para sugerir "una persona pasando lista": el clipboard flota, el
// badge de persona flota con un pequeño desfase, y los checks aparecen uno
// por uno en bucle, como si se fueran marcando personas de una lista.
function AnimacionConteo() {
    return (
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
            <style>{`
                @keyframes ctp-flotar { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes ctp-check-aparece { 0%, 15% { opacity: 0; transform: scale(0.4); } 30%, 85% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.4); } }
            `}</style>
            <div
                style={{ animation: 'ctp-flotar 3s ease-in-out infinite' }}
                className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 sm:h-28 sm:w-28"
            >
                <ClipboardList className="h-12 w-12 text-white/70 sm:h-14 sm:w-14" />
            </div>
            <div
                style={{ animation: 'ctp-flotar 3s ease-in-out infinite 0.4s' }}
                className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md sm:h-12 sm:w-12"
            >
                <UserCheck className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{ animation: `ctp-check-aparece 2.4s ease-in-out infinite ${i * 0.5}s` }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-success-soft text-success"
                    >
                        <Check className="h-3 w-3" />
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Contador() {
    return (
        <section className="bg-rail py-16 text-white">
            <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
                <div className="text-center md:text-left">
                    <p className="mb-2 text-sm uppercase tracking-widest text-white/60">Sistema de conteo</p>
                    <p className="mb-1 text-lg font-medium text-white/90">Personas en la institución</p>
                    <p className="text-5xl font-extrabold sm:text-6xl">--</p>
                    <p className="mx-auto mt-3 max-w-md text-sm text-white/60 md:mx-0">
                        Este dato se actualizará automáticamente cuando el sistema de conteo esté conectado.
                    </p>
                </div>
                <AnimacionConteo />
            </div>
        </section>
    );
}
