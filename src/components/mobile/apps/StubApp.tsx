import { motion } from "framer-motion";
import { useStore } from "~/stores";

interface Props {
  name: string;
  sprintNote: string;
}

export default function StubApp({ name, sprintNote }: Props) {
  const mobileCloseApp = useStore((s) => s.mobileCloseApp);
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-900/95 text-white gap-4"
    >
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-sm text-white/60">Coming in {sprintNote}</div>
      <button
        type="button"
        onClick={mobileCloseApp}
        className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur"
      >
        Close
      </button>
    </motion.div>
  );
}
