import React, { useState } from 'react';
import Modal from './Modal';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      onError('Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      onError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      onError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsChanging(true);

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
        onSuccess('Пароль успешно изменен!');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        onError('Ошибка при смене пароля');
      }
    } catch (error) {
      onError('Ошибка при смене пароля');
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Изменить пароль">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Новый пароль
          </label>
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isChanging}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Подтвердите пароль
          </label>
          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isChanging}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Требования к паролю:</strong>
          </p>
          <ul className="text-xs text-gray-400 mt-1 space-y-1">
            <li>• Минимум 6 символов</li>
            <li>• Рекомендуется использовать буквы, цифры и символы</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isChanging}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handlePasswordChange}
            disabled={isChanging || !newPassword || !confirmPassword}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'Изменяем...' : 'Изменить пароль'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordChangeModal;
