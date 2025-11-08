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
}

const MessageComponent = React.memo(({ 
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
                            <div className="w-full mr-[80px]">
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                        </>
                    )}
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
    onContextMenu
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Простой автоскролл при изменении сообщений
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Подготовка данных для отображения сообщений
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

