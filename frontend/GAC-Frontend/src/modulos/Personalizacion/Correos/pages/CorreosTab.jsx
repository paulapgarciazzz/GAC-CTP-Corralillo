import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Monitor, RotateCcw, Smartphone } from 'lucide-react';
import Aviso from '../../../../components/Aviso';
import { EstadoCargando } from '../../../../components/EstadoLista';
import { usePermisosModulo } from '../../../../auth/hooks/usePermisosModulo';
import CamposSeccion from '../../components/CamposSeccion';
import AccionesSeccion from '../../components/AccionesSeccion';
import CampoImagen from '../../components/CampoImagen';
import { useSeccionPersonalizacion } from '../../hooks/useSeccionPersonalizacion';
import { vistaPreviaCorreo } from '../../services/personalizacionService';

const TIPOS = [
    { key: 'aprobada', label: 'Solicitud aprobada' },
    { key: 'rechazada', label: 'Solicitud rechazada' },
    { key: 'detalle', label: 'Detalles de la solicitud' },
];

const CAMPOS = [
    { campo: 'asunto', label: 'Asunto', requerido: true, max: 150, ancho: 'medio' },
    { campo: 'encabezado', label: 'Encabezado', requerido: true, max: 120, ancho: 'medio' },
    { campo: 'saludo', label: 'Saludo', max: 150 },
    { campo: 'introduccion', label: 'Introducción', tipo: 'area', max: 1000, filas: 2 },
    { campo: 'mensaje_principal', label: 'Mensaje principal', tipo: 'area', max: 3000, filas: 4, ayuda: 'Va después de los datos de la solicitud.' },
    { campo: 'despedida', label: 'Despedida', tipo: 'area', max: 500, filas: 2, ancho: 'medio' },
    { campo: 'firma', label: 'Firma', tipo: 'area', max: 500, filas: 2, ancho: 'medio' },
    { campo: 'aviso', label: 'Aviso de correo automático', tipo: 'area', max: 500, filas: 2 },
    { campo: 'pie_pagina', label: 'Pie de página', tipo: 'area', max: 500, filas: 2 },
];

const ORIGEN_ESCUDO = {
    correos: 'Escudo propio de los correos.',
    apariencia: 'Usando el escudo de «Apariencia y galería».',
    predeterminado: 'Usando el escudo original del colegio.',
};

