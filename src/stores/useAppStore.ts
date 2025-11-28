import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

interface AppState {
  user: User | null;
  _role: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  urlQrcode: string;
  setUrlQrCode: (url: string) => void;
}

const convertUserRole = (user: User | null): string | null => {
  if (!user) return null;

  if (user.role === "admin") return "admin";

  if (user.role === "staff" && user.department?.name) {
    return `staff-${user.department.name.toLowerCase()}`;
  }

  return null;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      _role: null,

      setUser: (user: User) => {
        set({
          user,
          _role: convertUserRole(user),
        });
      },

      clearUser: () => {
        set({
          user: null,
          _role: null,
        });
      },

      urlQrcode: "",
      setUrlQrCode: (url) => set({ urlQrcode: url }),
    }),

    {
      name: "app-storage",
      partialize: (state) => ({
        user: state.user,
        _role: state._role,
        urlQrcode: state.urlQrcode,
      }),
    }
  )
);
