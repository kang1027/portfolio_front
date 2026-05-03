import type { StateCreator } from "zustand";
import { enterFullScreen, exitFullScreen } from "~/utils";

export interface SystemSlice {
  dark: boolean;
  volume: number;
  brightness: number;
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  fullscreen: boolean;
  wallpaperOverride: string | null;
  toggleDark: () => void;
  toggleWIFI: () => void;
  toggleBluetooth: () => void;
  toggleAirdrop: () => void;
  toggleFullScreen: (v: boolean) => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  setWallpaperOverride: (w: string | null) => void;
}

// Determine if it should be dark mode based on current time
// Dark mode: 6 PM (18:00) to 6 AM (06:00)
// Light mode: 6 AM (06:00) to 6 PM (18:00)
const getInitialDarkMode = (): boolean => {
  const currentHour = new Date().getHours();
  return currentHour >= 18 || currentHour < 6;
};

const getInitialWallpaper = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("wallpaperOverride");
  } catch {
    return null;
  }
};

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  dark: getInitialDarkMode(),
  volume: 100,
  brightness: 80,
  wifi: true,
  bluetooth: true,
  airdrop: true,
  fullscreen: false,
  wallpaperOverride: getInitialWallpaper(),
  setWallpaperOverride: (w) => {
    try {
      if (w !== null) window.localStorage.setItem("wallpaperOverride", w);
      else window.localStorage.removeItem("wallpaperOverride");
    } catch {}
    set({ wallpaperOverride: w });
  },
  toggleDark: () =>
    set((state) => {
      if (!state.dark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { dark: !state.dark };
    }),
  toggleWIFI: () => set((state) => ({ wifi: !state.wifi })),
  toggleBluetooth: () => set((state) => ({ bluetooth: !state.bluetooth })),
  toggleAirdrop: () => set((state) => ({ airdrop: !state.airdrop })),
  toggleFullScreen: (v) =>
    set(() => {
      v ? enterFullScreen() : exitFullScreen();
      return { fullscreen: v };
    }),
  setVolume: (v) => set(() => ({ volume: v })),
  setBrightness: (v) => set(() => ({ brightness: v }))
});
