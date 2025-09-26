import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import OAuthButtons from '../components/oauth/OAuthButtons';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className='flex flex-col gap-[20px] items-center justify-center w-full max-w-[350px]'>
        <LoginForm />
        <div className='text-white w-full flex items-center justify-center gap-[10px]'>
          
          <p>Ещё нет аккаунта?</p>
          <Link className='text-blueDD' to={"/register"}> Зарегистрироваться</Link></div>
      
                <OAuthButtons />
      </div>
    </div>
  );
};

export default Login;