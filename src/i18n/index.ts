import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import { en } from "./translations/en";
import { th } from "./translations/th";

export const translations = {
  en,
  th,
} as const;

const i18n = new I18n(translations);
const languageListeners = new Set<() => void>();
const LANGUAGE_STORAGE_KEY = "app_language";

i18n.enableFallback = true;
i18n.defaultLocale = "en";

export type LanguageCode = "en" | "th";
export type TranslationKey = keyof typeof en;

function isValidLanguage(value: string | null): value is LanguageCode {
  return value === "en" || value === "th";
}

function resolveDeviceLanguage(): LanguageCode {
  const detectedLanguage = getLocales()?.[0]?.languageCode;
  return detectedLanguage === "th" ? "th" : "en";
}

export async function initLanguage(): Promise<LanguageCode> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isValidLanguage(stored)) {
      i18n.locale = stored;
      return stored;
    }

    const fallback = resolveDeviceLanguage();
    i18n.locale = fallback;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, fallback);
    return fallback;
  } catch {
    i18n.locale = "en";
    return "en";
  }
}

export const t = (key: TranslationKey, options?: Record<string, unknown>) =>
  i18n.t(key, options) as string;

export const setLanguage = async (language: LanguageCode) => {
  if (i18n.locale === language) {
    return;
  }

  i18n.locale = language;

  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors to keep app usable.
  }

  languageListeners.forEach((listener) => listener());
};

export const getLanguage = (): LanguageCode =>
  i18n.locale?.startsWith("th") ? "th" : "en";

export const subscribeLanguageChange = (listener: () => void) => {
  languageListeners.add(listener);

  return () => {
    languageListeners.delete(listener);
  };
};
