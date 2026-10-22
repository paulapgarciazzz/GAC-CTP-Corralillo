import Aviso from '../../../../components/Aviso';
import { EstadoCargando } from '../../../../components/EstadoLista';
import { usePermisosModulo } from '../../../../auth/hooks/usePermisosModulo';
import CamposSeccion from '../../components/CamposSeccion';
import AccionesSeccion from '../../components/AccionesSeccion';
import { useSeccionPersonalizacion } from '../../hooks/useSeccionPersonalizacion';

const GRUPOS = [
    {
        titulo: 'Datos de contacto',
        descripcion: 'Se muestran en el pie de página de la landing. Deja un campo vacío para ocultarlo.',
        campos: [
            { campo: 'correo', label: 'Correo electrónico', tipo: 'email', max: 150, ancho: 'medio' },
            { campo: 'telefono', label: 'Teléfono', tipo: 'tel', max: 40, ancho: 'medio' },
            { campo: 'direccion', label: 'Dirección', tipo: 'area', max: 255, filas: 2 },
            {
                campo: 'ubicacion_mapa',
                label: 'Ubicación para el mapa',
                max: 255,
                ayuda: 'Texto o código Plus que se busca en Google Maps en la sección «Ubicación». Si queda vacío se usa la dirección.',
            },
        ],
    },
    {
        titulo: 'Redes sociales',
        descripcion: 'Solo aparecen los íconos de las redes que tengan enlace.',
        campos: [
            { campo: 'facebook', label: 'Facebook', tipo: 'url', max: 255, ancho: 'medio', placeholder: 'https://www.facebook.com/...' },
            { campo: 'instagram', label: 'Instagram', tipo: 'url', max: 255, ancho: 'medio', placeholder: 'https://www.instagram.com/...' },
            { campo: 'youtube', label: 'YouTube', tipo: 'url', max: 255, ancho: 'medio', placeholder: 'https://www.youtube.com/@...' },
            { campo: 'tiktok', label: 'TikTok', tipo: 'url', max: 255, ancho: 'medio', placeholder: 'https://www.tiktok.com/@...' },
            { campo: 'whatsapp', label: 'WhatsApp', tipo: 'tel', max: 20, ancho: 'medio', placeholder: '+506 8888 8888', ayuda: 'Número con código de país.' },
        ],
    },
];

export default function InformacionContactoTab() {
    const { puedeEditar } = usePermisosModulo('personalizacion');
    const seccion = useSeccionPersonalizacion('contacto');

    if (seccion.cargando) return <EstadoCargando texto="Cargando información de contacto..." />;
    if (!seccion.datos) return <Aviso mensaje={seccion.error} onReintentar={seccion.cargar} />;

    const enviar = (e) => {
        e.preventDefault();
        seccion.guardar();
    };

    return (
        <form onSubmit={enviar} className="space-y-8">
            {GRUPOS.map(({ titulo, descripcion, campos }) => (
                <section key={titulo} className="space-y-3">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
                        <p className="mt-1 text-sm text-foreground-soft">{descripcion}</p>
                    </div>
                    <CamposSeccion
                        idPrefijo="contacto"
                        campos={campos}
                        valores={seccion.valores}
                        errores={seccion.errores}
                        onChange={seccion.actualizarCampo}
                        disabled={!puedeEditar}
                    />
                </section>
            ))}

            <AccionesSeccion
                puedeEditar={puedeEditar}
                guardando={seccion.guardando}
                error={seccion.error}
                mensajeExito={seccion.mensajeExito}
                onRestaurar={seccion.restaurarTextos}
                textoRestaurar="Restaurar datos originales"
            />
        </form>
    );
}
