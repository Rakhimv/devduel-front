import React, { type FormEvent } from "react";
import { FaGamepad } from "react-icons/fa";
import ChatInput from "../ui/ChatInput";

interface ChatInputFormProps {
    text: string;
    onTextChange: (value: string) => void;
    onSend: () => void;
    onGameInvite: () => void;
    canSend: boolean;
    isInGame: boolean;
    isInviteSending: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
    text,
    onTextChange,
    onSend,
    onGameInvite,
    canSend,
    isInGame,
    isInviteSending
}) => {
    return (
        <div className="w-full relative z-[20] bg-primary-bg p-4 border-b border-primary-bdr">
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
    );
};

export default ChatInputForm;

