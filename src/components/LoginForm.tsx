import { useState } from 'react';
import { login } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import Spinner from './effects/Spinner';
import { useNavigate } from 'react-router-dom';
import { LogoSvg } from './ui/UiElements';
import { motion } from 'framer-motion';





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
            navigate("/app")
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
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
                <h2 className="font-dd text-3xl uppercase">Вход</h2>
            </motion.div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-dd text-redDD mb-4"
                >
                    {error}
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
                        className={`dd-inp p-2 w-full ${errors.loginOrEmail ? "dd-inp-err" : ""
                            }`}
                        {...formLogin("loginOrEmail", { required: "Введите логин email" })}
                        placeholder="Логин или Email"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <input
                        type="password"
                        {...formLogin("password", { required: "Введите пароль" })}
                        placeholder="Password"
                        className={`dd-inp p-2 w-full ${errors.password ? "dd-inp-err" : ""
                            }`}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
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
                            "Войти"
                        )}
                    </button>
                </motion.div>
            </motion.form>
        </motion.div>
    );
};

export default LoginForm;