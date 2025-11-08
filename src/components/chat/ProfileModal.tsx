import React from "react";
import Modal from "../ui/Modal";
import { getAvatarUrl } from "../../utils/avatarUrl";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileUser: any;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    profileUser
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
            }}
            title={profileUser ? `${profileUser.name} (@${profileUser.login})` : "Профиль"}
        >
            {profileUser && (
                <div className="text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={getAvatarUrl(profileUser.avatar)}
                            alt={profileUser.name}
                            className="w-16 h-16 rounded-full border-2 border-gray-600"
                        />
                        <div>
                            <h3 className="text-xl font-bold">{profileUser.name}</h3>
                            <p className="text-gray-400">@{profileUser.login}</p>
                        </div>
                    </div>
                    <div className="bg-secondary-bg border border-primary-bdr p-4">
                        <h4 className="font-semibold text-lg mb-2 text-white">Статистика</h4>
                        <p className="text-white/70">Игр сыграно: {profileUser.games_count || 0}</p>
                        <p className="text-white/70">Побед: {profileUser.wins_count || 0}</p>
                        <p className="text-white/70">Поражений: {(profileUser.games_count || 0) - (profileUser.wins_count || 0)}</p>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ProfileModal;

