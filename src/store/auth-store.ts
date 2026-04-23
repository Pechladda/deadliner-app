import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/src/firebase";

const LOGIN_KEY = "isLoggedIn";
const USER_ID_KEY = "userId";
const LOGGED_IN_VALUE = "true";

type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrateAuth: () => Promise<void> | void;
  syncAuthFromFirebase: () => () => void;
  login: (user?: User | null) => Promise<void>;
  logout: () => Promise<void>;
};

async function persistAuthState(user: User | null) {
  try {
    if (user) {
      await AsyncStorage.multiSet([
        [LOGIN_KEY, LOGGED_IN_VALUE],
        [USER_ID_KEY, user.uid],
      ]);
      return;
    }

    await AsyncStorage.multiRemove([LOGIN_KEY, USER_ID_KEY]);
  } catch {
    // Ignore persistence errors to keep auth flow usable.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isHydrated: false,
  hydrateAuth: () => {
    // Firebase Auth restores sessions asynchronously from AsyncStorage.
    // We must wait for onAuthStateChanged to fire before marking as hydrated,
    // otherwise auth.currentUser is always null at startup (production builds).
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        set({
          currentUser: user,
          isAuthenticated: Boolean(user),
          isHydrated: true,
        });
        void persistAuthState(user);
        resolve();
      });
    });
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
  login: async (user) => {
    const currentUser = user ?? auth.currentUser;
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
