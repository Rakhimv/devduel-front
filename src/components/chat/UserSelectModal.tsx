import React from "react";
import Modal from "../ui/Modal";
import AvatarWithStatus from "./AvatarWithStatus";

interface UserSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableUsers: any[];
    onlineUsers: Set<number>;
    userSearchQuery: string;
    onSearchChange: (query: string) => void;
    onUserSelect: (userId: number) => void;
    currentUserId?: number;
}

const UserSelectModal: React.FC<UserSelectModalProps> = ({
    isOpen,
    onClose,
    availableUsers,
    onlineUsers,
    userSearchQuery,
    onSearchChange,
    onUserSelect,
    currentUserId
}) => {
    const filteredUsers = availableUsers
        .filter(u => u.id !== currentUserId)
        .filter(u => {
            const query = userSearchQuery.toLowerCase();
            if (!query) return true;
            return (u.name?.toLowerCase().includes(query) || 
                    u.login?.toLowerCase().includes(query));
        });

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                onSearchChange("");
            }}
            title="Выберите пользователя"
        >
            <div className="w-full">
                <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Поиск по имени или логину..."
                    className="w-full p-2 mb-4 bg-secondary-bg text-white outline-none border border-primary-bdr focus:border-primary transition-colors"
                />
                <div className="max-h-96 overflow-y-auto">
                    {filteredUsers.map((userItem) => (
                        <button
                            key={userItem.id}
                            onClick={() => onUserSelect(userItem.id)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-secondary-bg transition-colors text-left cursor-pointer"
                        >
                            <AvatarWithStatus
                                avatar={userItem.avatar}
                                name={userItem.name || userItem.login}
                                isOnline={onlineUsers.has(userItem.id)}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-white">{userItem.name}</div>
                                <div className="text-sm text-gray-400 truncate">@{userItem.login}</div>
                            </div>
                        </button>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            {userSearchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default UserSelectModal;

