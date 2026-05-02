import { motion, AnimatePresence } from "framer-motion";
import { useDynamicIslandAlerts } from "../hooks/useDynamicIslandAlerts";

export default function DynamicIsland() {
  const alert = useDynamicIslandAlerts();
  const expanded = !!alert;

  return (
    <motion.div
      initial={false}
      animate={
        expanded
          ? { width: 280, height: 44, borderRadius: 22 }
          : { width: 128, height: 32, borderRadius: 16 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute top-2.5 bg-black z-30 overflow-hidden flex items-center"
      style={{ left: "50%", x: "-50%" }}
    >
      <AnimatePresence mode="wait">
        {expanded && alert && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="w-full flex items-center gap-2 px-3 text-white"
          >
            {alert.art && (
              <img
                src={alert.art}
                className="w-7 h-7 rounded-md object-cover bg-white/10"
                alt=""
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{alert.title}</div>
              {alert.subtitle && (
                <div className="text-[10px] text-white/70 truncate">{alert.subtitle}</div>
              )}
            </div>
            <span
              className="i-fa-solid:music text-base text-pink-400"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
