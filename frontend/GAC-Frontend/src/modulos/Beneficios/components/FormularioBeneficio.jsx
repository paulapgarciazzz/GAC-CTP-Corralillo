import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BENEFICIO_CONFIG } from '../services/beneficioService';

const obtenerValoresIniciales = (categoria, beneficio) => {
    if (!beneficio) {
        if (categoria === 'transporte') return { matricula: '', tipo: '', capacidad: '', cedula_conductor: '', nombre_conductor: '', apellido_conductor: '' };
        if (categoria === 'aula') return { nombre: '', capacidad: '', encargado: '' };
        if (categoria === 'alimentacion') return { tiempo_comida: '' };
        if (categoria === 'ruta') return { nombre_ruta: '' };
        if (categoria === 'mobiliario') return { nombre: '', cantidad_disponible: '', encargado: '' };
        return { nombre: '' };
    }

    return { ...beneficio };
};

function Campo({ label, name, value, onChange, error, type = 'text', disabled = false, required = true, min, maxLength }) {
    return (
        <div className="space-y-1">
            <label htmlFor={`beneficio-${name}`} className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                {label}
            </label>
            <input
                id={`beneficio-${name}`}
                name={name}
                type={type}
                value={value ?? ''}
                onChange={onChange}
                disabled={disabled}
                required={required}
                min={min}
                maxLength={maxLength}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-soft disabled:text-foreground-faint disabled:cursor-not-allowed"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

export default function FormularioBeneficio({ categoria, beneficio, loading, error, errors, onSubmit }) {
    const [valores, setValores] = useState(() => obtenerValoresIniciales(categoria, beneficio));
    const config = BENEFICIO_CONFIG[categoria];
    const editando = Boolean(beneficio);

    const actualizarValor = (event) => {
        const { name, value } = event.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const errorDe = (campo) => errors?.[campo]?.[0] ?? '';

    const handleSubmit = (event) => {
        event.preventDefault();
        const payload = { ...valores };
        if (editando && categoria === 'transporte') delete payload.matricula;
        if (categoria === 'mobiliario' && payload.cantidad_disponible === '') payload.cantidad_disponible = null;
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {categoria === 'alimentacion' && (
                <Campo label="Tiempo de comida" name="tiempo_comida" value={valores.tiempo_comida} onChange={actualizarValor} error={errorDe('tiempo_comida')} maxLength={100} />
            )}

            {categoria === 'aula' && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Nombre" name="nombre" value={valores.nombre} onChange={actualizarValor} error={errorDe('nombre')} maxLength={100} />
                    <Campo label="Capacidad" name="capacidad" type="number" min="1" value={valores.capacidad} onChange={actualizarValor} error={errorDe('capacidad')} />
                    <div className="sm:col-span-2">
                        <Campo label="Encargado" name="encargado" value={valores.encargado} onChange={actualizarValor} error={errorDe('encargado')} required={false} maxLength={150} />
                    </div>
                </div>
            )}

            {categoria === 'mobiliario' && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Campo label="Nombre" name="nombre" value={valores.nombre} onChange={actualizarValor} error={errorDe('nombre')} maxLength={100} />
                    </div>
                    <Campo label="Cantidad disponible" name="cantidad_disponible" type="number" min="0" value={valores.cantidad_disponible} onChange={actualizarValor} error={errorDe('cantidad_disponible')} required={false} />
                    <Campo label="Encargado" name="encargado" value={valores.encargado} onChange={actualizarValor} error={errorDe('encargado')} required={false} maxLength={150} />
                </div>
            )}

            {categoria === 'ruta' && (
                <Campo label="Nombre de ruta" name="nombre_ruta" value={valores.nombre_ruta} onChange={actualizarValor} error={errorDe('nombre_ruta')} maxLength={50} />
            )}

            {categoria === 'transporte' && (
                <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Matrícula" name="matricula" value={valores.matricula} onChange={actualizarValor} error={errorDe('matricula')} disabled={editando} maxLength={6} />
                    <Campo label="Tipo" name="tipo" value={valores.tipo} onChange={actualizarValor} error={errorDe('tipo')} maxLength={20} />
                    <Campo label="Capacidad" name="capacidad" type="number" min="1" value={valores.capacidad} onChange={actualizarValor} error={errorDe('capacidad')} />
                    <Campo label="Cédula del conductor" name="cedula_conductor" value={valores.cedula_conductor} onChange={actualizarValor} error={errorDe('cedula_conductor')} maxLength={10} />
                    <Campo label="Nombre del conductor" name="nombre_conductor" value={valores.nombre_conductor} onChange={actualizarValor} error={errorDe('nombre_conductor')} maxLength={100} />
                    <Campo label="Apellido del conductor" name="apellido_conductor" value={valores.apellido_conductor} onChange={actualizarValor} error={errorDe('apellido_conductor')} maxLength={100} />
                </div>
            )}

            {error && <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Guardando...' : editando ? 'Guardar cambios' : `Crear ${config.label.toLowerCase().replace(/s$/, '')}`}
            </button>
        </form>
    );
}
