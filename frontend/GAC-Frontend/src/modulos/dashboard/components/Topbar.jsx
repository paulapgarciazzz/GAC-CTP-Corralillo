import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Menu, Sun, Moon, UserCircle, LogOut,SquareArrowUpLeft} from 'lucide-react'
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
        <nav aria-label="Barra superior" className="print:hidden sticky top-0 z-20 bg-surface/90 backdrop-blur-lg border-b border-border">
            <div className="h-16 flex items-center px-4 sm:px-6 lg:px-8">
                <div className='flex items-center justify-between w-full'>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick= {onToggleDrawer} aria-label="Abrir o cerrar menú lateral" className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-soft transition-colors">
                            <Menu className="w-5 h-5 text-foreground" aria-hidden="true"/>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={onToggleTheme} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-soft transition-colors" aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                            {isDark ? (
                                <Sun className="w-5 h-5 text-warning" aria-hidden="true"/>
                            ):(
                                <Moon className="w-5 h-5 text-foreground-soft" aria-hidden="true"/>
                            )}
                        </button>

                        {/* Perfil*/}
                        <div className="relative" ref={menuRef}>
                            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Menú de usuario" aria-expanded={isDropdownOpen} aria-haspopup="true"
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-soft transition-colors">
                                <Avatar nombre={usuario?.name} foto={usuario?.foto} tamano="sm" className="border-2 border-border"/>
                            </button>
                            {isDropdownOpen && (
                                <>
                                    <div className='absolute right-0 mt-2 w-60 bg-surface rounded-xl shadow-xl border border-border z-20 animate-aparecer'>

                                        <div className='px-4 py-3 border-b border-border'>
                                            <p className='text-sm font-semibold text-foreground truncate'>{usuario?.name ?? 'Usuario'}</p>
                                            <p className='text-sm text-foreground-soft truncate'>{usuario?.email}</p>
                                        </div>
                                    <div className='p-2'>
                                        <button type="button" onClick={abrirPerfil} className='flex min-h-10 items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors text-foreground hover:bg-surface-soft'>
                                            <UserCircle className='w-4 h-4 text-foreground-soft' aria-hidden="true"/>
                                            Perfil
                                        </button>
                                        
                                        <button type="button" onClick={salirAPaginaPrincipal} className='flex min-h-10 items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors text-foreground hover:bg-surface-soft'>
                                            <SquareArrowUpLeft className='w-4 h-4 text-foreground-soft' aria-hidden="true"/>
                                            Página principal
                                        </button>
                                        <button type="button" className='flex min-h-10 items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors text-danger hover:bg-danger-soft' onClick={handleLogout}>

                                            <LogOut className='w-4 h-4' aria-hidden="true"/>
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
