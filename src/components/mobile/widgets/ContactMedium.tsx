import { useStore } from "~/stores";
import WidgetFrame from "./WidgetFrame";

export default function ContactMedium() {
  const mobileOpenApp = useStore((s) => s.mobileOpenApp);

  return (
    <WidgetFrame size="medium" onClick={() => mobileOpenApp("contact")}>
      <div className="p-4 h-full flex flex-col justify-between">
        <div>
          <div className="text-white text-base font-semibold">Get in Touch</div>
          <div className="text-white/70 text-xs mt-0.5">메시지 보내기</div>
        </div>
        <div className="flex gap-2">
          <span className="i-fa-solid:envelope text-xl text-white/90" />
          <span className="i-fa-brands:github text-xl text-white/90" />
          <span className="i-fa-brands:instagram text-xl text-white/90" />
          <span className="i-fa-brands:x-twitter text-xl text-white/90" />
        </div>
      </div>
    </WidgetFrame>
  );
}
