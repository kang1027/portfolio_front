import { useStore } from "~/stores";
import { websites } from "~/configs";
import WidgetFrame from "./WidgetFrame";

const SOCIALS = [
  {
    id: "my-email",
    icon: "i-fa-solid:envelope" as string | null,
    fallback: "mailto:kang3171611@naver.com"
  },
  {
    id: "my-github",
    icon: "i-fa-brands:github" as string | null,
    fallback: "https://github.com/kang1027"
  },
  {
    id: "my-instagram",
    icon: "i-fa-brands:instagram" as string | null,
    fallback: "https://instagram.com/donghyeon179"
  },
  {
    id: "my-x",
    icon: null as string | null,
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
              {s.icon ? (
                <span className={`${s.icon} text-base text-white`} aria-hidden="true" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </WidgetFrame>
  );
}
