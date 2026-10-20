import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import EventoDestacado from '../components/EventoDestacado'
import CalendarioEventos from '../components/calendario/CalendarioEventos'
import Contador from '../components/Contador'
import VisionMision from '../components/VisionMision'
import Ubicacion from '../components/Ubicacion'
import Patrocinadores from '../components/Patrocinadores'
import Footer from '../components/Footer'
import { useTheme } from '../../../hooks/useTheme'

const Landingpage = () => {
    const { isDark, toggleTheme } = useTheme();
    return (
        <div>
            <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
            <Hero />
            <EventoDestacado />
            <CalendarioEventos />
            <Contador />
            <VisionMision />
            <Ubicacion />
            <Patrocinadores />
            <Footer />
        </div>
    )
}
export default Landingpage;
