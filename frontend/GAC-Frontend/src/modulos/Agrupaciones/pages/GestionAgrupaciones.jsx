import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { obtenerAgrupaciones, eliminarAgrupacion } from '../services/agrupacionService';
import TarjetaAgrupacion from '../components/TarjetaAgrupacion';
import ModalEditarAgrupacion from '../components/ModalEditarAgrupacion';
import ModalCrearAgrupacion from '../components/ModalCrearAgrupacion';

export default function GestionAgrupaciones() {
    const [agrupaciones, setAgrupaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [agrupacionEditar, setAgrupacionEditar] = useState(null);
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

    useEffect(() => {
        (async () => {
            const result = await obtenerAgrupaciones();
            if (result.success) {
                setAgrupaciones(result.data);
            } else {
                setError(result.error);
            }
            setLoading(false);
        })();
    }, []);

    const handleActualizado = (agrupacionActualizada) => {
        setAgrupaciones((prev) => prev.map((a) => (a.id === agrupacionActualizada.id ? agrupacionActualizada : a)));
    };

    const handleCreada = (agrupacionCreada) => {
        setAgrupaciones((prev) => [...prev, agrupacionCreada]);
    };

    const handleEliminar = async (agrupacion) => {
        if (!window.confirm(`¿Eliminar la agrupación "${agrupacion.nombre}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        const result = await eliminarAgrupacion(agrupacion.id);
        if (result.success) {
            setAgrupaciones((prev) => prev.filter((a) => a.id !== agrupacion.id));
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => setModalCrearAbierto(true)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                >
                    + Crear agrupación
                </button>
            </div>

            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={28} />
                </div>
            ) : agrupaciones.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-sm text-foreground-faint text-center">No hay agrupaciones registradas todavía.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {agrupaciones.map((agrupacion) => (
                        <TarjetaAgrupacion
                            key={agrupacion.id}
                            agrupacion={agrupacion}
                            onEditar={setAgrupacionEditar}
                            onEliminar={handleEliminar}
                        />
                    ))}
                </div>
            )}

            <ModalEditarAgrupacion
                open={!!agrupacionEditar}
                agrupacion={agrupacionEditar}
                onClose={() => setAgrupacionEditar(null)}
                onActualizado={handleActualizado}
            />

            <ModalCrearAgrupacion
                open={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onCreada={handleCreada}
            />
        </div>
    );
}
