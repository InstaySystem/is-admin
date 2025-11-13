// /stores/useAppStore.ts
import { create } from "zustand";
import { User } from "@/types/user";

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
