import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaTrophy } from "react-icons/fa";

interface ChatHeaderProps {
    chatId: string;
    chatInfo: any;
    lastSeenText: string;
    onHeaderClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId, chatInfo, lastSeenText, onHeaderClick }) => {
    return (
        <div
            className={`bg-primary-bg p-4 border-b border-primary-bdr h-[80px] flex items-center justify-between ${(chatInfo?.chat_type === 'direct' || chatId === 'general') ? 'cursor-pointer' : ''}`}
            onClick={(chatInfo?.chat_type === 'direct' || chatId === 'general') ? onHeaderClick : undefined}
        >
            <div className="flex-1">
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

            {chatInfo?.chat_type === "direct" && chatInfo?.userStats && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 relative px-2 py-1">
                        <div className="absolute inset-0 bg-primary/10 blur-md opacity-50"></div>
                        <FaGamepad className="text-primary relative z-10" size={16} />
                        <span className="text-sm text-white/70 relative z-10 font-medium">
                            {chatInfo.userStats.games_count || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 relative px-2 py-1">
                        <div className="absolute inset-0 bg-primary/15 blur-md opacity-60"></div>
                        <FaTrophy className="text-primary relative z-10" size={16} style={{ filter: 'drop-shadow(0 0 3px rgba(255, 193, 7, 0.5))' }} />
                        <span className="text-sm text-primary relative z-10 font-medium" style={{ textShadow: '0 0 6px rgba(255, 193, 7, 0.3)' }}>
                            {chatInfo.userStats.wins_count || 0}
                        </span>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {chatInfo.chat_type === "group" && !chatInfo.isParticipant && chatId !== "general" && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm cursor-pointer"
                    >
                        Присоединиться
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatHeader;

