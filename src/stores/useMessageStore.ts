/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
export interface Chat {
  order_room: any;
  id: string;
  code?: string; // cho guest
  name: string;
  department_id?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "guest" | "staff" | "department";
  content?: string;
  image_key?: string;
  created_at: string;
  read_by: string[];
}

export interface WSRequest {
  event: string;
  data: any;
}

export interface WSResponse {
  event: string;
  data: any;
}

interface MessageStore {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  currentUserId: string | null;
  currentUserType: "guest" | "staff" | null;

  // Chat operations
  setChats: (chats: Chat[]) => void;
  addOrUpdateChat: (chat: Chat) => void;
  removeChatTempId: (tempId: string, realChat: Chat) => void;

  // Message operations
  addMessage: (chatId: string, msg: ChatMessage) => void;
  updateTempMessage: (
    chatId: string,
    tempId: string,
    realMsg: ChatMessage
  ) => void;
  markRead: (chatId: string, userId: string) => void;
  loadMessages: (chatId: string, messages: ChatMessage[]) => void;

  // User operations
  setCurrentUser: (userId: string, userType: "guest" | "staff") => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  chats: [],
  messages: {},
  currentUserId: null,
  currentUserType: null,

  setChats: (chats) => set({ chats }),

  addOrUpdateChat: (chat) =>
    set((state) => {
      const exists = state.chats.find((c) => c.id === chat.id);
      const newChats = exists
        ? state.chats.map((c) => (c.id === chat.id ? { ...c, ...chat } : c))
        : [...state.chats, chat];
      return { chats: newChats };
    }),

  removeChatTempId: (tempId, realChat) =>
    set((state) => {
      const messages = state.messages[tempId] || [];
      return {
        chats: state.chats.filter((c) => c.id !== tempId),
        messages: {
          ...state.messages,
          [realChat.id]: messages,
        },
      };
    }),

  addMessage: (chatId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), msg],
      },
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: msg.content || "[Hình ảnh]",
              lastMessageTime: msg.created_at,
            }
          : c
      ),
    })),

  updateTempMessage: (chatId, tempId, realMsg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === tempId ? realMsg : m
        ),
      },
    })),

  markRead: (chatId, userId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) => ({
          ...m,
          read_by: m.read_by?.includes(userId)
            ? m.read_by
            : [...(m.read_by || []), userId],
        })),
      },
    })),

  loadMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  setCurrentUser: (userId, userType) =>
    set({ currentUserId: userId, currentUserType: userType }),
}));
