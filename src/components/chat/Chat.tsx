import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import type { Message } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../context/GameContext";
import { formatLastSeen } from "../../utils/lastSeen";
import { motion, AnimatePresence } from "framer-motion";
import { MessageListSkeleton } from "../ui/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInputForm, { type ChatInputFormRef } from "./ChatInputForm";
import MessageContextMenu from "./MessageContextMenu";
import UserSelectModal from "./UserSelectModal";
import ProfileModal from "./ProfileModal";
import ParticipantsModal from "./ParticipantsModal";

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
    const chatTextsRef = useRef<{ [chatId: string]: string }>({});
    const chatInputFormRef = useRef<ChatInputFormRef>(null);
    const [isLoadingChatInfo, setIsLoadingChatInfo] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);
    const joinedChatIdRef = useRef<string | null>(null);
    const loadedChatIdRef = useRef<string | null>(null);
    const currentRequestChatIdRef = useRef<string | null>(null);

    const setNullChat = () => {
        setMessages([]);
        setChatInfo(null);
        setShowUnreadDivider(false);
        setLastSeenText("");
        setIsUserOnline(false);
        setGameEndInfo({});
        setReplyingToMessage(null);
        setHighlightedMessageId(null);
        currentChatIdRef.current = null;
        loadedChatIdRef.current = null;
        currentRequestChatIdRef.current = null;
    }

    useEffect(() => {
        if (!chatId) {
            setNullChat();
            return;
        }

        if (!socket) return;

        const handleNewMessage = (msg: Message) => {
            setShowUnreadDivider(false);
            const messageWithType: Message = {
                ...msg,
                message_type: msg.message_type || 'text'
            };
            setMessages((prev) => {
                const exists = prev.some(m => m.id === messageWithType.id);
                if (exists) {
                    return prev;
                }
                return [...prev, messageWithType];
            });
        };

        const handleMessagesReadByOther = ({ chatId: readChatId, messageIds }: any) => {
            const isCurrentChat = readChatId === currentChatIdRef.current || 
                                 readChatId === chatInfo?.chatId ||
                                 (chatId === 'general' && readChatId === 'general');
            
            if (isCurrentChat && messageIds && messageIds.length > 0) {
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
            setMessages((prev) => {
                const newMessages = [...prev, gameEndMessage];
                setGameEndInfo((gameInfo) => {
                    const newInfo = { ...gameInfo };
                    newMessages.forEach(msg => {
                    if (msg.game_invite_data?.status === 'accepted') {
                        newInfo[msg.game_invite_data.invite_id] = {
                            reason: data.reason,
                            duration: data.duration
                        };
                    }
                });
                return newInfo;
                });
                return newMessages;
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
                setChatInfo((prev: any) => {
                    if (!prev) {
                        return prev;
                    }
                    if (prev.participantsCount === participantsCount && prev.onlineCount === onlineCount) {
                        return prev;
                    }
                    return {
                        ...prev,
                        participantsCount,
                        onlineCount
                    };
                });
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
    }, [socket, user, navigate]);

    useEffect(() => {
        if (!socket || !chatId) {
            return;
        }

        if (chatId === 'general') {
            if (joinedChatIdRef.current !== 'general') {
                if (joinedChatIdRef.current && joinedChatIdRef.current !== 'general') {
                    socket.emit("leave_chat", joinedChatIdRef.current);
                }
                
                currentChatIdRef.current = 'general';
                joinedChatIdRef.current = 'general';
                socket.emit("join_chat", 'general');
            }
            return;
        }

        if (!chatInfo) {
            return;
        }

        const socketChatId = chatInfo.chatId || chatId;

        if (joinedChatIdRef.current !== socketChatId) {
            if (joinedChatIdRef.current && joinedChatIdRef.current !== socketChatId) {
                socket.emit("leave_chat", joinedChatIdRef.current);
            }
            
            currentChatIdRef.current = socketChatId;
            joinedChatIdRef.current = socketChatId;
            socket.emit("join_chat", socketChatId);
        }

        return () => {
            if (joinedChatIdRef.current && socket) {
                socket.emit("leave_chat", joinedChatIdRef.current);
                joinedChatIdRef.current = null;
            }
        };
    }, [chatId, chatInfo?.chatId, socket]);

    useEffect(() => {
        if (!chatId) {
            setIsLoadingChatInfo(false);
            loadedChatIdRef.current = null;
            return;
        }

        const isGeneral = chatId === 'general';
        const alreadyLoaded = chatInfo && (
            (isGeneral && chatInfo.chatId === 'general') ||
            (!isGeneral && chatInfo.chatId && (
                chatInfo.chatId === loadedChatIdRef.current ||
                (loadedChatIdRef.current && chatInfo.chatId === loadedChatIdRef.current)
            ))
        );

        if (alreadyLoaded) {
            if (isGeneral || (chatInfo.chatId && (chatInfo.chatId === chatId || loadedChatIdRef.current === chatId))) {
                return;
            }
        }

        setIsLoadingChatInfo(true);
        currentRequestChatIdRef.current = chatId;
        
        if (currentChatIdRef.current && currentChatIdRef.current !== chatId) {
            chatTextsRef.current[currentChatIdRef.current] = text;
            setReplyingToMessage(null);
            setHighlightedMessageId(null);
        }

        api
            .get(`/chats/${chatId}`)
            .then((res) => {
                if (currentRequestChatIdRef.current !== chatId) {
                    return;
                }
                
                const resolvedChatId = res.data.chatId || chatId;
                
                setChatInfo(res.data);
                setIsLoadingChatInfo(false);
                loadedChatIdRef.current = resolvedChatId;
                
                if (res.data.user && !res.data.user.updated_at) {
                    console.warn('updated_at missing in user data:', res.data.user);
                }
                
             
                setTimeout(() => {
                    if (chatInputFormRef.current && res.data.canSend) {
                        chatInputFormRef.current.focus();
                    }
                }, 200);
                
                if (res.data.chat_type === "direct" && res.data.user) {
                    setIsUserOnline(res.data.user.is_online || false);
                }
                
                if (res.data.chatExists) {
                    setIsLoadingMessages(true);
                    api
                        .get(`/chats/${resolvedChatId}/messages`)
                        .then((msgRes) => {
                            if (loadedChatIdRef.current !== resolvedChatId) {
                                return;
                            }
                            
                            const loadedMessages = msgRes.data.reverse().map((msg: Message) => ({
                                ...msg,
                                message_type: msg.message_type || (msg.game_invite_data ? 'game_invite' : 'text')
                            }));
                            setMessages(loadedMessages);

                            const hasUnread = loadedMessages.some((msg: Message) => !msg.is_read && msg.user_id !== user?.id);
                            setShowUnreadDivider(hasUnread);
                        })
                        .catch((error) => {
                            console.error('Error fetching messages:', error);
                            setMessages([]);
                            setShowUnreadDivider(false);
                        })
                        .finally(() => {
                            setIsLoadingMessages(false);
                        });
                } else {
                    setMessages([]);
                    setShowUnreadDivider(false);
                    setIsLoadingMessages(false);
                }
            })
            .catch((error) => {
                if (currentRequestChatIdRef.current !== chatId) {
                    return;
                }
                
                console.error('Error fetching chat info:', error);
                setMessages([]);
                setChatInfo(null);
                setShowUnreadDivider(false);
                setIsLoadingChatInfo(false);
                loadedChatIdRef.current = null;
                currentRequestChatIdRef.current = null;
            });
    }, [chatId, user]);

    useLayoutEffect(() => {
        if (chatId) {
            const savedText = chatTextsRef.current[chatId] || "";
            setText(savedText);
        }
    }, [chatId]);

    useEffect(() => {
        if (chatInfo?.canSend && chatInputFormRef.current) {
            const focusTimeout = setTimeout(() => {
                chatInputFormRef.current?.focus();
            }, 100);
            return () => clearTimeout(focusTimeout);
        }
    }, [chatInfo?.canSend]);

    useEffect(() => {
        if (!chatInfo?.chat_type || chatInfo.chat_type !== "direct") {
            return;
        }

        const userData = chatInfo.user || chatInfo.targetUser;
        if (!userData?.updated_at) {
            console.warn('updated_at missing in chatInfo:', { 
                user: chatInfo.user, 
                targetUser: chatInfo.targetUser,
                chatInfo 
            });
            return;
        }

        const updateLastSeen = () => {
            setLastSeenText(formatLastSeen(userData.updated_at, isUserOnline));
        };

        updateLastSeen();
        const interval = setInterval(updateLastSeen, 1000);

        return () => clearInterval(interval);
    }, [chatInfo, isUserOnline]);

    useEffect(() => {
        if (!chatId || !user || !chatInfo) return;

        const realChatId = chatId === 'general' ? 'general' : (chatInfo?.chatId || currentChatIdRef.current || chatId);
        
        if (!realChatId) return;

        const unreadMessages = messages.filter(msg => !msg.is_read && msg.user_id !== user.id);
        if (unreadMessages.length > 0) {
            const timer = setTimeout(() => {
                const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];

                api.post(`/chats/${realChatId}/mark-read`, {
                    chatId: realChatId,
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
    }, [messages, chatId, user, chatInfo]);

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
            let finalChatId = chatId === 'general' ? 'general' : (chatInfo?.chatId || currentChatIdRef.current || chatId);

            if (!chatInfo?.chatExists && chatInfo?.privacy_type === "private") {
                try {
                    const res = await api.post("/chats/private", { friendId: chatInfo.targetUser.id });
                    finalChatId = res.data.chatId;
                    setChatInfo({ ...chatInfo, chatId: finalChatId, chatExists: true });
                    currentChatIdRef.current = finalChatId;
                    socket.emit("join_chat", finalChatId);
                    const routeId = chatInfo.targetUser?.login || finalChatId;
                    setChatId(routeId);
                    navigate(`/app/msg/${routeId}`, { replace: true });

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

        let finalChatId = chatId === 'general' ? 'general' : (chatInfo?.chatId || currentChatIdRef.current || chatId);

        if (!chatInfo?.chatExists && chatInfo?.privacy_type === "private") {
            try {
                const res = await api.post("/chats/private", { friendId: chatInfo.targetUser.id });
                finalChatId = res.data.chatId;
                setChatInfo({ ...chatInfo, chatId: finalChatId, chatExists: true });
                currentChatIdRef.current = finalChatId;
                socket.emit("join_chat", finalChatId);
                const routeId = chatInfo.targetUser?.login || finalChatId;
                setChatId(routeId);
                navigate(`/app/msg/${routeId}`, { replace: true });
            } catch (err) {
                console.error("Error creating chat:", err);
                return;
            }
        }

        socket.emit("send_message", { 
            chatId: finalChatId, 
            text,
            replyToMessageId: replyingToMessage?.id || undefined
        });
        setText("");
        setReplyingToMessage(null);
    };

    const handleMessageRightClick = (e: React.MouseEvent, messageId: number) => {
        e.preventDefault();
        setMessageContextMenu({ x: e.clientX, y: e.clientY, messageId });
        setHighlightedMessageId(messageId);
        setTimeout(() => {
            setHighlightedMessageId(null);
        }, 2000);
    };

    const handleReplyMessage = (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (message && (message.message_type === 'text' || !message.message_type || message.message_type !== 'game_invite')) {
            setReplyingToMessage(message);
            setMessageContextMenu(null);
        }
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
        navigate(`/app/msg/${participantUsername}`, { replace: true });
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

    const handleTextChange = (value: string) => {
        setText(value);
        if (chatId) {
            chatTextsRef.current[chatId] = value;
        }
    };

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
                <div className="flex-1 overflow-y-auto px-4">
                    <MessageListSkeleton count={3} />
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
            <ChatHeader
                chatId={chatId}
                chatInfo={chatInfo}
                lastSeenText={lastSeenText}
                onHeaderClick={handleChatHeaderClick}
            />

                {isLoadingMessages && messages.length === 0 ? (
                <div className="flex-1 overflow-y-auto px-4">
                    <MessageListSkeleton count={3} />
                </div>
            ) : (
                <ChatMessages
                    messages={messages}
                    showUnreadDivider={showUnreadDivider}
                    userId={user?.id}
                    gameEndInfo={gameEndInfo}
                    isInGame={isInGame}
                    socket={socket}
                    onContextMenu={handleMessageRightClick}
                    highlightedMessageId={highlightedMessageId}
                    chatId={chatId}
                />
            )}

            {chatInfo.canSend && (
                <ChatInputForm
                    ref={chatInputFormRef}
                    text={text}
                    onTextChange={handleTextChange}
                    onSend={sendMessage}
                    onGameInvite={() => sendGameInvite()}
                    canSend={chatInfo.canSend}
                    isInGame={isInGame}
                    isInviteSending={isInviteSending}
                    replyingToMessage={replyingToMessage}
                    onCancelReply={() => setReplyingToMessage(null)}
                />
            )}

            <UserSelectModal
                isOpen={showUserSelectModal}
                onClose={() => setShowUserSelectModal(false)}
                availableUsers={availableUsers}
                onlineUsers={onlineUsers}
                userSearchQuery={userSearchQuery}
                onSearchChange={setUserSearchQuery}
                onUserSelect={sendGameInvite}
                currentUserId={user?.id}
            />

            <AnimatePresence>
                {messageContextMenu && (
                    <MessageContextMenu
                        key={`menu-${messageContextMenu.messageId}`}
                        x={messageContextMenu.x}
                        y={messageContextMenu.y}
                        messageId={messageContextMenu.messageId}
                        onCopy={handleCopyMessage}
                        onDelete={handleDeleteMessage}
                        onReply={handleReplyMessage}
                        canDelete={messages.find(m => m.id === messageContextMenu.messageId)?.user_id === user?.id}
                        onClose={() => setMessageContextMenu(null)}
                    />
                )}
            </AnimatePresence>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false);
                    setProfileUser(null);
                }}
                profileUser={profileUser}
            />

            <ParticipantsModal
                isOpen={showParticipantsModal}
                onClose={() => {
                    setShowParticipantsModal(false);
                    setParticipants([]);
                    setParticipantsOffset(0);
                    setParticipantsSearchQuery("");
                }}
                participants={participants}
                participantsTotal={participantsTotal}
                participantsLoading={participantsLoading}
                participantsSearchQuery={participantsSearchQuery}
                onSearchChange={setParticipantsSearchQuery}
                        onScroll={handleParticipantsScroll}
                onParticipantClick={handleParticipantClick}
                onlineUsers={onlineUsers}
                currentUserId={user?.id}
            />
        </div>
    );
};

export default Chat;
