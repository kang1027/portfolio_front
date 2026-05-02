import { motion } from "framer-motion";
import { useStore } from "~/stores";

const FAKE = [
  {
    id: "omninews",
    app: "OmniNews",
    title: "새 뉴스 12건",
    body: "Tech / 경제 카테고리 업데이트",
    time: "방금",
    icon: "/img/icons/safari.png"
  },
  {
    id: "github",
    app: "GitHub",
    title: "kang1027 starred Omni-News",
    body: "⭐ 3 new stars this week",
    time: "5분 전",
    icon: "/img/icons/github.png"
  }
];

export default function NotificationCenter() {
  const setOverlay = useStore((s) => s.setOverlay);
  return (
    <motion.div
      key="nc"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute left-0 right-0 m-3 z-45"
      style={{ top: "var(--mobile-safe-top, 12px)" }}
    >
      {FAKE.map((n) => (
        <div
          key={n.id}
          className="flex items-center gap-3 mb-2 p-3 rounded-2xl bg-black/60 backdrop-blur-2xl"
        >
          <img src={n.icon} alt="" className="w-8 h-8 rounded-md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70 uppercase">{n.app}</span>
              <span className="text-xs text-white/40">· {n.time}</span>
            </div>
            <div className="text-white text-sm font-semibold">{n.title}</div>
            <div className="text-white/80 text-xs truncate">{n.body}</div>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="text-white/70 text-xs underline mt-2"
        onClick={() => setOverlay(null)}
      >
        Close
      </button>
    </motion.div>
  );
}
