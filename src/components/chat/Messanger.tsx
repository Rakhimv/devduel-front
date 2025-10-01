import { useState, useEffect } from "react";
import { api } from "../../api/api";
import Chat from "./Chat"
import ChatList from "./ChatList";

interface MessangerProps {
    initialChatId?: string | null;
}

const Messanger = ({ initialChatId }: MessangerProps) => {
    const [chatId, setChatId] = useState<string | null>(initialChatId || null)

    useEffect(() => {
        if (initialChatId) {
            api.get(`/chats/${initialChatId}`)
                .then((res) => {
                    setChatId(res.data.chatId);
                })
                .catch((error) => {
                    console.error('Ошибка получения чата:', error);
                    setChatId(null);
                });
        }
    }, [initialChatId]);

    return (
        <div className="w-full flex h-[calc(100vh-100px)]">
            <ChatList setChatId={setChatId} />
            <Chat chatId={chatId} />
        </div>
    )
}


export default Messanger;

