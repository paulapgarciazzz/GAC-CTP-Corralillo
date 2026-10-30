import escudoOriginal from '../../../../assets/escudo.webp';
import logoOriginal from '../../../../assets/logo.webp';
import Aviso from '../../../../components/Aviso';
import { EstadoCargando } from '../../../../components/EstadoLista';
import { usePermisosModulo } from '../../../../auth/hooks/usePermisosModulo';
import CamposSeccion from '../../components/CamposSeccion';
import AccionesSeccion from '../../components/AccionesSeccion';
import CampoImagen from '../../components/CampoImagen';
import GestorFotos from '../../components/GestorFotos';
import { useSeccionPersonalizacion } from '../../hooks/useSeccionPersonalizacion';

const COLORES = [
    { campo: 'color_primario', label: 'Color principal', tipo: 'color', requerido: true, ancho: 'medio', ayuda: 'Botones, enlaces y elementos destacados.' },
    { campo: 'color_primario_hover', label: 'Color principal (al pasar el cursor)', tipo: 'color', requerido: true, ancho: 'medio', ayuda: 'Normalmente un tono más oscuro del principal.' },
    { campo: 'color_acento', label: 'Color de acento', tipo: 'color', requerido: true, ancho: 'medio', ayuda: 'Lema y detalles secundarios.' },
    { campo: 'color_riel', label: 'Color del pie de página', tipo: 'color', requerido: true, ancho: 'medio', ayuda: 'Fondo del pie de página y la portada.' },
];

const GALERIA = [
    { campo: 'mostrar_galeria', label: 'Mostrar galería en la landing', tipo: 'switch', ayuda: 'Se muestra después de «Conócenos» si hay al menos una foto visible.' },
    { campo: 'galeria_titulo', label: 'Título de la galería', requerido: true, max: 80, ancho: 'medio' },
    { campo: 'galeria_descripcion', label: 'Descripción', max: 400, ancho: 'medio' },
];

/** Diferencia de luminancia (WCAG) entre el blanco del texto y el color dado. */
function contrasteConBlanco(hex) {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex ?? '')) return null;
    const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const luminancia = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return 1.05 / (luminancia + 0.05);
}

function MuestraColores({ valores }) {
    const contraste = contrasteConBlanco(valores.color_primario);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4" style={{ backgroundColor: valores.color_riel }}>
                <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: valores.color_primario }}>Botón principal</span>
                <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: valores.color_primario_hover }}>Al pasar el cursor</span>
                <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: valores.color_acento }}>Lema</span>
                <span className="text-sm text-white/80">Texto del pie de página</span>
            </div>
            {contraste !== null && contraste < 4.5 && (
                <p className="text-xs text-warning">
                    El texto blanco sobre el color principal tiene poco contraste ({contraste.toFixed(1)}:1; se recomienda 4.5:1 o más). Considera un tono más oscuro.
                </p>
            )}
            <p className="text-xs text-foreground-faint">
                Los colores se aplican al tema claro. El tema oscuro conserva su paleta para mantener la legibilidad.
            </p>
        </div>
    );
}

export default function AparienciaGaleriaTab() {
    const { puedeCrear, puedeEditar, puedeEliminar } = usePermisosModulo('personalizacion');
    const seccion = useSeccionPersonalizacion('apariencia');

    if (seccion.cargando) return <EstadoCargando texto="Cargando apariencia..." />;
    if (!seccion.datos) return <Aviso mensaje={seccion.error} onReintentar={seccion.cargar} />;

    const { imagenes } = seccion.datos;

    const enviar = (e) => {
        e.preventDefault();
        seccion.guardar();
    };

    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Escudo y logotipo</h2>
                    <p className="mt-1 text-sm text-foreground-soft">Se guardan al elegir la imagen. PNG con fondo transparente, máximo 2 MB.</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                    <CampoImagen
                        titulo="Escudo institucional"
                        descripcion="Landing (barra, portada y pie de página). También se usa en los correos si no tienen un escudo propio."
                        url={imagenes.escudo.url}
                        urlPredeterminada={escudoOriginal}
                        personalizada={imagenes.escudo.personalizada}
                        puedeEditar={puedeEditar}
                        onSubir={(archivo) => seccion.subirImagen('escudo', archivo)}
                        onRestaurar={() => seccion.restaurarImagen('escudo')}
                        fondo="oscuro"
                    />
                    <CampoImagen
                        titulo="Logotipo del panel"
                        descripcion="Menú lateral del panel administrativo."
                        url={imagenes.logo.url}
                        urlPredeterminada={logoOriginal}
                        personalizada={imagenes.logo.personalizada}
                        puedeEditar={puedeEditar}
                        onSubir={(archivo) => seccion.subirImagen('logo', archivo)}
                        onRestaurar={() => seccion.restaurarImagen('logo')}
                    />
                </div>
            </section>

            <form onSubmit={enviar} className="space-y-8">
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Colores institucionales</h2>
                    <CamposSeccion idPrefijo="apariencia" campos={COLORES} valores={seccion.valores} errores={seccion.errores} onChange={seccion.actualizarCampo} disabled={!puedeEditar} />
                    <MuestraColores valores={seccion.valores} />
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Galería de la landing</h2>
                    <CamposSeccion idPrefijo="apariencia" campos={GALERIA} valores={seccion.valores} errores={seccion.errores} onChange={seccion.actualizarCampo} disabled={!puedeEditar} />
                </section>

                <AccionesSeccion
                    puedeEditar={puedeEditar}
                    guardando={seccion.guardando}
                    error={seccion.error}
                    mensajeExito={seccion.mensajeExito}
                    onRestaurar={seccion.restaurarTextos}
                    textoRestaurar="Restaurar colores y textos originales"
                />
            </form>

            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Fotografías de la galería</h2>
                    <p className="mt-1 text-sm text-foreground-soft">PNG, JPG o WEBP, máximo 4 MB. Las fotos ocultas no se muestran en la landing.</p>
                </div>
                <GestorFotos
                    destino="galeria"
                    textoVacio="Todavía no hay fotos en la galería."
                    puedeCrear={puedeCrear}
                    puedeEditar={puedeEditar}
                    puedeEliminar={puedeEliminar}
                />
            </section>
        </div>
    );
}
