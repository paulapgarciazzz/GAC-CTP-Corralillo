import { useAuth } from "../hooks/useAuth";
import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

/**
 * Protege una ruta: exige sesión y, opcionalmente, todos los permisos indicados
 * (p. ej. ['usuarios.ver']). El administrador pasa todos los chequeos.
 */
export const AccessGuard = ({
    children,
    requireAuth = true,
    requiredPermissions = [],
    fallback = <Navigate to="/login"/>,
})=>{
    const { loading, isAuthenticated, can } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center gap-2 bg-background text-foreground-soft">
                <Loader2 className="animate-spin text-primary" size={24} />
                Verificando sesión...
            </div>
        );
    }

    if (requireAuth && !isAuthenticated){
        return fallback;
    }

    if (requiredPermissions.length > 0 && !requiredPermissions.every(can)) {
        return fallback;
    }

    return children;
}
