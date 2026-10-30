import { useCallback, useEffect, useRef, useState } from 'react';
import escudoOriginal from '../../../assets/escudo.webp';
import { useCerrarConEscape } from '../../../hooks/useCerrarConEscape';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useNavigate, Link } from '@tanstack/react-router';
import {Sun, Moon, Menu, X} from 'lucide-react'

const ENLACES = [
    { href: '#inicio', texto: 'Inicio' },
    { href: '#calendario', texto: 'Calendario' },
    { href: '#conocenos', texto: 'Conócenos' },
    { href: '#ubicacion', texto: 'Ubicación' },
];

const BOTON_BASE = 'inline-flex min-h-10 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold shadow-sm transition-colors duration-150';
const BOTON_PRIMARIO = `${BOTON_BASE} bg-primary text-on-primary hover:bg-primary-hover`;
const BOTON_PELIGRO = `${BOTON_BASE} bg-danger text-on-danger hover:bg-danger/90`;

const Navbar = ({isDark, onToggleTheme}) => {
    const {isAuthenticated, logout} = useAuth();
    const { landing, apariencia } = usePersonalizacion();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const botonMenuRef = useRef(null);
    // Escape cierra el menú móvil y devuelve el foco al botón que lo abrió.
    const cerrarMenuConEscape = useCallback(() => {
        setIsMenuOpen(false);
        botonMenuRef.current?.focus();
    }, []);
    useCerrarConEscape(isMenuOpen, cerrarMenuConEscape);
    const handleLogout = async () => {
       await logout();
       navigate({ to: '/'});
       setIsMenuOpen(false);
    }

    // El navbar arranca transparente sobre el Hero y pasa a fondo sólido al
    // hacer scroll, para no perder legibilidad una vez deja de estar sobre la foto.
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const textColorClass = isScrolled ? 'text-foreground' : 'text-white';
    const hoverIconoClass = isScrolled ? 'hover:bg-surface-soft' : 'hover:bg-white/10';
    const etiquetaTema = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

    return (
        <nav
            aria-label="Principal"
            className={`fixed inset-x-0 top-0 z-50 py-3 transition-colors duration-200 ${
                isScrolled
                    ? 'bg-surface/95 border-b border-border shadow-sm'
                    : 'bg-transparent border-b border-transparent'
            } ${textColorClass}`}
        >
            <div className="container px-4 mx-auto relative">
                <div className="flex justify-between items-center gap-6">
                    <a href="#inicio" className="flex items-center gap-3 shrink-0 rounded-lg">
                        <img className="h-12 w-12 object-contain sm:h-14 sm:w-14" src={apariencia.escudo_url || escudoOriginal} alt="" width="56" height="56"/>
                        <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">{landing.nombre_institucion}</span>
                    </a>
                    <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
                        {ENLACES.map(({ href, texto }) => (
                            <li key={href}><a href={href} className="rounded-sm py-2 decoration-2 underline-offset-8 hover:underline">{texto}</a></li>
                        ))}
                    </ul>
                    <div className="hidden lg:flex gap-3 items-center">
                        {!isAuthenticated ? (
                            <Link to="/login" className={BOTON_PRIMARIO}>
                                Iniciar sesión
                            </Link>
                        ) : (
                            // Usuario autenticado
                            <>
                                <Link to="/dashboard" className={BOTON_PRIMARIO}>
                                    Panel de Gestión
                                </Link>

                                <button type="button" onClick={handleLogout} className={BOTON_PELIGRO}>
                                    Cerrar sesión
                                </button>
                            </>
                        )}
                        <button type="button" onClick={onToggleTheme} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${hoverIconoClass}`} aria-label={etiquetaTema}>
                            {isDark ? (
                                <Sun className="w-5 h-5 text-warning" aria-hidden="true"/>
                            ):(
                                <Moon className="w-5 h-5" aria-hidden="true"/>
                            )}
                        </button>
                    </div>
                     <div className="lg:hidden">
                        <button
                            ref={botonMenuRef}
                            type="button"
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${hoverIconoClass}`}
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={isMenuOpen}
                            aria-controls="menu-movil"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div id="menu-movil" className="lg:hidden mt-3 -mx-4 px-4 pb-4 rounded-b-2xl border-b border-border bg-surface text-foreground shadow-lg animate-aparecer">
                        <ul className="flex flex-col pt-2 font-medium">
                            {ENLACES.map(({ href, texto }) => (
                                <li key={href}><a href={href} onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-3 transition-colors hover:bg-surface-soft">{texto}</a></li>
                            ))}
                        </ul>
                        <div className="flex flex-col gap-3 mt-4">
                            {!isAuthenticated ? (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`w-full ${BOTON_PRIMARIO}`}>
                                    Iniciar sesión
                                </Link>
                            ) : (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`w-full ${BOTON_PRIMARIO}`}>
                                        Panel de Gestión
                                    </Link>
                                    <button type="button" onClick={handleLogout} className={`w-full ${BOTON_PELIGRO}`}>
                                        Cerrar sesión
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={onToggleTheme}
                                className="flex min-h-10 items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border-input text-sm font-semibold transition-colors hover:bg-surface-soft"
                            >
                                {isDark ? (
                                    <>
                                        <Sun className="w-5 h-5 text-warning" aria-hidden="true"/>
                                        <span>Modo claro</span>
                                    </>
                                ):(
                                    <>
                                        <Moon className="w-5 h-5 text-foreground-soft" aria-hidden="true"/>
                                        <span>Modo oscuro</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
