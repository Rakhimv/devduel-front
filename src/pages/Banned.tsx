import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Banned = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-primary-bg">
            <div className="text-center">
                <div className="text-redDD text-6xl mb-4">🚫</div>
                <h1 className="text-4xl font-bold text-white mb-4">Вы забанены</h1>
                <p className="text-white/60 text-lg mb-8">
                    Ваш аккаунт был заблокирован администратором.
                </p>
                <p className="text-white/40 text-sm">
                    Вы будете перенаправлены на страницу входа через 5 секунд...
                </p>
            </div>
        </div>
    );
};

export default Banned;

