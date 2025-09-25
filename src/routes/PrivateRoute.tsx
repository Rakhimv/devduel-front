import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const PrivateRout: React.FC = () => {
    const { isAuth, isLoading } = useAuth()
    if (isLoading) return null
    return isAuth ? <Outlet /> : <Navigate to={"/login"} />
}

export default PrivateRout