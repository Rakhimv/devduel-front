import React, { useEffect, useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import type { Message } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../context/GameContext";
import { formatLastSeen } from "../../utils/lastSeen";
import GameInviteComponent from "../game/GameInvite";
import Modal from "../ui/Modal";
import AvatarWithStatus from "./AvatarWithStatus";
import ChatInput from "../ui/ChatInput";
import { FaGamepad } from "react-icons/fa";

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
    const [showUserSelectModal, setShowUserSelectModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [messageContextMenu, setMessageContextMenu] = useState<{ x: number; y: number; messageId: number } | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [participantsOffset, setParticipantsOffset] = useState(0);
    const [participantsTotal, setParticipantsTotal] = useState(0);
    const participantsLimit = 10;
    const messageEndRef = useRef<HTMLDivElement>(null);
    const currentChatIdRef = useRef<string | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);


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
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                if (isOnline) {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
            
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

        const handleUsersList = (data: any) => {
            setAvailableUsers(data.users || []);
        };

        const handleGameInviteAccepted = (session: any) => {
            console.log('Game invite accepted, navigating to:', session.id);
            navigate(`/game/${session.id}`);
        };

        const handleGameInviteError = (data: any) => {
            console.log('Game invite error:', data.message);
            alert(data.message);
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

        const handleMessageDeleted = ({ messageId, chatId: deletedChatId }: any) => {
            if (deletedChatId === currentChatIdRef.current) {
                setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            }
        };

        const handleGeneralChatUpdate = ({ participantsCount, onlineCount }: any) => {
            if (currentChatIdRef.current === 'general') {
                setChatInfo((prev: any) => ({
                    ...prev,
                    participantsCount,
                    onlineCount
                }));
            }
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_read_by_other", handleMessagesReadByOther);
        socket.on("chat_history_cleared", handleChatHistoryCleared);
        socket.on("user_status", handleUserStatus);
        socket.on("users_list", handleUsersList);
        socket.on("game_invite_accepted", handleGameInviteAccepted);
        socket.on("game_invite_error", handleGameInviteError);
        socket.on("game_end_notification", handleGameEndNotification);
        socket.on("game_invite_expired", handleGameInviteExpired);
        socket.on("game_invite_declined", handleGameInviteDeclined);
        socket.on("game_invite_abandoned", handleGameInviteAbandoned);
        socket.on("message_deleted", handleMessageDeleted);
        socket.on("general_chat_update", handleGeneralChatUpdate);

        socket.emit("join_chat", chatId);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("messages_read_by_other", handleMessagesReadByOther);
            socket.off("chat_history_cleared", handleChatHistoryCleared);
            socket.off("user_status", handleUserStatus);
            socket.off("users_list", handleUsersList);
            socket.off("game_invite_accepted", handleGameInviteAccepted);
            socket.off("game_invite_error", handleGameInviteError);
            socket.off("game_end_notification", handleGameEndNotification);
            socket.off("game_invite_expired", handleGameInviteExpired);
            socket.off("game_invite_declined", handleGameInviteDeclined);
            socket.off("game_invite_abandoned", handleGameInviteAbandoned);
            socket.off("message_deleted", handleMessageDeleted);
            socket.off("general_chat_update", handleGeneralChatUpdate);
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



    const sendGameInvite = async (selectedUserId?: number) => {
        if (!socket || !chatInfo) return;

        const targetUserId = selectedUserId || chatInfo.targetUser?.id || chatInfo.user?.id;
        if (!targetUserId) {
            // For group chats, show user selection modal
            if (chatInfo?.chat_type === 'group') {
                setShowUserSelectModal(true);
                fetchOnlineUsers();
            } else {
                console.error("Cannot send invite: no target user specified");
            }
            return;
        }

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
            
            setShowUserSelectModal(false);
        } catch (err) {
            console.error("Error sending game invite:", err);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            if (socket) {
                socket.emit('get_users_list', { offset: 0, limit: 100 });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
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

    const handleMessageRightClick = (e: React.MouseEvent, messageId: number) => {
        e.preventDefault();
        setMessageContextMenu({ x: e.clientX, y: e.clientY, messageId });
    };

    const handleCopyMessage = async (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (message && message.text) {
            try {
                await navigator.clipboard.writeText(message.text);
                setMessageContextMenu(null);
            } catch (err) {
                console.error('Failed to copy message:', err);
            }
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            await api.delete(`/chats/messages/${messageId}`);
            setMessageContextMenu(null);
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    const handleChatHeaderClick = async () => {
        if (chatId === 'general') {
            // Open participants modal for general chat
            setShowParticipantsModal(true);
            setParticipantsOffset(0);
            setParticipants([]);
            loadParticipants(0);
        } else if (chatInfo?.chat_type === 'direct' && chatInfo?.user?.id) {
            try {
                const res = await api.get(`/users/${chatInfo.user.id}`);
                setProfileUser(res.data);
                setShowProfileModal(true);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        }
    };

    const loadParticipants = async (offset: number) => {
        setParticipantsLoading(true);
        try {
            const res = await api.get(`/users/list?offset=${offset}&limit=${participantsLimit}`);
            if (offset === 0) {
                setParticipants(res.data.users || []);
            } else {
                setParticipants((prev) => [...prev, ...(res.data.users || [])]);
            }
            setParticipantsTotal(res.data.total || 0);
            setParticipantsOffset(offset);
        } catch (err) {
            console.error('Failed to load participants:', err);
        } finally {
            setParticipantsLoading(false);
        }
    };

    const handleParticipantsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
        
        if (isNearBottom && !participantsLoading && participants.length < participantsTotal) {
            const nextOffset = participantsOffset + participantsLimit;
            if (nextOffset < participantsTotal) {
                loadParticipants(nextOffset);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setMessageContextMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!chatId) {
        return (
            <div className="w-full h-full bg-secondary-bg flex flex-col gap-[20px] items-center justify-center text-white relative">
                <img src="/logo.svg" className="opacity-[0.02] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
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
        <div className="w-full h-full bg-secondary-bg text-white flex flex-col">
            <div 
                className={`bg-primary-bg p-4 border-b border-primary-bdr ${(chatInfo?.chat_type === 'direct' || chatId === 'general') ? 'cursor-pointer hover:bg-[#2a3441]' : ''}`}
                onClick={(chatInfo?.chat_type === 'direct' || chatId === 'general') ? handleChatHeaderClick : undefined}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{chatInfo.display_name}</h2>
                        {chatInfo?.chat_type === "direct" && chatInfo?.userStats && (
                            <span className="text-xs text-gray-400">
                                ({chatInfo.userStats.games_count} игр, {chatInfo.userStats.wins_count} побед)
                            </span>
                        )}
                    </div>
                    {chatInfo.chat_type === "direct" && (
                        <p className={`text-sm ${chatInfo.user.is_online ? "text-primary" : "text-white/50"}`}>
                            {lastSeenText}
                        </p>
                    )}
                    {chatId === "general" && (
                        <p className="text-sm text-white/50">
                            {chatInfo?.participantsCount || 0} участников • {chatInfo?.onlineCount || 0} онлайн
                        </p>
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
                                        fromAvatar: msg.game_invite_data.from_avatar,
                                        toUserId: msg.game_invite_data.to_user_id,
                                        toUsername: msg.game_invite_data.to_username,
                                        toAvatar: msg.game_invite_data.to_avatar,
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
                            <div 
                                className="mb-2 flex items-center gap-2 relative"
                                onContextMenu={(e) => handleMessageRightClick(e, msg.id)}
                            >
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
                    className="w-full bg-[#485761] p-4"
                >
                    <div className="w-full flex items-end gap-2">
                        <div className="flex-1">
                            <ChatInput
                                value={text}
                                onChange={setText}
                                onSend={sendMessage}
                                placeholder="Напишите сообщение..."
                                disabled={false}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => sendGameInvite()}
                            disabled={isInGame || isInviteSending}
                            className={`p-3 rounded-lg transition-all duration-200 ${
                                isInGame || isInviteSending
                                    ? 'cursor-not-allowed bg-gray-500 text-gray-300' 
                                    : 'cursor-pointer bg-amber-500 hover:bg-amber-600 hover:scale-110 active:scale-95 shadow-lg hover:shadow-amber-500/50'
                            }`}
                            title={isInGame ? 'Вы уже в игре' : 'Пригласить в игру'}
                        >
                            <FaGamepad size={24} />
                        </button>
                    </div>
                </form>
            )}
            
            <Modal
                isOpen={showUserSelectModal}
                onClose={() => {
                    setShowUserSelectModal(false);
                    setUserSearchQuery("");
                }}
                title="Выберите пользователя"
            >
                <div className="w-full">
                    <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Поиск по имени или логину..."
                        className="w-full p-2 mb-4 bg-[#111A1F] text-white rounded outline-none border border-gray-600 focus:border-amber-500"
                    />
                    <div className="max-h-96 overflow-y-auto">
                        {availableUsers
                            .filter(u => u.id !== user?.id)
                            .filter(u => {
                                const query = userSearchQuery.toLowerCase();
                                if (!query) return true;
                                return (u.name?.toLowerCase().includes(query) || 
                                        u.login?.toLowerCase().includes(query));
                            })
                            .map((userItem) => (
                                <button
                                    key={userItem.id}
                                    onClick={() => sendGameInvite(userItem.id)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-[#111A1F] rounded transition-colors text-left"
                                >
                                    <AvatarWithStatus
                                        avatar={userItem.avatar}
                                        name={userItem.name || userItem.login}
                                        isOnline={onlineUsers.has(userItem.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate text-white">{userItem.name}</div>
                                        <div className="text-sm text-gray-400 truncate">@{userItem.login}</div>
                                    </div>
                                </button>
                            ))}
                        {availableUsers
                            .filter(u => u.id !== user?.id)
                            .filter(u => {
                                const query = userSearchQuery.toLowerCase();
                                if (!query) return true;
                                return (u.name?.toLowerCase().includes(query) || 
                                        u.login?.toLowerCase().includes(query));
                            })
                            .length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                {userSearchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {messageContextMenu && (
                <div
                    ref={contextMenuRef}
                    style={{
                        position: 'fixed',
                        left: messageContextMenu.x,
                        top: messageContextMenu.y,
                        zIndex: 1000,
                    }}
                    className="bg-secondary-bg border border-primary-bdr rounded shadow-lg"
                >
                    <button
                        onClick={() => handleCopyMessage(messageContextMenu.messageId)}
                        className="block w-full px-4 py-2 text-left hover:bg-primary-bg text-white text-sm"
                    >
                        Копировать
                    </button>
                    {messages.find(m => m.id === messageContextMenu.messageId)?.user_id === user?.id && (
                        <button
                            onClick={() => handleDeleteMessage(messageContextMenu.messageId)}
                            className="block w-full px-4 py-2 text-left hover:bg-red-600 text-white text-sm"
                        >
                            Удалить
                        </button>
                    )}
                </div>
            )}

            <Modal
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false);
                    setProfileUser(null);
                }}
                title={profileUser ? `${profileUser.name} (@${profileUser.login})` : "Профиль"}
            >
                {profileUser && (
                    <div className="text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <img 
                                src={`${import.meta.env.VITE_BACKEND_URL}${profileUser.avatar || "/default.png"}`}
                                alt={profileUser.name}
                                className="w-16 h-16 rounded-full border-2 border-gray-600"
                            />
                            <div>
                                <h3 className="text-xl font-bold">{profileUser.name}</h3>
                                <p className="text-gray-400">@{profileUser.login}</p>
                            </div>
                        </div>
                        <div className="bg-[#5a6470] rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-2">Статистика</h4>
                            <p className="text-gray-300">Игр сыграно: {profileUser.games_count || 0}</p>
                            <p className="text-gray-300">Побед: {profileUser.wins_count || 0}</p>
                            <p className="text-gray-300">Поражений: {(profileUser.games_count || 0) - (profileUser.wins_count || 0)}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={showParticipantsModal}
                onClose={() => {
                    setShowParticipantsModal(false);
                    setParticipants([]);
                    setParticipantsOffset(0);
                }}
                title={`Участники General (${participantsTotal})`}
            >
                <div 
                    className="max-h-96 overflow-y-auto"
                    onScroll={handleParticipantsScroll}
                >
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center gap-3 p-3 hover:bg-[#111A1F] rounded transition-colors"
                        >
                            <AvatarWithStatus
                                avatar={participant.avatar}
                                name={participant.name || participant.login}
                                isOnline={onlineUsers.has(participant.id)}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-white">{participant.name}</div>
                                <div className="text-sm text-gray-400 truncate">@{participant.login}</div>
                            </div>
                        </div>
                    ))}
                    {participantsLoading && (
                        <div className="text-center py-4 text-gray-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                        </div>
                    )}
                    {!participantsLoading && participants.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            Нет участников
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Chat;