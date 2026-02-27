import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxwQEqmQ1OfM769Bdfcn309XTug4QsmRA",
  authDomain: "deadliner-90803.firebaseapp.com",
  projectId: "deadliner-90803",
  storageBucket: "deadliner-90803.firebasestorage.app",
  messagingSenderId: "723371844872",
  appId: "1:723371844872:web:adab9ba55695ce741c38bd",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
