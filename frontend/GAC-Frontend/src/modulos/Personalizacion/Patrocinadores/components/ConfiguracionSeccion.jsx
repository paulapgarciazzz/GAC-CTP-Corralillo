import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import {
    actualizarConfiguracionPatrocinadores,
    obtenerConfiguracionPatrocinadores,
} from '../services/patrocinadorService';

export default function ConfiguracionSeccion() {
    const [valores, setValores] = useState({ titulo: '', descripcion: '' });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let activo = true;

        obtenerConfiguracionPatrocinadores().then((resultado) => {
            if (!activo) return;
            if (resultado.success) setValores(resultado.data);
            else setError(resultado.error);
            setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const guardar = async (event) => {
        event.preventDefault();
        setGuardando(true);
        setError('');
        setMensajeExito('');

        const resultado = await actualizarConfiguracionPatrocinadores(valores);
        setGuardando(false);

        if (resultado.success) {
            setValores(resultado.data);
            setMensajeExito('Configuración actualizada correctamente.');
            window.setTimeout(() => setMensajeExito(''), 3500);
        } else {
            setError(resultado.error);
        }
    };

    if (cargando) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-foreground-soft">
                <Loader2 className="animate-spin text-primary" size={20} />
                Cargando configuración...
            </div>
        );
    }

    return (
        <form onSubmit={guardar} className="space-y-4 max-w-xl">
            <div>
                <label className="block text-sm font-medium text-foreground-soft mb-1">Título de la sección</label>
                <input
                    type="text"
                    value={valores.titulo}
                    onChange={(event) => setValores((prev) => ({ ...prev, titulo: event.target.value }))}
                    required
                    maxLength={255}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground-soft mb-1">Descripción (opcional)</label>
                <textarea
                    value={valores.descripcion ?? ''}
                    onChange={(event) => setValores((prev) => ({ ...prev, descripcion: event.target.value }))}
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>

            {mensajeExito && <div role="status" className="p-3 bg-success-soft border border-success/30 rounded-lg text-success text-sm">{mensajeExito}</div>}
            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

            <button type="submit" disabled={guardando} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors cursor-pointer">
                {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </form>
    );
}
