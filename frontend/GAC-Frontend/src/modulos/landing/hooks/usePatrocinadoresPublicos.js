import { useEffect, useState } from 'react';
import api from '../../../services/axios';

const ESTADO_INICIAL = {
    patrocinadores: [],
    titulo: 'Nuestros Patrocinadores',
    descripcion: '',
    cargando: true,
};

/**
 * Patrocinadores activos + configuración de la sección, para la landing
 * pública. Solo usa los endpoints de /public, que nunca exponen
 * patrocinadores ocultos.
 */
export function usePatrocinadoresPublicos() {
    const [estado, setEstado] = useState(ESTADO_INICIAL);

    useEffect(() => {
        let activo = true;

        Promise.all([
            api.get('/public/patrocinadores'),
            api.get('/public/configuracion-patrocinadores'),
        ]).then(([patrocinadoresRes, configuracionRes]) => {
            if (!activo) return;
            setEstado({
                patrocinadores: patrocinadoresRes.data.data,
                titulo: configuracionRes.data.data.titulo,
                descripcion: configuracionRes.data.data.descripcion,
                cargando: false,
            });
        }).catch(() => {
            if (!activo) return;
            setEstado((prev) => ({ ...prev, cargando: false }));
        });

        return () => {
            activo = false;
        };
    }, []);

    return estado;
}
