import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react'
import { useEffect } from 'react';
import GestionSolicitudes from '../../SolicitudesAgrupaciones/pages/GestionSolicitudes';
import GestionAgrupaciones from '../../Agrupaciones/pages/GestionAgrupaciones';
import { useTheme } from '../../../hooks/useTheme';

const Dashboard =()=>{
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [selectedView, setSelectedView] = useState(null);

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
            <div className={!isMobile ? 'lg:ml-56' : ''}>
                <Topbar
                    isDark={isDark}
                    onToggleDrawer={toggleDrawer}
                    onToggleTheme={toggleTheme}
                    isMobile={isMobile}
                />
                <main className="p-4 sm:p-6">
                    {selectedView === 'Gestion de Solicitudes' && <GestionSolicitudes />}
                    {selectedView === 'Gestion de Agrupaciones' && <GestionAgrupaciones />}
                </main>
            </div>

            </div>
        </>
    )
}
export default Dashboard;