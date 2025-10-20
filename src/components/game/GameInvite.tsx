import React from 'react';
import type { GameInvite as GameInviteType } from '../../types/game';

interface GameInviteProps {
  invite: GameInviteType;
  onAccept: () => void;
  onDecline: () => void;
  isFromCurrentUser?: boolean;
}

const GameInvite: React.FC<GameInviteProps> = ({ invite, onAccept, onDecline, isFromCurrentUser = false }) => {
  if (isFromCurrentUser) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg border border-blue-400 shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">🎮</span>
            <h3 className="text-lg font-bold text-white">
              Приглашение отправлено
            </h3>
          </div>
          <p className="text-white/90 text-sm">
            Ожидаем ответа от <span className="font-semibold">{invite.toUsername}</span>
          </p>
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-white/80 text-xs">Ожидание...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg border border-purple-400 shadow-lg max-w-md mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🎮</span>
          <h3 className="text-lg font-bold text-white">
            Приглашение в игру
          </h3>
        </div>
        <p className="text-white/90 text-sm mb-4">
          <span className="font-semibold">{invite.fromUsername}</span> приглашает вас в игру!
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            ✅ Принять
          </button>
          <button
            onClick={onDecline}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            ❌ Отклонить
          </button>
        </div>
        
        <p className="text-white/70 text-xs mt-2">
          Приглашение активно 30 сек
        </p>
      </div>
    </div>
  );
};

export default GameInvite;
