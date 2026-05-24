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
import { getLoginData, detectSuspiciousLogin } from "@/lib/tracking";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  
  try {
    const loginData = await getLoginData();
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      browser: loginData.browser,
      os: loginData.os,
      device: loginData.deviceType,
      lastIP: loginData.ip,
      country: loginData.country,
      countryCode: loginData.countryCode,
      city: loginData.city,
      browserVersion: loginData.browserVersion,
      osVersion: loginData.osVersion,
      isVPN: loginData.isVPN,
      onlineStatus: "online",
    });
  } catch (error) {
    console.error("Error updating profile after Google signin:", error);
    // Fallback to basic info
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      onlineStatus: "online",
    });
  }
  
  return cred;
}

export async function registerWithEmail(email: string, password: string, username: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  
  try {
    const loginData = await getLoginData();
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      browser: loginData.browser,
      os: loginData.os,
      device: loginData.deviceType,
      lastIP: loginData.ip,
      country: loginData.country,
      countryCode: loginData.countryCode,
      city: loginData.city,
      browserVersion: loginData.browserVersion,
      osVersion: loginData.osVersion,
      isVPN: loginData.isVPN,
      onlineStatus: "online",
    });
  } catch (error) {
    console.error("Error updating profile after registration:", error);
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      onlineStatus: "online",
    });
  }
  
  return cred;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  try {
    const loginData = await getLoginData();
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      browser: loginData.browser,
      os: loginData.os,
      device: loginData.deviceType,
      lastIP: loginData.ip,
      country: loginData.country,
      countryCode: loginData.countryCode,
      city: loginData.city,
      browserVersion: loginData.browserVersion,
      osVersion: loginData.osVersion,
      isVPN: loginData.isVPN,
      onlineStatus: "online",
    });
  } catch (error) {
    console.error("Error updating profile after email signin:", error);
    await upsertUserProfile(cred.user, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      onlineStatus: "online",
    });
  }
  
  return cred;
}

export async function logout() {
  return signOut(auth);
}

export function onSessionChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
