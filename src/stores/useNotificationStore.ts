/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface NotificationStore {
  notifications: any[];
  unreadCount: number;

  addNotification: (noti: any) => void;
  setNotifications: (list: any[]) => void;
  setUnreadCount: (count: number) => void;
  removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (noti) =>
    set((state) => ({
      notifications: [noti, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setNotifications: (list) =>
    set(() => ({
      notifications: list,
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set(() => ({ unreadCount: count })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((x) => x.id !== id),
      unreadCount: Math.max(state.unreadCount - 1, 0),
    })),
}));
