import { motion, type DragControls, type PanInfo } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "~/stores";

interface Props {
  children: ReactNode;
  dragControls?: DragControls;
  showCloseButton?: boolean;
}

const getViewportHeight = () =>
  typeof window !== "undefined" ? window.innerHeight : 800;

export default function AppContainer({
  children,
  dragControls,
  showCloseButton = true
}: Props) {
  const mobileCloseApp = useStore((s) => s.mobileCloseApp);
  const [viewportH, setViewportH] = useState<number>(getViewportHeight);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", handle);
    window.addEventListener("orientationchange", handle);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("orientationchange", handle);
    };
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      drag={dragControls ? "y" : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: viewportH }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.y > 120 || info.velocity.y > 800) mobileCloseApp();
      }}
      className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          onClick={mobileCloseApp}
          aria-label="Close"
          className="absolute right-3 w-9 h-9 rounded-full bg-black/60 dark:bg-white/30 backdrop-blur-md flex items-center justify-center z-50 shadow-lg pointer-events-auto"
          style={{ top: "calc(var(--mobile-safe-top, 12px) + 8px)" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
            />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
