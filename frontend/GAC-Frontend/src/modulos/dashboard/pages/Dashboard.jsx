import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react'
import { useEffect } from 'react';

const Dashboard =()=>{
    const [isDark,setIsdark]= useState (true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () =>{
            const mobile = window.innerWidth >= 1024;
            setIsMobile(window.innerWidth < 1024);
            if(mobile){
                setIsSidebarOpen(false);
            }else{
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    },[]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-sheme:dark)').matches;
        if(savedTheme){
            setIsdark(savedTheme === 'dark');
        }else if(systemPrefersDark){
            setIsdark(true);
        }
        
    },[]);

    useEffect(() => {
        const html = document.documentElement;
        if(isDark){
            html.setAttribute('data-theme','dark');
            localStorage.setItem('theme','dark');
        }else{
            html.setAttribute('data-theme','light');
            localStorage.setItem('theme','light');
        }
    },[isDark]);
    const toggleTheme = () => {
        setIsdark(!isDark);
    };
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
            <div className="font-display min-h-screen bg-base-200 dark:bg-background">
            {(isSidebarOpen || !isMobile) && (
                <>
                    <Sidebar onCloseDrawer={closeSidebar} isMobile={isMobile}/>
                    {isMobile && isSidebarOpen && (
                        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setIsSidebarOpen(false)}/>
                       
                    )}
                </>
            )}
            <div className={!isMobile ? 'lg:ml-80' : ''}>
                <Topbar
                    isDark={isDark}
                    onToggleDrawer={toggleDrawer}
                    onToggleTheme={toggleTheme}
                    isMobile={isMobile}
                />
            </div>
                
            </div>
        </>
    )
}
export default Dashboard;