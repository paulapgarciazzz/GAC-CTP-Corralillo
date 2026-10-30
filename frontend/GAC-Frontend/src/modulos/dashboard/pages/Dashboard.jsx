import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import Inicio from '../components/Inicio';
import { lazy, Suspense, useState } from 'react'
import { useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { EsqueletoVista } from '../../../components/EstadoLista';
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
    'Gestión de Beneficios': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/GestionBeneficios')) },
    'Asignar Beneficios': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/AsignarBeneficios')) },
    'Ver Beneficios Asignados': { modulo: 'beneficios', Pagina: lazy(() => import('../../Beneficios/pages/VerBeneficiosAsignados')) },
    'Reportes de Beneficios': { modulo: 'reportes', Pagina: lazy(() => import('../../Beneficios/pages/ReportesBeneficios')) },
    'Gestión de Encargados': { modulo: 'solicitudes', Pagina: lazy(() => import('../../SolicitudesAgrupaciones/pages/GestionEncargadosAjustes')) },
    'Gestión de Ubicaciones': { modulo: 'calendario', Pagina: lazy(() => import('../../Calendario/pages/GestionUbicacionesAjustes')) },
    'Gestión del Calendario': { modulo: 'calendario', Pagina: lazy(() => import('../../Calendario/pages/Calendario')) },
    'Lista de Usuarios': { modulo: 'usuarios', Pagina: lazy(() => import('../../Usuarios/pages/ListaUsuarios')) },
    'Roles y Permisos': { modulo: 'usuarios', Pagina: lazy(() => import('../../Usuarios/pages/RolesPermisos')) },
    'Personalización del Sistema': { modulo: 'personalizacion', Pagina: lazy(() => import('../../Personalizacion/pages/PersonalizacionPage')) },
    'Panel de Conteo': { modulo: 'conteo', Pagina: lazy(() => import('../../Conteo/pages/PanelConteo')) },
    'Reportes de Conteo': { modulo: 'conteo', Pagina: lazy(() => import('../../Conteo/pages/ReportesConteo')) },
};


function SinAcceso() {
    return (
        <section className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center gap-3">
            <span className="h-14 w-14 inline-flex items-center justify-center rounded-full bg-surface-soft border border-border text-foreground-soft">
                <Lock size={26} aria-hidden="true" />
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
            <div className="min-h-screen bg-background">
            <a href="#contenido" className="saltar-contenido">Saltar al contenido</a>
            {(isSidebarOpen || !isMobile) && (
                <>
                    <Sidebar onCloseDrawer={closeSidebar} isMobile={isMobile} selectedView={selectedView} onSelectView={setSelectedView}/>
                    {isMobile && isSidebarOpen && (
                        <button type="button" aria-label="Cerrar menú lateral" className="fixed inset-0 bg-rail/60 z-10 animate-aparecer cursor-default" onClick={() => setIsSidebarOpen(false)}/>
                    )}
                </>
            )}
            <div className={!isMobile ? 'lg:ml-56 print:ml-0' : ''}>
                <Topbar
                    isDark={isDark}
                    isDrawerOpen={isMobile && isSidebarOpen}
                    onToggleDrawer={toggleDrawer}
                    onToggleTheme={toggleTheme}
                    isMobile={isMobile}
                />
                <main id="contenido" tabIndex={-1} className="p-4 sm:p-6 lg:p-8 focus:outline-none">
                    {/* Se re-monta por vista: el fundido corto marca el cambio sin estorbar (sin transform persistente). */}
                    <div key={selectedView ?? 'inicio'} className="animate-vista">
                    {selectedView === null && <Inicio onAbrir={setSelectedView} />}
                    {vista && (tieneModulo(vista.modulo) ? (
                        <Suspense fallback={<EsqueletoVista texto={`Cargando ${selectedView}...`} />}>
                            <vista.Pagina key={selectedView} />
                        </Suspense>
                    ) : (
                        <SinAcceso />
                    ))}
                    </div>
                </main>
            </div>

            </div>
        </>
    )
}
export default Dashboard;