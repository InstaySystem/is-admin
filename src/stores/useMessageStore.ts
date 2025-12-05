/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Chat, ChatMessage } from "@/types/chat";

interface MessageStore {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  currentUserId: string | null;
  currentUserType: "guest" | "staff" | null;

  setChats: (chats: Chat[]) => void;
  addOrUpdateChat: (chat: Chat) => void;
  removeChatTempId: (tempId: string, realChat: Chat) => void;

  addMessage: (chatId: string, msg: ChatMessage) => void;
  updateTempMessage: (
    chatId: string,
    tempId: string,
    realMsg: ChatMessage
  ) => void;
  markRead: (chatId: any, readerId: any, readerType: any, readAt: any) => void;
  loadMessages: (chatId: string, messages: ChatMessage[]) => void;

  setCurrentUser: (userId: string, userType: "guest" | "staff") => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
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
        : [chat, ...state.chats];

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
    set((state) => {
      const existing = state.messages[chatId] || [];

      if (existing.some((m) => m.id === msg.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, msg],
        },
      };
    }),

  updateTempMessage: (chatId, tempId, realMsg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === tempId ? realMsg : m
        ),
      },
    })),

  markRead: (chatId, readerId, readerType, readAt) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) => {
          const alreadyRead = m.read_by?.includes(readerId);

          return {
            ...m,
            read_by: alreadyRead ? m.read_by : [...(m.read_by || []), readerId],

            read_at: readAt || m.read_at,
            last_reader_type: readerType || m.reader_type,
          };
        }),
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
