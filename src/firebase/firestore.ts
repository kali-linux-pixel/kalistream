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
    lastActivity: new Date().toISOString(),
    lastIP: "",
    userAgent: "",
    browser: "",
    os: "",
    osVersion: "",
    browserVersion: "",
    device: "",
    country: "",
    countryCode: "",
    city: "",
    ip: "",
    isBanned: false,
    isVPN: false,
    onlineStatus: "offline",
    loginHistory: [],
    sessionHistory: [],
  };
}

export async function upsertUserProfile(user: User, metadata?: Partial<UserProfile>) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();
  
  if (!snap.exists()) {
    await setDoc(ref, { 
      ...defaultProfile(user), 
      lastLogin: now,
      lastActivity: now,
      ...metadata 
    });
  } else {
    const updates: Record<string, unknown> = {
      username: user.displayName || snap.data().username,
      email: user.email || snap.data().email,
      avatar: user.photoURL || snap.data().avatar || "",
      lastLogin: now,
      lastActivity: now,
      ...metadata,
    };
    
    // Agregar a loginHistory si hay datos de tracking
    if (metadata?.browser || metadata?.lastIP) {
      const loginRecord = {
        ip: metadata?.lastIP || "",
        country: metadata?.country || "",
        countryCode: metadata?.countryCode || "",
        city: metadata?.city || "",
        browser: metadata?.browser || "",
        os: metadata?.os || "",
        osVersion: metadata?.osVersion || "",
        browserVersion: metadata?.browserVersion || "",
        isVPN: metadata?.isVPN || false,
        isProxy: false,
        userAgent: metadata?.userAgent || "",
        timestamp: now,
        deviceType: metadata?.device || "desktop",
      };
      
      const currentHistory = snap.data().loginHistory || [];
      const newHistory = [loginRecord, ...currentHistory].slice(0, 50); // Max 50
      updates.loginHistory = newHistory;
    }
    
    await updateDoc(ref, updates);
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
  await addDoc(collection(db, "payment_requests"), { 
    ...payment, 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export function listenPendingPayments(cb: (payments: PaymentRecord[]) => void) {
  // Index-safe query: filter only, then sort client-side.
  const q = query(collection(db, "payment_requests"), where("status", "==", "pending"), limit(100));
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

export function listenAllPayments(cb: (payments: PaymentRecord[]) => void) {
  const q = query(collection(db, "payment_requests"), limit(500));
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

export async function setPaymentStatus(paymentId: string, status: PaymentRecord["status"], reviewedBy?: string) {
  const updates: Record<string, unknown> = { 
    status, 
    updatedAt: serverTimestamp() 
  };
  
  if (reviewedBy) {
    updates.reviewedAt = serverTimestamp();
    updates.reviewedBy = reviewedBy;
  }
  
  await updateDoc(doc(db, "payment_requests", paymentId), updates);
}

export async function approvePayment(paymentId: string, adminUid: string) {
  const payment = await getDoc(doc(db, "payment_requests", paymentId));
  if (!payment.exists()) throw new Error("Payment not found");
  
  const paymentData = payment.data() as PaymentRecord;
  const days = getDaysFromDuration(paymentData.duration);
  
  // Update payment status
  await setPaymentStatus(paymentId, "approved", adminUid);
  
  // Update user subscription
  await activateSubscription(paymentData.uid, paymentData.plan as "basic" | "plus" | "ultra", days);
  
  // Add audit log
  await addDoc(collection(db, "payment_audit"), {
    paymentId,
    action: "approved",
    adminUid,
    amount: paymentData.price,
    plan: paymentData.plan,
    duration: paymentData.duration,
    timestamp: serverTimestamp(),
    ipAddress: paymentData.ipAddress,
    userAgent: paymentData.userAgent
  });
}

export async function rejectPayment(paymentId: string, adminUid: string, reason: string) {
  const payment = await getDoc(doc(db, "payment_requests", paymentId));
  if (!payment.exists()) throw new Error("Payment not found");
  
  const paymentData = payment.data() as PaymentRecord;
  
  // Update payment status
  await updateDoc(doc(db, "payment_requests", paymentId), {
    status: "rejected",
    rejectionReason: reason,
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Add audit log
  await addDoc(collection(db, "payment_audit"), {
    paymentId,
    action: "rejected",
    adminUid,
    amount: paymentData.price,
    plan: paymentData.plan,
    duration: paymentData.duration,
    rejectionReason: reason,
    timestamp: serverTimestamp(),
    ipAddress: paymentData.ipAddress,
    userAgent: paymentData.userAgent
  });
}

function getDaysFromDuration(duration: string): number {
  switch (duration) {
    case "2 dias": return 2;
    case "1 semana": return 7;
    case "1 mes": return 30;
    case "1 ano": return 365;
    case "Ultra Elite": return 365; // 1 year for elite
    default: return 30;
  }
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
