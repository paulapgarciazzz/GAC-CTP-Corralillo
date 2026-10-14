export const PAISES_TELEFONO = [
    { value: 'CR', pais: 'Costa Rica', prefijo: '506', digitos: 8 },
    { value: 'NI', pais: 'Nicaragua', prefijo: '505', digitos: 8 },
    { value: 'PA', pais: 'Panamá', prefijo: '507', digitos: 8 },
    { value: 'MX', pais: 'México', prefijo: '52', digitos: 10 },
    { value: 'US', pais: 'Estados Unidos / Canadá', prefijo: '1', digitos: 10 },
    { value: 'ES', pais: 'España', prefijo: '34', digitos: 9 },
    { value: 'OTRO', pais: 'Otro', prefijo: null, digitos: null },
];

export const CODIGO_PAIS_POR_DEFECTO = 'CR';
export const MAX_DIGITOS_PREFIJO_CUSTOM = 4;
export const MIN_DIGITOS_NUMERO_CUSTOM = 4;
export const MAX_DIGITOS_NUMERO_CUSTOM = 14;

export const obtenerPais = (value) => PAISES_TELEFONO.find((p) => p.value === value) ?? PAISES_TELEFONO[0];

export const obtenerConfigTelefono = (value) => {
    const pais = obtenerPais(value);

    if (pais.value === 'OTRO') {
        return {
            ...pais,
            maxLength: MAX_DIGITOS_NUMERO_CUSTOM,
            pattern: `\\d{${MIN_DIGITOS_NUMERO_CUSTOM},${MAX_DIGITOS_NUMERO_CUSTOM}}`,
            title: `Debe contener entre ${MIN_DIGITOS_NUMERO_CUSTOM} y ${MAX_DIGITOS_NUMERO_CUSTOM} dígitos`,
        };
    }

    return {
        ...pais,
        maxLength: pais.digitos,
        pattern: `\\d{${pais.digitos}}`,
        title: `Debe contener exactamente ${pais.digitos} dígitos`,
    };
};

export const combinarNumeroTelefono = ({ codigoPais, prefijoCustom, numero }) => {
    const pais = obtenerPais(codigoPais);
    const prefijo = pais.value === 'OTRO'
        ? (prefijoCustom || '').replace(/\D/g, '').slice(0, MAX_DIGITOS_PREFIJO_CUSTOM)
        : pais.prefijo;
    const numeroLimpio = (numero || '').replace(/\D/g, '');

    if (!prefijo || !numeroLimpio) return '';

    return `+${prefijo} ${numeroLimpio}`;
};

const REGEX_NUMERO_CON_PREFIJO = /^\+(\d{1,4}) (\d+)$/;

export const parsearNumeroTelefono = (valorGuardado) => {
    if (!valorGuardado) {
        return { codigoPais: CODIGO_PAIS_POR_DEFECTO, prefijoCustom: '', numero: '' };
    }

    const coincidencia = REGEX_NUMERO_CON_PREFIJO.exec(valorGuardado.trim());
    if (!coincidencia) {
        // Valor legado sin prefijo -> se asume Costa Rica
        return { codigoPais: CODIGO_PAIS_POR_DEFECTO, prefijoCustom: '', numero: valorGuardado.replace(/\D/g, '') };
    }

    const [, prefijo, numero] = coincidencia;
    const pais = PAISES_TELEFONO.find((p) => p.prefijo === prefijo);

    return pais
        ? { codigoPais: pais.value, prefijoCustom: '', numero }
        : { codigoPais: 'OTRO', prefijoCustom: prefijo, numero };
};
