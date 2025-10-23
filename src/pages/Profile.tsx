import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage('Файл слишком большой. Максимальный размер: 5MB');
      setMessageType('error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Пожалуйста, выберите изображение');
      setMessageType('error');
      return;
    }

    setIsChangingAvatar(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setMessage('Аватар успешно обновлен!');
        setMessageType('success');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage('Ошибка при загрузке аватара');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Ошибка при загрузке аватара');
      setMessageType('error');
    } finally {
      setIsChangingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Пожалуйста, заполните все поля');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Пароли не совпадают');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Пароль должен содержать минимум 6 символов');
      setMessageType('error');
      return;
    }

    setIsChangingPassword(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setMessage('Пароль успешно изменен!');
        setMessageType('success');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        setMessage('Ошибка при смене пароля');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Ошибка при смене пароля');
      setMessageType('error');
    } finally {
      setIsChangingPassword(false);
    }
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
                {isChangingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
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
                  <label className="block text-sm font-medium mb-2">Изменить аватар</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isChangingAvatar}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Максимальный размер: 5MB</p>
                </div>

                {/* Смена пароля */}
                <div>
                  <label className="block text-sm font-medium mb-2">Изменить пароль</label>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Новый пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPassword}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <input
                      type="password"
                      placeholder="Подтвердите пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPassword}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword || !newPassword || !confirmPassword}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? 'Изменяем...' : 'Изменить пароль'}
                    </button>
                  </div>
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
    </div>
  );
};

export default Profile;
