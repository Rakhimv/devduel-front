import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: number;
  name: string;
  login: string;
  avatar: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

const Rating: React.FC = () => {
  const { socket } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 20;

  useEffect(() => {
    if (!socket) return;

    const handleUsersList = (response: UsersResponse) => {
      setUsers(response.users);
      setTotalUsers(response.total);
      setTotalPages(Math.ceil(response.total / usersPerPage));
      setLoading(false);
    };

    const handleError = (error: any) => {
      console.warn('Ошибка загрузки пользователей:', error);
      setLoading(false);
    };

    socket.on('users_list', handleUsersList);
    socket.on('error', handleError);
    
    loadUsers(0);

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Таймаут загрузки пользователей');
        setLoading(false);
      }
    }, 3000);

    return () => {
      socket.off('users_list', handleUsersList);
      socket.off('error', handleError);
      clearTimeout(timeout);
    };
  }, [socket]);

  const loadUsers = (page: number) => {
    setLoading(true);
    const offset = page * usersPerPage;
    socket?.emit('get_users_list', { offset, limit: usersPerPage });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#111A1F] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Загрузка рейтинга...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#111A1F] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Рейтинг участников</h1>
        
        {/* Информация о пагинации */}
        <div className="mb-4 text-center text-gray-400">
          Показано {users.length} из {totalUsers} участников
        </div>
        
        <div className="grid gap-4">
          {users.map((user, index) => (
            <div 
              key={user.id} 
              className="bg-[#485761] rounded-lg p-4 flex items-center gap-4 hover:bg-[#5a6470] transition-colors"
            >
              {/* Место */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                {currentPage * usersPerPage + index + 1}
              </div>

              {/* Аватар */}
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar || "/default.png"}`}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-gray-600"
              />

              {/* Информация */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-400">@{user.login}</p>
                <p className="text-sm text-gray-500">
                  Участник с {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>

              {/* ID */}
              <div className="text-right">
                <span className="text-gray-400 text-sm">ID: {user.id}</span>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <p>Нет участников для отображения</p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Назад
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                const page = startPage + i;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rating;
