import { Link } from '@tanstack/react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import escudoOriginal from '../../../assets/escudo.webp';
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
        <footer className="relative overflow-hidden bg-rail text-white/80">
            <div aria-hidden="true" className="patron-puntos absolute inset-0 mask-b-from-0% mask-b-to-80%" />
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-rail-activo/60" />
            <div className="relative container mx-auto grid gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <img src={apariencia.escudo_url || escudoOriginal} alt="" width="48" height="48" loading="lazy" className="h-12 w-12 object-contain" />
                        <span className="font-display text-lg font-semibold leading-tight text-white">{landing.nombre_institucion}</span>
                    </div>
                    {landing.footer_descripcion && (
                        <p className="text-sm text-white/75">{landing.footer_descripcion}</p>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-white">Enlaces</h2>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#inicio" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Inicio</a></li>
                        <li><a href="#evento" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Evento destacado</a></li>
                        <li><a href="#calendario" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Calendario</a></li>
                        <li><a href="#conocenos" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Conócenos</a></li>
                        {galeria.length > 0 && (
                            <li><a href="#galeria" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">{apariencia.galeria_titulo}</a></li>
                        )}
                        <li><a href="#ubicacion" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Ubicación</a></li>
                        <li><Link to="/login" className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">Iniciar sesión</Link></li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-white">Contacto</h2>
                    <ul className="space-y-3 text-sm">
                        {contacto.correo && (
                            <li className="flex items-start gap-2">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <a href={`mailto:${contacto.correo}`} className="break-all transition-colors hover:text-white hover:underline underline-offset-4">{contacto.correo}</a>
                            </li>
                        )}
                        {contacto.telefono && (
                            <li className="flex items-start gap-2">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <a href={`tel:${contacto.telefono.replace(/[^\d+]/g, '')}`} className="inline-block py-0.5 transition-colors hover:text-white hover:underline underline-offset-4">{contacto.telefono}</a>
                            </li>
                        )}
                        {contacto.direccion && (
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>{contacto.direccion}</span>
                            </li>
                        )}
                    </ul>
                </div>

                {redes.length > 0 && (
                    <div>
                        <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-white">Redes sociales</h2>
                        <div className="flex flex-wrap gap-3">
                            {redes.map(({ clave, etiqueta, Icono, enlace }) => (
                                <a
                                    key={clave}
                                    href={enlace ? enlace(contacto[clave]) : contacto[clave]}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${etiqueta} (se abre en una pestaña nueva)`}
                                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 transition-colors hover:bg-white/15"
                                >
                                    <Icono className="h-5 w-5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative border-t border-white/10 py-5 text-center text-xs text-white/70">
                &copy; {anio} {landing.nombre_institucion} — Todos los derechos reservados.
            </div>
        </footer>
    );
};

export default Footer;
