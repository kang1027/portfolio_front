import "~/styles/mobile.css";
import { AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { wallpapers } from "~/configs";
import type { MacActions } from "~/types";
import StatusBar from "./shell/StatusBar";
import DynamicIsland from "./shell/DynamicIsland";
import HomeIndicator from "./shell/HomeIndicator";
import LockScreen from "./lockscreen/LockScreen";
import HomeScreen from "./home/HomeScreen";
import GenericAppMobile from "./apps/GenericAppMobile";

export default function MobileShell(_props: MacActions) {
  const { dark, wallpaperOverride, lockScreenSeen, activeApp, mobileCloseApp } = useStore(
    useShallow((s) => ({
      dark: s.dark,
      wallpaperOverride: s.wallpaperOverride,
      lockScreenSeen: s.lockScreenSeen,
      activeApp: s.activeApp,
      mobileCloseApp: s.mobileCloseApp
    }))
  );
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      <StatusBar />
      <DynamicIsland />
      <HomeIndicator onSwipeUp={() => {}} />
      {lockScreenSeen && !activeApp && (
        <div className="absolute inset-0 z-0">
          <HomeScreen />
        </div>
      )}
      {activeApp && activeApp !== "bear" && activeApp !== "settings" && (
        <GenericAppMobile id={activeApp} />
      )}
      {activeApp === "bear" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-900/95 text-white gap-4">
          <div className="text-xl font-semibold">Bear (Sprint 5)</div>
          <button
            onClick={mobileCloseApp}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur"
          >
            Close
          </button>
        </div>
      )}
      {activeApp === "settings" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-900/95 text-white gap-4">
          <div className="text-xl font-semibold">Settings (Sprint 6)</div>
          <button
            onClick={mobileCloseApp}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur"
          >
            Close
          </button>
        </div>
      )}
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
