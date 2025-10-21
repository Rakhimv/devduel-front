import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../context/GameContext';
import GameInterface from '../components/game/GameInterface';
import type { GameSession } from '../types/game';

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
            setGameSession(null);
            setLoading(false);
            setIsInGame(false);
            setGameSessionId(null);
            setGameDuration(null);
            
            if (data.reason === 'player_left') {
                setError('Другой игрок покинул игру');
            } else {
                setError('Игра завершена');
            }
        };

        const handleGameNotFound = () => {
            setError('Игровая сессия не найдена');
            setLoading(false);
            setIsInGame(false);
            setGameSessionId(null);
            setGameDuration(null);
        };

        socket.on('game_session_update', handleGameSessionUpdate);
        socket.on('game_session_end', handleGameSessionEnd);
        socket.on('game_not_found', handleGameNotFound);

        socket.emit('join_game_session', { sessionId });

        return () => {
            socket.off('game_session_update', handleGameSessionUpdate);
            socket.off('game_session_end', handleGameSessionEnd);
            socket.off('game_not_found', handleGameNotFound);
            setIsInGame(false);
            setGameSessionId(null);
            setGameDuration(null);
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
            <div className="w-full h-screen bg-[#111A1F] flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <div>Загрузка игры...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen bg-[#111A1F] flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/msg')}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
                    >
                        Вернуться в чат
                    </button>
                </div>
            </div>
        );
    }

    if (!gameSession) {
        return (
            <div className="w-full h-screen bg-[#111A1F] flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-gray-400 text-xl mb-4">Игровая сессия не найдена</div>
                    <button
                        onClick={() => navigate('/msg')}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
                    >
                        Вернуться в чат
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#111A1F]">
            <GameInterface
                gameSession={gameSession}
                currentUserId={user?.id || 0}
                onReady={handleReady}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default Game;
