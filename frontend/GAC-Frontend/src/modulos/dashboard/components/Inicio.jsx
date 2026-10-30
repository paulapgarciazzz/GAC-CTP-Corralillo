import {
    FileUser, ShelvingUnit, CalendarDays, UserCog, ClipboardMinus, Settings,
    BookUser, PersonStanding, Users, SquareLibrary, CirclePile, ClipboardList,
    MapPin, Shield, Boxes, FileBarChart2, Paintbrush, ChevronRight, Lock, Activity,
} from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';

/**
 * Accesos rápidos por módulo. Los nombres de `vistas` deben coincidir con las
 * claves de VISTAS en Dashboard.jsx (son el valor de `?view=`).
 */
const MODULOS = [
    {
        titulo: 'Solicitudes', modulo: 'solicitudes', icono: FileUser,
        descripcion: 'Revisa solicitudes, agrupaciones y encargados.',
        vistas: [
            { nombre: 'Bandeja de Solicitudes', icono: BookUser },
            { nombre: 'Gestión de Agrupaciones', icono: PersonStanding },
            { nombre: 'Gestión de Encargados', icono: Users },
        ],
    },
    {
        titulo: 'Beneficios', modulo: 'beneficios', icono: ShelvingUnit,
        descripcion: 'Administra el catálogo y su asignación.',
        vistas: [
            { nombre: 'Gestión de Beneficios', icono: SquareLibrary },
            { nombre: 'Asignar Beneficios', icono: CirclePile },
            { nombre: 'Ver Beneficios Asignados', icono: ClipboardList },
        ],
    },
    {
        titulo: 'Calendario', modulo: 'calendario', icono: CalendarDays,
        descripcion: 'Organiza eventos, actividades y ubicaciones.',
        vistas: [
            { nombre: 'Gestión del Calendario', icono: CalendarDays },
            { nombre: 'Gestión de Ubicaciones', icono: MapPin },
        ],
    },
    {
        titulo: 'Conteo', modulo: 'conteo', icono: Activity,
        descripcion: 'Monitorea la ocupación en tiempo real.',
        vistas: [
            { nombre: 'Panel de Conteo', icono: Activity },
        ],
    },
    {
        titulo: 'Usuarios', modulo: 'usuarios', icono: UserCog,
        descripcion: 'Gestiona cuentas, roles y permisos.',
        vistas: [
            { nombre: 'Lista de Usuarios', icono: Users },
            { nombre: 'Roles y Permisos', icono: Shield },
        ],
    },
    {
        titulo: 'Reportes', modulo: 'reportes', icono: ClipboardMinus,
        descripcion: 'Consulta y exporta la información del festival.',
        vistas: [
            { nombre: 'Reportes de Solicitudes', icono: FileUser },
            { nombre: 'Reportes de Actividades', icono: Boxes },
            { nombre: 'Reportes de Beneficios', icono: FileBarChart2 },
            { nombre: 'Reportes de Conteo', icono: Activity },
        ],
    },
    {
        titulo: 'Ajustes', modulo: 'personalizacion', icono: Settings,
        descripcion: 'Personaliza la apariencia del sistema.',
        vistas: [
            { nombre: 'Personalización del Sistema', icono: Paintbrush },
        ],
    },
];

const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
};

function TarjetaModulo({ modulo, bloqueado, onAbrir }) {
    const Icono = modulo.icono;

    return (
        <article className={`flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-200 ${
            bloqueado ? 'opacity-70' : 'hover:shadow-md'
        }`}>
            <header className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icono className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        {modulo.titulo}
                        {bloqueado && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-xs font-medium text-foreground-soft border border-border">
                                <Lock className="h-3 w-3" aria-hidden="true" /> Sin acceso
                            </span>
                        )}
                    </h2>
                    <p className="mt-0.5 text-sm text-foreground-soft">{modulo.descripcion}</p>
                </div>
            </header>

            <ul className="mt-4 flex flex-1 flex-col gap-1 border-t border-border pt-3">
                {modulo.vistas.map(({ nombre, icono: IconoVista }) => (
                    <li key={nombre}>
                        <button
                            type="button"
                            disabled={bloqueado}
                            onClick={() => onAbrir(nombre)}
                            className="group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground-soft transition-colors duration-150 hover:bg-surface-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground-soft cursor-pointer"
                        >
                            <IconoVista className="h-4 w-4 shrink-0 text-primary group-disabled:text-foreground-faint" aria-hidden="true" />
                            <span className="flex-1">{nombre}</span>
                            {!bloqueado && (
                                <ChevronRight className="h-4 w-4 shrink-0 text-foreground-faint transition-transform duration-150 motion-safe:group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </article>
    );
}

const Inicio = ({ onAbrir }) => {
    const { user, tieneModulo } = useAuth();
    const nombre = user?.name?.split(' ')[0];
    const fecha = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Primero los módulos accesibles; los bloqueados quedan al final, visibles pero deshabilitados.
    const modulos = [...MODULOS].sort((a, b) => Number(!tieneModulo(a.modulo)) - Number(!tieneModulo(b.modulo)));

    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="relative overflow-hidden rounded-2xl bg-rail p-6 text-white shadow-sm sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-2 top-6 h-28 w-28 rounded-full border border-white/10" />
                <div className="relative">
                    <p className="text-sm font-medium capitalize text-white/75">{fecha}</p>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                        {saludo()}{nombre ? `, ${nombre}` : ''}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm sm:text-base text-white/80">
                        Bienvenido al panel del CTP Corralillo. Elige un acceso rápido para continuar.
                    </p>
                </div>
            </header>

            <div>
                <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-foreground-soft">Accesos rápidos</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {modulos.map((modulo) => (
                        <TarjetaModulo
                            key={modulo.titulo}
                            modulo={modulo}
                            bloqueado={!tieneModulo(modulo.modulo)}
                            onAbrir={onAbrir}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Inicio;
