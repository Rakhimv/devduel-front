import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;