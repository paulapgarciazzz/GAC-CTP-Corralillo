
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "@tanstack/react-router";

export const AccessGuard = ({
    children,
    requireAuth = true,
    requiredRoles = [],
    requiredPermissions = [],
    fallback = <Navigate to="/login"/>,
})=>{
    const { user, loading, isAuthenticated } = useAuth();

     if(loading)return <div>Cargando...</div>;

     if (requireAuth && !isAuthenticated){
        return fallback;
    }

    if(requiredRoles.length > 0){
        const hasRole = requiredRoles.includes(user?.role);
        if(!hasRole) return <Navigate to ="/unauthorized"/>;
    }

    if(requiredPermissions.length > 0){
        const hasPermission = requiredPermissions.every(p => user?.permission?.includes(p));
    
    if(!hasPermission) return <Navigate to="/unauthorized"/>;
    }
    return children;
}