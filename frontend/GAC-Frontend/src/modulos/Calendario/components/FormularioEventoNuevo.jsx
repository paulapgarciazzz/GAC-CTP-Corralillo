import { useState } from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import SelectorHora from '../../../components/SelectorHora';
import { CATEGORY_COLORS } from '../lib/categorias';
import { BOTON_PELIGRO_CLASS, INPUT_CLASS, LABEL_CLASS } from '../lib/formulario';
import { AlertaError, BotonesFormulario } from './Formulario';

const DARK_SOLID_BG = {
    info: 'dark:bg-info',
    success: 'dark:bg-success',
    warning: 'dark:bg-warning',
    danger: 'dark:bg-danger',
    'chart-1': 'dark:bg-chart-1',
    'chart-2': 'dark:bg-chart-2',
    'chart-3': 'dark:bg-chart-3',
};

const COLOR_OPTIONS = [
    { value: 'info', label: 'Turquesa' },
    { value: 'success', label: 'Verde' },
    { value: 'warning', label: 'Ámbar' },
    { value: 'danger', label: 'Rojo' },
    { value: 'chart-1', label: 'Azul' },
    { value: 'chart-2', label: 'Naranja' },
    { value: 'chart-3', label: 'Verde agua' },
];

const initialState = {
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    categoria: 'info',
};

function Campo({ label, name, value, onChange, type = 'text' }) {
    return (
        <div className="space-y-1">
            <label htmlFor={`evento-${name}`} className={LABEL_CLASS}>
                {label}
            </label>
            <input
                id={`evento-${name}`}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required
                className={INPUT_CLASS}
            />
        </div>
    );
}

const estadoDesdeEvento = (evento) => ({
    titulo: evento.title,
    fechaInicio: format(evento.start, 'yyyy-MM-dd'),
    fechaFin: format(evento.end, 'yyyy-MM-dd'),
    horaInicio: format(evento.start, 'HH:mm'),
    horaFin: format(evento.end, 'HH:mm'),
    categoria: evento.category,
});

export default function FormularioEventoNuevo({ evento, onSubmit, onCancel, onDelete }) {
    const [form, setForm] = useState(() => (evento ? estadoDesdeEvento(evento) : initialState));
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);
    const esEdicion = Boolean(evento);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleColorSelect = (categoria) => {
        setForm((prev) => ({ ...prev, categoria }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { titulo, fechaInicio, fechaFin, horaInicio, horaFin, categoria } = form;
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
        setGuardando(true);
        const resultado = await onSubmit({
            title: titulo,
            start,
            end,
            category: categoria,
            allDay: false,
        });
        setGuardando(false);
        if (resultado && !resultado.success) {
            setError(resultado.error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Eliminar este evento?')) return;
        setGuardando(true);
        const resultado = await onDelete();
        setGuardando(false);
        if (resultado && !resultado.success) {
            setError(resultado.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <AlertaError mensaje={error} />

            <Campo label="Título del evento" name="titulo" value={form.titulo} onChange={handleChange} />

            <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Fecha de inicio" name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} />
                <Campo label="Fecha de fin" name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="evento-horaInicio" className={LABEL_CLASS}>Hora de inicio</label>
                    <SelectorHora id="evento-horaInicio" name="horaInicio" value={form.horaInicio} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <label htmlFor="evento-horaFin" className={LABEL_CLASS}>Hora de fin</label>
                    <SelectorHora id="evento-horaFin" name="horaFin" value={form.horaFin} onChange={handleChange} required />
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-xs font-medium text-foreground-soft uppercase tracking-wider block">Color</span>
                <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((opcion) => {
                        const colors = CATEGORY_COLORS[opcion.value];
                        const seleccionado = form.categoria === opcion.value;
                        return (
                            <button
                                key={opcion.value}
                                type="button"
                                onClick={() => handleColorSelect(opcion.value)}
                                aria-label={opcion.label}
                                aria-pressed={seleccionado}
                                title={opcion.label}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${colors.bg} ${colors.text} ${DARK_SOLID_BG[opcion.value]} dark:text-white ${
                                    seleccionado ? 'border-current' : 'border-transparent'
                                }`}
                            >
                                {seleccionado && <Check size={16} strokeWidth={3} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <BotonesFormulario
                guardando={guardando}
                textoEnviar={esEdicion ? 'Guardar' : 'Crear evento'}
                onCancel={onCancel}
            >
                {esEdicion && (
                    <button type="button" onClick={handleDelete} disabled={guardando} className={BOTON_PELIGRO_CLASS}>
                        Eliminar
                    </button>
                )}
            </BotonesFormulario>
        </form>
    );
}
