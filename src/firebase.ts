import { getFirebaseConfigFromEnv } from "@/src/core/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const PERSISTENCE_TYPE_LOCAL = "LOCAL";
const STORAGE_AVAILABILITY_PROBE_KEY = "firebase-auth-availability";
const STORAGE_AVAILABILITY_PROBE_VALUE = "1";

const firebaseConfig = getFirebaseConfigFromEnv();
const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

function createReactNativePersistence(storage: typeof AsyncStorage) {
  return class {
    static type = PERSISTENCE_TYPE_LOCAL;
    readonly type = PERSISTENCE_TYPE_LOCAL;

    async _isAvailable() {
      try {
        if (!storage) {
          return false;
        }

        await storage.setItem(
          STORAGE_AVAILABILITY_PROBE_KEY,
          STORAGE_AVAILABILITY_PROBE_VALUE,
        );
        await storage.removeItem(STORAGE_AVAILABILITY_PROBE_KEY);
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
    return initializeAuth(firebaseApp, {
      persistence: createReactNativePersistence(AsyncStorage) as never,
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = initializeAuthWithPersistence();
