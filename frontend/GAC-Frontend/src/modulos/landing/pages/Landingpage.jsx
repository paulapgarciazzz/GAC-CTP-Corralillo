import Navbar from '../components/Navbar'
import Carousel from '../components/Carousel'
import VisionMision from '../components/VisionMision'
import Contacto from '../components/Contacto'
import Footer from '../components/Footer'
import { useTheme } from '../../../hooks/useTheme'

const Landingpage = () =>{
    const { isDark, toggleTheme } = useTheme();
    return(
        <>
            <div className= "Landing-page">
                <Navbar isDark={isDark} onToggleTheme={toggleTheme}/>
                <Carousel/>
                <VisionMision/>
                <Contacto/>
                <Footer/>
            </div>

        </>
    )
}
export default Landingpage;