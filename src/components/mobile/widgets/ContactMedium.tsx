import { useStore } from "~/stores";
import WidgetFrame from "./WidgetFrame";

export default function ContactMedium() {
  const mobileOpenApp = useStore((s) => s.mobileOpenApp);

  return (
    <WidgetFrame size="small" onClick={() => mobileOpenApp("contact")}>
      <div className="p-3 h-full flex flex-col justify-between">
        <div>
          <div className="text-white text-sm font-semibold">Get in Touch</div>
          <div className="text-white/70 text-[10px] mt-0.5">메시지 보내기</div>
        </div>
        <div className="flex gap-1.5">
          <span
            className="i-fa-solid:envelope text-base text-white/90"
            aria-hidden="true"
          />
          <span
            className="i-fa-brands:github text-base text-white/90"
            aria-hidden="true"
          />
          <span
            className="i-fa-brands:instagram text-base text-white/90"
            aria-hidden="true"
          />
          <span
            className="i-fa-brands:x-twitter text-base text-white/90"
            aria-hidden="true"
          />
        </div>
      </div>
    </WidgetFrame>
  );
}
