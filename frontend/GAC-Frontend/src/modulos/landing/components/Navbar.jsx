import escudo from '../../../assets/escudo.png'
import { useNavigate, Link } from '@tanstack/react-router'

const Navbar = () => {
    const navigate = useNavigate();
    const handleGoToDashboard = () => {
        navigate({ to: '/dashboard' })
    }
    const handleGoToLogin = () => {
        // Puedes redirigir a una página de login o mostrar un modal
        // Por ahora usaremos un alert
        alert("Funcionalidad de inicio de sesión")
    }
    return (
        <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b
        border-neutral-700/80">
            <div className="container px-4 mx-auto relative text-sm">
                <div className="flex justify-center items-center">
                    <div className= "flex items-center shrink-0">
                        <img className="h-16 w-16 mr-2" src={escudo} alt="Escudo"/>
                        <span className="text-xl tracking-tight">CTP de Corralillo</span>
                    </div>
                    <ul className="hidden lg:flex ml-14 space-x-12">
                        <li><Link to="/" className="hover:text-blue-500">Inicio</Link></li>
                        <li><a href="#" className="hover:text-blue-500">Calendario</a></li>
                        <li><a href="#" className="hover:text-blue-500">Conocenos</a></li>
                        <li><a href="#" className="hover:text-blue-500">Contacto</a></li>
                    </ul>
                    <div className="hidden lg:flex justify-center ml-14 space-x-4 items-center">
                        <button className="px-6 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg" 
                            onClick={handleGoToLogin}>
                            Iniciar sesión
                        </button>
                        
                        <button className="px-6 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg" 
                            onClick={handleGoToDashboard}>
                            Panel de Gestion
                        </button>
                        
                    </div>
                     <div className="lg:hidden ml-14 space-x-4">
                        <button className="text-gray-700 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;