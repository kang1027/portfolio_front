import type { StateCreator } from "zustand";

export type DeviceMode = "desktop" | "mobile" | "auto";

export type PushFrame =
  | { view: "bear-list"; categoryId: string }
  | { view: "bear-article"; categoryId: string; mdId: string; file: string }
  | {
      view: "settings-section";
      sectionId: "display" | "wallpaper" | "sounds" | "about";
    };

export interface MobileSlice {
  forcedMode: DeviceMode;
  setForcedMode: (m: DeviceMode) => void;

  lockScreenSeen: boolean;
  unlockScreen: () => void;

  currentPage: number;
  setCurrentPage: (p: number) => void;

  activeApp: string | null;
  mobileOpenApp: (id: string) => void;
  mobileCloseApp: () => void;

  pushStack: PushFrame[];
  push: (f: PushFrame) => void;
  pop: () => void;

  controlCenterOpen: boolean;
  notificationCenterOpen: boolean;
  appSwitcherOpen: boolean;
  setOverlay: (which: "cc" | "nc" | "sw" | null) => void;
}

const getInitialLock = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("lockSeen") === "1";
  } catch {
    return false;
  }
};

const getInitialMode = (): DeviceMode => {
  if (typeof window === "undefined") return "auto";
  try {
    const v = window.localStorage.getItem("forcedMode");
    if (v === "desktop" || v === "mobile" || v === "auto") return v;
    return "auto";
  } catch {
    return "auto";
  }
};

export const createMobileSlice: StateCreator<MobileSlice> = (set) => ({
  forcedMode: getInitialMode(),
  setForcedMode: (m) => {
    try {
      window.localStorage.setItem("forcedMode", m);
    } catch {}
    set({ forcedMode: m });
  },

  lockScreenSeen: getInitialLock(),
  unlockScreen: () => {
    try {
      window.localStorage.setItem("lockSeen", "1");
    } catch {}
    set({ lockScreenSeen: true });
  },

  currentPage: 0,
  setCurrentPage: (p) => set({ currentPage: p }),

  activeApp: null,
  mobileOpenApp: (id) => set({ activeApp: id, pushStack: [] }),
  mobileCloseApp: () => set({ activeApp: null, pushStack: [] }),

  pushStack: [],
  push: (f) => set((s) => ({ pushStack: [...s.pushStack, f] })),
  pop: () => set((s) => ({ pushStack: s.pushStack.slice(0, -1) })),

  controlCenterOpen: false,
  notificationCenterOpen: false,
  appSwitcherOpen: false,
  setOverlay: (which) =>
    set({
      controlCenterOpen: which === "cc",
      notificationCenterOpen: which === "nc",
      appSwitcherOpen: which === "sw"
    })
});
