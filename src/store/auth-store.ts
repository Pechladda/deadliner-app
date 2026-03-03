import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const AUTH_STORAGE_KEY = "@deadliner/authenticated";

type AuthState = {
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrateAuth: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrated: false,
  hydrateAuth: async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      set({
        isAuthenticated: storedAuth === "true",
        isHydrated: true,
      });
    } catch {
      set({
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },
  login: async () => {
    set({ isAuthenticated: true });
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
    } catch {}
  },
  logout: async () => {
    set({ isAuthenticated: false });
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  },
}));
