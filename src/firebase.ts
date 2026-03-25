import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function getRequiredEnvValue(name: string): string {
  const value = process.env[name]?.trim();
  return value ?? "";
}

function getFirebaseConfigFromEnv() {
  const apiKey = getRequiredEnvValue("EXPO_PUBLIC_FIREBASE_API_KEY");
  const authDomain = getRequiredEnvValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = getRequiredEnvValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = getRequiredEnvValue(
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  );
  const messagingSenderId = getRequiredEnvValue(
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  );
  const appId = getRequiredEnvValue("EXPO_PUBLIC_FIREBASE_APP_ID");

  const missing: string[] = [];
  if (!apiKey) missing.push("EXPO_PUBLIC_FIREBASE_API_KEY");
  if (!authDomain) missing.push("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!projectId) missing.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  if (!storageBucket) missing.push("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!messagingSenderId) {
    missing.push("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  }
  if (!appId) missing.push("EXPO_PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    throw new Error(
      `Firebase configuration is invalid. Missing env vars: ${missing.join(", ")}. Add them to .env and restart Expo with cache clear.`,
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

const firebaseConfig = getFirebaseConfigFromEnv();

if (__DEV__) {
  // TEMP DEBUG LOG: remove after confirming Expo reads env variables correctly.
  console.info(
    "[TEMP DEBUG] EXPO_PUBLIC_FIREBASE_API_KEY:",
    firebaseConfig.apiKey,
  );
  // TEMP DEBUG LOG: remove after confirming Expo reads env variables correctly.
  console.info(
    "[TEMP DEBUG] EXPO_PUBLIC_FIREBASE_PROJECT_ID:",
    firebaseConfig.projectId,
  );
}

export const db = getFirestore(initializeApp(firebaseConfig));
