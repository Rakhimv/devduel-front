import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className='flex flex-col gap-[20px] items-center justify-center w-full max-w-[350px]'>
                <RegisterForm />
                <div className='text-white w-full flex items-center justify-center gap-[10px]'>
                    <p>Уже есть аккаунт?</p>
                    <Link className='text-blueDD' to={"/login"}>Войти</Link></div>
            </div>
        </div>
    );
};

export default Register;