import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

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

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                zIndex: 1000,
            }}
            className="bg-secondary-bg border border-primary-bdr shadow-2xl min-w-[160px] overflow-hidden rounded-sm"
        >
                <motion.button
                    whileHover={{ backgroundColor: 'rgba(131, 214, 197, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        onReply(messageId);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-white text-sm cursor-pointer transition-colors border-b border-primary-bdr/50 hover:text-primary"
                >
                    Ответить
                </motion.button>
                <motion.button
                    whileHover={{ backgroundColor: 'rgba(131, 214, 197, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        onCopy(messageId);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-white text-sm cursor-pointer transition-colors border-b border-primary-bdr/50 hover:text-primary"
                >
                    Копировать
                </motion.button>
                {canDelete && (
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(244, 97, 97, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            onDelete(messageId);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-red-500 text-sm cursor-pointer transition-colors hover:text-red-400"
                    >
                        Удалить
                    </motion.button>
                )}
        </motion.div>
    );
};

export default MessageContextMenu;

