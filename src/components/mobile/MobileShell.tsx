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

export default function MobileShell(_props: MacActions) {
  const { dark, wallpaperOverride, lockScreenSeen, activeApp } = useStore(
    useShallow((s) => ({
      dark: s.dark,
      wallpaperOverride: s.wallpaperOverride,
      lockScreenSeen: s.lockScreenSeen,
      activeApp: s.activeApp
    }))
  );
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      <StatusBar />
      <DynamicIsland />
      <HomeIndicator onSwipeUp={() => {}} />
      {lockScreenSeen && !activeApp && <HomeScreen />}
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
