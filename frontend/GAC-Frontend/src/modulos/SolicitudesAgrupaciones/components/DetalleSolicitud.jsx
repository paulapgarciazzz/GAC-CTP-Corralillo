import { ArrowLeft } from 'lucide-react';
import EstadoBadge from './EstadoBadge';

function Campo({ etiqueta, valor }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{etiqueta}</p>
            <p className="text-sm text-gray-100 whitespace-pre-wrap">{valor || '—'}</p>
        </div>
    );
}

export default function DetalleSolicitud({ solicitud, onBack }) {
    if (!solicitud) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <p className="text-sm text-gray-400 text-center">Selecciona una solicitud para ver los detalles.</p>
            </div>
        );
    }

    const { encargado, agrupacion } = solicitud;

    return (
        <div className="px-6 sm:px-10 py-6 space-y-8">
            <button
                type="button"
                onClick={onBack}
                className="lg:hidden flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} />
                Volver a la lista
            </button>

            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">{agrupacion.nombre}</h2>
                <EstadoBadge estado={solicitud.estado} />
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#adec83] uppercase tracking-wider">Datos del encargado</h3>
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    <Campo etiqueta="Cédula" valor={encargado.cedula} />
                    <Campo etiqueta="Nombre completo" valor={`${encargado.primer_nombre} ${encargado.apellido}`} />
                    <Campo etiqueta="Correo electrónico" valor={encargado.email} />
                    <Campo etiqueta="Número de teléfono" valor={encargado.numero_tel} />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#adec83] uppercase tracking-wider">Datos de la agrupación</h3>
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    <Campo etiqueta="Nombre de la agrupación" valor={agrupacion.nombre} />
                    <Campo etiqueta="Lugar de procedencia" valor={agrupacion.lugar_procedencia} />
                    <Campo etiqueta="Cantidad de integrantes" valor={agrupacion.cantidad_integrantes} />
                    <div className="col-span-full">
                        <Campo etiqueta="Reseña" valor={agrupacion.resena} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#adec83] uppercase tracking-wider">Datos de la solicitud</h3>
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    <Campo etiqueta="Fecha de solicitud" valor={solicitud.fecha_solicitud} />
                    <Campo etiqueta="Fecha asignada" valor={solicitud.fecha_asignada || 'Sin asignar'} />
                    <Campo etiqueta="Hora asignada" valor={solicitud.hora_asignada || '—'} />
                    <div className="col-span-full">
                        <Campo etiqueta="Comentarios" valor={solicitud.comentarios} />
                    </div>
                </div>
            </div>
        </div>
    );
}
