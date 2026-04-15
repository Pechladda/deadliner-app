import { getFirebaseConfigFromEnv } from "@/src/core/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = getFirebaseConfigFromEnv();

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

function createReactNativePersistence(storage: typeof AsyncStorage) {
  const STORAGE_AVAILABLE_KEY = "firebase-auth-availability";

  return class {
    static type = "LOCAL";
    readonly type = "LOCAL";

    async _isAvailable() {
      try {
        if (!storage) {
          return false;
        }

        await storage.setItem(STORAGE_AVAILABLE_KEY, "1");
        await storage.removeItem(STORAGE_AVAILABLE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    _set(key: string, value: unknown) {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get<T>(key: string): Promise<T | null> {
      const json = await storage.getItem(key);
      return json ? (JSON.parse(json) as T) : null;
    }

    _remove(key: string) {
      return storage.removeItem(key);
    }

    _addListener() {
      return;
    }

    _removeListener() {
      return;
    }
  };
}

function initializeAuthWithPersistence() {
  try {
    return initializeAuth(app, {
      persistence: createReactNativePersistence(AsyncStorage) as never,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = initializeAuthWithPersistence();
