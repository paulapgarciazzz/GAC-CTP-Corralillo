import { Link } from '@tanstack/react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import escudoOriginal from '../../../assets/escudo.png';
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from './SocialIcons';

// Solo se muestran las redes configuradas en Personalización › Contacto.
const REDES = [
    { clave: 'facebook', etiqueta: 'Facebook', Icono: FacebookIcon },
    { clave: 'instagram', etiqueta: 'Instagram', Icono: InstagramIcon },
    { clave: 'youtube', etiqueta: 'YouTube', Icono: YouTubeIcon },
    { clave: 'tiktok', etiqueta: 'TikTok', Icono: TikTokIcon },
    {
        clave: 'whatsapp',
        etiqueta: 'WhatsApp',
        Icono: WhatsAppIcon,
        enlace: (numero) => `https://wa.me/${numero.replace(/\D/g, '')}`,
    },
];

const Footer = () => {
    const anio = new Date().getFullYear();
    const { landing, contacto, apariencia, galeria } = usePersonalizacion();
    const redes = REDES.filter(({ clave }) => contacto[clave]);

    return (
        <footer className="bg-rail text-white/80">
            <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <img src={apariencia.escudo_url || escudoOriginal} alt={`Escudo del ${landing.nombre_institucion}`} className="h-12 w-12 object-contain" />
                        <span className="text-lg font-bold leading-tight text-white">{landing.nombre_institucion}</span>
                    </div>
                    {landing.footer_descripcion && (
                        <p className="text-sm text-white/60">{landing.footer_descripcion}</p>
                    )}
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Enlaces</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#inicio" className="transition-colors hover:text-white">Inicio</a></li>
                        <li><a href="#evento" className="transition-colors hover:text-white">Evento destacado</a></li>
                        <li><a href="#calendario" className="transition-colors hover:text-white">Calendario</a></li>
                        <li><a href="#conocenos" className="transition-colors hover:text-white">Conócenos</a></li>
                        {galeria.length > 0 && (
                            <li><a href="#galeria" className="transition-colors hover:text-white">{apariencia.galeria_titulo}</a></li>
                        )}
                        <li><a href="#ubicacion" className="transition-colors hover:text-white">Ubicación</a></li>
                        <li><Link to="/login" className="transition-colors hover:text-white">Iniciar sesión</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Contacto</h4>
                    <ul className="space-y-3 text-sm">
                        {contacto.correo && (
                            <li className="flex items-start gap-2">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                                <a href={`mailto:${contacto.correo}`} className="break-all transition-colors hover:text-white">{contacto.correo}</a>
                            </li>
                        )}
                        {contacto.telefono && (
                            <li className="flex items-start gap-2">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                                <a href={`tel:${contacto.telefono.replace(/[^\d+]/g, '')}`} className="transition-colors hover:text-white">{contacto.telefono}</a>
                            </li>
                        )}
                        {contacto.direccion && (
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{contacto.direccion}</span>
                            </li>
                        )}
                    </ul>
                </div>

                {redes.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Redes sociales</h4>
                        <div className="flex flex-wrap gap-3">
                            {redes.map(({ clave, etiqueta, Icono, enlace }) => (
                                <a
                                    key={clave}
                                    href={enlace ? enlace(contacto[clave]) : contacto[clave]}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={etiqueta}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                >
                                    <Icono className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
                &copy; {anio} {landing.nombre_institucion} — Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
