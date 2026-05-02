import "~/styles/mobile.css";
import { AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { apps, wallpapers } from "~/configs";
import { MOBILE_SAFE_APP_IDS } from "~/configs/mobile";
import type { MacActions } from "~/types";
import StatusBar from "./shell/StatusBar";
import DynamicIsland from "./shell/DynamicIsland";
import HomeIndicator from "./shell/HomeIndicator";
import LockScreen from "./lockscreen/LockScreen";
import HomeScreen from "./home/HomeScreen";
import GenericAppMobile from "./apps/GenericAppMobile";
import StubApp from "./apps/StubApp";

const SAFE_IDS = MOBILE_SAFE_APP_IDS as readonly string[];

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

  const isSafe = !!activeApp && SAFE_IDS.includes(activeApp);
  const isStubKnown = activeApp === "bear" || activeApp === "settings";
  const showFallbackStub = !!activeApp && !isStubKnown && !isSafe;
  const fallbackTitle = showFallbackStub
    ? apps.find((a) => a.id === activeApp)?.title ?? activeApp
    : "";

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
        {activeApp === "bear" && <StubApp key="bear" name="Bear" sprintNote="Sprint 5" />}
        {activeApp === "settings" && (
          <StubApp key="settings" name="Settings" sprintNote="Sprint 6" />
        )}
        {isSafe && activeApp && <GenericAppMobile key={activeApp} id={activeApp} />}
        {showFallbackStub && activeApp && (
          <StubApp key={activeApp} name={fallbackTitle} sprintNote="future sprint" />
        )}
      </AnimatePresence>
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
