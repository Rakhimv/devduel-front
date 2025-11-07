import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { getAvatarUrl } from '../utils/avatarUrl';

interface User {
  id: number;
  name: string;
  login: string;
  avatar: string;
  created_at: string;
  games_count: number;
  wins_count: number;
}

const Rating: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/rating');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="w-full bg-[#111A1F] flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Загрузка рейтинга...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111A1F] text-white">
      <div className="container mx-auto px-4 py-8 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <h1 className="text-3xl font-bold mb-8 text-center">Рейтинг участников</h1>
        
        {/* Информация о пагинации */}
        <div className="mb-4 text-center text-gray-400">
          Показано {users.length} топ участников
        </div>
        
        <div className="grid gap-4 pb-8">
          {users.map((user, index) => (
            <div 
              key={user.id} 
              className="bg-[#485761] rounded-lg p-4 flex items-center gap-4 hover:bg-[#5a6470] transition-colors"
            >
              {/* Место */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              {/* Аватар */}
              <img 
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-gray-600"
              />

              {/* Информация */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-400">@{user.login}</p>
                <p className="text-sm text-gray-500">
                  {user.wins_count} побед • {user.games_count} игр
                </p>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <p>Нет участников для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rating;
