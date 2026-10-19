import api, { getCsrfCookie } from '../../services/axios';
import { manejarError } from '../../modulos/Calendario/services/manejoErrores';

export const login = async (email, password) => {
    await getCsrfCookie(); //se obtiene el csrf
    const response = await api.post('/login',{ email, password}, { skipAuthRedirect: true }); //se envian las credenciales
    if(response.data.token){
        localStorage.setItem('access_token', response.data.token); //almacena el token si este viene en el response
    }
    return response.data;

};

export const logout = async () => {
    await api.post('/logout', null, { skipAuthRedirect: true });
    localStorage.removeItem('access_token');
};
//obtener usuario autenticado (con roles y permisos)
export const getUser = async () =>{
    const response = await api.get('user', { skipAuthRedirect: true });
    return response.data;
};

const postRecuperacion = async (url, datos, mensajeError) => {
    try {
        const response = await api.post(url, datos, { skipAuthRedirect: true });
        return { success: true, data: response.data };
    } catch (error) {
        return manejarError(error, mensajeError);
    }
};

// Recuperación de contraseña: envía un código al correo y luego lo canjea por una contraseña nueva.
export const solicitarCodigoRecuperacion = (email) =>
    postRecuperacion('/password/codigo', { email }, 'No se pudo enviar el código.');

export const restablecerPassword = (datos) =>
    postRecuperacion('/password/restablecer', datos, 'No se pudo restablecer la contraseña.');
