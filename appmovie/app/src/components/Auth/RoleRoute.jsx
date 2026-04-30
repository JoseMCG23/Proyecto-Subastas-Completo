import { Navigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

export default function RoleRoute({ children, requiredRoles = [] }) {
    const { isAuthenticated, authorize } = useUser();

    // Si no ha iniciado sesión, lo mando al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si inició sesión pero no tiene permiso
    if (!authorize(requiredRoles)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center text-white shadow-xl backdrop-blur">
                    <h2 className="text-2xl font-bold mb-2">Acceso no autorizado</h2>
                    <p className="text-white/70">
                        No tienes permisos para ingresar a esta sección.
                    </p>
                </div>
            </div>
        );
    }

    // Si sí tiene permiso, renderiza la vista
    return children;
}