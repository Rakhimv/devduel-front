import React from 'react';
import { allEmojis } from "../../../utils/emojis"

interface EmojiProps {
  onEmojiSelect: (emoji: string) => void; // Добавляем пропс для выбора эмодзи
}

const Emoji: React.FC<EmojiProps> = React.memo(({ onEmojiSelect }) => {
    return (
        <div className="overflow-y-auto h-full p-3 grid grid-cols-8 gap-2"> {/* Сделал h-full, чтобы панель могла быть прокручиваемой */}
            {allEmojis.map((emoji, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => onEmojiSelect(emoji)} // Вызываем функцию из пропсов
                    className="text-xl hover:bg-[#111A1F] rounded p-1 hover:scale-125 transition-transform"
                    title={emoji}
                >
                    {emoji}
                </button>
            ))}
        </div>
    )
});

export default Emoji;