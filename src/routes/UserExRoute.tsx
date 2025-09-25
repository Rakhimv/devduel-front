import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const UserExRoute: React.FC = () => {
    const { isAuth } = useAuth()
    return isAuth ? <Navigate to={'/'} /> : <Outlet />
}

export default UserExRoute