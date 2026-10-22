/**
 * Valores originales del sitio. Se muestran mientras carga /public/personalizacion
 * o si la petición falla, así la landing nunca queda vacía. Deben coincidir con
 * backend/app/Modules/Personalizacion/Configuracion/Support/Predeterminados.php.
 */
export const PERSONALIZACION_PREDETERMINADA = {
    landing: {
        nombre_institucion: 'CTP de Corralillo',
        hero_etiqueta: 'Colegio Técnico Profesional',
        hero_titulo: 'CTP de Corralillo',
        hero_descripcion: 'Educación técnica de calidad, formando estudiantes íntegros y comprometidos con Corralillo, Nicoya y Guanacaste desde 1977.',
        conocenos_titulo: 'Conócenos',
        lema: 'Educación · Progreso · Libertad',
        conocenos_descripcion: 'Desde 1977 formando estudiantes técnicos comprometidos con Corralillo, Nicoya y Guanacaste.',
        vision_titulo: 'Visión',
        vision: 'Ser una institución educativa líder en la región, reconocida por su excelencia académica, formación integral y compromiso con el desarrollo sostenible, formando ciudadanos críticos, creativos y solidarios.',
        mision_titulo: 'Misión',
        mision: 'Ofrecer una educación de calidad basada en valores, innovación pedagógica y tecnología, que potencie las habilidades de nuestros estudiantes y los prepare para enfrentar los desafíos del mundo actual, con responsabilidad social y respeto por la diversidad.',
        footer_descripcion: 'Educación · Progreso · Libertad desde 1977.',
    },
    contacto: {
        correo: 'ctp.decorralillo@mep.go.cr',
        telefono: '+506 4500 1829',
        direccion: '150 mts Norte de la plaza de deportes, Corralillo, Nicoya, Guanacaste',
        ubicacion_mapa: '6JFF+WH Corralillo High School, Guanacaste Province, Moracia de Nicoya',
        facebook: 'https://www.facebook.com/CTPDeCorralillo/?locale=es_LA',
        instagram: 'https://www.instagram.com/ctpdecorralillo/',
        youtube: null,
        tiktok: null,
        whatsapp: null,
    },
    apariencia: {
        color_primario: '#277a48',
        color_primario_hover: '#1e5c37',
        color_acento: '#2c8a9c',
        color_riel: '#1a1e3c',
        escudo_url: null,
        logo_url: null,
        mostrar_galeria: false,
        galeria_titulo: 'Galería',
        galeria_descripcion: null,
    },
    fotos_hero: [],
    galeria: [],
};

// Fotos reales de actividades del colegio: el carrusel original del Hero, que
// se usa mientras no se suba ninguna foto propia desde Personalización › Landing.
export const FOTOS_HERO_PREDETERMINADAS = [
    'https://nicoya.go.cr/img/news/detail/293_1_vistadelaembajadoradesuizaalctpdecorralillo.jpg',
    'https://vozdeguanacaste.com/wp-content/uploads/2018/01/dsc_0061-1024x683.jpg',
    'https://cloudfront-us-east-1.images.arcpublishing.com/gruponacion/JK64NJLWHVCZPCYVYPJVGOHQ34.jpg',
];
