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
          <label className="block text-sm font-medium text-white/80 mb-2">
            Новый пароль
          </label>
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isChanging}
            className="dd-inp w-full px-3 py-2 bg-secondary-bg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Подтвердите пароль
          </label>
          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isChanging}
            className="dd-inp w-full px-3 py-2 bg-secondary-bg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="bg-secondary-bg border border-primary-bdr p-3">
          <p className="text-sm text-white/80">
            <strong>Требования к паролю:</strong>
          </p>
          <ul className="text-xs text-white/60 mt-1 space-y-1">
            <li>• Минимум 6 символов</li>
            <li>• Рекомендуется использовать буквы, цифры и символы</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isChanging}
            className="px-4 py-2 bg-secondary-bg border border-primary-bdr text-white hover:bg-primary-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handlePasswordChange}
            disabled={isChanging || !newPassword || !confirmPassword}
            className="dd-btn px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'Изменяем...' : 'Изменить пароль'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordChangeModal;
