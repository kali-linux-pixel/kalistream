import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { app } from "./config";
import { upsertUserProfile } from "./firestore";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await upsertUserProfile(cred.user, {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    browser: typeof navigator !== "undefined" ? navigator.appName : "",
    device: typeof navigator !== "undefined" ? navigator.platform : "",
  });
  return cred;
}

export async function registerWithEmail(email: string, password: string, username: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await upsertUserProfile(cred.user, {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    browser: typeof navigator !== "undefined" ? navigator.appName : "",
    device: typeof navigator !== "undefined" ? navigator.platform : "",
  });
  return cred;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(cred.user, {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    browser: typeof navigator !== "undefined" ? navigator.appName : "",
    device: typeof navigator !== "undefined" ? navigator.platform : "",
  });
  return cred;
}

export async function logout() {
  return signOut(auth);
}

export function onSessionChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
