import "~/styles/mobile.css";
import { AnimatePresence } from "framer-motion";
import { useStore } from "~/stores";
import { wallpapers } from "~/configs";
import type { MacActions } from "~/types";
import StatusBar from "./shell/StatusBar";
import DynamicIsland from "./shell/DynamicIsland";
import HomeIndicator from "./shell/HomeIndicator";
import LockScreen from "./lockscreen/LockScreen";

export default function MobileShell(_props: MacActions) {
  const { dark, wallpaperOverride, lockScreenSeen } = useStore((s) => ({
    dark: s.dark,
    wallpaperOverride: s.wallpaperOverride,
    lockScreenSeen: s.lockScreenSeen
  }));
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      <StatusBar />
      <DynamicIsland />
      <HomeIndicator onSwipeUp={() => {}} />
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
