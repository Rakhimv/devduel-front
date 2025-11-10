import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../context/GameContext';
import GameInterface from '../components/game/GameInterface';
import type { GameSession } from '../types/game';
import Spinner from '@/components/effects/Spinner';
import { motion } from "framer-motion"
const Game: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user, socket } = useAuth();
    const { setIsInGame, setGameSessionId, setGameDuration } = useGame();
    const navigate = useNavigate();
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!socket || !sessionId || !user) return;

        const handleGameSessionUpdate = (session: GameSession) => {
            setGameSession(session);
            setLoading(false);

            setIsInGame(true);
            setGameSessionId(session.id);
            setGameDuration(session.duration);
        };

        const handleGameSessionEnd = (data: any) => {
            console.log('game_session_end received:', data);

            setIsInGame(false);
            setGameSessionId(null);
            setGameDuration(null);

            if (data && data.id && data.status === 'finished') {
                console.log('Setting game session with finished status:', data);
                setGameSession(data as GameSession);
                setLoading(false);
                setError(null);
            } else {
                console.log('Legacy format or invalid data:', data);
                setGameSession(null);
                setLoading(false);

                if (data?.reason === 'player_left') {
                    setError('Другой игрок покинул игру');
                } else {
                    setError('Игра завершена');
                }
            }
        };

        const handleGameNotFound = () => {
            setError('Игровая сессия не найдена');
            setLoading(false);
            setIsInGame(false);
            setGameSessionId(null);
            setGameDuration(null);

        };

        const handleGameProgressUpdate = (_progress: { playerLevel: number; opponentLevel: number }) => {
        };

        socket.on('game_session_update', handleGameSessionUpdate);
        socket.on('game_session_end', handleGameSessionEnd);
        socket.on('game_not_found', handleGameNotFound);
        socket.on('game_progress_update', handleGameProgressUpdate);

        socket.emit('join_game_session', { sessionId });

        return () => {
            socket.off('game_session_update', handleGameSessionUpdate);
            socket.off('game_session_end', handleGameSessionEnd);
            socket.off('game_not_found', handleGameNotFound);
            socket.off('game_progress_update', handleGameProgressUpdate);
        };
    }, [socket, sessionId, user]);

    const handleLeave = () => {
        if (socket && sessionId) {
            socket.emit('leave_game', { sessionId });
        }
        setIsInGame(false);
        setGameSessionId(null);
        setGameDuration(null);
        navigate('/msg');
    };

    const handleReady = () => {
        if (socket && sessionId) {
            socket.emit('set_player_ready', { sessionId });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen-calc bg-secondary-bg flex items-center justify-center">
                <motion.div
                    className="flex text-primary gap-[10px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 3 }}
                >
                    Загрузка игры <Spinner />
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen-calc bg-secondary-bg flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-redDD text-xl mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/msg')}
                        className="bg-primary hover:bg-primary/80 text-black px-6 py-3 text-sm font-semibold border border-primary cursor-pointer"
                    >
                        Вернуться в чат
                    </button>
                </div>
            </div>
        );
    }

    if (!gameSession) {
        return (
            <div className="w-full h-screen-calc bg-secondary-bg flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-white/60 text-xl mb-4">Игровая сессия не найдена</div>
                    <button
                        onClick={() => navigate('/msg')}
                        className="bg-primary hover:bg-primary/80 text-black px-6 py-3 text-sm font-semibold border border-primary cursor-pointer"
                    >
                        Вернуться в чат
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen-calc bg-secondary-bg">
            <GameInterface
                gameSession={gameSession}
                currentUserId={user?.id || 0}
                onReady={handleReady}
                onLeave={handleLeave}
                onTaskSubmitted={() => {
                    if (socket && sessionId) {
                        socket.emit('join_game_session', { sessionId });
                    }
                }}
            />
        </div>
    );
};

export default Game;
