import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GameContextType {
  isInGame: boolean;
  gameSessionId: string | null;
  setIsInGame: (inGame: boolean) => void;
  setGameSessionId: (id: string | null) => void;
  leaveGame: () => void;
  gameDuration: number | null;
  setGameDuration: (duration: number | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [isInGame, setIsInGame] = useState(false);
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [gameDuration, setGameDuration] = useState<number | null>(null);
  const { socket } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedGameSession = localStorage.getItem('gameSessionId');
    if (savedGameSession) {
      setGameSessionId(savedGameSession);
      setIsInGame(true);
      const savedDuration = localStorage.getItem('gameDuration');
      if (savedDuration) {
        setGameDuration(parseInt(savedDuration));
      }
    }
  }, []);

  useEffect(() => {
    if (gameSessionId) {
      localStorage.setItem('gameSessionId', gameSessionId);
    } else {
      localStorage.removeItem('gameSessionId');
    }
  }, [gameSessionId]);

  useEffect(() => {
    if (isInGame) {
      localStorage.setItem('isInGame', 'true');
    } else {
      localStorage.removeItem('isInGame');
    }
  }, [isInGame]);

  useEffect(() => {
    if (gameDuration) {
      localStorage.setItem('gameDuration', gameDuration.toString());
    } else {
      localStorage.removeItem('gameDuration');
    }
  }, [gameDuration]);

  const leaveGame = () => {
    if (socket && gameSessionId) {
      socket.emit('leave_game', { sessionId: gameSessionId });
    }
    setIsInGame(false);
    setGameSessionId(null);
    setGameDuration(null);
    localStorage.removeItem('gameSessionId');
    localStorage.removeItem('gameDuration');
    navigate('/msg');
  };

  useEffect(() => {
    if (!socket) return;

    const handleGameSessionJoined = (data: { sessionId: string; duration: number }) => {
      setIsInGame(true);
      setGameSessionId(data.sessionId);
      setGameDuration(data.duration);
      localStorage.setItem('gameSessionId', data.sessionId);
      localStorage.setItem('gameDuration', data.duration.toString());
    };

    const handleGameSessionEnd = () => {
      setIsInGame(false);
      setGameSessionId(null);
      setGameDuration(null);
      localStorage.removeItem('gameSessionId');
      localStorage.removeItem('gameDuration');
    };

    socket.on('game_session_joined', handleGameSessionJoined);
    socket.on('game_session_end', handleGameSessionEnd);

    return () => {
      socket.off('game_session_joined', handleGameSessionJoined);
      socket.off('game_session_end', handleGameSessionEnd);
    };
  }, [socket]);

  return (
    <GameContext.Provider
      value={{
        isInGame,
        gameSessionId,
        setIsInGame,
        setGameSessionId,
        leaveGame,
        gameDuration,
        setGameDuration,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
