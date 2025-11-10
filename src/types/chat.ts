export interface ChatInList {
  id: string;
  privacy_type: "public" | "private";
  chat_type: "group" | "direct";
  name?: string;
  display_name: string;
  avatar?: string;
  participants?: string[];
  last_message?: string;
  last_timestamp?: string;
  username?: string;
  unread_count: number;
  user_id?: number;
  target_user_id?: number;
}

export interface Message {
  id: number;
  chat_id: string;
  user_id: number;
  username: string;
  name?: string;
  avatar?: string;
  text: string;
  timestamp: string;
  is_read: boolean;
  message_type?: 'text' | 'game_invite';
  reply_to_message_id?: number | null;
  reply_to_message?: {
    id: number;
    text: string;
    user_id: number;
    username: string;
    name?: string;
    avatar?: string;
    message_type?: 'text' | 'game_invite';
  } | null;
  game_invite_data?: {
    invite_id: string;
    from_user_id: number;
    from_username: string;
    from_name?: string;
    from_avatar?: string | null;
    to_user_id: number;
    to_username: string;
    to_name?: string;
    to_avatar?: string | null;
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'abandoned';
  };
}