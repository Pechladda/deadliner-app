import type { FirebaseOptions } from "firebase/app";

export function getFirebaseConfigFromEnv(): FirebaseOptions {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const storageBucket =
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  const messagingSenderId =
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";

  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  const missing: string[] = [];
  if (!apiKey) missing.push("EXPO_PUBLIC_FIREBASE_API_KEY");
  if (!authDomain) missing.push("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!projectId) missing.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  if (!storageBucket) missing.push("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!messagingSenderId) {
    missing.push("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  }
  if (!appId) missing.push("EXPO_PUBLIC_FIREBASE_APP_ID");

  if (missing.length) {
    throw new Error(
      `Firebase configuration is invalid. Missing env vars: ${missing.join(", ")}. Add them to .env and restart Expo with cache clear.`,
    );
  }

  return config;
}
