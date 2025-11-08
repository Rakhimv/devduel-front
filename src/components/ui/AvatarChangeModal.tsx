import React, { useState } from 'react';
import Modal from './Modal';

interface AvatarChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AvatarChangeModal: React.FC<AvatarChangeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError('Файл слишком большой. Максимальный размер: 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      onError('Пожалуйста, выберите изображение');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        onSuccess('Аватар успешно обновлен!');
        onClose();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        onError('Ошибка при загрузке аватара');
      }
    } catch (error) {
      onError('Ошибка при загрузке аватара');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Изменить аватар">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Выберите новый аватар
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 cursor-pointer file:border-0 file:text-sm file:font-semibold file:bg-primary hover:file:bg-primary file:text-primary-bg file:cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">
            Максимальный размер: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-300">Загружаем аватар...</span>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-secondary-bg border border-primary-bdr hover:bg-primary-bg hover:border-primary-bdr cursor-pointer text-white transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarChangeModal;
