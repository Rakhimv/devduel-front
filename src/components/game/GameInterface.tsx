import React, { useState, useEffect } from 'react';
import type { GameSession, Task } from '../../types/game';
import CodeEditor from '../IDE/CodeEditor';
import GameCanvas from './GameCanvas';
import { getGameProgress } from '../../api/api';
import { Timer } from './Timer';
import { useAuth } from '../../hooks/useAuth';

interface GameInterfaceProps {
  gameSession: GameSession;
  currentUserId: number;
  onReady: () => void;
  onLeave: () => void;
  onTaskSubmitted?: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  gameSession,
  currentUserId,
  onReady,
  onLeave,
  onTaskSubmitted
}) => {


  const [gameProgress, setGameProgress] = useState<{
    currentLevel: number;
    playerLevel: number;
    opponentLevel: number;
    currentTask: Task;
    solvedTasks: number[];
  } | null>(null);
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  const isPlayer1 = gameSession.player1.id === currentUserId;
  const currentPlayer = isPlayer1 ? gameSession.player1 : gameSession.player2;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const player1AvatarUrl = gameSession.player1.avatar ? `${backendUrl}${gameSession.player1.avatar}` : undefined;
  const player2AvatarUrl = gameSession.player2.avatar ? `${backendUrl}${gameSession.player2.avatar}` : undefined;

  const [lastGameSessionId, setLastGameSessionId] = React.useState<string | null>(null);
  const { socket } = useAuth();

  useEffect(() => {
    if (gameSession.status === 'in_progress' && gameSession.id !== lastGameSessionId) {
      setLastGameSessionId(gameSession.id);
      loadGameProgress();
    }
  }, [gameSession.status, gameSession.id]);

  // Listen for game progress updates from socket
  useEffect(() => {
    if (!socket || gameSession.status !== 'in_progress') return;

    const handleGameProgressUpdate = (progress: { playerLevel: number; opponentLevel: number }) => {
      if (gameProgress) {
        // Update progress when received from socket
        setGameProgress(prev => prev ? {
          ...prev,
          playerLevel: progress.playerLevel,
          opponentLevel: progress.opponentLevel
        } : null);
      } else {
        // If no progress yet, reload it
        loadGameProgress();
      }
    };

    socket.on('game_progress_update', handleGameProgressUpdate);

    return () => {
      socket.off('game_progress_update', handleGameProgressUpdate);
    };
  }, [socket, gameSession.status, gameProgress]);

  // Handle game finish - wait for animation before showing modal
  useEffect(() => {
    if (gameSession.status === 'finished') {
      // Wait for GameCanvas animation to complete (1 second) + small buffer
      const timer = setTimeout(() => {
        setShowFinishedModal(true);
      }, 1100);

      return () => clearTimeout(timer);
    } else {
      setShowFinishedModal(false);
    }
  }, [gameSession.status]);

  const loadGameProgress = async () => {
    try {
      const progress = await getGameProgress(gameSession.id);
      setGameProgress(progress);
    } catch (error: any) {
      if (error.message && error.message.includes('Game not found')) {
        setGameProgress({
          currentLevel: 1,
          playerLevel: 1,
          opponentLevel: 1,
          currentTask: {
            id: 1,
            title: 'Sum of Two Numbers',
            description: 'Write a function that takes two integers and returns their sum.',
            input_example: '2 3',
            output_example: '5',
            difficulty: 'easy',
            level: 1,
            code_templates: {
              javascript: 'function sum(a, b) {\n    // Write your code here\n    return a + b;\n}',
              python: 'def sum(a, b):\n    # Write your code here\n    return a + b'
            },
            function_signature: 'sum(a, b)'
          },
          solvedTasks: []
        });
      }
    }
  };

  const handleTaskSubmitted = (_success: boolean, _testResults: any[], gameFinished?: boolean) => {
    onTaskSubmitted?.();

    if (gameFinished) {
      setTimeout(() => {
        loadGameProgress();
      }, 500);
    } else {
      loadGameProgress();
    }
  };

  return (
    <div className="w-full bg-[#111A1F] text-white flex flex-col h-full">

      <div className="bg-[#485761] p-4 border-b border-gray-600">
        <div className="flex justify-between items-center">

          <div className="flex justify-between items-center">
            <div className="flex gap-8">

              <div className={`p-4 rounded-lg border-2 ${isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
                }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold">{gameSession.player1.username}</div>
                  <div className="text-sm text-gray-300">Level: {isPlayer1 ? (gameProgress?.playerLevel || gameSession.player1Level || 1) : (gameProgress?.opponentLevel || gameSession.player1Level || 1)}</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-2xl font-bold text-yellow-500">VS</div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${!isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
                }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold">{gameSession.player2.username}</div>
                  <div className="text-sm text-gray-300">Level: {!isPlayer1 ? (gameProgress?.playerLevel || gameSession.player2Level || 1) : (gameProgress?.opponentLevel || gameSession.player2Level || 1)}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-2">
            <button
              onClick={onLeave}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
            >
              Покинуть игру
            </button>

            <div className="text-4xl font-bold text-yellow-500">
              <Timer startTime={gameSession.startTime || "0"} duration={gameSession.duration || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center h-full">
        {gameSession.status === 'waiting' && (
          <div className="text-center">
            <h3 className="text-2xl mb-4">Ожидание готовности игроков</h3>
            <div className="flex gap-8 mb-8">
              <div className={`p-6 rounded-lg border-2 ${isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
                }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">{gameSession.player1.username}</div>
                  <div className={`px-4 py-2 rounded ${gameSession.player1.isReady ? 'bg-green-600' : 'bg-gray-600'
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
              <div className={`p-6 rounded-lg border-2 ${!isPlayer1 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/20'
                }`}>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">{gameSession.player2.username}</div>
                  <div className={`px-4 py-2 rounded ${gameSession.player2.isReady ? 'bg-green-600' : 'bg-gray-600'
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
          <div className="w-full h-full flex flex-col">

            <div className="flex-1 flex">
              <div className="w-1/3 border-r border-gray-600 p-4">
                <div className="h-full">
                  {gameProgress?.currentTask ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{gameProgress.currentTask.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${gameProgress.currentTask.difficulty === 'easy' ? 'bg-green-600' :
                          gameProgress.currentTask.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                          {gameProgress.currentTask.difficulty}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-600">
                          Level {gameProgress.currentLevel}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Описание:</h4>
                        <p className="text-sm text-gray-400">{gameProgress.currentTask.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Пример входных данных:</h4>
                        <code className="block bg-gray-800 p-2 rounded text-sm text-green-400">
                          {gameProgress.currentTask.input_example}
                        </code>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Пример выходных данных:</h4>
                        <code className="block bg-gray-800 p-2 rounded text-sm text-blue-400">
                          {gameProgress.currentTask.output_example}
                        </code>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Загрузка задачи...
                    </div>
                  )}
                </div>
              </div>

              <div className="w-1/2 max-w-1/2 border-r border-gray-600">
                <div className="h-full">
                  <CodeEditor
                    gameId={gameSession.id}
                    taskId={gameProgress?.currentTask?.id}
                    onTaskSubmitted={(success, testResults, gameFinished) => handleTaskSubmitted(success, testResults, gameFinished)}
                  />
                </div>
              </div>

              <div className="w-1/2">
                <GameCanvas
                  width={800}
                  height={600}
                  player1Level={isPlayer1 ? (gameProgress?.playerLevel || 1) : (gameProgress?.opponentLevel || 1)}
                  player2Level={isPlayer1 ? (gameProgress?.opponentLevel || 1) : (gameProgress?.playerLevel || 1)}
                  player1Username={gameSession.player1.username}
                  player2Username={gameSession.player2.username}
                  player1Avatar={player1AvatarUrl}
                  player2Avatar={player2AvatarUrl}
                />
              </div>
            </div>
          </div>
        )}

        {/* Show finished modal after animation delay */}
        {gameSession.status === 'finished' && showFinishedModal && (
          <div className="text-center relative">
            <div className="fixed inset-0 pointer-events-none z-50">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                    animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
                    animationDelay: `${Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-bold mb-6 animate-pulse">🎉 Игра завершена! 🎉</h3>

              {gameSession.gameResult === 'timeout' && (
                <div className="mb-4">
                  <p className="text-lg mb-2">⏰ Время истекло</p>
                </div>
              )}

              {gameSession.gameResult === 'player_left' && (
                <div className="mb-4">
                  <p className="text-lg mb-2">🚪 Противник покинул игру</p>
                </div>
              )}

              {gameSession.winner && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {gameSession.winner.id === currentUserId ? (
                      <>
                        <div className="text-6xl">🏆</div>
                        <div>
                          <p className="text-3xl font-bold text-yellow-400 mb-2">Вы победили!</p>
                          <p className="text-xl text-gray-300">Поздравляем с победой!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl">😔</div>
                        <div>
                          <p className="text-3xl font-bold text-red-400 mb-2">Вы проиграли</p>
                          <p className="text-xl text-gray-300">Победитель: <span className="text-yellow-400">{gameSession.winner.username}</span></p>
                        </div>
                      </>
                    )}
                  </div>
            
                </div>
              )}

              <button
                onClick={onLeave}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transform hover:scale-105 transition-transform"
              >
                Вернуться в чат
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInterface;