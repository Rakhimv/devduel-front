import React, { useEffect, useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import type { Message } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../context/GameContext";
import { formatLastSeen } from "../../utils/lastSeen";
import GameInviteComponent from "../game/GameInvite";

const Chat: React.FC<{ chatId: string | null; setChatId: (id: string | null) => void }> = ({ chatId, setChatId }) => {
    const { user, socket } = useAuth();
    const { isInGame } = useGame();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [chatInfo, setChatInfo] = useState<any>(null);
    const [showUnreadDivider, setShowUnreadDivider] = useState(false);
    const [lastSeenText, setLastSeenText] = useState("");
    const [isUserOnline, setIsUserOnline] = useState(false);
    const [gameEndInfo, setGameEndInfo] = useState<{[inviteId: string]: {reason: string, duration: number}}>({});
    const [isInviteSending, setIsInviteSending] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const currentChatIdRef = useRef<string | null>(null);


    const setNullChat = () => {
        setMessages([]);
        setChatInfo(null);
        setShowUnreadDivider(false);
        setLastSeenText("");
        setIsUserOnline(false);
        setGameEndInfo({});
        currentChatIdRef.current = null;
    }


    useEffect(() => {
        if (!chatId) {
            setNullChat()
            return;
        }

        if (!socket) return;

        currentChatIdRef.current = chatId;

        const handleNewMessage = (msg: Message) => {
            setShowUnreadDivider(false);
            setMessages((prev) => [...prev, msg]);
        };

        const handleMessagesReadByOther = ({ chatId: readChatId, messageIds }: any) => {
            if (readChatId === currentChatIdRef.current) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        (messageIds.includes(msg.id) && msg.user_id === user?.id)
                            ? { ...msg, is_read: true }
                            : msg
                    )
                );
            }
        };

        const handleChatHistoryCleared = ({ chatId: clearedChatId }: any) => {
            if (clearedChatId === currentChatIdRef.current) {
                setMessages([]);
                setShowUnreadDivider(false);
            }
        };

        const handleUserStatus = ({ userId, isOnline }: any) => {
            if (chatInfo?.chat_type === "direct" && chatInfo?.user?.id === userId) {
                setIsUserOnline(isOnline);
                if (!isOnline) {
                    setChatInfo((prev: any) => ({
                        ...prev,
                        user: {
                            ...prev.user,
                            updated_at: Date.now()
                        }
                    }));
                }
            }
        };

        const handleGameInviteAccepted = (session: any) => {
            console.log('Game invite accepted, navigating to:', session.id);
            navigate(`/game/${session.id}`);
        };

        const handleGameEndNotification = (data: any) => {
            const gameEndMessage: Message = {
                id: Date.now(),
                chat_id: chatId,
                user_id: 0,
                username: 'Система',
                text: `🎮 Игра завершена! ${data.reason === 'timeout' ? 'Время истекло' : data.reason === 'player_left' ? 'Игрок покинул игру' : 'Игра завершена'}. Длительность: ${Math.round(data.duration / 60000)} минут`,
                timestamp: new Date().toISOString(),
                is_read: false,
                message_type: 'text' as const
            };
            setMessages((prev) => [...prev, gameEndMessage]);
            
            setGameEndInfo((prev) => {
                const newInfo = {...prev};
                messages.forEach(msg => {
                    if (msg.game_invite_data?.status === 'accepted') {
                        newInfo[msg.game_invite_data.invite_id] = {
                            reason: data.reason,
                            duration: data.duration
                        };
                    }
                });
                return newInfo;
            });
        };

        const handleGameInviteExpired = (data: any) => {
            console.log('Game invite expired:', data.inviteId);
            setMessages((prev) => 
                prev.map((msg) => {
                    if (msg.game_invite_data?.invite_id === data.inviteId) {
                        return {
                            ...msg,
                            game_invite_data: {
                                ...msg.game_invite_data,
                                status: 'expired'
                            }
                        } as Message;
                    }
                    return msg;
                })
            );
        };

        const handleGameInviteDeclined = (data: any) => {
            console.log('Game invite declined:', data.inviteId);
            setMessages((prev) => 
                prev.map((msg) => {
                    if (msg.game_invite_data?.invite_id === data.inviteId) {
                        return {
                            ...msg,
                            game_invite_data: {
                                ...msg.game_invite_data,
                                status: 'declined'
                            }
                        } as Message;
                    }
                    return msg;
                })
            );
        };

        const handleGameInviteAbandoned = (data: any) => {
            console.log('Game invite abandoned:', data.inviteId);
            setMessages((prev) => 
                prev.map((msg) => {
                    if (msg.game_invite_data?.invite_id === data.inviteId) {
                        return {
                            ...msg,
                            game_invite_data: {
                                ...msg.game_invite_data,
                                status: 'abandoned'
                            }
                        } as Message;
                    }
                    return msg;
                })
            );
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_read_by_other", handleMessagesReadByOther);
        socket.on("chat_history_cleared", handleChatHistoryCleared);
        socket.on("user_status", handleUserStatus);
        socket.on("game_invite_accepted", handleGameInviteAccepted);
        socket.on("game_end_notification", handleGameEndNotification);
        socket.on("game_invite_expired", handleGameInviteExpired);
        socket.on("game_invite_declined", handleGameInviteDeclined);
        socket.on("game_invite_abandoned", handleGameInviteAbandoned);

        socket.emit("join_chat", chatId);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("messages_read_by_other", handleMessagesReadByOther);
            socket.off("chat_history_cleared", handleChatHistoryCleared);
            socket.off("user_status", handleUserStatus);
            socket.off("game_invite_accepted", handleGameInviteAccepted);
            socket.off("game_end_notification", handleGameEndNotification);
            socket.off("game_invite_expired", handleGameInviteExpired);
            socket.off("game_invite_declined", handleGameInviteDeclined);
            socket.off("game_invite_abandoned", handleGameInviteAbandoned);
        };
    }, [chatId, socket, user, chatInfo]);

    useEffect(() => {
        if (!chatId) return;

        api
            .get(`/chats/${chatId}`)
            .then((res) => {
                setChatInfo(res.data);
                if (res.data.chat_type === "direct" && res.data.user) {
                    setIsUserOnline(res.data.user.is_online || false);
                }

                if (res.data.chatExists) {
                    api
                        .get(`/chats/${chatId}/messages`)
                        .then((msgRes) => {
                            const loadedMessages = msgRes.data.reverse();
                            setMessages(loadedMessages);

                            const hasUnread = loadedMessages.some((msg: Message) => !msg.is_read && msg.user_id !== user?.id);
                            setShowUnreadDivider(hasUnread);
                        })
                        .catch((error) => {
                            console.error('Error fetching messages:', error);
                            setMessages([]);
                            setShowUnreadDivider(false);
                        });
                } else {
                    setMessages([]);
                    setShowUnreadDivider(false);
                }
            })
            .catch(() => {
                setMessages([]);
                setChatInfo(null);
                setShowUnreadDivider(false);
            });
    }, [chatId, user]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!chatInfo?.chat_type || chatInfo.chat_type !== "direct" || !chatInfo.user?.updated_at) {
            return;
        }

        const updateLastSeen = () => {
            setLastSeenText(formatLastSeen(chatInfo.user.updated_at, isUserOnline));
        };

        updateLastSeen();
        const interval = setInterval(updateLastSeen, 1000);

        return () => clearInterval(interval);
    }, [chatInfo, isUserOnline]);







    useEffect(() => {
        if (!chatId || !user) return;
        const unreadMessages = messages.filter(msg => !msg.is_read && msg.user_id !== user.id);
        if (unreadMessages.length > 0) {
            const timer = setTimeout(() => {
                const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];

                api.post(`/chats/${chatId}/mark-read`, {
                    chatId,
                    lastMessageId: lastUnreadMessage.id
                })
                    .then(() => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                (!msg.is_read && msg.user_id !== user.id && msg.id <= lastUnreadMessage.id)
                                    ? { ...msg, is_read: true }
                                    : msg
                            )
                        );

                        setShowUnreadDivider(false);
                    })
                    .catch((err) => {
                        console.error("Error marking messages as read:", err);
                    });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [messages, chatId, user]);



    const sendGameInvite = async () => {
        if (!socket || !chatInfo) return;

        const targetUserId = chatInfo.targetUser?.id || chatInfo.user?.id;
        if (!targetUserId) return;

        // Небольшая задержка для предотвращения случайных множественных кликов
        if (isInviteSending) return;
        setIsInviteSending(true);
        
        setTimeout(() => {
            setIsInviteSending(false);
        }, 1000);

        try {
            let finalChatId = chatId;

            if (!chatInfo?.chatExists && chatInfo?.privacy_type === "private") {
                try {
                    const res = await api.post("/chats/private", { friendId: chatInfo.targetUser.id });
                    finalChatId = res.data.chatId;
                    setChatInfo({ ...chatInfo, chatId: finalChatId, chatExists: true });
                    socket.emit("join_chat", finalChatId);

                    setChatId(finalChatId);
                    navigate(`/msg/${finalChatId}`, { replace: true });
                    
                    setTimeout(() => {
                        socket.emit("send_game_invite", {
                            chatId: finalChatId,
                            toUserId: targetUserId
                        });
                    }, 100);
                    
                    return;
                } catch (err) {
                    console.error("Error creating chat:", err);
                    return;
                }
            }

            socket.emit("send_game_invite", {
                chatId: finalChatId,
                toUserId: targetUserId
            });
        } catch (err) {
            console.error("Error sending game invite:", err);
        }
    };



    const sendMessage = async () => {
        if (!socket || !text.trim() || !chatId) return;

        let finalChatId = chatId;

        if (!chatInfo?.chatExists && chatInfo?.privacy_type === "private") {
            try {
                const res = await api.post("/chats/private", { friendId: chatInfo.targetUser.id });
                finalChatId = res.data.chatId;
                setChatInfo({ ...chatInfo, chatId: finalChatId, chatExists: true });
                socket.emit("join_chat", finalChatId);

                setChatId(finalChatId);
                navigate(`/msg/${finalChatId}`, { replace: true });
            } catch (err) {
                console.error("Error creating chat:", err);
                return;
            }
        }

        socket.emit("send_message", { chatId: finalChatId, text });
        setText("");
    };

    const firstUnreadIndex = messages.findIndex((msg) => !msg.is_read && msg.user_id !== user?.id);

    if (!chatId) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white">
                Выберите чат
            </div>
        );
    }

    if (!chatInfo) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">Чат не найден</div>
                    <div className="text-gray-400">У вас нет доступа к этому чату</div>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full h-full bg-[#111A1F] text-white flex flex-col">
            <div className="bg-[#485761] p-4 border-b border-gray-600">

                <div>
                    <h2 className="text-lg font-semibold">{chatInfo.display_name}</h2>
                    {chatInfo.chat_type === "direct" && (
                        <p className="text-sm text-gray-300">{lastSeenText}</p>
                    )}
                </div>


                {chatInfo.chat_type === "group" && !chatInfo.isParticipant && chatId !== "general" && (
                    <button className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                        Присоединиться
                    </button>
                )}
            </div>

            <div className="messages flex-1 overflow-y-auto text-[20px] p-4">

                {messages.map((msg, index) => (
                    <React.Fragment key={msg.id}>
                        {showUnreadDivider && firstUnreadIndex === index && (
                            <div className="my-2 border-t border-red-500 text-red-500 text-center">
                                Непрочитанные сообщения
                            </div>
                        )}
                        
                        {msg.message_type === 'game_invite' && msg.game_invite_data ? (
                            <div className="mb-4">
                                <GameInviteComponent
                                    invite={{
                                        id: msg.game_invite_data.invite_id,
                                        fromUserId: msg.game_invite_data.from_user_id,
                                        fromUsername: msg.game_invite_data.from_username,
                                        toUserId: msg.game_invite_data.to_user_id,
                                        toUsername: msg.game_invite_data.to_username,
                                        timestamp: msg.timestamp,
                                        status: msg.game_invite_data.status
                                    }}
                                    onAccept={() => {
                                        if (socket && msg.game_invite_data && msg.game_invite_data.invite_id && !isInGame) {
                                            console.log('Accepting invite:', msg.game_invite_data.invite_id);
                                            socket.emit("accept_game_invite", {
                                                inviteId: msg.game_invite_data.invite_id
                                            });
                                        } else if (isInGame) {
                                            console.log('Cannot accept invite - already in game');
                                        } else {
                                            console.error('Cannot accept invite - missing data:', msg.game_invite_data);
                                        }
                                    }}
                                    onDecline={() => {
                                        if (socket && msg.game_invite_data && msg.game_invite_data.invite_id) {
                                            console.log('Declining invite:', msg.game_invite_data.invite_id);
                                            socket.emit("decline_game_invite", {
                                                inviteId: msg.game_invite_data.invite_id
                                            });
                                        } else {
                                            console.error('Cannot decline invite - missing data:', msg.game_invite_data);
                                        }
                                    }}
                                    isFromCurrentUser={msg.user_id === user?.id}
                                    gameEndReason={gameEndInfo[msg.game_invite_data?.invite_id || '']?.reason}
                                    gameDuration={gameEndInfo[msg.game_invite_data?.invite_id || '']?.duration}
                                    isInGame={isInGame}
                                />
                            </div>
                        ) : (
                            <div className="mb-2 flex items-center gap-2">
                                <span>[{new Date(msg.timestamp).toLocaleTimeString()}] &lt;{msg.username}&gt; {msg.text}</span>
                                {msg.user_id === user?.id && (
                                    <span className={`text-xs ${msg.is_read ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {chatInfo?.chat_type === 'group' ? (msg.is_read ? '✓✓' : '✓') : (msg.is_read ? '✓✓' : '✓')}
                                    </span>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
                <div ref={messageEndRef} />
            </div>

            {chatInfo.canSend && (
                <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                    className="w-full py-[5px] bg-[#485761]"
                >
                    <div className="w-full flex gap-[5px]">
                        <input
                            className="p-[10px] outline-none bg-[#111A1F] w-full rounded-[4px]"
                            type="text"
                            placeholder="Сообщение..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />
                        <button
                            onClick={sendGameInvite}
                            disabled={isInGame || isInviteSending}
                            className={`p-[20px] whitespace-nowrap rounded-[4px] ${
                                isInGame || isInviteSending
                                    ? 'cursor-not-allowed bg-gray-500 text-gray-300' 
                                    : 'cursor-pointer bg-amber-500 hover:bg-amber-600'
                            }`}>
                            {isInGame ? 'В ИГРЕ' : isInviteSending ? 'ОТПРАВКА...' : 'ПРИГЛАСИТЬ В ИГРУ'}
                        </button>
                    </div>
                    <p className="opacity-50 text-sm px-2">freenode (IRC)</p>
                </form>
            )}
        </div>
    );
};

export default Chat;