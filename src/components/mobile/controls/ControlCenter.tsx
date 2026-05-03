import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";

interface TileProps {
  icon: string;
  label: string;
  on: boolean;
  onClick: () => void;
}

function Tile({ icon, label, on, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 ${on ? "bg-blue-500 text-white" : "bg-white/15 text-white"}`}
    >
      <span className={`${icon} text-xl`} aria-hidden="true" />
      <span className="text-[10px] opacity-90">{label}</span>
    </button>
  );
}

export default function ControlCenter() {
  const s = useStore(
    useShallow((state) => ({
      wifi: state.wifi,
      bluetooth: state.bluetooth,
      airdrop: state.airdrop,
      dark: state.dark,
      volume: state.volume,
      brightness: state.brightness,
      toggleWIFI: state.toggleWIFI,
      toggleBluetooth: state.toggleBluetooth,
      toggleAirdrop: state.toggleAirdrop,
      toggleDark: state.toggleDark,
      setVolume: state.setVolume,
      setBrightness: state.setBrightness,
      mobileOpenApp: state.mobileOpenApp,
      setOverlay: state.setOverlay
    }))
  );
  return (
    <motion.div
      key="cc"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute right-0 w-[88%] max-w-[420px] m-3 rounded-3xl p-4 z-45 bg-black/60 backdrop-blur-2xl"
      style={{ top: "calc(var(--mobile-safe-top, 12px) + 44px)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-2">
        <Tile icon="i-fa-solid:wifi" label="Wi-Fi" on={s.wifi} onClick={s.toggleWIFI} />
        <Tile
          icon="i-fa-brands:bluetooth-b"
          label="BT"
          on={s.bluetooth}
          onClick={s.toggleBluetooth}
        />
        <Tile
          icon="i-fa-solid:tower-broadcast"
          label="AirDrop"
          on={s.airdrop}
          onClick={s.toggleAirdrop}
        />
        <Tile icon="i-fa-solid:moon" label="Dark" on={s.dark} onClick={s.toggleDark} />
      </div>
      <div className="mt-3 bg-white/15 rounded-2xl p-3">
        <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
          <span className="i-fa-solid:sun" aria-hidden="true" />
          <span>Brightness</span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          value={s.brightness}
          onChange={(e) => s.setBrightness(Number(e.target.value))}
          className="w-full"
          aria-label="Brightness"
        />
      </div>
      <div className="mt-3 bg-white/15 rounded-2xl p-3">
        <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
          <span className="i-fa-solid:volume-high" aria-hidden="true" />
          <span>Volume</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={s.volume}
          onChange={(e) => s.setVolume(Number(e.target.value))}
          className="w-full"
          aria-label="Volume"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          s.mobileOpenApp("settings");
          s.setOverlay(null);
        }}
        className="mt-3 w-full bg-white/15 hover:bg-white/25 transition-colors rounded-2xl py-3 flex items-center justify-center gap-2 text-white text-sm"
      >
        <span className="i-fa-solid:gear text-base" aria-hidden="true" />
        <span>Settings</span>
      </button>
    </motion.div>
  );
}
