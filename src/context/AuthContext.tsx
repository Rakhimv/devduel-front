import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/auth";
import { getUser } from "../api/api";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuth: boolean;
    isLoading: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true)
            if (token) {
                try {
                    const fetchedUser = await getUser();
                    setUser(fetchedUser);
                    setIsAuth(true);
                } catch (err) {
                    console.error("Не удалось получить пользователя: ", err);
                    logout();
                }
            } else {
                setIsAuth(false);
                setUser(null);
            }
            setIsLoading(false)
        };
        fetchUser();
    }, [token]);


    const setAuth = (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken)
        setToken(newToken)
        setUser(newUser)
    }


    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }


    return <AuthContext.Provider value={{ user, token, isAuth, isLoading, setAuth, logout }}>
        {children}
    </AuthContext.Provider>



}