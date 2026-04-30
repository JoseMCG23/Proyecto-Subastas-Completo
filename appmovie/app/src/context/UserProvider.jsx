import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    const decodeToken = (jwtToken) => {
        try {
            if (!jwtToken) return null;
            return jwtDecode(jwtToken);
        } catch (error) {
            console.error("Error al decodificar token:", error);
            return null;
        }
    };

    const user = useMemo(() => {
        if (!token) return null;

        const decoded = decodeToken(token);
        if (!decoded) return null;

        const currentTime = new Date().getTime();

        if (decoded.exp && decoded.exp * 1000 < currentTime) {
            return null;
        }

        return decoded;
    }, [token]);
    useEffect(() => {
        if (!token || !user) {
            localStorage.removeItem("token");
            return;
        }

        localStorage.setItem("token", token);
    }, [token, user]);

    const saveUser = (jwtToken) => {
        localStorage.setItem("token", jwtToken);
        setToken(jwtToken);
    };

    const clearUser = () => {
        localStorage.removeItem("token");
        setToken("");
    };

    const authorize = (requiredRoles = []) => {
        if (!user) return false;
        if (!requiredRoles.length) return true;

        return requiredRoles.includes(user.rol);
    };

    const isAuthenticated = !!user;

    return (
        <UserContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                saveUser,
                clearUser,
                decodeToken,
                authorize,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}