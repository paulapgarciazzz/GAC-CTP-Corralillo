import { useContext } from 'react';
import { PersonalizacionContext } from './PersonalizacionContext';

/**
 * Textos, contacto, colores, escudo/logo y fotos públicas del sitio, ya
 * combinados con los valores originales. `recargar()` vuelve a pedirlos
 * (p. ej. después de guardar cambios en el panel).
 */
export const usePersonalizacion = () => useContext(PersonalizacionContext);
