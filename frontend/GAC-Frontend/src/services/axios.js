import axios from 'axios'

const apiBaseURL = import.meta.env.APP_URL || 'http://localhost:8000/api';
const backendBaseURL = apiBaseURL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Envía/recibe la cookie de sesión de Sanctum
    withXSRFToken: true, // Fuerza a Axios a leer XSRF-TOKEN y enviar X-XSRF-TOKEN aunque frontend y backend sean orígenes distintos
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
})

const csrfClient = axios.create({
    baseURL: backendBaseURL,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
});

let csrfRequest = null;

export const getCsrfCookie = () => {
    csrfRequest ??= csrfClient.get('/sanctum/csrf-cookie').finally(() => {
        csrfRequest = null;
    });

    return csrfRequest;
};

// Interceptor para agregar token
api.interceptors.request.use(
    async (config) => {
        const metodo = config.method?.toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo)) {
            await getCsrfCookie();
        }

        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Token expirado - redirigir a login
            localStorage.removeItem('access_token')
            window.location.href = '/login'
        }
        if (error.response?.status === 403) {
            // Acceso denegado
            console.error('Acceso denegado - permisos insuficientes');
            return Promise.reject(error);
        }

        if (error.response?.status === 422) {
            // Errores de validación
            console.error('Validación fallida:', error.response.data.errors);
            return Promise.reject(error);
        }

        if (error.response?.status === 500) {
            // Error del servidor
            console.error('Error del servidor');
            return Promise.reject(error);
        }
        return Promise.reject(error)
    }
);

export default api;