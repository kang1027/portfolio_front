import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "~/stores";
import "./lockscreen.css";

const fmtTime = () => {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const fmtDate = () => {
  const d = new Date();
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  return `${day}, ${d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
};

export default function LockScreen() {
  const unlock = useStore((s) => s.unlockScreen);
  const [dragging, setDragging] = useState(false);
  const [time, setTime] = useState(fmtTime);
  const [date, setDate] = useState(fmtDate);

  useEffect(() => {
    const tick = () => {
      setTime(fmtTime());
      setDate(fmtDate());
    };
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      drag="y"
      dragConstraints={{ top: -9999, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        if (info.offset.y < -120 || info.velocity.y < -500) unlock();
      }}
      className="lock-screen absolute inset-0 z-40 flex flex-col items-center justify-between py-24 cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col items-center pt-16">
        <div className="text-sm font-medium opacity-90">{date}</div>
        <div className="text-8xl font-thin tracking-tight mt-2 leading-none">{time}</div>
      </div>
      <div className="flex flex-col items-center gap-3 pb-4 opacity-90">
        <span className="i-fa-solid:chevron-up text-xl animate-bounce" />
        <span className="text-sm">{dragging ? "계속 위로" : "swipe up to unlock"}</span>
      </div>
    </motion.div>
  );
}
