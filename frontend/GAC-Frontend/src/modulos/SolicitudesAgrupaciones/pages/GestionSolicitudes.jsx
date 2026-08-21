import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { obtenerSolicitudes, actualizarEstadoSolicitud } from '../services/solicitudService';
import ListaSolicitudes from '../components/ListaSolicitudes';
import DetalleSolicitud from '../components/DetalleSolicitud';

export default function GestionSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await obtenerSolicitudes();
            if (result.success) {
                setSolicitudes(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        })();
    }, []);

    const cambiarEstado = async (id, nuevoEstado) => {
        const result = await actualizarEstadoSolicitud(id, nuevoEstado);
        if (result.success) {
            setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)));
        } else {
            setError(result.error);
        }
    };

    const solicitudSeleccionada = solicitudes.find((s) => s.id === selectedId) ?? null;

    return (
        <div className="space-y-4">
            <h1 className="text-left text-xl font-bold text-gray-900 dark:text-white">Gestión de Solicitudes</h1>

            {error && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-[#adec83]" size={28} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 h-[calc(100vh-11rem)]">
                    <div className={`bg-gray-700 rounded-xl shadow-2xl overflow-y-auto ${selectedId ? 'hidden lg:block' : 'block'}`}>
                        <ListaSolicitudes
                            solicitudes={solicitudes}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onAceptar={(id) => cambiarEstado(id, 'aprobada')}
                            onRechazar={(id) => cambiarEstado(id, 'rechazada')}
                        />
                    </div>

                    <div className={`bg-gray-700 rounded-xl shadow-2xl overflow-y-auto ${selectedId ? 'block' : 'hidden lg:block'}`}>
                        <DetalleSolicitud solicitud={solicitudSeleccionada} onBack={() => setSelectedId(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}
