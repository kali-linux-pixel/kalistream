import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBbBQF44vDF_QSBl-3ROBRpzDMGIGaldY0",
  authDomain: "kalistream-52448.firebaseapp.com",
  projectId: "kalistream-52448",
  storageBucket: "kalistream-52448.firebasestorage.app",
  messagingSenderId: "114400010251",
  appId: "1:114400010251:web:9fce11093e9f981d56670e",
  measurementId: "G-1XLSGG9JF0",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export async function enableAnalytics() {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;
  return getAnalytics(app);
}
