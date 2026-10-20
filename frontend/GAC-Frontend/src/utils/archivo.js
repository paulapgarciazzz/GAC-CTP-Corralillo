/**
 * Lee un archivo (imagen, PDF…) y lo devuelve como data URI, sin modificarlo.
 * Para fotos de perfil reducidas, usar `redimensionarImagen` de `./imagen`.
 */
export const leerComoDataURL = (archivo) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(archivo);
});
