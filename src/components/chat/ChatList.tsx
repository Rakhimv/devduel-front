import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChatInList } from "../../types/chat";
import { api } from "../../api/api";

type ChatListProps = {
    setChatId: Dispatch<SetStateAction<string | null>>;
};

const ChatList: React.FC<ChatListProps> = ({ setChatId }) => {
    const [chats, setChats] = useState<ChatInList[]>([]);
    const [searchResults, setSearchResults] = useState<ChatInList[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();

    const fetchChats = async () => {
        try {
            const res = await api.get("/chats/my");
            setChats(res.data);
        } catch (err: any) {
            console.error("Error fetching chats:", err.message);
        }
    };

    const handleSearch = async () => {
        try {
            if (searchText.length > 2) {
                const res = await api.get(`/chats/search?query=${searchText}`);
                setSearchResults(res.data);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error searching chats:", err);
        }
    };

    const startPrivateChat = async (friendId: any) => {
        try {
            const res = await api.post("/chats/private", { friendId });
            const chatId = res.data.chatId;
            navigate(`/msg/${chatId}`);
            setChatId(chatId);
        } catch (err: any) {
            console.error("Error starting private chat:", err.message);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchText]);


    const currentChatId = location.pathname.split('/msg/')[1];

    return (
        <div className="h-full w-[300px] bg-[#485761] p-[5px] text-white">
            <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="p-[10px] outline-none bg-[#111A1F] w-full rounded-[4px]"
                type="text"
                placeholder="Поиск..."

            />

            <div className="flex flex-col gap-[10px] mt-[5px]">
                {searchText.length > 0 ? (
                    <div>
                        {searchResults.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => startPrivateChat(user.id)}
                                className="bg-black p-[10px] cursor-pointer hover:bg-gray-800 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-semibold">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{user.name}</div>
                                    <div className="text-sm text-gray-400 truncate">@{user.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-[10px]">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    navigate(`/msg/${chat.id}`);
                                    setChatId(chat.id);
                                }}
                                className={`p-[10px] cursor-pointer hover:bg-gray-800 flex items-center gap-3 ${currentChatId === chat.id
                                    ? 'bg-blue-900 border-l-4 border-blue-400'
                                    : 'bg-black'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                                    {chat.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}${chat?.avatar}`}
                                            alt={chat.display_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-semibold">
                                            {chat.display_name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{chat.display_name}</div>
                                    {chat.last_message && (
                                        <div className="text-sm text-gray-400 truncate">{chat.last_message}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;