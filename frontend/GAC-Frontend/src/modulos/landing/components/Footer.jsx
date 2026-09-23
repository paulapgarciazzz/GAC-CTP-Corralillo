import { Link } from '@tanstack/react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import escudo from '../../../assets/escudo.png';
import { FacebookIcon, InstagramIcon } from './SocialIcons';

const Footer = () => {
    const anio = new Date().getFullYear();

    return (
        <footer className="bg-rail text-white/80">
            <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <img src={escudo} alt="Escudo del CTP de Corralillo" className="h-12 w-12 object-contain" />
                        <span className="text-lg font-bold leading-tight text-white">CTP de<br />Corralillo</span>
                    </div>
                    <p className="text-sm text-white/60">Educación · Progreso · Libertad desde 1977.</p>
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Enlaces</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#inicio" className="transition-colors hover:text-white">Inicio</a></li>
                        <li><a href="#evento" className="transition-colors hover:text-white">Evento destacado</a></li>
                        <li><a href="#conocenos" className="transition-colors hover:text-white">Conócenos</a></li>
                        <li><a href="#ubicacion" className="transition-colors hover:text-white">Ubicación</a></li>
                        <li><Link to="/login" className="transition-colors hover:text-white">Iniciar sesión</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Contacto</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                            <a href="mailto:ctp.decorralillo@mep.go.cr" className="transition-colors hover:text-white">ctp.decorralillo@mep.go.cr</a>
                        </li>
                        <li className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>+506 4500 1829</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>150 mts Norte de la plaza de deportes, Corralillo, Nicoya, Guanacaste</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Redes sociales</h4>
                    <div className="flex gap-3">
                        <a
                            href="https://www.facebook.com/CTPDeCorralillo/?locale=es_LA"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                        >
                            <FacebookIcon className="h-5 w-5" />
                        </a>
                        <a
                            href="https://www.instagram.com/ctpdecorralillo/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram"
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                        >
                            <InstagramIcon className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
                &copy; {anio} CTP de Corralillo — Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
