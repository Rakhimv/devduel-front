import { useEffect, useRef, useState, useMemo, useCallback, memo, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChatInList } from "../../types/chat";
import { api } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import AvatarWithStatus from "./AvatarWithStatus";
import { Virtuoso } from "react-virtuoso";
import { ChatListSkeleton } from "../ui/ChatSkeleton";
import { motion, AnimatePresence } from "framer-motion";

type ChatListProps = {
  setChatId: Dispatch<SetStateAction<string | null>>;
};

const ChatItem = memo(({ 
  chat, 
  isActive, 
  onlineUsers, 
  onChatClick, 
  onContextMenu 
}: {
  chat: ChatInList;
  isActive: boolean;
  onlineUsers: Set<number>;
  onChatClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  const isOnline = chat.chat_type === "direct" && onlineUsers.has(chat.user_id || 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onContextMenu={onContextMenu}
      onClick={onChatClick}
      className={`p-[10px] cursor-pointer flex items-center gap-3 ${
        isActive ? "bg-tertiary-bg" : "hover:bg-secondary-bg"
      } transition-colors`}
    >
      <AvatarWithStatus
        avatar={chat.avatar}
        name={chat.display_name || ""}
        isOnline={isOnline}
      />
      <div className="flex-1 flex-col min-w-0">
        <div className="w-full flex justify-between gap-[5px]">
          <div className="font-semibold truncate">{chat.display_name}</div>
          {chat.last_timestamp && (
            <div className="text-sm text-white/40 flex-shrink-0">
              {new Date(String(chat.last_timestamp)).toLocaleString().slice(12, 17)}
            </div>
          )}
        </div>

        {chat.last_message && (
          <div className="w-full flex gap-[10px] items-end justify-between">
            <div className="text-sm text-white/40 truncate">{chat.last_message}</div>
            {chat.unread_count > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary text-black font-bold text-[12px] rounded-full px-2 py-[3px] flex-shrink-0"
              >
                {chat.unread_count}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatItem.displayName = 'ChatItem';

const SearchItem = memo(({ 
  user, 
  isOnline, 
  onUserClick 
}: {
  user: ChatInList;
  isOnline: boolean;
  onUserClick: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
      onClick={onUserClick}
      className="p-[10px] cursor-pointer flex items-center gap-3 hover:bg-secondary-bg transition-colors"
    >
      <AvatarWithStatus
        avatar={user.avatar}
        name={user.name || ""}
        isOnline={isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{user.name}</div>
        <div className="text-sm text-gray-400 truncate">@{user.username}</div>
      </div>
    </motion.div>
  );
});

SearchItem.displayName = 'SearchItem';

const ChatList: React.FC<ChatListProps> = ({ setChatId }) => {
  const [chats, setChats] = useState<ChatInList[]>([]);
  const [searchResults, setSearchResults] = useState<ChatInList[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
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

        if (chatId !== 'general') {
          fetchChats();
        }
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
        navigate('/app');
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
        navigate(`/app/msg/${chatId}`);
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

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/chats/my");
      const sortedChats = res.data.sort(
        (a: ChatInList, b: ChatInList) =>
          new Date(b.last_timestamp || 0).getTime() - new Date(a.last_timestamp || 0).getTime()
      );
      setChats(sortedChats);
      res.data.forEach((chat: any) => {
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
      });
    } catch (err: any) {
      console.error("Error fetching chats:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      if (query.length > 2) {
        setIsSearching(true);
        const res = await api.get(`/chats/search?query=${query}`);
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching chats:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

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



  const handleOpenPopupMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, chatId: string) => {
    event.preventDefault();
    setPopupPos({ x: event.clientX, y: event.clientY });
    setPopupChatId(chatId);
  }, []);
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
    if (searchText.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchText);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText, handleSearch]);

  const currentChatId = useMemo(() => location.pathname.split("/app/msg/")[1], [location.pathname]);

  const handleChatClick = useCallback((chat: ChatInList) => {
    const routeId = chat.chat_type === "direct" && chat.username ? chat.username : chat.id;
    if (currentChatId === routeId) {
      return;
    }
    navigate(`/app/msg/${routeId}`);
    setChatId(routeId);
  }, [navigate, setChatId, currentChatId]);

  const startPrivateChat = useCallback((userLogin: string) => {
    navigate(`/app/msg/${userLogin}`);
    setChatId(userLogin);
    setSearchText("");
  }, [navigate, setChatId]);

  const handleSearchUserClick = useCallback((user: ChatInList) => {
    if (user.username) {
      startPrivateChat(user.username);
    }
  }, [startPrivateChat]);

  const itemContent = useCallback((_index: number, chat: ChatInList) => {
    const routeId = chat.chat_type === "direct" && chat.username ? chat.username : chat.id;
    const isActive = currentChatId === routeId;
    
    return (
      <ChatItem
        chat={chat}
        isActive={isActive}
        onlineUsers={onlineUsers}
        onChatClick={() => handleChatClick(chat)}
        onContextMenu={(e) => handleOpenPopupMenu(e, chat.id)}
      />
    );
  }, [currentChatId, onlineUsers, handleChatClick]);

  const searchItemContent = useCallback((_index: number, user: ChatInList) => {
    return (
      <SearchItem
        user={user}
        isOnline={onlineUsers.has(Number(user.id))}
        onUserClick={() => handleSearchUserClick(user)}
      />
    );
  }, [onlineUsers, handleSearchUserClick]);

  return (
    <>
      <div className="h-full w-full bg-primary-bg border-r border-primary-bdr text-white flex flex-col">
        <div className="w-full p-[10px] flex-shrink-0">
          <motion.input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="p-[10px] outline-none bg-secondary-bg w-full placeholder:text-white/20 focus:ring-2 focus:ring-primary transition-all"
            type="text"
            placeholder="Поиск..."
          />
        </div>

        <div className="flex-1 overflow-hidden relative">
          {isLoading && chats.length === 0 ? (
            <div className="flex flex-col">
              <ChatListSkeleton count={8} />
            </div>
          ) : searchText.length > 0 ? (
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  <ChatListSkeleton count={3} />
                </motion.div>
              ) : searchResults.length > 0 ? (
                <Virtuoso
                  key="search-results"
                  data={searchResults}
                  itemContent={searchItemContent}
                  style={{ height: '100%' }}
                  totalCount={searchResults.length}
                />
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full text-white/40"
                >
                  Ничего не найдено
                </motion.div>
              )}
            </AnimatePresence>
          ) : chats.length > 0 ? (
            <Virtuoso
              data={chats}
              itemContent={itemContent}
              style={{ height: '100%' }}
              totalCount={chats.length}
              followOutput="smooth"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-white/40"
            >
              Нет чатов
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {popupPos && popupChatId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            ref={popupRef}
            style={{
              position: "fixed",
              left: popupPos.x,
              top: popupPos.y,
              zIndex: 1000,
            }}
            className="bg-secondary-bg border border-primary-bdr shadow-2xl min-w-[180px] overflow-hidden rounded-sm"
          >
            {popupChatId && chats.find(c => c.id === popupChatId)?.id !== 'general' && (
              <>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(131, 214, 197, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (popupChatId) {
                      handleClearChat(popupChatId);
                    }
                  }}
                  className="block w-full px-4 py-2.5 text-left text-white text-sm cursor-pointer transition-colors border-b border-primary-bdr/50 hover:text-primary"
                >
                  Очистить историю
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(244, 97, 97, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (popupChatId) {
                      handleDeleteChat(popupChatId);
                    }
                  }}
                  className="block w-full px-4 py-2.5 text-left text-red-500 text-sm cursor-pointer transition-colors hover:text-red-400"
                >
                  Удалить чат
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatList;