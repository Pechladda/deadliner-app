import type { FirebaseOptions } from "firebase/app";

// Metro bundler can only inline process.env values when using static dot notation.
// Dynamic bracket access (process.env[key]) is NOT replaced at build time.
export function getFirebaseConfigFromEnv(): FirebaseOptions {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
  };

  const ENV_KEY_NAMES: Record<keyof typeof config, string> = {
    apiKey: "EXPO_PUBLIC_FIREBASE_API_KEY",
    authDomain: "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "EXPO_PUBLIC_FIREBASE_APP_ID",
  };

  const missingEnvKeys = (Object.keys(config) as (keyof typeof config)[])
    .filter((key) => !config[key])
    .map((key) => ENV_KEY_NAMES[key]);

  if (missingEnvKeys.length) {
    throw new Error(
      `Firebase configuration is invalid. Missing env vars: ${missingEnvKeys.join(", ")}. Add them to .env and restart Expo with cache clear.`,
    );
  }

  return config;
}
