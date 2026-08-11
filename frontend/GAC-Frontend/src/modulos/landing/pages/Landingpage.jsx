import Navbar from '../components/Navbar'
import Carousel from '../components/Carousel'
import VisionMision from '../components/VisionMision'
import Contacto from '../components/Contacto'
import Footer from '../components/Footer'

const Landingpage = () =>{
    return(
        <>
            <div className= "Landing-page">
                <Navbar/>
                <Carousel/>
                <VisionMision/>
                <Contacto/>
                <Footer/>
            </div>
            
        </>
    )
}
export default Landingpage;