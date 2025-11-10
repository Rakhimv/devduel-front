import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { Message } from "../../types/chat";
import { formatMessageDate, isDifferentDay } from "../../utils/dateFormatter";
import { getAvatarUrl } from "../../utils/avatarUrl";
import GameInviteComponent from "../game/GameInvite";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";

interface MessageItem {
    message: Message;
    showDateDivider: boolean;
    showUnreadDivider: boolean;
    isFirstUnread: boolean;
}

interface ChatMessagesProps {
    messages: Message[];
    showUnreadDivider: boolean;
    userId?: number;
    gameEndInfo: { [inviteId: string]: { reason: string, duration: number } };
    isInGame: boolean;
    socket: any;
    onContextMenu: (e: React.MouseEvent, messageId: number) => void;
    highlightedMessageId?: number | null;
    chatId?: string | null;
}

const MessageComponent = React.memo(({
    msg,
    showDateDivider,
    userId,
    gameEndInfo,
    isInGame,
    socket,
    onContextMenu,
    highlightedMessageId,
    onReplyClick
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
    highlightedMessageId?: number | null;
    onReplyClick?: (messageId: number) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const isHighlighted = highlightedMessageId === msg.id;

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
            {/*             
            {showUnreadDivider && isFirstUnread && (
                <div className="my-2 border-t border-red-500 text-red-500 text-center">
                    Непрочитанные сообщения
                </div>
            )} */}

            <motion.div
                ref={ref}
                id={`message-${msg.id}`}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1, scale: isHighlighted ? 1.02 : 1 } : { opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className={`mb-2 flex items-end gap-2 relative ${isHighlighted ? 'opacity-90' : ''}`}
                onContextMenu={(e: any) => onContextMenu(e, msg.id)}
                style={{
                    backgroundColor: isHighlighted ? '#00ffcb0f' : 'transparent',
                    padding: isHighlighted ? '4px' : '0',
                    transition: 'all 0.3s ease'
                }}
            >
                <img
                    src={getAvatarUrl(msg.avatar)}
                    alt={msg.name || msg.username}
                    className="w-[40px] h-[40px] rounded-full object-cover border-2 border-primary-bdr flex-shrink-0"
                />
                <div className="bg-primary-bg max-w-[600px] relative p-[10px] py-[10px]">
                    <div className="absolute left-[-8px] bottom-0 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-primary-bg border-b-[8px] border-b-transparent"></div>


                    {msg.message_type === 'game_invite' && msg.game_invite_data ? (
                        <div>
                            <div className="text-xs text-white/60 mb-1">{msg.name || msg.username}</div>
                            <div className="w-full mr-[80px]">
                                <GameInviteComponent
                                    invite={{
                                        id: msg.game_invite_data.invite_id,
                                        fromUserId: msg.game_invite_data.from_user_id,
                                        fromUsername: msg.game_invite_data.from_username,
                                        fromName: msg.game_invite_data.from_name,
                                        fromAvatar: msg.game_invite_data.from_avatar || msg.avatar,
                                        toUserId: msg.game_invite_data.to_user_id,
                                        toUsername: msg.game_invite_data.to_username,
                                        toName: msg.game_invite_data.to_name,
                                        toAvatar: msg.game_invite_data.to_avatar,
                                        timestamp: msg.timestamp,
                                        status: msg.game_invite_data.status
                                    }}
                                    onAccept={() => {
                                        if (socket && msg.game_invite_data && msg.game_invite_data.invite_id && !isInGame) {
                                            socket.emit("accept_game_invite", {
                                                inviteId: msg.game_invite_data.invite_id
                                            });
                                        }
                                    }}
                                    onDecline={() => {
                                        if (socket && msg.game_invite_data && msg.game_invite_data.invite_id) {
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
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-xs text-white/60 mb-1">{msg.name || msg.username}</div>
                            {msg.reply_to_message && (
                                <div
                                    className="mb-2 pl-3 p-2 border-l-2 border-primary cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                    onClick={() => onReplyClick?.(msg.reply_to_message!.id)}
                                >
                                    <div className="text-xs text-primary mb-1">
                                        {msg.reply_to_message.name || msg.reply_to_message.username}
                                    </div>
                                    <div className="text-xs text-white/60 truncate">
                                        {msg.reply_to_message.message_type === 'game_invite'
                                            ? '🎮 Приглашение в игру'
                                            : msg.reply_to_message.text}
                                    </div>
                                </div>
                            )}
                            <div className="w-full mr-[80px]">
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                        </>
                    )}
                    <div className="absolute right-[10px] flex gap-[5px] items-center bottom-[0px]">
                        <span className="text-[14px] text-white/40">{new Date(msg.timestamp).toLocaleTimeString().slice(0, 5)}</span>
                        {msg.user_id === userId && (
                            <span className={`text-xs ${msg.is_read ? 'text-primary' : 'text-white/60'}`}>
                                {msg.is_read ? <IoCheckmarkDoneSharp size={18} /> : <IoCheckmarkSharp size={18} />}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
});

MessageComponent.displayName = 'MessageComponent';

const ChatMessages: React.FC<ChatMessagesProps> = ({
    messages,
    showUnreadDivider,
    userId,
    gameEndInfo,
    isInGame,
    socket,
    onContextMenu,
    highlightedMessageId,
    chatId
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const wasAtBottomRef = useRef(true);
    const isInitialLoadRef = useRef(true);
    const prevChatIdRef = useRef<string | null | undefined>(chatId);

    useEffect(() => {
        if (prevChatIdRef.current !== chatId) {
            isInitialLoadRef.current = true;
            wasAtBottomRef.current = true;
            prevChatIdRef.current = chatId;
        }
    }, [chatId]);

    const checkIfAtBottom = () => {
        if (!messagesContainerRef.current) return false;
        const container = messagesContainerRef.current;
        const threshold = 100;
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            wasAtBottomRef.current = checkIfAtBottom();
            if (isInitialLoadRef.current) {
                isInitialLoadRef.current = false;
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        wasAtBottomRef.current = checkIfAtBottom();

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            isInitialLoadRef.current = true;
            return;
        }

        const shouldScroll = isInitialLoadRef.current || wasAtBottomRef.current;

        if (shouldScroll && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const scrollToBottom = () => {
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    requestAnimationFrame(() => {
                        if (container.scrollTop < container.scrollHeight - container.clientHeight - 10) {
                            container.scrollTop = container.scrollHeight;
                        }
                    });
                }
            };

            setTimeout(scrollToBottom, 50);
            setTimeout(scrollToBottom, 200);

            if (isInitialLoadRef.current) {
                isInitialLoadRef.current = false;
                wasAtBottomRef.current = true;
            }
        }
    }, [messages]);

    const handleReplyClick = (messageId: number) => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
            messageElement.style.backgroundColor = '#00ffcb0f';
            setTimeout(() => {
                messageElement.style.backgroundColor = '';
            }, 2000);
        }
    };

    const messageItems: MessageItem[] = [];
    const firstUnreadIndex = messages.findIndex((msg) => !msg.is_read && msg.user_id !== userId);

    messages.forEach((msg, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateDivider = index === 0 || (prevMessage !== null && isDifferentDay(msg.timestamp, prevMessage.timestamp));

        messageItems.push({
            message: msg,
            showDateDivider: Boolean(showDateDivider),
            showUnreadDivider: showUnreadDivider && firstUnreadIndex === index,
            isFirstUnread: firstUnreadIndex === index
        });
    });

    return (
        <div className="messages flex-1 overflow-hidden text-[20px]">
            <AnimatePresence mode="wait">
                {messages.length > 0 ? (
                    <motion.div
                        key="messages"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        ref={messagesContainerRef}
                        className="h-full overflow-y-auto px-4 py-4"
                    >
                        {messageItems.map((item) => (
                            <MessageComponent
                                key={item.message.id}
                                msg={item.message}
                                showDateDivider={item.showDateDivider}
                                showUnreadDivider={item.showUnreadDivider}
                                isFirstUnread={item.isFirstUnread}
                                userId={userId}
                                gameEndInfo={gameEndInfo}
                                isInGame={isInGame}
                                socket={socket}
                                onContextMenu={onContextMenu}
                                highlightedMessageId={highlightedMessageId}
                                onReplyClick={handleReplyClick}
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
    );
};

export default ChatMessages;

