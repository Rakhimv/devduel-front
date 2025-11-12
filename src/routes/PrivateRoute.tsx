import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const PrivateRout: React.FC = () => {
    const { isAuth, isLoading } = useAuth()
    const location = useLocation()
    
    // Если загрузка завершена и пользователь не авторизован, делаем редирект
    useEffect(() => {
        if (!isLoading && !isAuth && typeof window !== 'undefined') {
            // Если мы не на странице логина или регистрации, редиректим
            if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/banned') {
                // Используем window.location.href для гарантированного редиректа на сервере
                // Это работает даже если React Router не может сделать редирект
                window.location.href = '/login';
            }
        }
    }, [isLoading, isAuth, location.pathname])
    
    // Если загрузка завершена и пользователь не авторизован, редиректим на логин через React Router
    if (!isLoading && !isAuth) {
        return <Navigate to={"/login"} replace />
    }
    
    // Пока загружается, показываем ничего (или можно показать loader)
    if (isLoading) {
        return null
    }
    
    // Если авторизован, показываем защищенный контент
    return <Outlet />
}

export default PrivateRout