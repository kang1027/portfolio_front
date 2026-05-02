import "~/styles/mobile.css";
import { useStore } from "~/stores";
import { wallpapers } from "~/configs";
import type { MacActions } from "~/types";
import StatusBar from "./shell/StatusBar";

export default function MobileShell(_props: MacActions) {
  const { dark, wallpaperOverride } = useStore((s) => ({
    dark: s.dark,
    wallpaperOverride: s.wallpaperOverride
  }));
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      <StatusBar />
      {/* DynamicIsland / HomeIndicator / LockScreen mount here */}
    </div>
  );
}
