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
import StubApp from "./apps/StubApp";

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
      {!activeApp && <HomeIndicator onSwipeUp={() => {}} />}
      {lockScreenSeen && !activeApp && (
        <div className="absolute inset-0 z-0">
          <HomeScreen />
        </div>
      )}
      <AnimatePresence>
        {activeApp && activeApp !== "bear" && activeApp !== "settings" && (
          <GenericAppMobile key={activeApp} id={activeApp} />
        )}
        {activeApp === "bear" && <StubApp key="bear" name="Bear" sprintNote="Sprint 5" />}
        {activeApp === "settings" && (
          <StubApp key="settings" name="Settings" sprintNote="Sprint 6" />
        )}
      </AnimatePresence>
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
