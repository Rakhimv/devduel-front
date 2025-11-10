import React, { useRef, useEffect } from "react";

interface MessageContextMenuProps {
    x: number;
    y: number;
    messageId: number;
    onCopy: (messageId: number) => void;
    onDelete: (messageId: number) => void;
    onReply: (messageId: number) => void;
    canDelete: boolean;
    onClose: () => void;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
    x,
    y,
    messageId,
    onCopy,
    onDelete,
    onReply,
    canDelete,
    onClose
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                zIndex: 1000,
            }}
            className="bg-secondary-bg border border-primary-bdr shadow-lg"
        >
            <button
                onClick={() => onReply(messageId)}
                className="block w-full px-4 py-2 text-left hover:bg-primary-bg text-white text-sm cursor-pointer"
            >
                Ответить
            </button>
            <button
                onClick={() => onCopy(messageId)}
                className="block w-full px-4 py-2 text-left hover:bg-primary-bg text-white text-sm cursor-pointer"
            >
                Копировать
            </button>
            {canDelete && (
                <button
                    onClick={() => onDelete(messageId)}
                    className="block w-full px-4 py-2 text-left hover:bg-red-600 text-white text-sm cursor-pointer"
                >
                    Удалить
                </button>
            )}
        </div>
    );
};

export default MessageContextMenu;

