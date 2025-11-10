import React, { type FormEvent } from "react";
import { FaGamepad } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ChatInput from "../ui/ChatInput";
import type { Message } from "../../types/chat";

interface ChatInputFormProps {
    text: string;
    onTextChange: (value: string) => void;
    onSend: () => void;
    onGameInvite: () => void;
    canSend: boolean;
    isInGame: boolean;
    isInviteSending: boolean;
    replyingToMessage: Message | null;
    onCancelReply: () => void;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
    text,
    onTextChange,
    onSend,
    onGameInvite,
    canSend,
    isInGame,
    isInviteSending,
    replyingToMessage,
    onCancelReply
}) => {
    return (
        <div className="w-full relative z-[20] bg-primary-bg border-t border-primary-bdr">
            {replyingToMessage && (
                <div className="px-4 pt-3 pb-2 border-b border-primary-bdr bg-secondary-bg/50 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-primary mb-1">
                            Ответ на сообщение {replyingToMessage.name || replyingToMessage.username}
                        </div>
                        <div className="text-sm text-white/70 truncate">
                            {replyingToMessage.text}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        title="Отменить ответ"
                    >
                        <IoClose size={20} className="text-white/60" />
                    </button>
                </div>
            )}
            <div className="p-4">
                <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        if (canSend) {
                            onSend();
                        }
                    }}
                    className="w-full"
                >
                    <div className="w-full flex items-end gap-2">
                        <div className="flex-1" style={{ display: canSend ? 'block' : 'none' }}>
                            <ChatInput
                                value={text}
                                onChange={onTextChange}
                                onSend={onSend}
                                placeholder="Напишите сообщение..."
                                disabled={!canSend}
                            />
                        </div>
                        <div style={{ display: canSend ? 'block' : 'none' }}>
                            <button
                                type="button"
                                onClick={onGameInvite}
                                disabled={isInGame || isInviteSending}
                                className={`p-3 transition-all duration-200 ${
                                    isInGame || isInviteSending
                                        ? 'cursor-not-allowed bg-gray-500 text-gray-300'
                                        : 'cursor-pointer bg-primary text-black hover:bg-amber-600 shadow-lg hover:shadow-amber-500/50'
                                }`}
                                title={isInGame ? 'Вы уже в игре' : 'Пригласить в игру'}
                            >
                                <FaGamepad size={24} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInputForm;

