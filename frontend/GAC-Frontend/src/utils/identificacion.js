export const TIPOS_IDENTIFICACION = [
    { value: 'cedula', etiqueta: 'Cédula costarricense' },
    { value: 'dimex', etiqueta: 'DIMEX' },
    { value: 'pasaporte', etiqueta: 'Número de pasaporte' },
];

const CONFIG_POR_TIPO = {
    cedula: {
        etiquetaCorta: 'Cédula',
        pattern: '\\d{9}',
        maxLength: 9,
        inputMode: 'numeric',
        title: 'Debe contener exactamente 9 dígitos',
        placeholder: 'Ej: 123456789',
        soloNumeros: true,
        mensajeError: 'La cédula debe contener exactamente 9 dígitos.',
    },
    dimex: {
        etiquetaCorta: 'DIMEX',
        pattern: '\\d{11,12}',
        maxLength: 12,
        inputMode: 'numeric',
        title: 'Debe contener 11 o 12 dígitos',
        placeholder: 'Ej: 155812345678',
        soloNumeros: true,
        mensajeError: 'El DIMEX debe contener 11 o 12 dígitos.',
    },
    pasaporte: {
        etiquetaCorta: 'Pasaporte',
        pattern: '[A-Za-z0-9]{6,20}',
        maxLength: 20,
        inputMode: 'text',
        title: 'Alfanumérico, entre 6 y 20 caracteres',
        placeholder: 'Ej: A1234567',
        soloNumeros: false,
        mensajeError: 'El pasaporte debe ser alfanumérico, entre 6 y 20 caracteres.',
    },
};

export const obtenerConfigIdentificacion = (tipo) => CONFIG_POR_TIPO[tipo] ?? CONFIG_POR_TIPO.cedula;

export const formatearValorIdentificacion = (tipo, valor) => {
    const config = obtenerConfigIdentificacion(tipo);
    const limpio = config.soloNumeros ? valor.replace(/\D/g, '') : valor.replace(/[^A-Za-z0-9]/g, '');
    return limpio.slice(0, config.maxLength);
};
