import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GameStatusBanner: React.FC = () => {
  const { isInGame, gameSessionId, gameDuration } = useGame();
  const { socket } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidSession, setIsValidSession] = useState(true);

  // Validate session on mount
  useEffect(() => {
    if (gameSessionId && socket) {
      const validateSession = () => {
        socket.emit('validate_game_session', { sessionId: gameSessionId });
      };

      validateSession();

      const handleValidation = (result: boolean) => {
        setIsValidSession(result);
      };

      socket.on('session_validation_result', handleValidation);

      return () => {
        socket.off('session_validation_result', handleValidation);
      };
    } else {
      setIsValidSession(false);
    }
  }, [gameSessionId, socket]);

  if (!isInGame || !gameSessionId || !isValidSession || location.pathname.startsWith('/game')) {
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
