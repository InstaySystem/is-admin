/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "guest" | "staff";
  content: string;
  created_at: string;
  read_by?: string[];
  read_at?: string;
  reader_type?: string;
  last_reader_type?: string;
  is_read?: boolean;
  [key: string]: any;
}

interface Chat {
  id: string;
  name: string;
  code?: string;
  department_id?: number;
  receiver_id?: number;
  department?: any;
  order_room?: any;
  last_message?: {
    id: string;
    content: string;
    sender_type: "guest" | "staff";
    created_at: string;
    is_read?: boolean;
    read_at?: string;
    reader_type?: string;
  };
}

interface MessageStore {
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentUser: { id: string; role: string } | null;
  selectedChatId: null;
  setSelectedChatId: (id: any) => void;
  isHaveNewMessage: boolean;
  setIsHaveNewMessage: (isHaveNewMessage: boolean) => void;

  addOrUpdateChat: (chat: Chat) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (
    chatId: string,
    messageId: string,
    updatedMessage: Partial<Message>
  ) => void;
  loadMessages: (chatId: string, messages: Message[]) => void;
  markRead: (
    chatId: string,
    readerId: string,
    readerType: string,
    readAt: string
  ) => void;
  setCurrentUser: (id: string, role: string) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  chats: [],
  messages: {},
  currentUser: null,
  selectedChatId: null,
  isHaveNewMessage: false,

  setIsHaveNewMessage: (isHaveNewMessage: boolean) => {
    set({ isHaveNewMessage: isHaveNewMessage });
  },

  setSelectedChatId: (id) => {
    set({ selectedChatId: id });
  },

  addOrUpdateChat: (chat: Chat) => {
    set((state) => {
      const existingIndex = state.chats.findIndex((c) => c.id === chat.id);
      const updated = [...state.chats];

      if (existingIndex !== -1) {
        updated[existingIndex] = { ...updated[existingIndex], ...chat };
      } else {
        updated.push(chat);
      }

      updated.sort((a, b) => {
        const timeA = a.last_message?.created_at
          ? new Date(a.last_message.created_at).getTime()
          : 0;
        const timeB = b.last_message?.created_at
          ? new Date(b.last_message.created_at).getTime()
          : 0;
        return timeB - timeA;
      });

      return { chats: updated };
    });
  },

  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      const existing = state.messages[chatId] || [];
      const messageExists = existing.some((m) => m.id === message.id);

      if (messageExists) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, message],
        },
      };
    });
  },

  // 🔥 Cập nhật message có sẵn
  updateMessage: (
    chatId: string,
    messageId: string,
    updatedMessage: Partial<Message>
  ) => {
    set((state) => {
      const messages = state.messages[chatId] || [];
      const updated = messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      );

      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });
  },

  loadMessages: (chatId: string, messages: Message[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }));
  },

  markRead: (
    chatId: string,
    readerId: string,
    readerType: string,
    readAt: string
  ) => {
    set((state) => {
      const messages = state.messages[chatId] || [];
      const updated = messages.map((msg) => {
        if (msg.sender_type !== readerType) {
          return {
            ...msg,
            is_read: true,
            read_by: Array.from(new Set([...(msg.read_by || []), readerType])),
            read_at: readAt,
            reader_type: readerType,
          };
        }
        return msg;
      });

      return {
        messages: {
          ...state.messages,
          [chatId]: updated,
        },
      };
    });
  },

  setCurrentUser: (id: string, role: string) => {
    set({ currentUser: { id, role } });
  },

  clearMessages: () => {
    set({ messages: {}, chats: [] });
  },
}));
