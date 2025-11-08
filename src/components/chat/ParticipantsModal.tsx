import React from "react";
import Modal from "../ui/Modal";
import AvatarWithStatus from "./AvatarWithStatus";

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: any[];
    participantsTotal: number;
    participantsLoading: boolean;
    participantsSearchQuery: string;
    onSearchChange: (query: string) => void;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    onParticipantClick: (username: string) => void;
    onlineUsers: Set<number>;
    currentUserId?: number;
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
    isOpen,
    onClose,
    participants,
    participantsTotal,
    participantsLoading,
    participantsSearchQuery,
    onSearchChange,
    onScroll,
    onParticipantClick,
    onlineUsers,
    currentUserId
}) => {
    const filtered = participants
        .filter(participant => participant.id !== currentUserId)
        .filter(participant => {
            const query = participantsSearchQuery.toLowerCase();
            if (!query) return true;
            return (participant.name?.toLowerCase().includes(query) ||
                participant.login?.toLowerCase().includes(query));
        });

    const sorted = [...filtered].sort((a, b) => {
        const aOnline = onlineUsers.has(a.id);
        const bOnline = onlineUsers.has(b.id);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return 0;
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
            }}
            title={`Участники General (${participantsTotal})`}
        >
            <div className="w-full">
                <input
                    type="text"
                    value={participantsSearchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Поиск по нику или имени..."
                    className="w-full p-2 mb-4 bg-secondary-bg text-white outline-none border border-primary-bdr focus:border-primary transition-colors"
                />
                <div
                    className="max-h-96 overflow-y-auto"
                    onScroll={onScroll}
                >
                    {sorted.map((participant) => (
                        <div
                            key={participant.id}
                            onClick={() => onParticipantClick(participant.login)}
                            className="flex items-center gap-3 p-3 hover:bg-secondary-bg transition-colors cursor-pointer"
                        >
                            <AvatarWithStatus
                                avatar={participant.avatar}
                                name={participant.name || participant.login}
                                isOnline={onlineUsers.has(participant.id)}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-white">{participant.name}</div>
                                <div className="text-sm text-white/40 truncate">@{participant.login}</div>
                            </div>
                        </div>
                    ))}
                    {participantsLoading && (
                        <div className="text-center py-4">
                            <div className="h-4 w-32 bg-white/10 animate-pulse mx-auto"></div>
                        </div>
                    )}
                    {!participantsLoading && participants.filter(p => p.id !== currentUserId).length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            Нет участников
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ParticipantsModal;

