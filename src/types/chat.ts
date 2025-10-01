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
}

export interface Message {
  id: number;
  chat_id: string;
  user_id: number;
  username: string;
  text: string;
  timestamp: string;
}