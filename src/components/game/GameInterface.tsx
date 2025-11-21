import React, { useState, useEffect } from 'react';
import type { GameSession, Task } from '../../types/game';
import CodeEditor from '../IDE/CodeEditor';
import GameCanvas from './GameCanvas';
import { getGameProgress } from '../../api/api';
import { Timer } from './Timer';
import { useAuth } from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/avatarUrl';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from "framer-motion"
import Spinner from '../effects/Spinner';
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

  const [lastGameSessionId, setLastGameSessionId] = React.useState<string | null>(null);
  const { socket } = useAuth();

  useEffect(() => {
    if (gameSession.status === 'in_progress' && gameSession.id !== lastGameSessionId) {
      setLastGameSessionId(gameSession.id);
      loadGameProgress();
    }
  }, [gameSession.status, gameSession.id]);

  useEffect(() => {
    if (!socket || gameSession.status !== 'in_progress') return;

    const handleGameProgressUpdate = (progress: { playerLevel: number; opponentLevel: number }) => {
      if (gameProgress) {
        setGameProgress(prev => prev ? {
            ...prev,
            playerLevel: progress.playerLevel,
            opponentLevel: progress.opponentLevel
        } : null);
      } else {
        loadGameProgress();
        }
    };

    socket.on('game_progress_update', handleGameProgressUpdate);

    return () => {
      socket.off('game_progress_update', handleGameProgressUpdate);
    };
  }, [socket, gameSession.status, gameProgress]);

  useEffect(() => {
    if (gameSession.status === 'finished') {
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

  const player1Level = isPlayer1 ? (gameProgress?.playerLevel || gameSession.player1Level || 1) : (gameProgress?.opponentLevel || gameSession.player1Level || 1);
  const player2Level = !isPlayer1 ? (gameProgress?.playerLevel || gameSession.player2Level || 1) : (gameProgress?.opponentLevel || gameSession.player2Level || 1);

  return (
    <div className="w-full bg-secondary-bg text-white flex flex-col h-full">
      <div className="bg-primary-bg p-3 border-b border-primary-bdr">
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-4 justify-start">
            <div className="flex items-center gap-2">
              <img
                src={getAvatarUrl(gameSession.player1.avatar)}
                alt={gameSession.player1.username}
                className="w-10 h-10 border border-primary-bdr object-cover"
                style={{ aspectRatio: '1/1' }}
              />
              <div>
                <div className="text-sm font-semibold text-white">{gameSession.player1.username}</div>
                <div className="text-xs text-white/60">Level {player1Level}</div>
              </div>
            </div>

            <div className="text-lg font-bold text-primary">VS</div>

            <div className="flex items-center gap-2">
              <img
                src={getAvatarUrl(gameSession.player2.avatar)}
                alt={gameSession.player2.username}
                className="w-10 h-10 border border-primary-bdr object-cover"
                style={{ aspectRatio: '1/1' }}
              />
              <div>
                <div className="text-sm font-semibold text-white">{gameSession.player2.username}</div>
                <div className="text-xs text-white/60">Level {player2Level}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Timer startTime={gameSession.startTime || "0"} duration={gameSession.duration || 0} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onLeave}
              className="bg-redDD hover:bg-red-700 px-4 py-2 text-sm text-white border border-red-700 cursor-pointer"
            >
              Покинуть игру
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {gameSession.status === 'waiting' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl mb-6">Ожидание готовности игроков</h3>
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className={`p-4 border-2 ${isPlayer1 ? 'border-primary bg-primary/10' : 'border-primary-bdr bg-secondary-bg'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={getAvatarUrl(gameSession.player1.avatar)}
                      alt={gameSession.player1.username}
                      className="w-8 h-8 border border-primary-bdr object-cover"
                      style={{ aspectRatio: '1/1' }}
                    />
                    <div className="text-sm font-semibold">{gameSession.player1.username}</div>
                  </div>
                  <div className={`px-3 py-1 text-xs ${gameSession.player1.isReady ? 'bg-primary text-black' : 'bg-secondary-bg border border-primary-bdr text-white/60'}`}>
                    {gameSession.player1.isReady ? 'Готов' : 'Не готов'}
                  </div>
                </div>

                <div className="text-2xl font-bold text-primary">VS</div>

                <div className={`p-4 border-2 ${!isPlayer1 ? 'border-primary bg-primary/10' : 'border-primary-bdr bg-secondary-bg'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={getAvatarUrl(gameSession.player2.avatar)}
                      alt={gameSession.player2.username}
                      className="w-8 h-8 border border-primary-bdr object-cover"
                      style={{ aspectRatio: '1/1' }}
                    />
                    <div className="text-sm font-semibold">{gameSession.player2.username}</div>
                  </div>
                  <div className={`px-3 py-1 text-xs ${gameSession.player2.isReady ? 'bg-primary text-black' : 'bg-secondary-bg border border-primary-bdr text-white/60'}`}>
                    {gameSession.player2.isReady ? 'Готов' : 'Не готов'}
                  </div>
                </div>
              </div>

              {!currentPlayer.isReady && (
                <button
                  onClick={onReady}
                  className="bg-primary hover:bg-primary/80 text-black px-8 py-3 text-lg font-semibold border border-primary cursor-pointer"
                >
                  Готов к игре
                </button>
              )}
            </div>
          </div>
        )}

        {gameSession.status === 'ready' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl mb-4">Оба игрока готовы!</h3>
              <p className="text-lg mb-4 text-white/60">Игра начнется через несколько секунд...</p>
              <motion.div
                className="flex text-primary gap-[10px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 3 }}
              >
                Загрузка <Spinner />
              </motion.div>
            </div>
          </div>
        )}

        {gameSession.status === 'in_progress' && (
          <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
            <Panel defaultSize={25} minSize={20} maxSize={40} className="bg-primary-bg">
              <div className="h-full p-4 overflow-y-auto border-r border-primary-bdr">
                {gameProgress?.currentTask ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{gameProgress.currentTask.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs border ${gameProgress.currentTask.difficulty === 'easy' ? 'border-greenDD text-greenDD' :
                          gameProgress.currentTask.difficulty === 'medium' ? 'border-orangeDD text-orangeDD' : 'border-redDD text-redDD'
                          }`}>
                          {gameProgress.currentTask.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs border border-primary text-primary">
                          Level {gameProgress.currentLevel}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">Описание:</h4>
                      <p className="text-sm text-white/60 whitespace-pre-wrap">{gameProgress.currentTask.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">Пример входных данных:</h4>
                      <code className="block bg-secondary-bg border border-primary-bdr p-2 text-sm text-greenDD whitespace-pre-wrap break-words">
                        {gameProgress.currentTask.input_example}
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">Пример выходных данных:</h4>
                      <code className="block bg-secondary-bg border border-primary-bdr p-2 text-sm text-blueDD whitespace-pre-wrap break-words">
                        {gameProgress.currentTask.output_example}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/60">
                    Загрузка задачи... <Spinner />
                  </div>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-primary-bdr hover:bg-primary/20 transition-colors" />

            <Panel defaultSize={45} minSize={30} className="min-w-0">
              <div className="h-full border-r border-primary-bdr overflow-hidden">
                <CodeEditor
                  gameId={gameSession.id}
                  taskId={gameProgress?.currentTask?.id}
                  onTaskSubmitted={(success, testResults, gameFinished) => handleTaskSubmitted(success, testResults, gameFinished)}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-primary-bdr hover:bg-primary/20 transition-colors" />

            <Panel defaultSize={30} minSize={20} maxSize={40} className="overflow-hidden">
              <GameCanvas
                width={800}
                height={600}
                player1Level={player1Level}
                player2Level={player2Level}
                player1Username={gameSession.player1.username}
                player2Username={gameSession.player2.username}
                player1Avatar={getAvatarUrl(gameSession.player1.avatar)}
                player2Avatar={getAvatarUrl(gameSession.player2.avatar)}
              />
            </Panel>
          </PanelGroup>
        )}

        {gameSession.status === 'finished' && showFinishedModal && (
          <div className="flex-1 flex items-center justify-center relative">
            <div className="fixed inset-0 pointer-events-none z-50">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2"
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

            <div className="relative z-10 text-center">
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
                          <p className="text-3xl font-bold text-primary mb-2">Вы победили!</p>
                          <p className="text-xl text-white/60">Поздравляем с победой!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl">😔</div>
                        <div>
                          <p className="text-3xl font-bold text-redDD mb-2">Вы проиграли</p>
                          <p className="text-xl text-white/60">Победитель: <span className="text-primary">{gameSession.winner.username}</span></p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onLeave}
                className="bg-primary hover:bg-primary/80 text-black px-8 py-3 text-lg font-semibold border border-primary cursor-pointer"
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
