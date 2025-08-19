/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type {
  IUser,
  IRegisterRequest,
  ILoginRequest,
} from "../types/auth.types";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { getToken } from "../utils/token.utils";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: ILoginRequest) => Promise<void>;
  signup: (data: IRegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.user,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await userService.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
