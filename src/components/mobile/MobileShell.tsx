import "~/styles/mobile.css";
import { AnimatePresence, motion } from "framer-motion";
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
import BearMobile from "./apps/BearMobile";
import SettingsMobile from "./apps/SettingsMobile";
import ControlCenter from "./controls/ControlCenter";
import NotificationCenter from "./controls/NotificationCenter";
import AppSwitcher from "./controls/AppSwitcher";

const SAFE_IDS = MOBILE_SAFE_APP_IDS as readonly string[];
const STUB_IDS = MOBILE_STUB_APP_IDS as readonly string[];

export default function MobileShell(_props: MacActions) {
  const {
    dark,
    wallpaperOverride,
    lockScreenSeen,
    activeApp,
    controlCenterOpen,
    notificationCenterOpen,
    appSwitcherOpen,
    setOverlay
  } = useStore(
    useShallow((s) => ({
      dark: s.dark,
      wallpaperOverride: s.wallpaperOverride,
      lockScreenSeen: s.lockScreenSeen,
      activeApp: s.activeApp,
      controlCenterOpen: s.controlCenterOpen,
      notificationCenterOpen: s.notificationCenterOpen,
      appSwitcherOpen: s.appSwitcherOpen,
      setOverlay: s.setOverlay
    }))
  );
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  const isStub = activeApp ? STUB_IDS.includes(activeApp) : false;
  const isSafe = activeApp ? SAFE_IDS.includes(activeApp) : false;
  const isBear = activeApp === "bear";
  const isSettings = activeApp === "settings";
  const showFallbackStub = !!activeApp && !isStub && !isSafe && !isBear && !isSettings;
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

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 200 }}
        dragElastic={0.2}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y > 30 || info.velocity.y > 300) setOverlay("cc");
        }}
        className="absolute top-0 right-0 w-1/2 h-12 z-50"
        style={{ touchAction: "pan-y" }}
      />

      <AnimatePresence>
        {controlCenterOpen && (
          <>
            <motion.div
              key="cc-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 z-40"
              onClick={() => setOverlay(null)}
            />
            <ControlCenter />
          </>
        )}
      </AnimatePresence>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 200 }}
        dragElastic={0.2}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y > 30 || info.velocity.y > 300) setOverlay("nc");
        }}
        className="absolute top-0 left-0 w-1/2 h-12 z-50"
        style={{ touchAction: "pan-y" }}
      />

      <AnimatePresence>
        {notificationCenterOpen && (
          <>
            <motion.div
              key="nc-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 z-40"
              onClick={() => setOverlay(null)}
            />
            <NotificationCenter />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{appSwitcherOpen && <AppSwitcher key="sw" />}</AnimatePresence>
    </div>
  );
}
