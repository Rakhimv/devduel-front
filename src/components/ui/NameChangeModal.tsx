import React, { useState } from 'react';
import Modal from './Modal';
import { changeName } from '../../api/api';

interface NameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  currentName: string;
}

const NameChangeModal: React.FC<NameChangeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError,
  currentName
}) => {
  const [newName, setNewName] = useState(currentName);
  const [isChanging, setIsChanging] = useState(false);

  const handleNameChange = async () => {
    if (!newName || newName.trim().length === 0) {
      onError('Имя не может быть пустым');
      return;
    }

    if (newName.length > 50) {
      onError('Имя должно быть менее 50 символов');
      return;
    }

    if (newName.trim() === currentName) {
      onError('Имя не изменилось');
      return;
    }

    setIsChanging(true);

    try {
      await changeName(newName.trim());
      onSuccess('Имя успешно изменено!');
      onClose();
    } catch (error: any) {
      onError(error.message || 'Ошибка при изменении имени');
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setNewName(currentName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Изменить имя">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Новое имя
          </label>
          <input
            type="text"
            placeholder="Введите новое имя"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isChanging}
            className="dd-inp w-full px-3 py-2 bg-secondary-bg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={50}
          />
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
            onClick={handleNameChange}
            disabled={isChanging || !newName || newName.trim() === currentName}
            className="dd-btn px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'Изменяем...' : 'Изменить имя'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NameChangeModal;

