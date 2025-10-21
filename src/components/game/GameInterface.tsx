import React, { useState, useEffect } from 'react';
import { GameSession, GameTimer } from '../../types/game';

interface GameInterfaceProps {
  gameSession: GameSession;
  currentUserId: number;
  onReady: () => void;
  onLeave: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ 
  gameSession, 
  currentUserId, 
  onReady, 
  onLeave 
}) => {
  const [timer, setTimer] = useState<GameTimer>({
    minutes: 10,
    seconds: 0,
    isActive: false
  });

  const isPlayer1 = gameSession.player1.id === currentUserId;
  const currentPlayer = isPlayer1 ? gameSession.player1 : gameSession.player2;
  const opponent = isPlayer1 ? gameSession.player2 : gameSession.player1;

  useEffect(() => {
    if (gameSession.status === 'in_progress' && gameSession.startTime) {
      const startTime = new Date(gameSession.startTime).getTime();
      const duration = gameSession.duration;
      const endTime = startTime + duration;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        
        if (remaining <= 0) {
          setTimer({ minutes: 0, seconds: 0, isActive: false });
          return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        setTimer({ minutes, seconds, isActive: true });
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameSession.status, gameSession.startTime, gameSession.duration]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-[#111A1F] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#485761] p-4 border-b border-gray-600">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Игровая сессия</h2>
          <button
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Покинуть игру
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {gameSession.status === 'waiting' && (
          <div className="text-center">
            <h3 className="text-2xl mb-4">Ожидание готовности игроков</h3>
            <div className="flex gap-8 mb-8">
              {/* Player 1 */}
              <div className={`p-6 rounded-lg border-2 ${
                isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">{gameSession.player1.username}</div>
                  <div className={`px-4 py-2 rounded ${
                    gameSession.player1.isReady ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {gameSession.player1.isReady ? 'Готов' : 'Не готов'}
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center">
                <div className="text-4xl font-bold text-yellow-500">VS</div>
              </div>

              {/* Player 2 */}
              <div className={`p-6 rounded-lg border-2 ${
                !isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">{gameSession.player2.username}</div>
                  <div className={`px-4 py-2 rounded ${
                    gameSession.player2.isReady ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {gameSession.player2.isReady ? 'Готов' : 'Не готов'}
                  </div>
                </div>
              </div>
            </div>

            {!currentPlayer.isReady && (
              <button
                onClick={onReady}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-lg font-semibold"
              >
                Готов к игре
              </button>
            )}
          </div>
        )}

        {gameSession.status === 'ready' && (
          <div className="text-center">
            <h3 className="text-2xl mb-4">Оба игрока готовы!</h3>
            <p className="text-lg mb-4">Игра начнется через несколько секунд...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        )}

        {gameSession.status === 'in_progress' && (
          <div className="text-center">
            <div className="text-6xl font-bold text-yellow-500 mb-8">
              {formatTime(timer.minutes, timer.seconds)}
            </div>
            
            <div className="flex gap-8 mb-8">
              {/* Player 1 */}
              <div className={`p-6 rounded-lg border-2 ${
                isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold">{gameSession.player1.username}</div>
                  <div className="text-sm text-gray-400">Игрок 1</div>
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center">
                <div className="text-4xl font-bold text-yellow-500">VS</div>
              </div>

              {/* Player 2 */}
              <div className={`p-6 rounded-lg border-2 ${
                !isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold">{gameSession.player2.username}</div>
                  <div className="text-sm text-gray-400">Игрок 2</div>
                </div>
              </div>
            </div>

            <div className="text-lg text-gray-400">
              Игра в процессе... Время ограничено!
            </div>
          </div>
        )}

        {gameSession.status === 'finished' && (
          <div className="text-center">
            <h3 className="text-2xl mb-4">Игра завершена!</h3>
            
            {gameSession.gameResult === 'timeout' && (
              <div className="mb-4">
                <p className="text-lg mb-2">⏰ Время истекло</p>
                <p className="text-gray-400">Игра длилась: {gameSession.duration / 60000} минут</p>
              </div>
            )}
            
            {gameSession.gameResult === 'player_left' && (
              <div className="mb-4">
                <p className="text-lg mb-2">🚪 Противник покинул игру</p>
                <p className="text-gray-400">Игра длилась: {gameSession.duration / 60000} минут</p>
              </div>
            )}
            
            {gameSession.winner && (
              <div className="mb-4">
                <p className="text-lg mb-2">🏆 Победитель: {gameSession.winner.username}</p>
                <p className="text-gray-400">Игра длилась: {gameSession.duration / 60000} минут</p>
              </div>
            )}
            
            <button
              onClick={onLeave}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Вернуться в чат
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInterface;
