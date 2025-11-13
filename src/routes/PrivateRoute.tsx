import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const PrivateRout: React.FC = () => {
    const { isAuth, isLoading } = useAuth()
    const location = useLocation()
    
    useEffect(() => {
        if (!isLoading && !isAuth && typeof window !== 'undefined') {
            if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/banned') {
                window.location.href = '/login';
            }
        }
    }, [isLoading, isAuth, location.pathname])
    
    if (!isLoading && !isAuth) {
        return <Navigate to={"/login"} replace />
    }
    
    if (isLoading) {
        return null
    }
    
    return <Outlet />
}

export default PrivateRout