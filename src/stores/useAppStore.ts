import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  urlQrcode: string;
  setUrlQrCode: (url: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      urlQrcode: "",
      setUrlQrCode: (url) => set({ urlQrcode: url }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        user: state.user,
        urlQrcode: state.urlQrcode,
      }),
    }
  )
);
