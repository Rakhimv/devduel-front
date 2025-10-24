import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AvatarChangeModal from '../components/ui/AvatarChangeModal';
import PasswordChangeModal from '../components/ui/PasswordChangeModal';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSuccess = (msg: string) => {
    setMessage(msg);
    setMessageType('success');
  };

  const handleError = (msg: string) => {
    setMessage(msg);
    setMessageType('error');
  };

  return (
    <div className="w-full h-screen bg-[#111A1F] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Профиль</h1>
        
        <div className="max-w-2xl mx-auto">
          {/* Сообщения */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-[#485761] rounded-lg p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img 
                  src={`${import.meta.env.VITE_BACKEND_URL}${user?.avatar || "/default.png"}`}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full border-4 border-gray-600"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-400">@{user?.login}</p>
                <p className="text-sm text-gray-500">ID: {user?.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#5a6470] rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Информация</h3>
                <p className="text-gray-300">Имя: {user?.name}</p>
                <p className="text-gray-300">Login: @{user?.login}</p>
                <p className="text-gray-300">Email: {user?.email}</p>
                <p className="text-gray-300">ID: {user?.id}</p>
                <p className="text-gray-300">Провайдер: {user?.provider || 'local'}</p>
                <p className="text-gray-300">Роль: {user?.role || 'user'}</p>
              </div>

              <div className="bg-[#5a6470] rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Статистика</h3>
                <p className="text-gray-300">Игр сыграно: 0</p>
                <p className="text-gray-300">Побед: 0</p>
                <p className="text-gray-300">Поражений: 0</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4">Настройки</h3>
              <div className="space-y-4">
                {/* Смена аватара */}
                <div>
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Изменить аватар
                  </button>
                </div>

                {/* Смена пароля */}
                <div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Изменить пароль
                  </button>
                </div>

                {/* Удаление аккаунта */}
                <div>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Удалить аккаунт
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Эта функция будет доступна позже</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      <AvatarChangeModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default Profile;
