import { createContext, useState, useEffect, useMemo } from "react";
import { getUser, login as authlogin, logout as authlogout } from "../services/authService";


const AuthContext = createContext();

export { AuthContext };

export const Authprovider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getUser();
      setUser(userData);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);
    
    const login = async (email, password) =>{
        try{
            const data = await authlogin(email, password);
            setUser(data.user); //se asume que data.user contiene al usuario
            return { success: true};
        }catch (error)
        {
            console.error('Fallo al iniciar sesion:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al iniciar sesion'
            };

        }
    };

    // Vuelve a pedir el usuario (p. ej. tras cambiar sus propios datos).
    const refrescarUsuario = async () => {
        try {
            setUser(await getUser());
        } catch {
            // Se conserva la sesión actual si la petición falla.
        }
    };

    const logout = async () => {
        try{
            await authlogout();
        }catch(error){
            console.error('Fallo al cerrar sesion', error);
        }finally{
            setUser(null);
            localStorage.removeItem('access_token');
        }
    };

    const value = useMemo(() => {
        const permisos = new Set(user?.permissions ?? []);
        const esAdmin = Boolean(user?.es_admin);

        return {
            user,
            loading,
            login,
            logout,
            refrescarUsuario,
            // Aplica un usuario recibido del backend (p. ej. tras editar el perfil) sin otra petición.
            establecerUsuario: setUser,
            isAuthenticated: !!user,
            esAdmin,
            // Permiso puntual, p. ej. can('usuarios.crear'). El administrador tiene todos.
            can: (permiso) => esAdmin || permisos.has(permiso),
            // Acceso a un módulo: "ver" es la acción base que el backend garantiza a todo módulo activo.
            tieneModulo: (modulo) => esAdmin || permisos.has(`${modulo}.ver`),
        };
    }, [user, loading]); // login/logout/refrescarUsuario solo usan setters estables.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};