import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AvatarChangeModal from '../components/ui/AvatarChangeModal';
import PasswordChangeModal from '../components/ui/PasswordChangeModal';
import { getAvatarUrl } from '../utils/avatarUrl';
import { FaSignOutAlt, FaGithub, FaGoogle, FaYandex, FaTrash, FaUser, FaEnvelope, FaIdCard, FaShieldAlt, FaGamepad, FaTrophy, FaChartLine } from 'react-icons/fa';
import { deleteAccount } from '../api/api';
import Modal from '../components/ui/Modal';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <FaGithub className="text-white" size={20} />;
      case 'google':
        return <FaGoogle className="text-white" size={20} />;
      case 'yandex':
        return <FaYandex className="text-red-500" size={20} />;
      default:
        return <FaUser className="text-white/60" size={20} />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'bg-gray-800 border-gray-700';
      case 'google':
        return 'bg-blue-600 border-blue-500';
      case 'yandex':
        return 'bg-red-600 border-red-500';
      default:
        return 'bg-secondary-bg border-primary-bdr';
    }
  };



  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.login) {
      handleError('Подтверждение не совпадает с вашим логином');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      navigate('/login');
    } catch (error: any) {
      handleError(error.message || 'Ошибка при удалении аккаунта');
      setIsDeleting(false);
    }
  };



  const winRate = user?.games_count && user.games_count > 0 
    ? Math.round((user.wins_count || 0) / user.games_count * 100) 
    : 0;

  return (
    <div className="w-full bg-secondary-bg text-white min-h-screen-calc">
      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 border ${
            messageType === 'success' 
              ? 'bg-primary/20 border-primary text-primary' 
              : 'bg-red-600/20 border-red-600 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-primary-bg border border-primary-bdr mb-6">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                <div className="relative">
                  <img 
                    src={getAvatarUrl(user?.avatar)}
                    alt={user?.name}
                    className="w-32 h-32 border-2 border-primary-bdr object-cover"
                  />
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-primary text-black px-3 py-1 text-sm cursor-pointer hover:bg-primary/80 border border-primary"
                  >
                    Изменить
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-white/60 text-lg mb-4">@{user?.login}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 border ${getProviderColor(user?.provider || 'local')}`}>
                      {getProviderIcon(user?.provider || 'local')}
                      <span className="text-sm capitalize">{user?.provider || 'local'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary-bg border border-primary-bdr">
                      <FaShieldAlt className="text-primary" size={16} />
                      <span className="text-sm">{user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-primary-bg border border-primary-bdr p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaGamepad className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">Игр сыграно</h3>
              </div>
              <div className="text-3xl font-bold text-primary">{user?.games_count || 0}</div>
            </div>

            <div className="bg-primary-bg border border-primary-bdr p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaTrophy className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">Побед</h3>
              </div>
              <div className="text-3xl font-bold text-primary">{user?.wins_count || 0}</div>
            </div>

            <div className="bg-primary-bg border border-primary-bdr p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">Винрейт</h3>
              </div>
              <div className="text-3xl font-bold text-primary">{winRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary-bg border border-primary-bdr p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-primary" size={20} />
                Личная информация
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-white/40" size={16} />
                  <div>
                    <div className="text-white/60 text-sm">ID</div>
                    <div className="text-white">{user?.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUser className="text-white/40" size={16} />
                  <div>
                    <div className="text-white/60 text-sm">Имя</div>
                    <div className="text-white">{user?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-white/40" size={16} />
                  <div>
                    <div className="text-white/60 text-sm">Email</div>
                    <div className="text-white">{user?.email || 'Не указан'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-bg border border-primary-bdr p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-primary" size={20} />
                Настройки аккаунта
              </h3>
              <div className="space-y-3">
                {(!user?.provider || user.provider === 'local') && (
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full bg-secondary-bg border border-primary-bdr text-white hover:bg-primary-bg py-2 px-4 transition-colors cursor-pointer text-left"
                  >
                    Изменить пароль
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full bg-secondary-bg border border-red-600/50 text-red-400 hover:bg-red-600/20 py-2 px-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaSignOutAlt size={16} />
                  Выйти
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full bg-secondary-bg border border-red-600/30 text-red-400/70 hover:bg-red-600/10 py-2 px-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaTrash size={16} />
                  Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirm('');
        }}
        title="Удаление аккаунта"
      >
        <div className="space-y-4">
          <p className="text-white/80">
            Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.
          </p>
          <p className="text-white/60 text-sm">
            Все ваши данные, включая игры, статистику и сообщения, будут безвозвратно удалены.
          </p>
          <div>
            <label className="block text-sm mb-2 text-white/80">
              Для подтверждения введите ваш логин: <span className="font-semibold">{user?.login}</span>
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Введите логин"
              className="w-full outline-none bg-secondary-bg border border-primary-bdr text-white px-3 py-2"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirm !== user?.login}
              className="flex-1 bg-redDD text-white px-4 py-2 cursor-pointer hover:bg-red-700 disabled:bg-secondary-bg disabled:cursor-not-allowed disabled:text-white/60"
            >
              {isDeleting ? 'Удаление...' : 'Удалить аккаунт'}
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirm('');
              }}
              className="flex-1 bg-secondary-bg border border-primary-bdr text-white px-4 py-2 cursor-pointer hover:bg-primary-bg"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
