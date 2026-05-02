import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AppContainer({ children }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
