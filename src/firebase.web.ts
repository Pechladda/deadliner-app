import { getFirebaseConfigFromEnv } from "@/src/core/config";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = getFirebaseConfigFromEnv();
const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

// On web, Firebase Auth uses browserLocalPersistence by default (no AsyncStorage needed)
export const auth = getAuth(firebaseApp);
