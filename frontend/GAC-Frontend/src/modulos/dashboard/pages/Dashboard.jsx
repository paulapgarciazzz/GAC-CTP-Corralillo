import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react'
import { useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import GestionSolicitudes from '../../SolicitudesAgrupaciones/pages/GestionSolicitudes';
import GestionAgrupaciones from '../../Agrupaciones/pages/GestionAgrupaciones';
import ReportesAgrupaciones from '../../Reportes/pages/Reportes_agrupaciones/ReportesAgrupaciones';
import ReportesActividades from '../../Reportes/pages/Reportes_actividades/ReportesActividades';
import GestionAgrupacionesAjustes from '../../Agrupaciones/pages/GestionAgrupacionesAjustes';
import GestionEncargadosAjustes from '../../SolicitudesAgrupaciones/pages/GestionEncargadosAjustes';
import Calendario from '../../Calendario/pages/Calendario';
import GestionUbicacionesAjustes from '../../Calendario/pages/GestionUbicacionesAjustes';
import GestionBeneficios from '../../Beneficios/pages/GestionBeneficios';
import AsignarBeneficios from '../../Beneficios/pages/AsignarBeneficios';
import VerBeneficiosAsignados from '../../Beneficios/pages/VerBeneficiosAsignados';
import ReportesBeneficios from '../../Beneficios/pages/ReportesBeneficios';
import PersonalizacionPage from '../../Personalizacion/pages/PersonalizacionPage';
import { useTheme } from '../../../hooks/useTheme';

const routeApi = getRouteApi('/dashboard');

const VISTAS_VALIDAS = [
    'Bandeja de Solicitudes',
    'Gestión de Agrupaciones',
    'Reportes de Solicitudes',
    'Reportes de Actividades',
    'Gestión de beneficios',
    'Asignar beneficios',
    'Ver beneficios asignados',
    'Reportes de beneficios',
    'Gestión de agrupaciones',
    'Gestión de encargados',
    'Gestión de ubicaciones',
    'Personalización del sistema',
    'Gestión del calendario',
];

const Dashboard =()=>{
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { view } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const selectedView = view && VISTAS_VALIDAS.includes(view) ? view : null;
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
                    {selectedView === 'Bandeja de Solicitudes' && <GestionSolicitudes />}
                    {selectedView === 'Gestión de Agrupaciones' && <GestionAgrupaciones />}
                    {selectedView === 'Reportes de Solicitudes' && <ReportesAgrupaciones />}
                    {selectedView === 'Reportes de Actividades' && <ReportesActividades />}
                    {selectedView === 'Gestión de beneficios' && <GestionBeneficios />}
                    {selectedView === 'Asignar beneficios' && <AsignarBeneficios />}
                    {selectedView === 'Ver beneficios asignados' && <VerBeneficiosAsignados />}
                    {selectedView === 'Reportes de beneficios' && <ReportesBeneficios />}
                    {selectedView === 'Gestión de agrupaciones' && <GestionAgrupacionesAjustes />}
                    {selectedView === 'Gestión de encargados' && <GestionEncargadosAjustes />}
                    {selectedView === 'Gestión de ubicaciones' && <GestionUbicacionesAjustes />}
                    {selectedView === 'Personalización del sistema' && <PersonalizacionPage />}
                    {selectedView === 'Gestión del calendario' && <Calendario />}
                </main>
            </div>

            </div>
        </>
    )
}
export default Dashboard;