import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { getAvatarUrl } from '../utils/avatarUrl';
import { FaGamepad, FaTrophy, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Spinner from '@/components/effects/Spinner';

interface User {
  id: number;
  name: string;
  login: string;
  avatar: string;
  created_at: string;
  games_count: number;
  wins_count: number;
  win_rate?: number;
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
      <div className="w-full bg-secondary-bg flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <motion.div
          className="flex text-primary gap-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          Загрузка рейтинга <Spinner />
        </motion.div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

  return (
    <div className="w-full bg-secondary-bg text-white">
      <div className="container mx-auto px-4 py-8 overflow-y-auto scroll-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        <h1 className="text-3xl font-bold mb-8 text-center">Рейтинг участников</h1>

        {topThree.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 max-w-[280px] bg-primary-bg border-2  p-6 relative overflow-hidden"
                style={{
                  borderColor: '#C0C0C0',
                  boxShadow: '0 0 20px rgba(192, 192, 192, 0.3), inset 0 0 20px rgba(192, 192, 192, 0.1)'
                }}
              >
                <div className="absolute top-2 right-2">
                  <div className="w-10 h-10 flex items-center justify-center font-bold text-lg bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800">
                    2
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mt-4">
                  <img
                    src={getAvatarUrl(topThree[1].avatar)}
                    alt={topThree[1].name}
                    className="w-20 h-20 rounded-full border-2 border-gray-400 object-cover mb-3"
                    style={{ boxShadow: '0 0 15px rgba(192, 192, 192, 0.5)' }}
                  />
                  <h3 className="text-lg font-semibold text-white mb-1">{topThree[1].name}</h3>
                  <p className="text-sm text-white/60 mb-3">@{topThree[1].login}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FaTrophy className="text-yellow-300" size={16} />
                      <span className="text-sm text-yellow-300 font-medium">{topThree[1].wins_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaGamepad className="text-primary" size={16} />
                      <span className="text-sm text-primary">{topThree[1].games_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaChartLine className="text-white/60" size={16} />
                      <span className="text-sm text-white/60">{topThree[1].win_rate || 0}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}



            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 max-w-[320px] bg-primary-bg border-2  p-8 relative overflow-hidden"
                style={{
                  borderColor: '#FFD700',
                  boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.15)'
                }}
              >
                <div className="absolute top-3 right-3">
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-xl bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-900">
                    1
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mt-6">
                  <img
                    src={getAvatarUrl(topThree[0].avatar)}
                    alt={topThree[0].name}
                    className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-4"
                    style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' }}
                  />
                  <h3 className="text-xl font-bold text-white mb-1">{topThree[0].name}</h3>
                  <p className="text-sm text-white/60 mb-4">@{topThree[0].login}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FaTrophy className="text-yellow-300" size={18} style={{ filter: 'drop-shadow(0 0 3px rgba(131, 214, 197, 0.5))' }} />
                      <span className="text-base text-yellow-300 font-semibold" style={{ textShadow: '0 0 6px rgba(131, 214, 197, 0.3)' }}>{topThree[0].wins_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaGamepad className="text-primary" size={18} />
                      <span className="text-base text-primary">{topThree[0].games_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaChartLine className="text-white/60" size={18} />
                      <span className="text-base text-white/60">{topThree[0].win_rate || 0}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 max-w-[280px] bg-primary-bg border-2  p-6 relative overflow-hidden"
                style={{
                  borderColor: '#CD7F32',
                  boxShadow: '0 0 20px rgba(205, 127, 50, 0.3), inset 0 0 20px rgba(205, 127, 50, 0.1)'
                }}
              >
                <div className="absolute top-2 right-2">
                  <div className="w-10 h-10 flex items-center justify-center font-bold text-lg bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100">
                    3
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mt-4">
                  <img
                    src={getAvatarUrl(topThree[2].avatar)}
                    alt={topThree[2].name}
                    className="w-20 h-20 rounded-full border-2 border-amber-600 object-cover mb-3"
                    style={{ boxShadow: '0 0 15px rgba(205, 127, 50, 0.5)' }}
                  />
                  <h3 className="text-lg font-semibold text-white mb-1">{topThree[2].name}</h3>
                  <p className="text-sm text-white/60 mb-3">@{topThree[2].login}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FaTrophy className="text-yellow-300" size={16} />
                      <span className="text-sm text-yellow-300 font-medium">{topThree[2].wins_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaGamepad className="text-primary" size={16} />
                      <span className="text-sm text-primary">{topThree[2].games_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaChartLine className="text-white/60" size={16} />
                      <span className="text-sm text-white/60">{topThree[2].win_rate || 0}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}



        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
          {restUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              className="bg-primary-bg border border-primary-bdr p-4 flex items-center gap-4 transition-colors "
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-bold text-lg bg-secondary-bg border border-primary-bdr text-white/70">
                {index + 4}
              </div>

              <img
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-primary-bdr object-cover"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                <p className="text-white/40">@{user.login}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5">
                    <FaTrophy className="text-yellow-300" size={14} />
                    <span className="text-sm text-yellow-300 font-medium">{user.wins_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaGamepad className="text-primary" size={14} />
                    <span className="text-sm text-primary">{user.games_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaChartLine className="text-white/60" size={14} />
                    <span className="text-sm text-white/60">{user.win_rate || 0}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center text-white/40 mt-8">
            <p>Нет участников для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rating;
