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
    avatarVersion: number;
    setAuth: (user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateAvatarVersion: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [avatarVersion, setAvatarVersion] = useState(0);

    const { socket, isConnected: isSocketConnected } = useSocket(isAuth);


    const fetchUser = useCallback(async () => {
        setIsLoading(true)
        setUser(null);
        setIsAuth(false);
        
        try {
            const fetchedUser = await getUser();
            if (fetchedUser && fetchedUser.id) {
                setUser(fetchedUser);
                setIsAuth(true);
            } else {
                setUser(null);
                setIsAuth(false);
            }
        } catch (err: any) {
            setUser(null);
            setIsAuth(false);
            
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
                if (typeof window !== 'undefined') {
                    window.location.href = '/banned';
                }
            }
        } finally {
            setIsLoading(false)
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        
        try {
            const fetchedUser = await getUser();
            if (fetchedUser && fetchedUser.id) {
                if (user && fetchedUser.avatar !== user.avatar) {
                    setAvatarVersion(prev => prev + 1);
                }
                setUser(fetchedUser);
                setIsAuth(true);
            }
        } catch (err: any) {
            if (err?.status === 502 || err?.status === 503 || err?.status === 504) {
                console.warn('Temporary server error during user refresh, keeping current user data');
            } else if (err.isBanned) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/banned';
                }
            } else if (err?.status === 401) {
                setUser(null);
                setIsAuth(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const updateAvatarVersion = useCallback(() => {
        setAvatarVersion(prev => prev + 1);
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


    return <AuthContext.Provider value={{ user, isAuth, isLoading, socket, isSocketConnected, avatarVersion, setAuth, logout, refreshUser, updateAvatarVersion }}>
        {children}
    </AuthContext.Provider>



}