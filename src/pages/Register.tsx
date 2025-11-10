import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import OAuthButtons from '../components/oauth/OAuthButtons';
import { motion } from "framer-motion"


const Register = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center">
            <div className='flex flex-col gap-[20px] items-center justify-center w-full max-w-[350px]'>
                <RegisterForm />



                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8, ease: "easeInOut" }} className='text-white w-full flex items-center justify-center gap-[10px]'>
                    <p>Уже есть аккаунт?</p>
                    <Link className='text-blueDD' to={"/login"}>Войти</Link>
                </motion.div>
                <OAuthButtons />
            </div>
        </div>
    );
};

export default Register;