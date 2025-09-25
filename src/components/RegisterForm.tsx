import { useState } from 'react';
import { login, register } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from './effects/Spinner';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

type FormData = {
    name: string;
    login: string;
    email: string;
    password: string;
};


const RegisterForm = () => {
    const {
        register: formRegister,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>();
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState<boolean>(false)
    const { setAuth } = useAuth();
    const navigate = useNavigate()


    const onSubmit = async (data: FormData) => {
        setErrorText("");
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 500));
            await register(data);
            const { token, user }: any = await login({
                loginOrEmail: data.login,
                password: data.password,
            });
            setAuth(token, user);
            navigate("/")
        } catch (err: any) {
            setErrorText(err.response?.data?.message || err.message);
            if (err.response?.data?.errType === "login") {
                setError("login", { type: "manual", message: "Логин занят" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] flex flex-col  items-center justify-center gap-4 text-white">
            <h2 className="font-dd text-4xl uppercase">Регистрация</h2>
            {errorText && <p className="font-dd text-redDD mb-4">{errorText}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    type="text"
                    placeholder="Имя"
                    className={`dd-inp p-2 w-full ${errors.name ? "dd-inp-err" : ""
                        }`}
                    {...formRegister("name", { required: "Введите имя" })}
                />
                <input
                    type="text"
                    placeholder="Логин"
                    className={`dd-inp p-2 w-full ${errors.login ? "dd-inp-err" : ""
                        }`}
                    {...formRegister("login", { required: "Введите логин" })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className={`dd-inp p-2 w-full ${errors.email ? "dd-inp-err" : ""
                        }`}
                    {...formRegister("email", { required: "Введите email" })}
                />
                <input
                    type="password"
                    className={`dd-inp p-2 w-full ${errors.password ? "dd-inp-err" : ""
                        }`}
                    {...formRegister("password", { required: "Введите пароль" })}
                    placeholder="Пароль"
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
                        "ЗАРЕГИСТРИРОВАТЬСЯ"
                    )}

                </button>
            </form>
        </div>
    );
};

export default RegisterForm;