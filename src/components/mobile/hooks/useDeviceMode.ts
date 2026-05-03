import { useEffect, useState } from "react";
import { useStore } from "~/stores";

const MOBILE_BREAKPOINT = 768;

const detectAuto = (): "desktop" | "mobile" => {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < MOBILE_BREAKPOINT) return "mobile";
  const ua = navigator.userAgent || "";
  const touch = navigator.maxTouchPoints > 0;
  if (touch && /iPhone|Android|iPad|iPod/.test(ua)) return "mobile";
  return "desktop";
};

export function useDeviceMode(): "desktop" | "mobile" {
  const forced = useStore((s) => s.forcedMode);
  const [auto, setAuto] = useState(detectAuto);

  useEffect(() => {
    const handler = () => setAuto(detectAuto());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);

  if (forced === "desktop" || forced === "mobile") return forced;
  return auto;
}
