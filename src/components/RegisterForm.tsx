import { useState } from 'react';
import { login, register } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import Spinner from './effects/Spinner';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { LogoSvg } from './ui/UiElements';
import { motion } from 'framer-motion';

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
            const { user }: any = await login({
                loginOrEmail: data.login,
                password: data.password,
            });
            setAuth(user);
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[400px] flex flex-col items-center justify-center gap-4 text-white"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='flex items-center justify-center flex-col gap-[10px]'
            >
                <LogoSvg className='w-[60px]' />
                <h2 className="font-dd text-3xl uppercase">Регистрация</h2>
            </motion.div>
            {errorText && (
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-dd text-redDD mb-4"
                >
                    {errorText}
                </motion.p>
            )}
            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 w-full"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <input
                        type="text"
                        placeholder="Имя"
                        className={`dd-inp p-2 w-full ${errors.name ? "dd-inp-err" : ""
                            }`}
                        {...formRegister("name", { required: "Введите имя" })}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <input
                        type="text"
                        placeholder="Логин"
                        className={`dd-inp p-2 w-full ${errors.login ? "dd-inp-err" : ""
                            }`}
                        {...formRegister("login", { required: "Введите логин" })}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        className={`dd-inp p-2 w-full ${errors.email ? "dd-inp-err" : ""
                            }`}
                        {...formRegister("email", { required: "Введите email" })}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                >
                    <input
                        type="password"
                        className={`dd-inp p-2 w-full ${errors.password ? "dd-inp-err" : ""
                            }`}
                        {...formRegister("password", { required: "Введите пароль" })}
                        placeholder="Пароль"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                >
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
                </motion.div>
            </motion.form>
        </motion.div>
    );
};

export default RegisterForm;