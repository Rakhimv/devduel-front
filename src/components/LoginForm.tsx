import { useState } from 'react';
import { login } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import Spinner from './effects/Spinner';
import { useNavigate } from 'react-router-dom';





type FormData = {
    loginOrEmail: string;
    password: string;
};


const LoginForm = () => {
    const {
        register: formLogin,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>()

    const navigate = useNavigate()

    const [error, setError] = useState('');
    const [loading, setLoading] = useState<boolean>(false)
    const { setAuth } = useAuth();

    const onSubmit = async (data: FormData) => {
        setError("");
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 500))
            const { user }: any = await login({
                loginOrEmail: data.loginOrEmail,
                password: data.password
            });
            setAuth(user);
            console.log(user);
            navigate("/")
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] flex flex-col  items-center justify-center gap-4 text-white">
            <h2 className="font-dd text-4xl uppercase">Вход</h2>
            {error && <p className="font-dd text-redDD mb-4">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    type="text"
                    className={`dd-inp p-2 w-full ${errors.loginOrEmail ? "dd-inp-err" : ""
                        }`}
                    {...formLogin("loginOrEmail", { required: "Введите логин email" })}
                    placeholder="Логин или Email"
                />
                <input
                    type="password"
                    {...formLogin("password", { required: "Введите пароль" })}
                    placeholder="Password"
                    className={`dd-inp p-2 w-full ${errors.password ? "dd-inp-err" : ""
                        }`}
                />
                <button
                    disabled={loading}
                    type="submit"
                    className="dd-btn p-2 w-full">
                    {loading ? (
                        <>
                            <Spinner /> ЗАГРУЗКА...
                        </>
                    ) : (
                        "Войти"
                    )}

                </button>
            </form>
        </div>
    );
};

export default LoginForm;