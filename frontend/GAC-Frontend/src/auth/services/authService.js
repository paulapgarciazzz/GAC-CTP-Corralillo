import api, { getCsrfCookie } from '../../services/axios';

export const login = async (email, password) => {
    await getCsrfCookie(); //se obtiene el csrf
    const response = await api.post('/login',{ email, password}); //se envian las credenciales
    if(response.data.token){
        localStorage.setItem('access_token', response.data.token); //almacena el token si este viene en el response
    }
    return response.data;

};

export const logout = async () => {
    await api.post('/logout');
    localStorage.removeItem('access_token');
};
//obtener usuario autenticado
export const getUser = async () =>{
    const response = await api.get('user');
    return response.data;
};