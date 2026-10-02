import { useEffect, useState } from 'react';

const SIN_CARGAR = Symbol('sin-cargar');

/**
 * Ejecuta un servicio que devuelve { success, data } | { success: false, error }
 * y expone { datos, cargando, error }. `servicio` debe ser una función estable
 * (definida a nivel de módulo); `parametro` es opcional y vuelve a disparar la carga.
 */
export function useCargarReporte(servicio, parametro) {
    const [estado, setEstado] = useState({ parametro: SIN_CARGAR, datos: null, error: '' });

    useEffect(() => {
        let activo = true;

        servicio(parametro).then((resultado) => {
            if (!activo) return;
            setEstado(resultado.success
                ? { parametro, datos: resultado.data, error: '' }
                : { parametro, datos: null, error: resultado.error });
        });

        return () => {
            activo = false;
        };
    }, [servicio, parametro]);

    // Sigue cargando mientras el resultado guardado no corresponda al parámetro actual.
    const cargando = estado.parametro !== parametro;

    return {
        datos: cargando ? null : estado.datos,
        error: cargando ? '' : estado.error,
        cargando,
    };
}
