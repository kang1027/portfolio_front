import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useStore } from "~/stores";

interface Props {
  children: ReactNode;
}

export default function AppContainer({ children }: Props) {
  const mobileCloseApp = useStore((s) => s.mobileCloseApp);

  return (
    <AnimatePresence>
      <motion.div
        key="app-container"
        initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
        animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
        exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 600 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 800) mobileCloseApp();
        }}
        className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
