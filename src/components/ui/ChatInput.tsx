import React, { useState, useRef, useEffect, memo } from 'react';
import { FaRegSmile, FaSmile } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(({
  value,
  onChange,
  onSend,
  placeholder = "Сообщение...",
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    // Close emoji picker when clicking outside or pressing Escape
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the emoji picker and not on the emoji button
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        !target.closest('button[aria-label="Toggle emoji picker"]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showEmojiPicker]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    onChange(value + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-end gap-2 bg-secondary-bg border border-primary-bdr p-2  focus-within:border focus-within:border-primary-bdr transition-all ">


        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-white outline-none resize-none max-h-32 min-h-[30px] px-2 noscroll placeholder:text-white/20"
          rows={1}
        />

        <div className="relative">

          <div className='flex gap-[10px] h-[30px] items-center'>
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className={`text-2xl cursor-pointer transition-all rounded ${showEmojiPicker ? 'opacity-100 text-primary' : 'opacity-20 hover:opacity-100'}`}
              disabled={disabled}
              aria-label="Toggle emoji picker"
            >
              {showEmojiPicker ? <FaSmile /> : <FaRegSmile />}
            </button>
            <button
              type="button"
              onClick={() => {
                if (value.trim()) {
                  onSend();
                }
              }}
              className={`text-2xl transition-transform rounded  ${value.trim().length > 0 ? "" : "opacity-20"} cursor-pointer`}
              disabled={disabled}
            >
              <IoSend />
            </button>
          </div>

          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl"
              style={{ maxHeight: '400px' }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                width={350}
                height={400}
                skinTonesDisabled
                // @ts-ignore
                theme='dark'
                previewConfig={{
                  showPreview: false
                }}
                searchDisabled={false}
              />
            </div>
          )}
         
        </div>


      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомное сравнение - перерисовываем только если изменились важные пропсы
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onSend === nextProps.onSend
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;

