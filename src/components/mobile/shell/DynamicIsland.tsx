import { motion } from "framer-motion";

export default function DynamicIsland() {
  return (
    <motion.div
      layout
      className="absolute top-2.5 left-1/2 -translate-x-1/2 h-8 w-32 bg-black rounded-full z-30"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );
}
