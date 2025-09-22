import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/auth";
import { getUser } from "../api/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const fetchedUser = await getUser(token)
                    setUser(fetchedUser)
                } catch (err) {
                    console.log("Не удалось получить пользователя: ", err)
                    logout()
                }
            }
        }
        fetchUser()
    }, [])

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


    return <AuthContext.Provider value={{ user, token, setAuth, logout }}>
        {children}
    </AuthContext.Provider>



}