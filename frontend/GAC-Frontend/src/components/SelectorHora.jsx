import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// La opción vacía ('--') permite borrar la hora.
const HORAS = ['', ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODOS = [
    { value: 'AM', label: 'a. m.' },
    { value: 'PM', label: 'p. m.' },
];

// Las tres partes van sin borde dentro de un solo contenedor, para que se vean como un único campo.
const CONTENEDOR_CLASS = 'relative flex w-full items-center border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary';

const PARTE_CLASS = 'py-2 bg-transparent text-foreground cursor-pointer rounded-md focus:outline-none focus-visible:bg-primary/10 disabled:opacity-60 disabled:cursor-not-allowed';

// El <select> es transparente, así que la lista nativa no hereda el tema: las opciones necesitan sus propios colores.
const OPCION_CLASS = 'bg-surface text-foreground';

// Debe coincidir con `max-h-48` de la lista (12rem): unas 6 opciones visibles.
const ALTO_LISTA = 192;

const SIN_HORA = { hora: '', minuto: '', periodo: '' };

// "HH:mm" o "HH:mm:ss" (24 h) → partes en formato de 12 h.
function separarHora(valor) {
    const coincidencia = /^(\d{2}):(\d{2})/.exec(valor ?? '');
    if (!coincidencia) return SIN_HORA;

    const horas = Number(coincidencia[1]);
    if (horas > 23 || Number(coincidencia[2]) > 59) return SIN_HORA;

    return {
        hora: String(horas % 12 || 12),
        minuto: coincidencia[2],
        periodo: horas < 12 ? 'AM' : 'PM',
    };
}

// Partes en formato de 12 h → "HH:mm" (24 h).
function unirHora({ hora, minuto, periodo }) {
    const horas = (Number(hora) % 12) + (periodo === 'PM' ? 12 : 0);
    return `${String(horas).padStart(2, '0')}:${minuto}`;
}

/**
 * Lista desplegable corta (con scroll) para la hora y los minutos; el <select> nativo no permite limitar su alto.
 * Se posiciona con `fixed` para que no la recorte el scroll de los modales, y se cierra si la página se desplaza.
 */
function ListaDesplegable({ id, etiqueta, value, opciones, onChange, disabled = false, className = '' }) {
    const [posicion, setPosicion] = useState(null);
    const botonRef = useRef(null);
    const listaRef = useRef(null);
    const abierta = posicion !== null;

    const abrir = () => {
        const rect = botonRef.current.getBoundingClientRect();
        const cabeAbajo = window.innerHeight - rect.bottom >= ALTO_LISTA + 8;
        setPosicion({
            left: rect.left,
            width: rect.width,
            ...(cabeAbajo ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
        });
    };

    const cerrar = () => {
        setPosicion(null);
        botonRef.current?.focus();
    };

    // Al abrir: centra y enfoca la opción elegida.
    useEffect(() => {
        if (!abierta) return;

        const lista = listaRef.current;
        const elegida = lista.querySelector('[aria-selected="true"]') ?? lista.firstElementChild;
        lista.scrollTop = elegida.offsetTop - (lista.clientHeight - elegida.offsetHeight) / 2;
        elegida.focus({ preventScroll: true });

        const alDesplazar = (e) => {
            if (e.target !== lista) setPosicion(null);
        };
        const alRedimensionar = () => setPosicion(null);
        window.addEventListener('scroll', alDesplazar, true);
        window.addEventListener('resize', alRedimensionar);
        return () => {
            window.removeEventListener('scroll', alDesplazar, true);
            window.removeEventListener('resize', alRedimensionar);
        };
    }, [abierta]);

    const handleBotonKeyDown = (e) => {
        if (!abierta && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            abrir();
        }
    };

    const elegir = (opcion) => {
        onChange(opcion);
        cerrar();
    };

    const handleOpcionKeyDown = (e, opcion) => {
        const actual = e.currentTarget;
        const destinos = {
            ArrowDown: actual.nextElementSibling,
            ArrowUp: actual.previousElementSibling,
            Home: actual.parentElement.firstElementChild,
            End: actual.parentElement.lastElementChild,
        };

        if (e.key in destinos) {
            e.preventDefault();
            destinos[e.key]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            elegir(opcion);
        } else if (e.key === 'Escape') {
            // Evita que el Escape también cierre el modal que contiene el formulario.
            e.preventDefault();
            e.stopPropagation();
            cerrar();
        } else if (e.key === 'Tab') {
            setPosicion(null);
        }
    };

    // Se cierra al hacer clic o mover el foco fuera de la lista (salvo al propio botón, que la alterna).
    const handleListaBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget) && e.relatedTarget !== botonRef.current) {
            setPosicion(null);
        }
    };

    return (
        <>
            <button
                ref={botonRef}
                id={id}
                type="button"
                aria-label={id ? undefined : etiqueta}
                aria-haspopup="listbox"
                aria-expanded={abierta}
                disabled={disabled}
                onClick={() => (abierta ? setPosicion(null) : abrir())}
                onKeyDown={handleBotonKeyDown}
                className={`flex min-w-0 flex-1 items-center justify-between gap-1 text-left ${PARTE_CLASS} ${className}`}
            >
                <span className="truncate">{value || '--'}</span>
                <ChevronDown size={16} className="shrink-0 text-foreground-soft" aria-hidden="true" />
            </button>
            {abierta && (
                <ul
                    ref={listaRef}
                    role="listbox"
                    aria-label={etiqueta}
                    tabIndex={-1}
                    onBlur={handleListaBlur}
                    style={posicion}
                    className="fixed z-[60] max-h-48 overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface py-1 shadow-lg focus:outline-none"
                >
                    {opciones.map((opcion) => {
                        const seleccionada = opcion === value;
                        return (
                            <li
                                key={opcion}
                                role="option"
                                aria-selected={seleccionada}
                                tabIndex={-1}
                                onClick={() => elegir(opcion)}
                                onKeyDown={(e) => handleOpcionKeyDown(e, opcion)}
                                className={`px-3 py-1 cursor-pointer focus:outline-none ${
                                    seleccionada
                                        ? 'bg-primary text-white font-semibold'
                                        : 'text-foreground hover:bg-primary/10 focus:bg-primary/10'
                                }`}
                            >
                                {opcion || '--'}
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

/**
 * Selector de hora: hora (1-12), minutos (00-59) y a. m./p. m.
 * Recibe y emite la hora como "HH:mm" (24 h) y llama a `onChange` con `{ target: { name, value } }`,
 * igual que un input nativo, para reutilizar los `handleChange` de los formularios.
 */
export default function SelectorHora({ id, name, value, onChange, required = false }) {
    const partes = separarHora(value);
    const sinHora = !partes.hora;

    const cambiarParte = (parte, valorParte) => {
        const siguiente = { ...partes, [parte]: valorParte };
        const nuevoValor = siguiente.hora
            ? unirHora({ hora: siguiente.hora, minuto: siguiente.minuto || '00', periodo: siguiente.periodo || 'AM' })
            : '';
        onChange({ target: { name, value: nuevoValor } });
    };

    return (
        <div className={CONTENEDOR_CLASS}>
            {/* Input oculto: conserva la validación nativa `required` en los formularios que la usan. */}
            <input
                type="text"
                tabIndex={-1}
                aria-hidden="true"
                required={required}
                value={value ?? ''}
                onChange={() => {}}
                className="sr-only"
            />
            <ListaDesplegable id={id} etiqueta="Hora" value={partes.hora} opciones={HORAS} onChange={(hora) => cambiarParte('hora', hora)} className="pl-4 pr-2" />
            <span className="text-foreground-soft font-semibold" aria-hidden="true">:</span>
            <ListaDesplegable etiqueta="Minutos" value={partes.minuto} opciones={MINUTOS} onChange={(minuto) => cambiarParte('minuto', minuto)} disabled={sinHora} className="px-2" />
            <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
            <select aria-label="a. m. o p. m." value={partes.periodo} onChange={(e) => cambiarParte('periodo', e.target.value)} disabled={sinHora} className={`shrink-0 px-2 ${PARTE_CLASS}`}>
                {sinHora && <option value="" className={OPCION_CLASS}>--</option>}
                {PERIODOS.map((periodo) => (
                    <option key={periodo.value} value={periodo.value} className={OPCION_CLASS}>{periodo.label}</option>
                ))}
            </select>
        </div>
    );
}
