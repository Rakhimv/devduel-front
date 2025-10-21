import React from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const GameStatusBanner: React.FC = () => {
  const { isInGame, gameSessionId, gameDuration } = useGame();
  const navigate = useNavigate();

  if (!isInGame || !gameSessionId) {
    return null;
  }

  const formatDuration = (duration: number | null) => {
    if (!duration) return '0 мин';
    const minutes = Math.floor(duration / 60000);
    return `${minutes} мин`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 text-center">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <span className="font-semibold">Вы в игре</span>
        </div>
        <div className="text-sm opacity-90">
          Длительность: {formatDuration(gameDuration)}
        </div>
        <button
          onClick={() => navigate(`/game/${gameSessionId}`)}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Вернуться к игре
        </button>
      </div>
    </div>
  );
};

export default GameStatusBanner;