/** Vista previa renderizada por el backend con datos de ejemplo. No envía ningún correo. */
function VistaPrevia({ tipo, textos, escudoUrl }) {
    const [previa, setPrevia] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [movil, setMovil] = useState(false);
    const clave = JSON.stringify(textos);

    useEffect(() => {
        let activo = true;
        // Espera a que se deje de escribir para no pedir una vista previa por tecla.
        const temporizador = window.setTimeout(async () => {
            setCargando(true);
            const resultado = await vistaPreviaCorreo(tipo, JSON.parse(clave));
            if (!activo) return;
            setCargando(false);
            if (resultado.success) {
                setPrevia(resultado.data);
                setError('');
            } else {
                setError(resultado.error);
            }
        }, 500);

        return () => {
            activo = false;
            window.clearTimeout(temporizador);
        };
    }, [tipo, clave, escudoUrl]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    Vista previa
                    {cargando && <Loader2 size={16} className="animate-spin text-primary" />}
                </h3>
                <div className="inline-flex rounded-lg border border-border p-0.5" role="group" aria-label="Tamaño de la vista previa">
                    {[{ valor: false, Icono: Monitor, texto: 'Escritorio' }, { valor: true, Icono: Smartphone, texto: 'Celular' }].map(({ valor, Icono, texto }) => (
                        <button
                            key={texto}
                            type="button"
                            onClick={() => setMovil(valor)}
                            aria-pressed={movil === valor}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${movil === valor ? 'bg-primary text-on-primary' : 'text-foreground-soft hover:bg-background'}`}
                        >
                            <Icono size={14} />{texto}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-foreground-faint">
                Datos de ejemplo, sin envío real. Los datos de la solicitud (encargado, agrupación, fechas) se completan automáticamente en cada correo.
            </p>

            <Aviso mensaje={error} />

            {previa && (
                <div className="overflow-hidden rounded-xl border border-border bg-[#f4f4f4]">
                    <div className="border-b border-border bg-surface px-4 py-2 text-sm">
                        <span className="text-foreground-faint">Asunto: </span>
                        <span className="font-medium text-foreground">{previa.asunto}</span>
                    </div>
                    <div className="flex justify-center p-2 sm:p-4">
                        <iframe
                            title="Vista previa del correo"
                            srcDoc={previa.html}
                            sandbox=""
                            className="h-160 rounded-lg bg-white shadow-sm transition-all"
                            style={{ width: movil ? 375 : '100%', maxWidth: '100%' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CorreosTab() {
    const { puedeEditar } = usePermisosModulo('personalizacion');
    const seccion = useSeccionPersonalizacion('correos');
    const [tipo, setTipo] = useState('aprobada');

    if (seccion.cargando) return <EstadoCargando texto="Cargando plantillas de correo..." />;
    if (!seccion.datos) return <Aviso mensaje={seccion.error} onReintentar={seccion.cargar} />;

    const { imagenes, escudo_efectivo: escudo, variables, predeterminados } = seccion.datos;
    const textos = seccion.valores[tipo] ?? {};
    const escudoNoPublico = !escudo.url.startsWith('https://');

    const cambiarCampo = (campo, valor) =>
        seccion.setValores((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [campo]: valor } }));

    const restaurarTipo = () =>
        seccion.setValores((prev) => ({ ...prev, [tipo]: predeterminados[tipo] }));

    const enviar = (e) => {
        e.preventDefault();
        seccion.guardar();
    };

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Escudo de los correos</h2>
                    <p className="mt-1 text-sm text-foreground-soft">
                        Aparece en el encabezado de los tres correos. Si no se elige uno propio se usa el de «Apariencia y galería» y, si tampoco hay, el original del colegio.
                    </p>
                </div>
                <CampoImagen
                    titulo="Escudo en el encabezado"
                    url={imagenes.escudo.url}
                    urlPredeterminada={escudo.url}
                    personalizada={imagenes.escudo.personalizada}
                    etiquetaOrigen={ORIGEN_ESCUDO[escudo.origen]}
                    puedeEditar={puedeEditar}
                    onSubir={(archivo) => seccion.subirImagen('escudo', archivo)}
                    onRestaurar={() => seccion.restaurarImagen('escudo')}
                />
                {escudoNoPublico && (
                    <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>
                            El escudo se enlaza desde <span className="break-all font-mono">{escudo.url}</span>, que no es una dirección pública HTTPS.
                            Los destinatarios no lo verán hasta configurar <span className="font-mono">PERSONALIZACION_URL_PUBLICA</span> (o <span className="font-mono">APP_URL</span>) con el dominio HTTPS del servidor.
                        </span>
                    </p>
                )}
            </section>

            <div className="border-b border-border overflow-x-auto">
                <nav className="flex gap-1 min-w-max" aria-label="Plantillas de correo">
                    {TIPOS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTipo(key)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${key === tipo ? 'border-primary text-primary' : 'border-transparent text-foreground-soft hover:text-foreground'}`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
                <form onSubmit={enviar} className="space-y-5">
                    <div className="rounded-lg border border-border bg-background p-3 text-xs text-foreground-soft">
                        <p className="font-medium text-foreground">Variables disponibles</p>
                        <p className="mt-1">Se reemplazan con los datos de cada solicitud. Usa **texto** para negrita.</p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(variables).map(([variable, descripcion]) => (
                                <li key={variable} title={descripcion} className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-foreground">
                                    {`{${variable}}`}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <CamposSeccion
                        idPrefijo={`correo-${tipo}`}
                        campos={CAMPOS}
                        valores={textos}
                        errores={seccion.errores}
                        prefijoError={`${tipo}.`}
                        onChange={cambiarCampo}
                        disabled={!puedeEditar}
                    />

                    {puedeEditar && (
                        <button type="button" onClick={restaurarTipo} className="inline-flex items-center gap-2 text-sm font-medium text-foreground-soft hover:text-foreground cursor-pointer">
                            <RotateCcw size={14} />Restaurar los textos originales de este correo
                        </button>
                    )}

                    <AccionesSeccion
                        puedeEditar={puedeEditar}
                        guardando={seccion.guardando}
                        error={seccion.error}
                        mensajeExito={seccion.mensajeExito}
                        onRestaurar={seccion.restaurarTextos}
                        textoRestaurar="Restaurar los tres correos"
                    />
                </form>

                <VistaPrevia tipo={tipo} textos={textos} escudoUrl={escudo.url} />
            </div>
        </div>
    );
}
