import { motion, type DragControls, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";
import { useStore } from "~/stores";

interface Props {
  children: ReactNode;
  dragControls?: DragControls;
}

export default function AppContainer({ children, dragControls }: Props) {
  const mobileCloseApp = useStore((s) => s.mobileCloseApp);

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      drag={dragControls ? "y" : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{
        top: 0,
        bottom: typeof window !== "undefined" ? window.innerHeight : 800
      }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.y > 120 || info.velocity.y > 800) mobileCloseApp();
      }}
      className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
