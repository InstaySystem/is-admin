/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface MessageStore {
  messages: any[];
  addMessage: (msg: any) => void;
  removeMessage: (id: number) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [msg, ...state.messages],
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((x) => x.id !== id),
    })),

  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}));
