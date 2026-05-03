import { useStore } from "~/stores";
import { websites } from "~/configs";
import WidgetFrame from "./WidgetFrame";

const SOCIALS = [
  {
    id: "my-email",
    icon: "i-fa-solid:envelope",
    fallback: "mailto:kang3171611@naver.com"
  },
  {
    id: "my-github",
    icon: "i-fa-brands:github",
    fallback: "https://github.com/kang1027"
  },
  {
    id: "my-instagram",
    icon: "i-fa-brands:instagram",
    fallback: "https://instagram.com/donghyeon179"
  },
  {
    id: "my-x",
    icon: "i-fa-brands:x-twitter",
    fallback: "https://x.com/mentis1027"
  }
];

export default function ContactMedium() {
  const mobileOpenApp = useStore((s) => s.mobileOpenApp);
  const sites =
    (websites as { favorites?: { sites?: { id: string; link: string }[] } }).favorites
      ?.sites ?? [];

  const open = (e: React.MouseEvent, id: string, fallback: string) => {
    e.stopPropagation();
    const link = sites.find((s) => s.id === id)?.link ?? fallback;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <WidgetFrame size="small" onClick={() => mobileOpenApp("contact")}>
      <div
        className="relative w-full h-full p-3 flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)"
        }}
      >
        <div>
          <div className="text-white text-sm font-semibold">Get in Touch</div>
          <div className="text-white/70 text-[10px] mt-0.5">메시지 보내기</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SOCIALS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={(e) => open(e, s.id, s.fallback)}
              aria-label={s.id}
              className="aspect-square rounded-lg bg-white/15 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <span className={`${s.icon} text-base text-white`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </WidgetFrame>
  );
}
