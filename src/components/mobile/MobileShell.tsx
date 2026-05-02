import "~/styles/mobile.css";
import { AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { apps, wallpapers } from "~/configs";
import {
  MOBILE_SAFE_APP_IDS,
  MOBILE_STUB_APP_IDS,
  MOBILE_STUB_APPS
} from "~/configs/mobile";
import type { MacActions } from "~/types";
import StatusBar from "./shell/StatusBar";
import DynamicIsland from "./shell/DynamicIsland";
import HomeIndicator from "./shell/HomeIndicator";
import LockScreen from "./lockscreen/LockScreen";
import HomeScreen from "./home/HomeScreen";
import GenericAppMobile from "./apps/GenericAppMobile";
import StubApp from "./apps/StubApp";

const SAFE_IDS = MOBILE_SAFE_APP_IDS as readonly string[];
const STUB_IDS = MOBILE_STUB_APP_IDS as readonly string[];

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

  const isStub = activeApp ? STUB_IDS.includes(activeApp) : false;
  const isSafe = activeApp ? SAFE_IDS.includes(activeApp) : false;
  const showFallbackStub = !!activeApp && !isStub && !isSafe;
  const fallbackTitle = showFallbackStub
    ? apps.find((a) => a.id === activeApp)?.title ?? activeApp ?? ""
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
        {MOBILE_STUB_APPS.map(
          ({ id, name, sprintNote }) =>
            activeApp === id && <StubApp key={id} name={name} sprintNote={sprintNote} />
        )}
        {activeApp && isSafe && <GenericAppMobile key={activeApp} id={activeApp} />}
        {showFallbackStub && (
          <StubApp
            key={activeApp ?? "fallback"}
            name={fallbackTitle}
            sprintNote="future sprint"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
    </div>
  );
}
