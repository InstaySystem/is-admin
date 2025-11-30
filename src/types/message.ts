export interface Message {
  id: number;
  chat_id?: number;
  sender_id: number;
  sender_name: string;
  content?: string;
  image_key?: string;
  created_at: string;
  read_by: number[];
}

export interface Chat {
  id: number;
  code: string;
  name: string;
  last_message?: string;
  department_id: number;
}

export interface MessageStore {
  chats: Chat[];
  messages: Record<number, Message[]>;
  unread: Record<number, number>;
  addOrUpdateChat: (chat: Chat) => void;
  addMessage: (chat_id: number, msg: Message) => void;
  markRead: (chat_id: number, user_id: number) => void;
  setChats: (chats: Chat[]) => void;
}
