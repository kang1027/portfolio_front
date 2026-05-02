import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";

const fmt = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export default function StatusBar() {
  const { wifi, bluetooth } = useStore(
    useShallow((s) => ({ wifi: s.wifi, bluetooth: s.bluetooth }))
  );
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const tick = () => setTime(fmt(new Date()));
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
    <div className="absolute top-0 left-0 right-0 h-13 px-7 flex items-center justify-between text-white text-sm font-semibold pointer-events-none">
      <div className="pl-2">{time}</div>
      <div className="flex items-center gap-1.5 pr-2">
        <span className={wifi ? "i-fa-solid:wifi" : "i-fa-solid:wifi text-white/40"} />
        {bluetooth && <span className="i-fa-brands:bluetooth-b" />}
        <span className="i-fa-solid:battery-full" />
      </div>
    </div>
  );
}
