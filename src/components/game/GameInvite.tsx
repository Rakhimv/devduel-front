import React, { useState, useEffect } from 'react';
import type { GameInvite as GameInviteType } from '../../types/game';
import AvatarWithStatus from '../chat/AvatarWithStatus';

interface GameInviteProps {
  invite: GameInviteType;
  onAccept: () => void;
  onDecline: () => void;
  isFromCurrentUser?: boolean;
  gameEndReason?: string;
  gameDuration?: number;
  isInGame?: boolean;
}

const GameInvite: React.FC<GameInviteProps> = ({ invite, onAccept, onDecline, isFromCurrentUser = false, gameEndReason, gameDuration, isInGame = false }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (invite.status !== 'pending') return;
    
    const inviteTime = new Date(invite.timestamp).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - inviteTime) / 1000);
    const remaining = Math.max(0, 30 - elapsed);
    
    setTimeLeft(remaining);
    
    if (remaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [invite.timestamp, invite.status]);
  if (isFromCurrentUser) {
    let statusColor = 'bg-yellow-400';
    let statusText = 'Ожидание...';
    
    if (invite.status === 'accepted') {
      statusColor = 'bg-green-400';
      statusText = 'Принято';
    } else if (invite.status === 'declined') {
      statusColor = 'bg-red-400';
      statusText = 'Отклонено';
    } else if (invite.status === 'expired') {
      statusColor = 'bg-gray-400';
      statusText = 'Истекло';
    }

    return (
      <div className="bg-primary-bg  p-4 max-w-md  relative">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 gap-3">
            <AvatarWithStatus avatar={invite.fromAvatar} name={invite.fromName || invite.fromUsername} />
            <span className="text-2xl">🎮</span>
            <AvatarWithStatus avatar={invite.toAvatar} name={invite.toName || invite.toUsername} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Приглашение отправлено
          </h3>
          <p className="text-white/90 text-sm">
            Ожидаем ответа от <span className="font-semibold">{invite.toName || invite.toUsername}</span>
          </p>
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-secondary-bg ">
              <div className={`w-2 h-2 rounded-full mr-2 ${statusColor} ${invite.status === 'pending' ? 'animate-pulse' : ''}`}></div>
              <span className="text-white/80 text-xs">{statusText}</span>
            </div>
          </div>
        </div>
        {/* <div className="text-xs text-white/40 absolute bottom-2 right-4">
          {new Date(invite.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div> */}
      </div>
    );
  }

    if (invite.status === 'declined' || invite.status === 'expired' || invite.status === 'accepted' || invite.status === 'abandoned') {
    let statusColor = 'bg-gray-400';
    let statusText = 'Недоступно';
    
    if (invite.status === 'accepted') {
      statusColor = 'bg-green-400';
      statusText = 'Принято';
    } else if (invite.status === 'declined') {
      statusColor = 'bg-red-400';
      statusText = 'Отклонено';
    } else if (invite.status === 'expired') {
      statusColor = 'bg-gray-400';
      statusText = 'Истекло';
    } else if (invite.status === 'abandoned') {
      statusColor = 'bg-orange-400';
      statusText = 'Оборвалось';
    }

    return (
      <div className="bg-primary-bg  p-4 max-w-md relative">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 gap-3">
            <AvatarWithStatus avatar={invite.fromAvatar} name={invite.fromName || invite.fromUsername} />
            <span className="text-2xl">🎮</span>
            <AvatarWithStatus avatar={invite.toAvatar} name={invite.toName || invite.toUsername} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Приглашение в игру
          </h3>
          <p className="text-white/90 text-sm mb-4">
            <span className="font-semibold">{invite.fromName || invite.fromUsername}</span> приглашал вас в игру
          </p>
          <div className="inline-flex items-center px-3 py-1 bg-secondary-bg ">
            <div className={`w-2 h-2 rounded-full mr-2 ${statusColor}`}></div>
            <span className="text-white/80 text-xs">{statusText}</span>
          </div>
        </div>
        {/* <div className="text-xs text-white/40 absolute bottom-2 right-4">
          {new Date(invite.timestamp).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div> */}
      </div>
    );
  }

  return (
    <div className="bg-transparent p-0">
      <div className="flex items-center justify-center mb-3 gap-3">
        <AvatarWithStatus avatar={invite.fromAvatar} name={invite.fromName || invite.fromUsername} />
        <span className="text-2xl">🎮</span>
        <AvatarWithStatus avatar={invite.toAvatar} name={invite.toName || invite.toUsername} />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-white/70">Приглашение в игру</span>
      </div>
      <p className="text-sm text-white/90 mb-3">
        <span className="font-semibold">{invite.fromName || invite.fromUsername}</span> приглашает вас в игру!
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          disabled={isInGame}
          className={`px-3 py-1.5 font-semibold transition-colors text-xs cursor-pointer ${
            isInGame 
              ? 'cursor-not-allowed bg-gray-500 text-gray-300' 
              : 'bg-primary text-black hover:bg-primary/80'
          }`}
        >
          {isInGame ? '🚫 В игре' : '✅ Принять'}
        </button>
        <button
          onClick={onDecline}
          className="bg-secondary-bg  hover:bg-primary-bg text-white px-3 py-1.5 font-semibold transition-colors text-xs cursor-pointer"
        >
          ❌ Отклонить
        </button>
      </div>
      
      {gameEndReason && gameDuration && (
        <div className="mt-2 p-2 bg-secondary-bg  text-xs">
          <p className="text-primary font-semibold">🎮 Игра завершена!</p>
          <p className="text-white/80">
            {gameEndReason === 'timeout' ? 'Время истекло' : 
             gameEndReason === 'player_left' ? 'Игрок покинул игру' : 
             'Игра завершена'}
          </p>
          <p className="text-white/60">Длительность: {Math.round(gameDuration / 60000)} минут</p>
        </div>
      )}
      
      {invite.status === 'pending' && (
        <p className="text-white/50 text-xs mt-2">
          Приглашение активно {timeLeft} сек
        </p>
      )}
    </div>
  );
};

export default GameInvite;
