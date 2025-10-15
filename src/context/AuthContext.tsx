import { createContext, useEffect, useState, type ReactNode } from "react";
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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    

    const { socket, isConnected: isSocketConnected } = useSocket(isAuth);


    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true)
            try {
                const fetchedUser = await getUser();
                setUser(fetchedUser);
                setIsAuth(true);
            } catch (err) {
                console.error("Не удалось получить пользователя: ", err);
                setUser(null);
                setIsAuth(false);
            } finally {
                setIsLoading(false)
            }
        };
        fetchUser();
    }, []);


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


    return <AuthContext.Provider value={{ user, isAuth, isLoading, socket, isSocketConnected, setAuth, logout }}>
        {children}
    </AuthContext.Provider>



}