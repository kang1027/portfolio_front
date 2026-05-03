import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { user, wallpapers, websites } from "~/configs";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";
import EdgeBackGesture from "../shell/EdgeBackGesture";
import { usePushNavigation } from "../hooks/usePushNavigation";

const NAV_TOP_PT = "calc(var(--mobile-safe-top, 12px) + 36px + 52px)";

type SectionId = "display" | "wallpaper" | "sounds" | "about";

interface SectionMeta {
  id: SectionId;
  title: string;
  icon: string;
  iconBg: string;
}

const SECTIONS: readonly SectionMeta[] = [
  {
    id: "display",
    title: "Display & Brightness",
    icon: "i-fa-solid:sun",
    iconBg: "bg-blue-500"
  },
  {
    id: "wallpaper",
    title: "Wallpaper",
    icon: "i-fa-solid:image",
    iconBg: "bg-blue-500"
  },
  {
    id: "sounds",
    title: "Sounds",
    icon: "i-fa-solid:volume-high",
    iconBg: "bg-pink-500"
  },
  {
    id: "about",
    title: "About",
    icon: "i-fa-solid:circle-info",
    iconBg: "bg-c-500"
  }
] as const;

function Root() {
  const push = useStore((s) => s.push);
  return (
    <ul className="absolute inset-0 overflow-y-auto" style={{ paddingTop: NAV_TOP_PT }}>
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => push({ view: "settings-section", sectionId: s.id })}
            className="w-full px-4 py-3.5 flex items-center gap-3 border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <span
              className={`${s.icon} text-base text-white ${s.iconBg} rounded-md w-7 h-7 flex items-center justify-center`}
              aria-hidden="true"
            />
            <span className="flex-1 text-left text-black dark:text-white">{s.title}</span>
            <span
              className="i-fa-solid:chevron-right text-sm text-c-400"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

function DisplaySection() {
  const { dark, brightness, toggleDark, setBrightness } = useStore(
    useShallow((s) => ({
      dark: s.dark,
      brightness: s.brightness,
      toggleDark: s.toggleDark,
      setBrightness: s.setBrightness
    }))
  );
  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 pb-8 text-black dark:text-white"
      style={{ paddingTop: NAV_TOP_PT }}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-xl divide-y divide-black/5 dark:divide-white/5">
        <label className="flex items-center justify-between px-4 py-3 cursor-pointer">
          <span>Dark Mode</span>
          <input type="checkbox" checked={dark} onChange={toggleDark} />
        </label>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span>Brightness</span>
            <span className="text-sm text-c-500">{brightness}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
            aria-label="Brightness"
          />
        </div>
      </div>
    </div>
  );
}

function WallpaperSection() {
  const { wallpaperOverride, setWallpaperOverride } = useStore(
    useShallow((s) => ({
      wallpaperOverride: s.wallpaperOverride,
      setWallpaperOverride: s.setWallpaperOverride
    }))
  );
  const opts: { label: string; val: string | null }[] = [
    { label: "Auto (Day/Night)", val: null },
    { label: "Day", val: wallpapers.day },
    { label: "Night", val: wallpapers.night }
  ];
  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 pb-8 text-black dark:text-white"
      style={{ paddingTop: NAV_TOP_PT }}
    >
      <div className="grid grid-cols-2 gap-3">
        {opts.map((o) => {
          const sel = wallpaperOverride === o.val;
          return (
            <button
              type="button"
              key={o.label}
              onClick={() => setWallpaperOverride(o.val)}
              aria-pressed={sel}
              className={`aspect-[3/4] rounded-2xl overflow-hidden border-2 ${
                sel ? "border-blue-500" : "border-transparent"
              } relative`}
              style={{
                backgroundImage: o.val
                  ? `url(${o.val})`
                  : "linear-gradient(135deg,#a8c0ff,#3f2b96)",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded m-2 inline-block absolute top-0 left-0">
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SoundsSection() {
  const { volume, setVolume } = useStore(
    useShallow((s) => ({
      volume: s.volume,
      setVolume: s.setVolume
    }))
  );
  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 pb-8 text-black dark:text-white"
      style={{ paddingTop: NAV_TOP_PT }}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span>Volume</span>
          <span className="text-sm text-c-500">{volume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

function AboutSection() {
  const githubLink =
    websites.favorites.sites.find((s) => s.id === "my-github")?.link ??
    "https://github.com/kang1027";
  const emailLink =
    websites.favorites.sites.find((s) => s.id === "my-email")?.link ??
    "mailto:kang3171611@naver.com";
  const githubHandle = githubLink.replace(/^https?:\/\/github\.com\//, "@");
  const emailDisplay = emailLink.replace(/^mailto:/, "");
  const displayName = user.name ?? "강동현";
  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 py-6 text-center text-black dark:text-white"
      style={{
        paddingTop: "calc(var(--mobile-safe-top, 12px) + 36px + 52px + 24px)"
      }}
    >
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-white/10">
        <img
          src="/img/photos/1.png?v2"
          alt={displayName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-xl font-semibold">{displayName}</div>
      <div className="text-sm text-c-500 mb-6">Full-stack Developer @ (주)오파크</div>
      <div className="bg-white dark:bg-neutral-800 rounded-xl divide-y divide-black/5 dark:divide-white/5 text-left">
        <a
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-3"
        >
          <span>GitHub</span>
          <span className="text-c-500">{githubHandle}</span>
        </a>
        <a href={emailLink} className="flex items-center justify-between px-4 py-3">
          <span>Email</span>
          <span className="text-c-500">{emailDisplay}</span>
        </a>
      </div>
    </div>
  );
}

export default function SettingsMobile() {
  const { pushStack, pop } = useStore(
    useShallow((s) => ({
      pushStack: s.pushStack,
      pop: s.pop
    }))
  );
  const dragControls = useDragControls();

  const { direction, handlePop, onExitComplete } = usePushNavigation(
    pushStack.length,
    pop
  );

  const top = pushStack[pushStack.length - 1] ?? null;
  const isSection = top?.view === "settings-section";

  let title = "Settings";
  let body: ReactNode = <Root />;
  let viewKey = "root";
  if (isSection) {
    const sec = SECTIONS.find((s) => s.id === top.sectionId);
    title = sec?.title ?? "";
    viewKey = `section-${top.sectionId}`;
    if (top.sectionId === "display") body = <DisplaySection />;
    else if (top.sectionId === "wallpaper") body = <WallpaperSection />;
    else if (top.sectionId === "sounds") body = <SoundsSection />;
    else if (top.sectionId === "about") body = <AboutSection />;
  }

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar
        title={title}
        dragControls={dragControls}
        left={
          isSection ? (
            <button
              type="button"
              onClick={handlePop}
              aria-label="뒤로 가기"
              className="flex items-center gap-1 text-blue-500 text-sm"
            >
              <span className="i-fa-solid:chevron-left" aria-hidden="true" />
              <span>Settings</span>
            </button>
          ) : null
        }
      />
      {isSection && <EdgeBackGesture onBack={handlePop} />}
      <AnimatePresence mode="wait" custom={direction} onExitComplete={onExitComplete}>
        <motion.div
          key={viewKey}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: -d * 60, opacity: 0 })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="absolute inset-0"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </AppContainer>
  );
}
