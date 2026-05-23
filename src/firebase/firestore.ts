import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { app } from "./config";
import { AnnouncementRecord, PaymentRecord, UserProfile } from "@/types";

export const db = getFirestore(app);

function defaultProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    username: user.displayName || user.email?.split("@")[0] || "user",
    email: user.email || "",
    avatar: user.photoURL || "",
    role: "free",
    subscriptionPlan: "free",
    subscriptionExpire: null,
    createdAt: new Date().toISOString(),
    favorites: [],
    continueWatching: [],
    watchHistory: [],
    lastLogin: new Date().toISOString(),
    userAgent: "",
    browser: "",
    device: "",
    country: "",
    ip: "",
    isBanned: false,
  };
}

export async function upsertUserProfile(user: User, metadata?: Partial<UserProfile>) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...defaultProfile(user), ...metadata });
  } else {
    await updateDoc(ref, {
      username: user.displayName || snap.data().username,
      email: user.email || snap.data().email,
      avatar: user.photoURL || snap.data().avatar || "",
      lastLogin: new Date().toISOString(),
      ...metadata,
    });
  }
}

export function listenUserProfile(uid: string, cb: (profile: UserProfile | null) => void) {
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      cb(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    () => cb(null),
  );
}

export async function addFavorite(uid: string, mediaId: number) {
  await updateDoc(doc(db, "users", uid), { favorites: arrayUnion(mediaId) });
}

export async function removeFavorite(uid: string, mediaId: number) {
  await updateDoc(doc(db, "users", uid), { favorites: arrayRemove(mediaId) });
}

export async function saveWatchProgress(uid: string, payload: { id: number; type: "movie" | "tv"; progress: number }) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const user = snap.data() as UserProfile;
  const now = new Date().toISOString();
  const nextContinue = user.continueWatching.filter((x) => x.id !== payload.id);
  nextContinue.unshift({ ...payload, updatedAt: now });
  const nextHistory = user.watchHistory.filter((x) => x.id !== payload.id);
  nextHistory.unshift({ ...payload, watchedAt: now });
  await updateDoc(ref, {
    continueWatching: nextContinue.slice(0, 30),
    watchHistory: nextHistory.slice(0, 100),
  });
}

export async function createPayment(payment: PaymentRecord) {
  await addDoc(collection(db, "payments"), { ...payment, createdAt: serverTimestamp() });
}

export function listenPendingPayments(cb: (payments: PaymentRecord[]) => void) {
  // Index-safe query: filter only, then sort client-side.
  const q = query(collection(db, "payments"), where("status", "==", "pending"), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as PaymentRecord) }))
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      cb(rows);
    },
    () => cb([]),
  );
}

export async function setPaymentStatus(paymentId: string, status: PaymentRecord["status"]) {
  await updateDoc(doc(db, "payments", paymentId), { status });
}

export async function activateSubscription(uid: string, plan: "basic" | "plus" | "ultra", days: number) {
  const expire = new Date(Date.now() + days * 86400000).toISOString();
  const role = plan === "ultra" ? "ultra" : plan;
  await updateDoc(doc(db, "users", uid), {
    subscriptionPlan: plan,
    role,
    subscriptionExpire: expire,
  });
  await addDoc(collection(db, "subscriptions"), {
    uid,
    plan,
    expiresAt: expire,
    status: "approved",
    createdAt: serverTimestamp(),
  });
}

export async function createAnnouncement(item: AnnouncementRecord) {
  await addDoc(collection(db, "announcements"), { ...item, createdAt: serverTimestamp() });
}

export function listenActiveAnnouncements(cb: (items: AnnouncementRecord[]) => void) {
  // Index-safe query: filter only, then sort client-side.
  const q = query(collection(db, "announcements"), where("active", "==", true), limit(20));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as AnnouncementRecord) }))
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
        .slice(0, 5);
      cb(rows);
    },
    () => cb([]),
  );
}

export async function getAdminStats() {
  const [users, payments, subscriptions] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "payments")),
    getDocs(collection(db, "subscriptions")),
  ]);
  const pending = payments.docs.filter((d) => d.data().status === "pending").length;
  return {
    users: users.size,
    payments: payments.size,
    pendingPayments: pending,
    subscriptions: subscriptions.size,
  };
}

export async function listRecentSubscriptions() {
  const snap = await getDocs(query(collection(db, "subscriptions"), limit(100)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    .sort((a, b) => {
      const aa = a as Record<string, unknown>;
      const bb = b as Record<string, unknown>;
      return String(bb.createdAt || "").localeCompare(String(aa.createdAt || ""));
    });
}
