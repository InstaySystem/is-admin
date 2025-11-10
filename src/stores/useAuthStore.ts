import { create } from "zustand"

interface AuthState {
  forgotPasswordToken: string
  setForgotPasswordToken: (token: string) => void
  resetPasswordToken: string
  setResetPasswordToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  forgotPasswordToken:"",
  setForgotPasswordToken: (token) => set({ forgotPasswordToken: token }),
  resetPasswordToken: "", 
  setResetPasswordToken: (token) => set({ resetPasswordToken: token }),
}))
