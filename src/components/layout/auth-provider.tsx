"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { onSessionChanged } from "@/firebase/auth";
import { listenActiveAnnouncements, listenUserProfile } from "@/firebase/firestore";
import { useAppStore } from "@/store/useAppStore";
import { UserProfile } from "@/types";

type AuthCtx = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const setPlan = useAppStore((s) => s.setPlan);
  const pushAnnouncement = useAppStore((s) => s.pushAnnouncement);
  const clearAnnouncement = useAppStore((s) => s.clearAnnouncement);

  useEffect(() => {
    const unsub = onSessionChanged((next) => {
      setUser(next);
      setLoading(false);
      if (!next) {
        setProfile(null);
        document.cookie = "kalistream_uid=; path=/; max-age=0";
        document.cookie = "kalistream_role=; path=/; max-age=0";
        return;
      }
      document.cookie = `kalistream_uid=${next.uid}; path=/; max-age=2592000`;
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = listenUserProfile(user.uid, (nextProfile) => {
      setProfile(nextProfile);
      if (nextProfile) {
        setPlan(nextProfile.role);
        document.cookie = `kalistream_role=${nextProfile.role}; path=/; max-age=2592000`;
      }
    });
    return () => unsub();
  }, [setPlan, user]);

  useEffect(() => {
    const unsub = listenActiveAnnouncements((items) => {
      const top = items[0];
      if (top?.message) pushAnnouncement(top.message);
      else clearAnnouncement();
    });
    return () => unsub();
  }, [clearAnnouncement, pushAnnouncement]);

  const value = useMemo(() => ({ user, profile, loading }), [user, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  return useContext(AuthContext);
}
