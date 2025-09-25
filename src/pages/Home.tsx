import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className='text-blueDD font-dd font-bold text-[30px]'>{user?.id}</p>
      <p className='text-primary font-dd font-bold text-[30px]'>{user?.name}</p>
      <p 
      onClick={logout}
      className='text-redDD font-dd font-bold text-[30px] cursor-pointer'>Выйти</p>
      
    </div>
  );
};

export default Home;