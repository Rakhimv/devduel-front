import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChatInList } from "../../types/chat";
import { api } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import AvatarWithStatus from "./AvatarWithStatus";

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
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupChatId, setPopupChatId] = useState<string | null>(null);


  useEffect(() => {
    if (!socket) return;



    const handleChatUpdate = ({ chatId, last_message, last_timestamp, unread_count }: any) => {
      setChats((prev) => {
        const chatExists = prev.some((chat) => chat.id === chatId);

        if (chatExists) {
          const updated = prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, last_message, last_timestamp, unread_count: unread_count || 0 }
              : chat
          );

          return updated.sort(
            (a, b) =>
              new Date(b.last_timestamp || 0).getTime() - new Date(a.last_timestamp || 0).getTime()
          );
        }

        fetchChats();
        return prev;
      });
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

    const handleChatDeleted = ({ chatId }: any) => {
      const deletedChat = chats.find(chat => chat.id === chatId);
      const routeId = deletedChat?.chat_type === "direct" && deletedChat?.username ? deletedChat.username : chatId;
      if (location.pathname.includes(routeId)) {
        setChatId(null);
        navigate('/msg');
      }
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    };

    const handleChatHistoryCleared = ({ chatId }: any) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, last_message: undefined, last_timestamp: undefined, unread_count: 0 }
            : chat
        )
      );
    };

    const handleChatCreated = ({ chatId }: any) => {
      fetchChats();

      if (chatId && !chats.some(chat => chat.id === chatId)) {
        navigate(`/msg/${chatId}`);
        setChatId(chatId);
      }
    };

    socket.on("chat_update", handleChatUpdate);
    socket.on("user_status", handleUserStatus);
    socket.on("chat_deleted", handleChatDeleted);
    socket.on("chat_history_cleared", handleChatHistoryCleared);
    socket.on("chat_created", handleChatCreated);

    return () => {
      socket.off("chat_update", handleChatUpdate);
      socket.off("user_status", handleUserStatus);
      socket.off("chat_deleted", handleChatDeleted);
      socket.off("chat_history_cleared", handleChatHistoryCleared);
      socket.off("chat_created", handleChatCreated);
    };
  }, [socket, location.pathname, navigate, setChatId]);

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats/my");
      const sortedChats = res.data.sort(
        (a: ChatInList, b: ChatInList) =>
          new Date(b.last_timestamp || 0).getTime() - new Date(a.last_timestamp || 0).getTime()
      );
      setChats(sortedChats);
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

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await api.delete(`/chats/${chatId}`);
      if (res.data?.success) {
        console.log("Success deleted")

        const deletedChat = chats.find(chat => chat.id === chatId);
        const routeId = deletedChat?.chat_type === "direct" && deletedChat?.username ? deletedChat.username : chatId;
        if (currentChatId === routeId) {
          setChatId(null);
        }

        setChats((prev) => {
          const updatedChats = prev.filter((chat) => chat.id !== chatId);
          console.log("Updated chats:", updatedChats);
          return updatedChats;
        });


        setPopupPos(null);
        setPopupChatId(null);
      }
    } catch (err: any) {
      console.error("Error fetching chats:", err.message);
    }
  };


  const handleClearChat = async (chatId: string) => {
    try {
      const res = await api.post(`/chats/${chatId}/clear`);
      if (res.data?.success) {
        console.log("Success clear");

        setPopupPos(null);
        setPopupChatId(null);
      }
    } catch (err: any) {
      console.error("Error clearing chat history:", err.message);
    }
  };



  const startPrivateChat = (userLogin: string) => {
    navigate(`/msg/${userLogin}`);
    setChatId(userLogin);
    setSearchText("");
  };
  const handleOpenPopupMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, chatId: string) => {
    event.preventDefault();
    setPopupPos({ x: event.clientX, y: event.clientY });
    setPopupChatId(chatId);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setPopupPos(null);
      setPopupChatId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchText]);

  const currentChatId = location.pathname.split("/msg/")[1];

  return (
    <>
      <div className="h-full w-[300px] bg-primary-bg border-r border-primary-bdr  text-white">
        <div className="w-full p-[10px]">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="p-[10px] outline-none bg-secondary-bg w-full"
            type="text"
            placeholder="Поиск..."
          />
        </div>


        <div className="flex flex-col gap-[10px] mt-[5px] relative">
          {searchText.length > 0 ? (
            <div className="flex flex-col">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => user.username && startPrivateChat(user.username)}
                  className={`p-[10px] cursor-pointer flex items-center gap-3 hover:bg-secondary-bg`}
                >
                  <AvatarWithStatus
                    avatar={user.avatar}
                    name={user.name || ""}
                    isOnline={onlineUsers.has(Number(user.id))}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{user.name}</div>
                    <div className="text-sm text-gray-400 truncate">@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {chats.map((chat) => (
                <div
                  onContextMenu={(e) => handleOpenPopupMenu(e, chat.id)}
                  key={chat.id}
                  onClick={() => {
                    const routeId = chat.chat_type === "direct" && chat.username ? chat.username : chat.id;
                    navigate(`/msg/${routeId}`);
                    setChatId(routeId);
                  }}
                  className={`p-[10px] cursor-pointer flex items-center gap-3 ${currentChatId === (chat.chat_type === "direct" && chat.username ? chat.username : chat.id) ? "bg-tertiary-bg" : "hover:bg-secondary-bg"
                    }`}
                >
                  <AvatarWithStatus
                    avatar={chat.avatar}
                    name={chat.display_name || ""}
                    isOnline={chat.chat_type === "direct" && onlineUsers.has(chats.find((c) => c.id === chat.id)?.user_id || 0)}
                  />
                  <div className="flex-1 flex-col min-w-0">
                    <div className="w-full flex justify-between gap-[5px]">
                      <div className="font-semibold truncate">{chat.display_name}</div>
                      <div className="text-sm text-white/40">{new Date(String(chat.last_timestamp)).toLocaleString().slice(12, 17)}</div>
                    </div>

                    {chat.last_message && (
                      <div className="w-full flex gap-[10px] items-end justify-between">
                        <div className="text-sm text-white/40 truncate">{chat.last_message}</div>
                        {chat.unread_count > 0 && (
                          <div className="bg-primary text-black font-bold text-[12px] rounded-full px-2 py-[3px]">
                            {chat.unread_count}
                          </div>
                        )}
                      </div>
                    )}

                  </div>




                  {popupPos && popupChatId === chat.id && (
                    <div
                      ref={popupRef}
                      style={{
                        position: "fixed",
                        left: popupPos.x,
                        top: popupPos.y,
                        zIndex: 10,
                      }}
                      className="bg-secondary-bg flex flex-col"
                    >
                      {chat.id !== 'general' && (
                        <div
                          onClick={() => handleClearChat(chat.id)}
                          className="cursor-pointer p-[10px] px-[20px] hover:text-black hover:bg-white">
                          Очистить история
                        </div>
                      )}
                      {chat.id !== 'general' && (
                        <div
                          onClick={() => handleDeleteChat(chat.id)}
                          className="text-red-500 cursor-pointer p-[10px] px-[20px] hover:text-black hover:bg-red-500"
                        >
                          Удалить чат
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>



    </>
  );
};

export default ChatList;