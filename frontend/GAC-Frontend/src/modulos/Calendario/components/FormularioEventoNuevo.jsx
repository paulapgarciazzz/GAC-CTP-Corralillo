import { useState } from 'react';

const initialState = {
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
};

function Campo({ label, name, value, onChange, type = 'text' }) {
    return (
        <div className="space-y-1">
            <label htmlFor={`evento-${name}`} className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">
                {label}
            </label>
            <input
                id={`evento-${name}`}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}

export default function FormularioEventoNuevo({ onSubmit, onCancel }) {
    const [form, setForm] = useState(initialState);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { titulo, fechaInicio, fechaFin, horaInicio, horaFin } = form;
        if (!titulo || !fechaInicio || !fechaFin || !horaInicio || !horaFin) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        const start = new Date(`${fechaInicio}T${horaInicio}`);
        const end = new Date(`${fechaFin}T${horaFin}`);

        if (end <= start) {
            setError('La fecha y hora de fin debe ser posterior a la de inicio.');
            return;
        }

        setError('');
        onSubmit({
            id: `evt-${Date.now()}`,
            title: titulo,
            start,
            end,
            category: 'info',
            allDay: false,
        });
        setForm(initialState);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div role="alert" className="p-3 bg-danger-soft border border-danger/30 rounded-lg text-danger text-sm">
                    {error}
                </div>
            )}

            <Campo label="Título del evento" name="titulo" value={form.titulo} onChange={handleChange} />

            <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Fecha de inicio" name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} />
                <Campo label="Fecha de fin" name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Hora de inicio" name="horaInicio" type="time" value={form.horaInicio} onChange={handleChange} />
                <Campo label="Hora de fin" name="horaFin" type="time" value={form.horaFin} onChange={handleChange} />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full py-2.5 px-4 border border-border rounded-lg text-foreground-soft font-semibold hover:bg-surface-soft transition-colors cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                    Crear evento
                </button>
            </div>
        </form>
    );
}
