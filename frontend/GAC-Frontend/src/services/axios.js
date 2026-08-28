import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.APP_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Para cookies de Sanctum
})

// Interceptor para agregar token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            const csrfToken = document.cookie
                .split(', ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            if(csrfToken){
                config.headers['X-CSRF-TOKEN'] = decodeURIComponent(csrfToken);
            }
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