import { useState } from 'react';
import escudo from '../../../assets/escudo.png';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useNavigate, Link } from '@tanstack/react-router';
import {Sun, Moon, Menu, X} from 'lucide-react'

const Navbar = ({isDark, onToggleTheme}) => {
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleLogout = async () => {
       await logout();
       navigate({ to: '/'});
       setIsMenuOpen(false);
    }

    return (
        <nav className="sticky top-0 z-50 py-3 bg-background/95 backdrop-blur-lg border-b border-border text-foreground">
            <div className="container px-4 mx-auto relative text-sm">
                <div className="flex justify-center items-center">
                    <div className= "flex items-center shrink-0">
                        <img className="h-16 w-16 mr-2" src={escudo} alt="Escudo"/>
                        <span className="text-xl tracking-tight">CTP de Corralillo</span>
                    </div>
                    <ul className="hidden lg:flex ml-14 space-x-12">
                        <li><Link to="/" className="hover:text-accent transition-colors">Inicio</Link></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Calendario</a></li>
                        <li><a href="#conocenos" className="hover:text-accent transition-colors">Conocenos</a></li>
                        <li><a href="#contacto" className="hover:text-accent transition-colors">Contacto</a></li>
                    </ul>
                    <div className="hidden lg:flex justify-center ml-14 space-x-4 items-center">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login">
                                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg" >
                                        Iniciar sesión
                                    </button>
                                </Link>
                                 <Link to="/dashboard">
                                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg">
                                        Panel de Gestión
                                    </button>
                                </Link>
                                <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Toggle Theme">
                                    {isDark ? (
                                        <Sun className="w-5 h-5 text-warning"/>
                                    ):(
                                        <Moon className="w-5 h-5 text-foreground-soft"/>
                                    )}
                                </button>
                            </>
                        ) : (
                            // Usuario autenticado
                            <>
                                <Link to="/dashboard">
                                    <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg">
                                        Panel de Gestión
                                    </button>
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-2 bg-danger text-white rounded-lg hover:brightness-90 transition duration-300 font-medium shadow-md hover:shadow-lg"
                                >
                                    Cerrar sesión
                                </button>
                                <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Toggle Theme">
                                    {isDark ? (
                                        <Sun className="w-5 h-5 text-warning"/>
                                    ):(
                                        <Moon className="w-5 h-5 text-foreground-soft"/>
                                    )}
                                </button>
                            </>
                        )}

                    </div>
                     <div className="lg:hidden ml-14 space-x-4">
                        <button
                            className="text-foreground focus:outline-none"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="lg:hidden mt-4 pb-2">
                        <ul className="flex flex-col space-y-4">
                            <li><Link to="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent transition-colors">Inicio</Link></li>
                            <li><a href="#" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent transition-colors">Calendario</a></li>
                            <li><a href="#conocenos" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent transition-colors">Conocenos</a></li>
                            <li><a href="#contacto" onClick={() => setIsMenuOpen(false)} className="block hover:text-accent transition-colors">Contacto</a></li>
                        </ul>
                        <div className="flex flex-col space-y-3 mt-6">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <button className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg">
                                            Iniciar sesión
                                        </button>
                                    </Link>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <button className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg">
                                            Panel de Gestión
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <button className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition duration-300 font-medium shadow-md hover:shadow-lg">
                                            Panel de Gestión
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-6 py-2 bg-danger text-white rounded-lg hover:brightness-90 transition duration-300 font-medium shadow-md hover:shadow-lg"
                                    >
                                        Cerrar sesión
                                    </button>
                                </>
                            )}
                            <button
                                onClick={onToggleTheme}
                                className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors border border-border"
                                aria-label="Toggle Theme"
                            >
                                {isDark ? (
                                    <>
                                        <Sun className="w-5 h-5 text-warning"/>
                                        <span>Modo claro</span>
                                    </>
                                ):(
                                    <>
                                        <Moon className="w-5 h-5 text-foreground-soft"/>
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