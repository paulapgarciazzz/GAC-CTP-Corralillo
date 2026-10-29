import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Menu, Search, Sun, Moon, UserCircle, LogOut,SquareArrowUpLeft} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../../auth/hooks/useAuth'
import Avatar from '../../../components/Avatar'
import { useCerrarConEscape } from '../../../hooks/useCerrarConEscape'

// El modal de perfil se descarga solo cuando se abre.
const ModalPerfil = lazy(() => import('../../Usuarios/components/ModalPerfil'));

const Topbar = ({ isDark, onToggleDrawer, onToggleTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Un overlay fixed no sirve aquí: el backdrop-blur del <nav> lo limita a la barra.
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClickFuera = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, [isDropdownOpen]);
    useCerrarConEscape(isDropdownOpen, () => setIsDropdownOpen(false));

    const { user: usuario, logout, establecerUsuario } = useAuth();
    const handleLogout = async () => {
        await logout();
        navigate({ to: '/login' })
    }

    const abrirPerfil = () => {
        setIsDropdownOpen(false);
        setPerfilAbierto(true);
    }
    const salirAPaginaPrincipal = () => {
        setIsDropdownOpen(false);
        navigate({to: '/'});
    }

    const perfilGuardado = (actualizado) => {
        establecerUsuario(actualizado);
        setPerfilAbierto(false);
    }

    return(
        <>
        <nav className="print:hidden sticky top-0 z-20 bg-surface/80 backdrop-blur-lg border-b border-border">
            <div className="h-16 flex items-center px-4 sm:px-6">
                <div className='flex items-center justify-between w-full'>
                    <div className="flex items-center gap-3">
                        <button onClick= {onToggleDrawer} className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors">
                            <Menu className="w-5 h-5 text-foreground"/>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">

                        <button className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors">
                            <Search className="w-5 h-5 text-foreground-soft"/>
                        </button>
                        <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Toggle Theme">
                            {isDark ? (
                                <Sun className="w-5 h-5 text-warning"/>
                            ):(
                                <Moon className="w-5 h-5 text-foreground-soft"/>
                            )}
                        </button>

                        {/* Perfil*/}
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Menú de usuario" aria-expanded={isDropdownOpen}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                <Avatar nombre={usuario?.name} foto={usuario?.foto} tamano="sm" className="border-2 border-border"/>
                            </button>
                            {isDropdownOpen && (
                                <>
                                    <div className='absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20'>

                                        <div className='p-3 border-b border-border'>
                                            <p className='text-sm font-semibold text-foreground truncate'>{usuario?.name ?? 'Usuario'}</p>
                                            <p className='text-xs text-foreground-faint truncate'>{usuario?.email}</p>
                                        </div>
                                    <div className='p-2'>
                                        <button onClick={abrirPerfil} className='flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors'>
                                            <UserCircle className='w-4 h-4'/>
                                            Perfil
                                        </button>
                                        
                                        <button onClick={salirAPaginaPrincipal} className='flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors'>
                                            <SquareArrowUpLeft className='w-4 h-4'/>
                                            Pagina principal
                                        </button>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft rounded-lg transition-colors'  onClick={handleLogout}>

                                            <LogOut  className='w-4 h-4'/>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                                </>

                            )}
                        </div>
                    </div>
                </div>

            </div>

        </nav>

        {/* Fuera del <nav>: su backdrop-blur encerraría al modal (position: fixed). */}
        {perfilAbierto && usuario && (
            <Suspense fallback={null}>
                <ModalPerfil usuario={usuario} onClose={() => setPerfilAbierto(false)} onGuardado={perfilGuardado} />
            </Suspense>
        )}
        </>
    )
}
export default Topbar;
