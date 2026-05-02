import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";

export default function HomeIndicator() {
  const { activeApp, mobileCloseApp, setOverlay } = useStore(
    useShallow((s) => ({
      activeApp: s.activeApp,
      mobileCloseApp: s.mobileCloseApp,
      setOverlay: s.setOverlay
    }))
  );

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) {
          if (info.velocity.y <= -800) {
            // fast upward — close active app
            if (activeApp) mobileCloseApp();
          } else {
            // slow upward — only meaningful when there's an active app to switch
            if (activeApp) setOverlay("sw");
          }
        }
      }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.25 w-32 rounded-full bg-white/80 z-30 cursor-grab active:cursor-grabbing"
    />
  );
}
