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
  validateSession: (sessionId: string) => Promise<boolean>;
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

  const validateSession = async (sessionId: string): Promise<boolean> => {
    if (!sessionId || !socket) return false;
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      
      const handleValidation = (isValid: boolean) => {
        clearTimeout(timeout);
        socket.off('session_validation_result', handleValidation);
        resolve(isValid);
      };
      
      socket.on('session_validation_result', handleValidation);
      socket.emit('validate_game_session', { sessionId });
    });
  };

  useEffect(() => {
    const restoreSession = () => {
      const savedGameSession = localStorage.getItem('gameSessionId');
      const savedIsInGame = localStorage.getItem('isInGame');
      const savedDuration = localStorage.getItem('gameDuration');

      if (savedGameSession && savedIsInGame === 'true') {
        setGameSessionId(savedGameSession);
        setIsInGame(true);
        if (savedDuration) {
          setGameDuration(parseInt(savedDuration));
        }
      }
    };

    restoreSession();
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
    localStorage.removeItem('isInGame');
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
      localStorage.setItem('isInGame', 'true');
      localStorage.setItem('gameDuration', data.duration.toString());
    };

    const handleGameSessionEnd = () => {
      setIsInGame(false);
      setGameSessionId(null);
      setGameDuration(null);
      localStorage.removeItem('gameSessionId');
      localStorage.removeItem('isInGame');
      localStorage.removeItem('gameDuration');
    };

    const handleGameInviteAccepted = (session: any) => {
      if (isInGame && gameSessionId) {
        socket.emit('leave_game', { sessionId: gameSessionId });
      }
      setIsInGame(true);
      setGameSessionId(session.id);
      setGameDuration(session.duration);
      localStorage.setItem('gameSessionId', session.id);
      localStorage.setItem('isInGame', 'true');
      localStorage.setItem('gameDuration', session.duration.toString());
    };

    socket.on('game_session_joined', handleGameSessionJoined);
    socket.on('game_session_end', handleGameSessionEnd);
    socket.on('game_invite_accepted', handleGameInviteAccepted);

    return () => {
      socket.off('game_session_joined', handleGameSessionJoined);
      socket.off('game_session_end', handleGameSessionEnd);
      socket.off('game_invite_accepted', handleGameInviteAccepted);
    };
  }, [socket, isInGame, gameSessionId]);

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
        validateSession,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};