import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../services/axios';
import { PersonalizacionContext } from './PersonalizacionContext';
import { PERSONALIZACION_PREDETERMINADA } from './predeterminados';

const ID_ESTILO_COLORES = 'personalizacion-colores';

// Defensa extra: el backend ya solo acepta #RRGGBB.
const esColor = (valor) => /^#[0-9a-fA-F]{6}$/.test(valor ?? '');

const combinar = (datos) => ({
    landing: { ...PERSONALIZACION_PREDETERMINADA.landing, ...datos?.landing },
    contacto: { ...PERSONALIZACION_PREDETERMINADA.contacto, ...datos?.contacto },
    apariencia: { ...PERSONALIZACION_PREDETERMINADA.apariencia, ...datos?.apariencia },
    fotos_hero: datos?.fotos_hero ?? [],
    galeria: datos?.galeria ?? [],
});

/**
 * Aplica los colores institucionales sobre las variables de Tailwind (index.css).
 * Solo se reemplaza el tema claro: el oscuro conserva su paleta, ajustada
 * para mantener el contraste. El riel (footer/login) es igual en ambos temas.
 */
function aplicarColores(apariencia) {
    const predeterminados = PERSONALIZACION_PREDETERMINADA.apariencia;
    const color = (clave) => (esColor(apariencia[clave]) ? apariencia[clave] : predeterminados[clave]);
    const color_primario = color('color_primario');
    const color_primario_hover = color('color_primario_hover');
    const color_acento = color('color_acento');
    const color_riel = color('color_riel');

    let estilo = document.getElementById(ID_ESTILO_COLORES);

    if (!estilo) {
        estilo = document.createElement('style');
        estilo.id = ID_ESTILO_COLORES;
        document.head.appendChild(estilo);
    }

    estilo.textContent = `
:root:not([data-theme="dark"]) {
  --color-primary: ${color_primario};
  --color-primary-hover: ${color_primario_hover};
  --color-accent: ${color_acento};
}
:root:root { --color-rail: ${color_riel}; }`;
}

// Sin conexión con el backend devuelve null y se mantienen los valores originales.
const pedir = () => api.get('/public/personalizacion', { skipAuthRedirect: true })
    .then((response) => combinar(response.data.data))
    .catch(() => null);

export function PersonalizacionProvider({ children }) {
    const [datos, setDatos] = useState(() => combinar(null));
    const [cargando, setCargando] = useState(true);

    const recargar = useCallback(async () => {
        const nuevos = await pedir();
        if (nuevos) setDatos(nuevos);
    }, []);

    useEffect(() => {
        let activo = true;

        pedir().then((nuevos) => {
            if (!activo) return;
            if (nuevos) setDatos(nuevos);
            setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        aplicarColores(datos.apariencia);
    }, [datos.apariencia]);

    const value = useMemo(() => ({ ...datos, cargando, recargar }), [datos, cargando, recargar]);

    return <PersonalizacionContext.Provider value={value}>{children}</PersonalizacionContext.Provider>;
}
