import { createContext, useState, useEffect } from "react";
import { getUser, login as authlogin, logout as authlogout } from "../../services/authService";


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

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};