import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import EventoDestacado from '../components/EventoDestacado'
import CalendarioEventos from '../components/calendario/CalendarioEventos'
import Contador from '../components/Contador'
import VisionMision from '../components/VisionMision'
import Galeria from '../components/Galeria'
import Ubicacion from '../components/Ubicacion'
import Patrocinadores from '../components/Patrocinadores'
import Footer from '../components/Footer'
import { useTheme } from '../../../hooks/useTheme'
import { useDesplazamientoSuave } from '../hooks/useDesplazamientoSuave'

const Landingpage = () => {
    const { isDark, toggleTheme } = useTheme();
    useDesplazamientoSuave();
    return (
        <div>
            <a href="#contenido" className="saltar-contenido">Saltar al contenido</a>
            <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
            <main id="contenido" tabIndex={-1} className="focus:outline-none">
                <Hero />
                <EventoDestacado />
                <CalendarioEventos />
                <Contador />
                <VisionMision />
                <Galeria />
                <Ubicacion />
                <Patrocinadores />
            </main>
            <Footer />
        </div>
    )
}
export default Landingpage;
