export const esImagen = (archivo) => Boolean(archivo?.type?.startsWith('image/'));

const cargarImagen = (archivo) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
        URL.revokeObjectURL(url);
        resolve(imagen);
    };
    imagen.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo leer la imagen.'));
    };
    imagen.src = url;
});

/**
 * Recorta la imagen al centro en un cuadrado de `lado` píxeles y la devuelve
 * como data URI JPEG. Sirve para fotos de perfil livianas (unos 20–40 KB),
 * acepta cualquier formato que el navegador pueda leer.
 */
export async function redimensionarImagen(archivo, lado = 256, calidad = 0.85) {
    if (!esImagen(archivo)) throw new Error('El archivo seleccionado debe ser una imagen.');

    const imagen = await cargarImagen(archivo);
    const recorte = Math.min(imagen.naturalWidth, imagen.naturalHeight);
    const x = (imagen.naturalWidth - recorte) / 2;
    const y = (imagen.naturalHeight - recorte) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    const contexto = canvas.getContext('2d');
    // Fondo blanco para que las imágenes con transparencia no queden negras en JPEG.
    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, lado, lado);
    contexto.drawImage(imagen, x, y, recorte, recorte, 0, 0, lado, lado);

    return canvas.toDataURL('image/jpeg', calidad);
}
