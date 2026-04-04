import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/src/firebase";

const AUTH_STORAGE_KEY = "@deadliner/authenticated";

type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrateAuth: () => Promise<void>;
  syncAuthFromFirebase: () => () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

async function persistAuthState(user: User | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
      return;
    }

    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore persistence errors to keep auth flow usable.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isHydrated: false,
  hydrateAuth: async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      set({
        currentUser,
        isAuthenticated: true,
        isHydrated: true,
      });
      await persistAuthState(currentUser);
      return;
    }

    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      set({
        currentUser: auth.currentUser,
        isAuthenticated: storedAuth === "true",
        isHydrated: true,
      });
    } catch {
      set({
        currentUser: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },
  syncAuthFromFirebase: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        currentUser: user,
        isAuthenticated: Boolean(user),
        isHydrated: true,
      });

      void persistAuthState(user);
    });

    return unsubscribe;
  },
  login: async () => {
    const currentUser = auth.currentUser;
    set({ currentUser, isAuthenticated: Boolean(currentUser) });
    await persistAuthState(currentUser ?? null);
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch {
      // Even if sign out fails remotely, clear local state to avoid lock-in.
    }

    set({ currentUser: null, isAuthenticated: false });
    await persistAuthState(null);
  },
}));
