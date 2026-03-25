import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const CONSENT_STORAGE_KEY = "@deadliner/privacy-consent";

type PrivacyState = {
  consentGranted: boolean;
  isHydrated: boolean;
  hydrateConsent: () => Promise<void>;
  setConsent: (granted: boolean) => Promise<void>;
};

export const usePrivacyStore = create<PrivacyState>((set) => ({
  consentGranted: false,
  isHydrated: false,
  hydrateConsent: async () => {
    try {
      const stored = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
      set({ consentGranted: stored === "true", isHydrated: true });
    } catch {
      set({ consentGranted: false, isHydrated: true });
    }
  },
  setConsent: async (granted) => {
    set({ consentGranted: granted });

    try {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, String(granted));
    } catch {
      // Keep silent to avoid blocking app login.
    }
  },
}));
