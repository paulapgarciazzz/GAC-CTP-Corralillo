import api, { getCsrfCookie } from '../../services/axios';

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
