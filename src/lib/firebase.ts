import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialise if a real API key is present (prevents build-time crashes)
const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// getApps().length check-then-initializeApp isn't atomic — on Cloudflare
// Workers, concurrent requests to a fresh isolate can both see zero apps and
// both call initializeApp(), and the loser throws "Firebase App named
// '[DEFAULT]' already exists", crashing the whole request with no way for
// page-level try/catch to intercept it (it happens at module-import time).
// Falling back to the already-registered app on that specific error makes
// this race harmless instead of a 500.
function getOrInitApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  try {
    return initializeApp(firebaseConfig);
  } catch (err) {
    const alreadyExists = getApps();
    if (alreadyExists.length > 0) return alreadyExists[0];
    throw err;
  }
}

const app = configured ? getOrInitApp() : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = app ? getAuth(app) : (null as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = app ? getFirestore(app) : (null as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const storage = app ? getStorage(app) : (null as any);

export default app;
