import "~/styles/mobile.css";
import { AnimatePresence, motion } from "framer-motion";
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
import BearMobile from "./apps/BearMobile";
import SettingsMobile from "./apps/SettingsMobile";
import FaceTimeMobile from "./apps/FaceTimeMobile";
import ControlCenter from "./controls/ControlCenter";
import NotificationCenter from "./controls/NotificationCenter";
import AppSwitcher from "./controls/AppSwitcher";

const SAFE_IDS = MOBILE_SAFE_APP_IDS as readonly string[];

export default function MobileShell(_props: MacActions) {
  const {
    dark,
    wallpaperOverride,
    lockScreenSeen,
    activeApp,
    controlCenterOpen,
    notificationCenterOpen,
    appSwitcherOpen,
    setOverlay,
    forcedMode,
    setForcedMode
  } = useStore(
    useShallow((s) => ({
      dark: s.dark,
      wallpaperOverride: s.wallpaperOverride,
      lockScreenSeen: s.lockScreenSeen,
      activeApp: s.activeApp,
      controlCenterOpen: s.controlCenterOpen,
      notificationCenterOpen: s.notificationCenterOpen,
      appSwitcherOpen: s.appSwitcherOpen,
      setOverlay: s.setOverlay,
      forcedMode: s.forcedMode,
      setForcedMode: s.setForcedMode
    }))
  );
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  const isSafe = activeApp ? SAFE_IDS.includes(activeApp) : false;
  const isBear = activeApp === "bear";
  const isSettings = activeApp === "settings";
  const isFacetime = activeApp === "facetime";
  const showFallbackStub =
    !!activeApp && !isSafe && !isBear && !isSettings && !isFacetime;
  const fallbackTitle = showFallbackStub
    ? apps.find((a) => a.id === activeApp)?.title ?? activeApp ?? ""
    : "";

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      <StatusBar />
      <DynamicIsland />
      {!activeApp && <HomeIndicator />}
      {lockScreenSeen && !activeApp && (
        <div className="absolute inset-0 z-0">
          <HomeScreen />
        </div>
      )}
      <AnimatePresence>
        {activeApp === "bear" && <BearMobile key="bear" />}
        {activeApp === "settings" && <SettingsMobile key="settings" />}
        {activeApp === "facetime" && <FaceTimeMobile key="facetime" />}
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

      {lockScreenSeen && !controlCenterOpen && !appSwitcherOpen && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={0.2}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 30 && info.velocity.y > 100) setOverlay("cc");
          }}
          className="absolute top-0 right-0 w-1/2 h-12 z-50"
          style={{ touchAction: "pan-y" }}
        />
      )}

      <AnimatePresence>
        {controlCenterOpen && (
          <motion.div
            key="cc-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOverlay(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{controlCenterOpen && <ControlCenter key="cc" />}</AnimatePresence>

      {lockScreenSeen && !notificationCenterOpen && !appSwitcherOpen && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={0.2}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 30 && info.velocity.y > 100) setOverlay("nc");
          }}
          className="absolute top-0 left-0 w-1/2 h-12 z-50"
          style={{ touchAction: "pan-y" }}
        />
      )}

      <AnimatePresence>
        {notificationCenterOpen && (
          <motion.div
            key="nc-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOverlay(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notificationCenterOpen && <NotificationCenter key="nc" />}
      </AnimatePresence>

      <AnimatePresence>{appSwitcherOpen && <AppSwitcher key="sw" />}</AnimatePresence>

      {forcedMode === "mobile" && (
        <button
          type="button"
          onClick={() => setForcedMode("auto")}
          className="absolute bottom-2 right-2 z-50 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-1 shadow-lg"
          aria-label="Exit mobile preview"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
            <path
              fill="currentColor"
              d="M20 18h-7v-1h7zm0-3h-7v-1h7zm0-3h-7v-1h7zm0-3h-7V8h7zM4 4h16v2H4zm0 14h7v-9H4z"
            />
          </svg>
          <span>Exit preview</span>
        </button>
      )}
    </div>
  );
}
