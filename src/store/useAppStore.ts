"use client";

import { create } from "zustand";
import { PlanType } from "@/types";

type AppState = {
  plan: PlanType;
  freeViewsUsedToday: number;
  progressByMedia: Record<string, number>;
  cinematicMode: boolean;
  autoplay: boolean;
  autoNext: boolean;
  subtitleSize: number;
  subtitlePosition: number;
  subtitleColor: string;
  subtitleOpacity: number;
  announcement: string | null;
  setPlan: (plan: PlanType) => void;
  incrementFreeViews: () => void;
  setProgress: (mediaId: string, progress: number) => void;
  toggleCinematicMode: () => void;
  setAutoplay: (enabled: boolean) => void;
  setAutoNext: (enabled: boolean) => void;
  setSubtitleStyle: (input: Partial<Pick<AppState, "subtitleSize" | "subtitlePosition" | "subtitleColor" | "subtitleOpacity">>) => void;
  pushAnnouncement: (message: string) => void;
  clearAnnouncement: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  plan: "free",
  freeViewsUsedToday: 0,
  progressByMedia: {},
  cinematicMode: false,
  autoplay: true,
  autoNext: true,
  subtitleSize: 20,
  subtitlePosition: 8,
  subtitleColor: "#ffffff",
  subtitleOpacity: 95,
  announcement: null,
  setPlan: (plan) => set({ plan }),
  incrementFreeViews: () =>
    set((state) => ({ freeViewsUsedToday: state.freeViewsUsedToday + 1 })),
  setProgress: (mediaId, progress) =>
    set((state) => ({ progressByMedia: { ...state.progressByMedia, [mediaId]: progress } })),
  toggleCinematicMode: () => set((state) => ({ cinematicMode: !state.cinematicMode })),
  setAutoplay: (enabled) => set({ autoplay: enabled }),
  setAutoNext: (enabled) => set({ autoNext: enabled }),
  setSubtitleStyle: (input) => set((state) => ({ ...state, ...input })),
  pushAnnouncement: (message) => set({ announcement: message }),
  clearAnnouncement: () => set({ announcement: null }),
}));
