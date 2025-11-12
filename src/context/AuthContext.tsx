import { createContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User } from "../types/auth";
import { getUser, logout as apiLogout } from "../api/api";
import { useSocket, disconnectSocket } from "../hooks/useSocket";
import type { Socket } from "socket.io-client";

interface AuthContextType {
    user: User | null;
    isAuth: boolean;
    isLoading: boolean;
    socket: Socket | null;
    isSocketConnected: boolean;
    setAuth: (user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    

    const { socket, isConnected: isSocketConnected } = useSocket(isAuth);


    const fetchUser = useCallback(async () => {
        setIsLoading(true)
        setUser(null);
        setIsAuth(false);
        
        try {
            const fetchedUser = await getUser();
            // Убеждаемся, что мы получили валидного пользователя
            if (fetchedUser && fetchedUser.id) {
                setUser(fetchedUser);
                setIsAuth(true);
            } else {
                // Если пользователь не валиден, считаем его неавторизованным
                setUser(null);
                setIsAuth(false);
            }
        } catch (err: any) {
            // При любой ошибке (401, 403, сеть, таймаут) устанавливаем пользователя как неавторизованного
            setUser(null);
            setIsAuth(false);
            
            // Логируем ошибки для отладки (можно убрать в продакшене)
            if (process.env.NODE_ENV === 'development') {
                console.log("Auth error:", {
                    message: err?.message,
                    status: err?.status,
                    isBanned: err?.isBanned,
                    isNetworkError: err?.isNetworkError,
                    error: err
                });
            }
            
            if (err.isBanned) {
                // Используем window.location для редиректа на забаненную страницу
                if (typeof window !== 'undefined') {
                    window.location.href = '/banned';
                }
            }
        } finally {
            // КРИТИЧНО: всегда устанавливаем isLoading в false, даже при ошибке
            // Это гарантирует, что PrivateRoute сможет сделать редирект
            setIsLoading(false)
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);


    const setAuth = (newUser: User) => {
        setUser(newUser)
        setIsAuth(true)
    }


    const logout = async () => {
        try {
            disconnectSocket();
            
            await apiLogout();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
        setUser(null)
        setIsAuth(false)
    
        window.history.pushState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }


    return <AuthContext.Provider value={{ user, isAuth, isLoading, socket, isSocketConnected, setAuth, logout, refreshUser }}>
        {children}
    </AuthContext.Provider>



}