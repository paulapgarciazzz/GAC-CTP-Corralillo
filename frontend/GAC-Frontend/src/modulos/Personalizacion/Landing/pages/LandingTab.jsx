import Aviso from '../../../../components/Aviso';
import { EstadoCargando } from '../../../../components/EstadoLista';
import { usePermisosModulo } from '../../../../auth/hooks/usePermisosModulo';
import CamposSeccion from '../../components/CamposSeccion';
import AccionesSeccion from '../../components/AccionesSeccion';
import GestorFotos from '../../components/GestorFotos';
import { useSeccionPersonalizacion } from '../../hooks/useSeccionPersonalizacion';

const GRUPOS = [
    {
        titulo: 'Portada (Hero)',
        campos: [
            { campo: 'nombre_institucion', label: 'Nombre de la institución', requerido: true, max: 80, ancho: 'medio', ayuda: 'Se muestra en la barra de navegación y el pie de página.' },
            { campo: 'hero_etiqueta', label: 'Etiqueta superior', max: 80, ancho: 'medio' },
            { campo: 'hero_titulo', label: 'Título principal', requerido: true, max: 120 },
            { campo: 'hero_descripcion', label: 'Descripción', tipo: 'area', max: 400 },
        ],
    },
    {
        titulo: 'Sección «Conócenos»',
        campos: [
            { campo: 'conocenos_titulo', label: 'Título', requerido: true, max: 80, ancho: 'medio' },
            { campo: 'lema', label: 'Lema', max: 120, ancho: 'medio' },
            { campo: 'conocenos_descripcion', label: 'Descripción', tipo: 'area', max: 400, filas: 2 },
            { campo: 'vision_titulo', label: 'Título de la visión', requerido: true, max: 60, ancho: 'medio' },
            { campo: 'mision_titulo', label: 'Título de la misión', requerido: true, max: 60, ancho: 'medio' },
            { campo: 'vision', label: 'Visión', tipo: 'area', requerido: true, max: 1500, filas: 5, ancho: 'medio' },
            { campo: 'mision', label: 'Misión', tipo: 'area', requerido: true, max: 1500, filas: 5, ancho: 'medio' },
        ],
    },
    {
        titulo: 'Pie de página',
        campos: [
            { campo: 'footer_descripcion', label: 'Texto bajo el escudo', max: 200 },
        ],
    },
];

export default function LandingTab() {
    const { puedeCrear, puedeEditar, puedeEliminar } = usePermisosModulo('personalizacion');
    const seccion = useSeccionPersonalizacion('landing');

    if (seccion.cargando) return <EstadoCargando texto="Cargando textos de la landing..." />;
    if (!seccion.datos) return <Aviso mensaje={seccion.error} onReintentar={seccion.cargar} />;

    const enviar = (e) => {
        e.preventDefault();
        seccion.guardar();
    };

    return (
        <div className="space-y-10">
            <form onSubmit={enviar} className="space-y-8">
                {GRUPOS.map(({ titulo, campos }) => (
                    <section key={titulo} className="space-y-3">
                        <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
                        <CamposSeccion
                            idPrefijo="landing"
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
                />
            </form>

            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Imágenes de la portada</h2>
                    <p className="mt-1 text-sm text-foreground-soft">
                        Fotos del carrusel del Hero. Si no hay ninguna visible, se muestran las fotos originales del colegio.
                        Se recomiendan fotos horizontales de al menos 1600 px de ancho.
                    </p>
                </div>
                <GestorFotos
                    destino="hero"
                    textoVacio="Sin fotos propias: la portada usa las fotos originales."
                    puedeCrear={puedeCrear}
                    puedeEditar={puedeEditar}
                    puedeEliminar={puedeEliminar}
                />
            </section>
        </div>
    );
}
