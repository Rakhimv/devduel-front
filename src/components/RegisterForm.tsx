import { useState } from 'react';
import { login, register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import Spinner from './effects/Spinner';
import { useForm } from "react-hook-form";

type FormData = {
    name: string;
    email: string;
    password: string;
};


const RegisterForm = () => {
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState<boolean>(false)
    const { setAuth } = useAuth();



    const onSubmit = async (data: FormData) => {
        setError("");
        setLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 500));
            const user = await register(data);
            const { token }: any = await login({
                email: data.email,
                password: data.password,
            });
            setAuth(token, user);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] flex flex-col  items-center justify-center gap-4 text-white">
            <h2 className="font-dd text-4xl uppercase">Регистрация</h2>
            {error && <p className="font-dd text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    type="text"
                    placeholder="Имя"
                    className={`dd-inp p-2 w-full ${errors.name ? "dd-inp-err" : ""
                        }`}
                    {...formRegister("name", { required: "Введите имя" })}
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