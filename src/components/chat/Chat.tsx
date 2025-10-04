import React, { useEffect, useState, useRef, type FormEvent } from "react";
import io, { Socket } from "socket.io-client";
import { api } from "../../api/api";
import type { Message } from "../../types/chat";
import { useAuth } from "../../hooks/useAuth";

const Chat: React.FC<{ chatId: string | null }> = ({ chatId }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [chatInfo, setChatInfo] = useState<any>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setChatInfo(null);
            return;
        }

        const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:6047", {
            withCredentials: true,
        });

        newSocket.on("connect", () => {
            newSocket.emit("join_chat", chatId);
        });

        newSocket.on("new_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });



        newSocket.on("messages_read_by_other", ({ chatId: readChatId, messageIds }) => {
            if (readChatId === chatId) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        (messageIds.includes(msg.id) && msg.user_id === user?.id)
                            ? { ...msg, is_read: true }
                            : msg
                    )
                );
            }
        });


        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [chatId]);

    useEffect(() => {
        if (!chatId) return;

        api
            .get(`/chats/${chatId}`)
            .then((res) => {
                setChatInfo(res.data);
                if (res.data.chatExists) {
                    api
                        .get(`/chats/${chatId}/messages`)
                        .then((msgRes) => {
                            setMessages(msgRes.data.reverse());
                        })
                        .catch((error) => {
                            console.error('Error fetching messages:', error);
                            setMessages([]);
                        });
                } else {
                    setMessages([]);
                }
            })
            .catch(() => {
                setMessages([]);
                setChatInfo(null);
            });
    }, [chatId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);







    useEffect(() => {
        if (!chatId || !user) return;
        const unreadMessages = messages.filter(msg => !msg.is_read && msg.user_id !== user.id);
        if (unreadMessages.length > 0) {
            const timer = setTimeout(() => {
                const messageIds = unreadMessages.map(msg => msg.id);
                api.post(`/chats/${chatId}/mark-read`, { chatId, messageIds })
                    .then(() => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
                            )
                        );
                    })
                    .catch((err) => {
                        console.error("Error marking messages as read:", err);
                    });
            }, 500); 

            return () => clearTimeout(timer);
        }
    }, [messages, chatId, user]);





    const sendMessage = async () => {
        if (!socket || !text.trim() || !chatId) return;

        let finalChatId = chatId;

        if (!chatInfo?.chatExists && chatInfo?.privacy_type === "private") {
            try {
                const res = await api.post("/chats/private", { friendId: chatInfo.targetUser.id });
                finalChatId = res.data.chatId;
                setChatInfo({ ...chatInfo, chatId: finalChatId, chatExists: true });
                socket.emit("join_chat", finalChatId);
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
                <h2 className="text-lg font-semibold">{chatInfo.display_name}</h2>
                {chatInfo.chat_type === "group" && !chatInfo.isParticipant && chatId !== "general" && (
                    <button className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                        Присоединиться
                    </button>
                )}
            </div>

            <div className="messages flex-1 overflow-y-auto text-[20px] p-4">
                {messages.map((msg, index) => (
                    <React.Fragment key={msg.id}>
                        {firstUnreadIndex === index && (
                            <div className="my-2 border-t border-red-500 text-red-500 text-center">
                                Непрочитанные сообщения
                            </div>
                        )}
                        <div className="mb-2 flex items-center gap-2">
                          
                            <span>[{new Date(msg.timestamp).toLocaleTimeString()}] &lt;{msg.username}&gt; {msg.text}</span>
                           
                           
                           
                            {msg.user_id === user?.id && (
                                <span className={`text-xs ${msg.is_read ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {chatInfo?.chat_type === 'group' ? (msg.is_read ? '✓✓' : '✓') : (msg.is_read ? '✓✓' : '✓')}
                                </span>
                            )}
                        </div>
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
                    <p className="opacity-50 text-sm px-2">freenode (IRC)</p>
                </form>
            )}
        </div>
    );
};

export default Chat;