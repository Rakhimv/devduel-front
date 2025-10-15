import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChatInList } from "../../types/chat";
import { api } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";

type ChatListProps = {
  setChatId: Dispatch<SetStateAction<string | null>>;
};

const ChatList: React.FC<ChatListProps> = ({ setChatId }) => {
  const [chats, setChats] = useState<ChatInList[]>([]);
  const [searchResults, setSearchResults] = useState<ChatInList[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = ({ chatId, last_message, last_timestamp, unread_count }: any) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, last_message, last_timestamp, unread_count: unread_count || 0 }
            : chat
        )
      );
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
    };

    socket.on("chat_update", handleChatUpdate);
    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("chat_update", handleChatUpdate);
      socket.off("user_status", handleUserStatus);
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/my");
      setChats(res.data);
            res.data.map((chat: any) => {
                if (chat.chat_type === 'direct' && chat.online !== null && chat.user_id) {
                    setOnlineUsers((prev) => {
                        const newSet = new Set(prev);
                        if (chat.online) {
                            newSet.add(chat.user_id);
                        } else {
                            newSet.delete(chat.user_id);
                        }
                        return newSet;
                    });
                }
            })
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
      setChats((prev: any) => [
        {
          id: chatId,
          privacy_type: "private",
          chat_type: "direct",
          display_name: searchResults.find((u) => u.id === friendId)?.name || "",
          last_message: null,
          last_timestamp: null,
          unread_count: 0,
        },
        ...prev,
      ]);
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

  const currentChatId = location.pathname.split("/msg/")[1];

  return (
    <div className="h-full w-[300px] bg-[#485761] p-[5px] text-white">
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="p-[10px] outline-none bg-[#111A1F] w-full rounded-[4px]"
        type="text"
        placeholder="Поиск..."
      />
      <div className="flex flex-col gap-[10px] mt-[5px] relative">
        {searchText.length > 0 ? (
          <div>
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => startPrivateChat(user.id)}
                className="bg-black p-[10px] cursor-pointer hover:bg-gray-800 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden relative">
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
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${onlineUsers.has(Number(user.id)) ? "bg-green-500" : "bg-gray-500"
                      }`}
                  />
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
                className={`p-[10px] cursor-pointer hover:bg-gray-800 flex items-center gap-3 ${currentChatId === chat.id ? "bg-blue-900 border-l-4 border-blue-400" : "bg-black"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden relative">
                  {chat.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${chat.avatar}`}
                      alt={chat.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {chat.display_name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                  {chat.chat_type === "direct" && (
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${onlineUsers.has(
                        chats.find((c) => c.id === chat.id)?.user_id || 0
                      )
                        ? "bg-green-500"
                        : "bg-gray-500"
                        }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{chat.display_name}</div>
                  {chat.last_message && (
                    <div className="text-sm text-gray-400 truncate">{chat.last_message}</div>
                  )}
                  {chat.unread_count > 0 && (
                    <div className="absolute right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unread_count}
                    </div>
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