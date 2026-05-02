import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { apps } from "~/configs";

export default function AppSwitcher() {
  const { activeApp, setOverlay, mobileCloseApp, mobileOpenApp } = useStore(
    useShallow((s) => ({
      activeApp: s.activeApp,
      setOverlay: s.setOverlay,
      mobileCloseApp: s.mobileCloseApp,
      mobileOpenApp: s.mobileOpenApp
    }))
  );
  const list = activeApp
    ? [apps.find((a) => a.id === activeApp)].filter((a): a is NonNullable<typeof a> =>
        Boolean(a)
      )
    : [];

  return (
    <motion.div
      key="sw"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute inset-0 z-45 bg-black/60 backdrop-blur-xl flex items-center justify-center"
      onClick={() => setOverlay(null)}
    >
      {list.length === 0 ? (
        <div className="text-white/70">No active apps</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4">
          {list.map((app) => (
            <div
              key={app.id}
              className="w-56 h-96 rounded-2xl bg-white/10 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between p-2">
                <button
                  type="button"
                  onClick={() => {
                    mobileOpenApp(app.id);
                    setOverlay(null);
                  }}
                  className="text-white text-xs"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    mobileCloseApp();
                    setOverlay(null);
                  }}
                  aria-label="Close app"
                  className="text-white text-xs"
                >
                  Close ✕
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img src={app.img} alt="" className="w-20 h-20 rounded-xl" />
              </div>
              <div className="text-center text-white pb-2">{app.title}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
