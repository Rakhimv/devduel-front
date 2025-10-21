import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const GameNavigationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInGame, gameSessionId } = useGame();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInGame && gameSessionId && !location.pathname.startsWith('/game/')) {
      const shouldLeave = window.confirm(
        'Вы находитесь в игровой сессии. Если вы покинете игру сейчас, это будет засчитано как поражение. Вы уверены, что хотите покинуть игру?'
      );
      
      if (shouldLeave) {
        return;
      } else {
        navigate(`/game/${gameSessionId}`);
      }
    }
  }, [isInGame, gameSessionId, location.pathname, navigate]);

  return <>{children}</>;
};

export default GameNavigationGuard;
