import React, { useEffect, useState, useRef, useMemo, memo, useCallback, useLayoutEffect, type FormEvent, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import type { Message } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../context/GameContext";
import { formatLastSeen } from "../../utils/lastSeen";
import { getAvatarUrl } from "../../utils/avatarUrl";
import { formatMessageDate, isDifferentDay } from "../../utils/dateFormatter";
import GameInviteComponent from "../game/GameInvite";
import Modal from "../ui/Modal";
import AvatarWithStatus from "./AvatarWithStatus";
import ChatInput from "../ui/ChatInput";
import { FaGamepad } from "react-icons/fa";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MessageListSkeleton } from "../ui/MessageSkeleton";

// Интерфейс для элемента сообщения с метаданными
interface MessageItem {
    message: Message;
    showDateDivider: boolean;
    showUnreadDivider: boolean;
    isFirstUnread: boolean;
}

// Мемоизированный компонент сообщения
const MessageComponent = memo(({ 
    msg, 
    showDateDivider, 
    showUnreadDivider, 
    isFirstUnread,
    userId,
    gameEndInfo,
    isInGame,
    socket,
    onContextMenu
}: {
    msg: Message;
    showDateDivider: boolean;
    showUnreadDivider: boolean;
    isFirstUnread: boolean;
    userId?: number;
    gameEndInfo: { [inviteId: string]: { reason: string, duration: number } };
    isInGame: boolean;
    socket: any;
    onContextMenu: (e: React.MouseEvent, messageId: number) => void;
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <>
            {showDateDivider && (
                <div className="flex items-center justify-center my-6 gap-3">
                    <div className="flex-1 h-px bg-white/20"></div>
                    <div className="text-xs text-white/60 font-medium px-2">
                        {formatMessageDate(msg.timestamp)}
                    </div>
                    <div className="flex-1 h-px bg-white/20"></div>
                </div>
            )}
            
            {showUnreadDivider && isFirstUnread && (
                <div className="my-2 border-t border-red-500 text-red-500 text-center">
                    Непрочитанные сообщения
                </div>
            )}

            {msg.message_type === 'game_invite' && msg.game_invite_data ? (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="mb-4"
                    onContextMenu={(e: any) => onContextMenu(e, msg.id)}
                >
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
                            }
                        }}
                        onDecline={() => {
                            if (socket && msg.game_invite_data && msg.game_invite_data.invite_id) {
                                console.log('Declining invite:', msg.game_invite_data.invite_id);
                                socket.emit("decline_game_invite", {
                                    inviteId: msg.game_invite_data.invite_id
                                });
                            }
                        }}
                        isFromCurrentUser={msg.user_id === userId}
                        gameEndReason={gameEndInfo[msg.game_invite_data?.invite_id || '']?.reason}
                        gameDuration={gameEndInfo[msg.game_invite_data?.invite_id || '']?.duration}
                        isInGame={isInGame}
                    />
                </motion.div>
            ) : (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="mb-2 flex items-end gap-2 relative"
                    onContextMenu={(e: any) => onContextMenu(e, msg.id)}
                >
                    <img 
                        src={getAvatarUrl(msg.avatar)}
                        alt={msg.name || msg.username}
                        className="w-[40px] h-[40px] rounded-full object-cover border-2 border-primary-bdr flex-shrink-0"
                    />
                    <div className="bg-primary-bg relative p-[10px] py-[10px] rounded-[10px]">
                        <div className="text-xs text-white/60 mb-1">{msg.name || msg.username}</div>
                        <div className="w-full mr-[80px]">
                            <p className="text-sm break-words">{msg.text}</p>
                        </div>
                        <div className="absolute right-[10px] flex gap-[5px] items-center bottom-[0px]">
                            <span className="text-[14px] text-white/40">{new Date(msg.timestamp).toLocaleTimeString().slice(0, 5)}</span>
                            {msg.user_id === userId && (
                                <span className={`text-xs ${msg.is_read ? 'text-primary' : 'text-white/60'}`}>
                                    {msg.is_read ? <IoCheckmarkDoneSharp /> : <IoCheckmarkSharp />}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
});

MessageComponent.displayName = 'MessageComponent';

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
    const [gameEndInfo, setGameEndInfo] = useState<{ [inviteId: string]: { reason: string, duration: number } }>({});
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
    const [participantsSearchQuery, setParticipantsSearchQuery] = useState("");
    const participantsLimit = 10;
    const currentChatIdRef = useRef<string | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingChatInfo, setIsLoadingChatInfo] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const loadedChatIdRef = useRef<string | null>(null);
    const chatTextsRef = useRef<{ [chatId: string]: string }>({});

    const setNullChat = () => {
        setMessages([]);
        setChatInfo(null);
        setShowUnreadDivider(false);
        setLastSeenText("");
        setIsUserOnline(false);
        setGameEndInfo({});
        currentChatIdRef.current = null;
        loadedChatIdRef.current = null;
        setIsScrolling(false);
    }


    useEffect(() => {
        if (!chatId) {
            setNullChat()
            return;
        }

        if (!socket) return;

        // Не перезагружать, если чат уже открыт
        if (currentChatIdRef.current === chatId) {
            return;
        }

        currentChatIdRef.current = chatId;

        const handleNewMessage = (msg: Message) => {
            setShowUnreadDivider(false);
            setMessages((prev) => {
                // Проверяем, нет ли уже такого сообщения (оптимистичное обновление)
                const exists = prev.some(m => m.id === msg.id);
                if (exists) {
                    return prev.map(m => m.id === msg.id ? msg : m);
                }
                return [...prev, msg];
            });
            // Scroll to bottom on new message - используем requestAnimationFrame для моментального скролла
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current && messagesEndRef.current) {
                        const container = messagesContainerRef.current;
                        const maxScroll = container.scrollHeight - container.clientHeight;
                        container.scrollTop = maxScroll;
                    } else {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
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
                const newInfo = { ...prev };
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
        if (!chatId) {
            setIsLoadingChatInfo(false);
            return;
        }

        // Не перезагружать, если чат уже загружен
        if (loadedChatIdRef.current === chatId && chatInfo) {
            return;
        }

        // Сбросить состояние скролла при смене чата
        setIsScrolling(false);
        setIsLoadingChatInfo(true);
        
        // Сохраняем текст текущего чата перед переключением
        if (loadedChatIdRef.current && loadedChatIdRef.current !== chatId) {
            chatTextsRef.current[loadedChatIdRef.current] = text;
        }
        
        loadedChatIdRef.current = chatId;

        // Retry логика для загрузки чата
        let loadAttempts = 0;
        const maxLoadAttempts = 3;
        const loadChatWithRetry = () => {
            if (loadAttempts >= maxLoadAttempts) {
                console.error("Failed to load chat after", maxLoadAttempts, "attempts");
                setMessages([]);
                setChatInfo(null);
                setShowUnreadDivider(false);
                setIsLoadingChatInfo(false);
                loadedChatIdRef.current = null;
                return;
            }
            
            loadAttempts++;
            startTransition(() => {
                api
                    .get(`/chats/${chatId}`)
                    .then((res) => {
                        setChatInfo(res.data);
                        setIsLoadingChatInfo(false);
                        if (res.data.chat_type === "direct" && res.data.user) {
                            setIsUserOnline(res.data.user.is_online || false);
                        }

                        if (res.data.chatExists) {
                            setIsLoadingMessages(true);
                            setIsScrolling(true);
                            api
                                .get(`/chats/${chatId}/messages`)
                                .then((msgRes) => {
                                    const loadedMessages = msgRes.data.reverse();
                                    startTransition(() => {
                                        setMessages(loadedMessages);
                                    });

                                    const hasUnread = loadedMessages.some((msg: Message) => !msg.is_read && msg.user_id !== user?.id);
                                    setShowUnreadDivider(hasUnread);
                                    
                                    // Плавный скролл: ждем пока DOM обновится, потом плавно скроллим
                                    // Используем несколько requestAnimationFrame для гарантии что DOM обновлен
                                    requestAnimationFrame(() => {
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => {
                                                if (messagesContainerRef.current) {
                                                    // Даем больше времени для рендера всех сообщений
                                                    setTimeout(() => {
                                                        if (!messagesContainerRef.current) {
                                                            setIsScrolling(false);
                                                            return;
                                                        }
                                                        
                                                        const container = messagesContainerRef.current;
                                                        
                                                        // Проверяем несколько раз, что DOM полностью обновлен
                                                        const checkAndScroll = (attempts = 0) => {
                                                            if (attempts > 10) {
                                                                setIsScrolling(false);
                                                                return;
                                                            }
                                                            
                                                            const maxScroll = container.scrollHeight - container.clientHeight;
                                                            const currentScroll = container.scrollTop;
                                                            
                                                            // Если scrollHeight еще не стабилен, ждем еще
                                                            if (maxScroll <= 0 && attempts < 5) {
                                                                requestAnimationFrame(() => checkAndScroll(attempts + 1));
                                                                return;
                                                            }
                                                            
                                                            // Если уже внизу или почти внизу, не скроллим
                                                            if (Math.abs(currentScroll - maxScroll) < 5) {
                                                                container.scrollTop = maxScroll;
                                                                setIsScrolling(false);
                                                                return;
                                                            }
                                                            
                                                            const distance = maxScroll - currentScroll;
                                                            
                                                            // Если расстояние маленькое, скроллим сразу
                                                            if (Math.abs(distance) < 10) {
                                                                container.scrollTop = maxScroll;
                                                                setIsScrolling(false);
                                                                return;
                                                            }
                                                            
                                                            const duration = 600; // 600ms для плавного скролла
                                                            const startTime = performance.now();
                                                            
                                                            const smoothScroll = (currentTime: number) => {
                                                                if (!messagesContainerRef.current) {
                                                                    setIsScrolling(false);
                                                                    return;
                                                                }
                                                                
                                                                const elapsed = currentTime - startTime;
                                                                const progress = Math.min(elapsed / duration, 1);
                                                                
                                                                // Easing функция для плавности (ease-out)
                                                                const ease = (t: number) => 1 - Math.pow(1 - t, 3);
                                                                
                                                                const currentScrollPos = currentScroll + distance * ease(progress);
                                                                container.scrollTop = currentScrollPos;
                                                                
                                                                if (progress < 1) {
                                                                    requestAnimationFrame(smoothScroll);
                                                                } else {
                                                                    // Убеждаемся что мы в самом низу - делаем финальную проверку
                                                                    const finalMaxScroll = container.scrollHeight - container.clientHeight;
                                                                    container.scrollTop = finalMaxScroll;
                                                                    setIsScrolling(false);
                                                                }
                                                            };
                                                            
                                                            requestAnimationFrame(smoothScroll);
                                                        };
                                                        
                                                        checkAndScroll();
                                                    }, 150);
                                                } else {
                                                    setIsScrolling(false);
                                                }
                                            });
                                        });
                                    });
                                })
                                .catch((error) => {
                                    console.error('Error fetching messages:', error);
                                    setMessages([]);
                                    setShowUnreadDivider(false);
                                    setIsScrolling(false);
                                })
                                .finally(() => {
                                    setIsLoadingMessages(false);
                                });
                        } else {
                            setMessages([]);
                            setShowUnreadDivider(false);
                            setIsLoadingMessages(false);
                            setIsScrolling(false);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading chat, retrying...', error);
                        if (loadAttempts < maxLoadAttempts) {
                            setTimeout(loadChatWithRetry, 1000 * loadAttempts);
                        } else {
                            setMessages([]);
                            setChatInfo(null);
                            setShowUnreadDivider(false);
                            setIsLoadingChatInfo(false);
                            loadedChatIdRef.current = null;
                        }
                    });
            });
        };
        
        loadChatWithRetry();
    }, [chatId, user]);

    // Синхронно восстанавливаем текст для чата перед рендером
    useLayoutEffect(() => {
        if (chatId) {
            const savedText = chatTextsRef.current[chatId] || "";
            setText(savedText);
        }
    }, [chatId]);

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



    const sendMessage = useCallback(async () => {
        const currentText = text;
        if (!socket || !currentText.trim() || !chatId || !user) return;

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

        const messageText = currentText.trim();
        setText("");

        // Оптимистичное обновление - добавляем сообщение сразу
        const optimisticMessage: Message = {
            id: Date.now(), // Временный ID
            chat_id: finalChatId,
            user_id: user.id,
            username: user.login || user.name || '',
            name: user.name || '',
            text: messageText,
            timestamp: new Date().toISOString(),
            is_read: false,
            message_type: 'text' as const,
            avatar: user.avatar || undefined
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        
        // Мгновенный скролл к новому сообщению
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (messagesContainerRef.current) {
                    const container = messagesContainerRef.current;
                    const maxScroll = container.scrollHeight - container.clientHeight;
                    container.scrollTop = maxScroll;
                } else {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Retry логика для отправки сообщения
        let attempts = 0;
        const maxAttempts = 3;
        const sendWithRetry = () => {
            if (attempts >= maxAttempts) {
                console.error("Failed to send message after", maxAttempts, "attempts");
                // Удаляем оптимистичное сообщение при ошибке
                setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
                setText(messageText); // Восстанавливаем текст
                return;
            }
            
            attempts++;
            try {
                socket.emit("send_message", { chatId: finalChatId, text: messageText });
            } catch (err) {
                console.error("Error sending message, retrying...", err);
                setTimeout(sendWithRetry, 500 * attempts);
            }
        };
        
        sendWithRetry();
    }, [socket, chatId, user, chatInfo, navigate, setChatId, text]);
    
    // Стабильная функция для onChange
    const handleTextChange = useCallback((value: string) => {
        setText(value);
        // Сохраняем текст в ref для текущего чата
        if (chatId) {
            chatTextsRef.current[chatId] = value;
        }
    }, [chatId]);

    // Подготовка данных для отображения сообщений
    const messageItems = useMemo(() => {
        const items: MessageItem[] = [];
        const firstUnreadIndex = messages.findIndex((msg) => !msg.is_read && msg.user_id !== user?.id);
        
        messages.forEach((msg, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showDateDivider = index === 0 || (prevMessage !== null && isDifferentDay(msg.timestamp, prevMessage.timestamp));
            
            items.push({
                message: msg,
                showDateDivider: Boolean(showDateDivider),
                showUnreadDivider: showUnreadDivider && firstUnreadIndex === index,
                isFirstUnread: firstUnreadIndex === index
            });
        });
        
        return items;
    }, [messages, showUnreadDivider, user?.id]);

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
            setShowParticipantsModal(true);
            setParticipantsOffset(0);
            setParticipants([]);
            setParticipantsSearchQuery("");
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

    const handleParticipantClick = async (participantUsername: string) => {
        setShowParticipantsModal(false);
        try {
            const res = await api.get(`/chats/${participantUsername}`);
            if (res.data.chatExists) {
                setChatId(res.data.chatId);
                navigate(`/msg/${participantUsername}`, { replace: true });
            } else {
                // Chat doesn't exist, create it
                navigate(`/msg/${participantUsername}`, { replace: true });
                setChatId(participantUsername);
            }
        } catch (err) {
            console.error("Error opening chat with participant:", err);
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

    if (isLoadingChatInfo) {
        return (
            <div className="w-full h-full bg-secondary-bg text-white flex flex-col">
                <div className="bg-primary-bg p-4 border-b border-primary-bdr h-[80px] flex items-center">
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!chatInfo) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center text-white"
            >
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">Чат не найден</div>
                    <div className="text-gray-400">У вас нет доступа к этому чату</div>
                </div>
            </motion.div>
        );
    }


    return (
        <div className="w-full h-full bg-secondary-bg text-white flex flex-col">
            <div
                className={`bg-primary-bg p-4 border-b border-primary-bdr h-[80px] ${(chatInfo?.chat_type === 'direct' || chatId === 'general') ? 'cursor-pointer hover:bg-[#2a3441]' : ''}`}
                onClick={(chatInfo?.chat_type === 'direct' || chatId === 'general') ? handleChatHeaderClick : undefined}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={chatId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-lg font-semibold"
                            >
                                {chatInfo.display_name}
                            </motion.h2>
                        </AnimatePresence>
                        {chatInfo?.chat_type === "direct" && chatInfo?.userStats && (
                            <span className="text-xs text-gray-400">
                                ({chatInfo.userStats.games_count} игр, {chatInfo.userStats.wins_count} побед)
                            </span>
                        )}
                    </div>
                    {chatInfo.chat_type === "direct" && (
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`${chatId}-${lastSeenText}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`text-sm ${chatInfo.user.is_online ? "text-primary" : "text-white/50"}`}
                            >
                                {lastSeenText}
                            </motion.p>
                        </AnimatePresence>
                    )}
                    {chatId === "general" && (
                        <p className="text-sm text-white/50">
                            {chatInfo?.participantsCount || 0} участников • {chatInfo?.onlineCount || 0} онлайн
                        </p>
                    )}
                </div>

                <AnimatePresence>
                    {chatInfo.chat_type === "group" && !chatInfo.isParticipant && chatId !== "general" && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                        >
                            Присоединиться
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="messages flex-1 overflow-hidden text-[20px]">
                <AnimatePresence mode="wait">
                    {isLoadingMessages && messages.length === 0 ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto px-4"
                        >
                            <MessageListSkeleton count={10} />
                        </motion.div>
                    ) : messages.length > 0 ? (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isScrolling ? 0.3 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            ref={messagesContainerRef}
                            className="h-full overflow-y-auto px-4 py-4"
                            style={{ 
                                scrollBehavior: isScrolling ? 'auto' : 'smooth',
                                pointerEvents: isScrolling ? 'none' : 'auto'
                            }}
                        >
                            {messageItems.map((item) => (
                                <MessageComponent
                                    key={item.message.id}
                                    msg={item.message}
                                    showDateDivider={item.showDateDivider}
                                    showUnreadDivider={item.showUnreadDivider}
                                    isFirstUnread={item.isFirstUnread}
                                    userId={user?.id}
                                    gameEndInfo={gameEndInfo}
                                    isInGame={isInGame}
                                    socket={socket}
                                    onContextMenu={handleMessageRightClick}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center h-full text-white/40"
                        >
                            Нет сообщений
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full bg-primary-bg p-4">
                <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        if (chatInfo?.canSend) {
                            sendMessage();
                        }
                    }}
                    className="w-full"
                >
                    <div className="w-full flex items-end gap-2">
                        <div className="flex-1" style={{ display: chatInfo?.canSend ? 'block' : 'none' }}>
                            <ChatInput
                                value={text}
                                onChange={handleTextChange}
                                onSend={sendMessage}
                                placeholder="Напишите сообщение..."
                                disabled={!chatInfo?.canSend}
                            />
                        </div>
                        <div style={{ display: chatInfo?.canSend ? 'block' : 'none' }}>
                            <button
                                type="button"
                                onClick={() => sendGameInvite()}
                                disabled={isInGame || isInviteSending}
                                className={`p-3 transition-all duration-200 ${isInGame || isInviteSending
                                    ? 'cursor-not-allowed bg-gray-500 text-gray-300'
                                    : 'cursor-pointer bg-primary text-black    hover:bg-amber-600  shadow-lg hover:shadow-amber-500/50'
                                    }`}
                                title={isInGame ? 'Вы уже в игре' : 'Пригласить в игру'}
                            >
                                <FaGamepad size={24} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

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
                        className="w-full p-2 mb-4 bg-secondary-bg text-white rounded outline-none border border-primary-bdr focus:border-primary transition-colors"
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
                                    className="w-full p-3 flex items-center gap-3 hover:bg-secondary-bg rounded transition-colors text-left"
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
                                src={getAvatarUrl(profileUser.avatar)}
                                alt={profileUser.name}
                                className="w-16 h-16 rounded-full border-2 border-gray-600"
                            />
                            <div>
                                <h3 className="text-xl font-bold">{profileUser.name}</h3>
                                <p className="text-gray-400">@{profileUser.login}</p>
                            </div>
                        </div>
                        <div className="bg-secondary-bg border border-primary-bdr rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-2 text-white">Статистика</h4>
                            <p className="text-white/70">Игр сыграно: {profileUser.games_count || 0}</p>
                            <p className="text-white/70">Побед: {profileUser.wins_count || 0}</p>
                            <p className="text-white/70">Поражений: {(profileUser.games_count || 0) - (profileUser.wins_count || 0)}</p>
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
                    setParticipantsSearchQuery("");
                }}
                title={`Участники General (${participantsTotal})`}
            >
                <div className="w-full">
                    <input
                        type="text"
                        value={participantsSearchQuery}
                        onChange={(e) => setParticipantsSearchQuery(e.target.value)}
                        placeholder="Поиск по нику или имени..."
                        className="w-full p-2 mb-4 bg-secondary-bg text-white rounded outline-none border border-primary-bdr focus:border-primary transition-colors"
                    />
                    <div
                        className="max-h-96 overflow-y-auto"
                        onScroll={handleParticipantsScroll}
                    >
                        {(() => {
                            const filtered = participants
                                .filter(participant => participant.id !== user?.id)
                                .filter(participant => {
                                    const query = participantsSearchQuery.toLowerCase();
                                    if (!query) return true;
                                    return (participant.name?.toLowerCase().includes(query) ||
                                        participant.login?.toLowerCase().includes(query));
                                });
                            
                            // Сортируем: онлайн вверху
                            const sorted = [...filtered].sort((a, b) => {
                                const aOnline = onlineUsers.has(a.id);
                                const bOnline = onlineUsers.has(b.id);
                                if (aOnline && !bOnline) return -1;
                                if (!aOnline && bOnline) return 1;
                                return 0;
                            });
                            
                            return sorted.map((participant) => (
                                <div
                                    key={participant.id}
                                    onClick={() => handleParticipantClick(participant.login)}
                                    className="flex items-center gap-3 p-3 hover:bg-secondary-bg rounded transition-colors cursor-pointer"
                                >
                                    <AvatarWithStatus
                                        avatar={participant.avatar}
                                        name={participant.name || participant.login}
                                        isOnline={onlineUsers.has(participant.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate text-white">{participant.name}</div>
                                        <div className="text-sm text-white/40 truncate">@{participant.login}</div>
                                    </div>
                                </div>
                            ));
                        })()}
                        {participantsLoading && (
                            <div className="text-center py-4 text-gray-400">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                            </div>
                        )}
                        {!participantsLoading && participants.filter(p => p.id !== user?.id).length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                Нет участников
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Chat;