import { useAuth } from "../hooks/useAuth";
import { useGame } from "../context/GameContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaGamepad, FaComments, FaTrophy, FaHeadset, FaUserShield } from "react-icons/fa";
import { getAvatarUrl } from "../utils/avatarUrl";

const Header = () => {
    const { user } = useAuth();
    const { gameSessionId } = useGame();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        if (path === '/game') return location.pathname.startsWith('/game');
        if (path === '/msg') return location.pathname === '/app' || (location.pathname.startsWith('/app/msg') && !location.pathname.startsWith('/app/msg/support'));
        if (path === '/msg/support') return location.pathname === '/app/msg/support';
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path;
    };


    return (
        <div className="w-full h-[80px] flex items-center justify-between bg-primary-bg border-b border-primary-bdr">
            <div className="flex items-center w-full h-16 px-4 relative">
                <Link to={"/"} className="flex items-center gap-2">
                    <img src="/logo.svg" alt="DevDuel" className="w-8 h-8" />
                    <span className="text-white font-bold text-xl">DevDuel</span>
                </Link>

                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                    <button
                        onClick={() => handleNavigation('/app')}
                        className={`p-2 transition-colors cursor-pointer ${isActive('/msg')
                                ? 'text-primary'
                                : 'text-white/40 hover:text-white'
                            }`}
                        title="Чат"
                    >
                        <FaComments size={30} />
                    </button>

                    <button
                        onClick={() => handleNavigation('/rating')}
                        className={`p-2 transition-colors cursor-pointer ${isActive('/rating')
                                ? 'text-primary'
                                : 'text-white/40 hover:text-white'
                            }`}
                        title="Рейтинг"
                    >
                        <FaTrophy size={30} />
                    </button>

                    {user?.login !== 'support' && <button
                        onClick={() => handleNavigation('/app/msg/support')}
                        className={`p-2 transition-colors cursor-pointer ${isActive('/msg/support')
                                ? 'text-primary'
                                : 'text-white/40 hover:text-white'
                            }`}
                        title="Поддержка"
                    >
                        <FaHeadset size={30} />
                    </button>}

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => handleNavigation('/admin')}
                            className={`p-2 transition-colors cursor-pointer ${isActive('/admin')
                                    ? 'text-primary'
                                    : 'text-white/40 hover:text-white'
                                }`}
                            title="Админ панель"
                        >
                            <FaUserShield size={30} />
                        </button>
                    )}

                    {gameSessionId && (
                        <button
                            onClick={() => handleNavigation(`/game/${gameSessionId}`)}
                            className={`p-2 transition-colors cursor-pointer ${isActive('/game')
                                    ? 'text-primary'
                                    : 'text-green-400'
                                }`}
                            title="Игра"
                        >
                            <FaGamepad size={30} />
                        </button>
                    )}
                </div>

                {/* Справа - Профиль */}
                <button
                    onClick={() => handleNavigation('/profile')}
                    className={`ml-auto flex items-center gap-3 p-2 transition-colors cursor-pointe`}
                    title="Профиль"
                >
                    <img
                        className="w-10 h-10 rounded-full border-2 border-primary-bdr object-cover"
                        src={getAvatarUrl(user?.avatar)}
                        alt="Avatar"
                    />
                    <div className="flex flex-col text-left">
                        <span className="text-white font-semibold text-sm">{user?.name}</span>
                        <span className="text-white/40 text-xs">ID: {user?.id}</span>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default Header