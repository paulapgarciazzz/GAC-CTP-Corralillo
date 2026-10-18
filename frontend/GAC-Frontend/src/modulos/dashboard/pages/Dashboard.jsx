import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { lazy, Suspense, useState } from 'react'
import { useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { EstadoCargando } from '../../../components/EstadoLista';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../auth/hooks/useAuth';

const routeApi = getRouteApi('/dashboard');

/**
 * Vistas del panel: nombre (igual al del Sidebar) → módulo de permisos y página.
 * Cada página se descarga solo cuando se abre por primera vez (React.lazy).
 */
const VISTAS = {
    'Bandeja de Solicitudes': { modulo: 'solicitudes', Pagina: lazy(() => import('../../SolicitudesAgrupaciones/pages/GestionSolicitudes')) },
    'Gestión de Agrupaciones': { modulo: 'solicitudes', Pagina: lazy(() => import('../../Agrupaciones/pages/GestionAgrupaciones')) },
    'Reportes de Solicitudes': { modulo: 'reportes', Pagina: lazy(() => import('../../Reportes/pages/Reportes_agrupaciones/ReportesAgrupaciones')) },
    'Reportes de Actividades': { modulo: 'reportes', Pagina: lazy(() => import('../../Reportes/pages/Reportes_actividades/ReportesActividades')) },
    'Gestión de beneficios': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/GestionBeneficios')) },
    'Asignar beneficios': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/AsignarBeneficios')) },
    'Ver beneficios asignados': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/VerBeneficiosAsignados')) },
    'Reportes de beneficios': { modulo: 'reportes', Pagina: lazy(() => import('../../Beneficios/pages/ReportesBeneficios')) },
    'Gestión de agrupaciones': { modulo: 'solicitudes', Pagina: lazy(() => import('../../Agrupaciones/pages/GestionAgrupacionesAjustes')) },
    'Gestión de encargados': { modulo: 'solicitudes', Pagina: lazy(() => import('../../SolicitudesAgrupaciones/pages/GestionEncargadosAjustes')) },
    'Gestión de ubicaciones': { modulo: 'calendario', Pagina: lazy(() => import('../../Calendario/pages/GestionUbicacionesAjustes')) },
    'Gestión del calendario': { modulo: 'calendario', Pagina: lazy(() => import('../../Calendario/pages/Calendario')) },
    'Lista de Usuarios': { modulo: 'usuarios', Pagina: lazy(() => import('../../Usuarios/pages/ListaUsuarios')) },
    'Roles y Permisos': { modulo: 'usuarios', Pagina: lazy(() => import('../../Usuarios/pages/RolesPermisos')) },
};


function SinAcceso() {
    return (
        <section className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center gap-3">
            <span className="h-14 w-14 inline-flex items-center justify-center rounded-full bg-background border border-border text-foreground-faint">
                <Lock size={26} />
            </span>
            <h1 className="text-xl font-semibold text-foreground">Sin acceso a este módulo</h1>
            <p className="text-sm text-foreground-soft max-w-sm">Solicita a un administrador que te habilite el permiso en Roles y Permisos.</p>
        </section>
    );
}

const Dashboard =()=>{
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { view } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const { tieneModulo } = useAuth();
    const selectedView = view && Object.hasOwn(VISTAS, view) ? view : null;
    const vista = selectedView ? VISTAS[selectedView] : null;
    const setSelectedView = (nuevaVista) => {
        navigate({ search: (prev) => ({ ...prev, view: nuevaVista ?? undefined }) });
    };

    useEffect(() => {
        const handleResize = () =>{
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);

            setIsSidebarOpen(prev => {
                const newState = !mobile;
            return prev !== newState ? newState : prev;
        });
    };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    },[]);

    const toggleDrawer = () =>{
        if (isMobile){
            setIsSidebarOpen(!isSidebarOpen);
        }
    };
    const closeSidebar = () =>{
        if(isMobile){
            setIsSidebarOpen(false);
        }
    };
    return (
        <>
            <div className="font-display min-h-screen bg-background">
            {(isSidebarOpen || !isMobile) && (
                <>
                    <Sidebar onCloseDrawer={closeSidebar} isMobile={isMobile} selectedView={selectedView} onSelectView={setSelectedView}/>
                    {isMobile && isSidebarOpen && (
                        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setIsSidebarOpen(false)}/>
                       
                    )}
                </>
            )}
            <div className={!isMobile ? 'lg:ml-56 print:ml-0' : ''}>
                <Topbar
                    isDark={isDark}
                    onToggleDrawer={toggleDrawer}
                    onToggleTheme={toggleTheme}
                    isMobile={isMobile}
                />
                <main className="p-4 sm:p-6">
                    {selectedView === null && (
                        <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                            <h1 className="text-2xl font-semibold text-foreground">Panel principal</h1>
                        </section>
                    )}
                    {vista && (tieneModulo(vista.modulo) ? (
                        <Suspense fallback={<EstadoCargando />}>
                            <vista.Pagina key={selectedView} />
                        </Suspense>
                    ) : (
                        <SinAcceso />
                    ))}
                </main>
            </div>

            </div>
        </>
    )
}
export default Dashboard;