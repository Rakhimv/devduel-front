import { useAuth } from "../hooks/useAuth";
import { useGame } from "../context/GameContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGamepad, FaComments, FaTrophy, FaUser, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
    const { user, logout } = useAuth();
    const { gameSessionId } = useGame();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        if (path === '/game') return location.pathname.startsWith('/game');
        if (path === '/msg') return location.pathname === '/' || location.pathname.startsWith('/msg');
        return location.pathname === path;
    };


    return (
        <div className="w-full h-[80px] flex items-center justify-between bg-primary-bg border-b border-primary-bdr">

            <div className="flex items-center w-full justify-between h-16 px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.svg" alt="DevDuel" className="w-8 h-8" />
                        <span className="text-white font-bold text-xl">DevDuel</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <img 
                            className="w-10 h-10 rounded-full border-2 border-gray-600" 
                            src={`${import.meta.env.VITE_BACKEND_URL}${user?.avatar || "/default.png"}`} 
                            alt="Avatar"
                        />
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">{user?.name}</span>
                            <span className="text-gray-400 text-xs">ID: {user?.id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleNavigation('/msg')}
                        className={`p-2 rounded-lg transition-colors ${
                            isActive('/msg') 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="Чат"
                    >
                        <FaComments size={20} />
                    </button>

                    <button
                        onClick={() => handleNavigation('/rating')}
                        className={`p-2 rounded-lg transition-colors ${
                            isActive('/rating') 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="Рейтинг"
                    >
                        <FaTrophy size={20} />
                    </button>

                    <button
                        onClick={() => gameSessionId ? handleNavigation(`/game/${gameSessionId}`) : handleNavigation('/msg')}
                        className={`p-2 rounded-lg transition-colors ${
                            gameSessionId && isActive('/game')
                                ? 'bg-green-600 text-white'
                                : gameSessionId
                                ? 'text-green-400 hover:text-white hover:bg-gray-700'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title={gameSessionId ? "Игра" : "Нет активной игры"}
                    >
                        <FaGamepad size={20} />
                    </button>

                    <button
                        onClick={() => handleNavigation('/profile')}
                        className={`p-2 rounded-lg transition-colors ${
                            isActive('/profile') 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="Профиль"
                    >
                        <FaUser size={20} />
                    </button>

                    <button
                        onClick={logout}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                        title="Выйти"
                    >
                        <FaSignOutAlt size={20} />
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Header