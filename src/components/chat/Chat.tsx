import React, { useEffect, useState, useRef, type FormEvent } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
    id: number;
    userId: number;
    userName: string;
    text: string;
    timestamp: string;
}

const Chat: React.FC<{ chatId: string }> = ({ chatId }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Подключаемся с cookies (токены передаются автоматически)
        const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:6047', {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            newSocket.emit('join_chat', chatId);
            // Загружаем историю
            fetch(`/chats/${chatId}/messages`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => setMessages(data.reverse())); // reverse для хронологии
        });

        newSocket.on('new_message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        newSocket.on('user_typing', ({ userId, isTyping }: { userId: number; isTyping: boolean }) => {
            setIsTyping(isTyping); // Можно показать "User печатает..."
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (socket && text.trim()) {
            socket.emit('send_message', { chatId, text });
            setText('');
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (socket) socket.emit('typing', { chatId, isTyping: e.target.value.length > 0 });
    };

    return (
        <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                sendMessage()
            }}
            className="chat-container h-96 flex flex-col bg-[#111A1F] text-[#f4f7fc]">
            <div className="messages flex-1 overflow-y-auto text-[20px]">
                {messages.map(msg => (
                    <div key={msg.id}>
                       {"["}{new Date(msg.timestamp).toLocaleTimeString()}{"]"} == - {"<"}{msg.userName}{">"} {msg.text} 
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {isTyping && <p>Кто-то печатает...</p>}

            <div className='w-full py-[5px] bg-[#485761]'>
                <input
                    className='p-[10px] outline-none bg-[#111A1F] w-full rounded-[4px]'
                    type="text" value={text} onChange={handleTyping} placeholder="Сообщение..." />
            
                <p className='opacity-50'>freenode (IRC)</p>
            </div>

        </form>
    );
};

export default Chat;