# Mobile iPhone Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a fully interactive iPhone 15 Pro–style shell (Dynamic Island, lock screen, widgets, push navigation, control center, settings, app switcher) for mobile viewports while leaving the existing macOS desktop shell untouched.

**Architecture:** A new `MobileShell` is rendered as a sibling of `DesktopShell` under a `Shell` router that branches on `useDeviceMode()`. State is split between the existing `system` slice (shared toggles + new `wallpaperOverride`) and a new `mobile` slice (active app, push stack, page index, overlay state). All animations use framer-motion (already in deps). Existing widget/app components are reused via mobile-specific wrappers — no edits to desktop logic.

**Tech Stack:** React 18, TypeScript 5.4, Vite 5, UnoCSS, Zustand 4.5, framer-motion 11, react-rnd, react-markdown.

**Spec:** `docs/superpowers/specs/2026-05-02-mobile-iphone-shell-design.md`

**Worktree:** All implementation runs in a worktree at `../portfolio_front-mobile/` on branch `feat/mobile-iphone-shell`.

---

## File Structure

### New files (~26)

```
src/components/mobile/
├── MobileShell.tsx
├── shell/
│   ├── StatusBar.tsx
│   ├── DynamicIsland.tsx
│   ├── HomeIndicator.tsx
│   └── EdgeBackGesture.tsx
├── lockscreen/
│   ├── LockScreen.tsx
│   └── lockscreen.css
├── home/
│   ├── HomeScreen.tsx
│   ├── PageDots.tsx
│   ├── WidgetPage.tsx
│   ├── AppPage.tsx
│   └── Dock.tsx
├── widgets/
│   ├── WidgetFrame.tsx
│   ├── PhotoLarge.tsx
│   ├── MusicMedium.tsx
│   ├── WeatherSmall.tsx
│   ├── CalendarSmall.tsx
│   └── ContactMedium.tsx
├── apps/
│   ├── AppContainer.tsx
│   ├── AppNavBar.tsx
│   ├── AppIcon.tsx
│   ├── BearMobile.tsx
│   ├── SettingsMobile.tsx
│   └── GenericAppMobile.tsx
├── controls/
│   ├── ControlCenter.tsx
│   ├── NotificationCenter.tsx
│   └── AppSwitcher.tsx
└── hooks/
    ├── useDeviceMode.ts
    ├── useSwipeGesture.ts
    └── useDynamicIslandAlerts.ts

src/components/Shell.tsx              # router between desktop / mobile
src/stores/slices/mobile.ts           # mobile zustand slice
src/styles/mobile.css                 # mobile-shared base styles
```

### Modified files (~5)

```
src/App.tsx (or wherever Desktop is mounted)   # use Shell instead of Desktop directly
src/pages/Desktop.tsx                          # background calc to honor wallpaperOverride; keep otherwise unchanged
src/stores/index.ts                            # register mobile slice
src/stores/slices/system.ts                    # add wallpaperOverride/setWallpaperOverride
src/components/menus/TopBar.tsx                # add 📱 mobile-preview toggle button
```

### Out of scope to touch

- All existing widgets (`MusicWidget.tsx`, `PhotoWidget.tsx`, etc.) — reused via wrappers.
- All existing apps in `src/components/apps/` — reused inside `GenericAppMobile`/`BearMobile`.
- Routing/configs (`apps.tsx`, `bear.tsx`, etc.) — read-only in mobile shell.

---

## Sprint 0 — Shell branching, device detection, mobile preview toggle

**Goal:** From any session, page renders DesktopShell on desktop and a stub MobileShell on mobile widths. A toggle in the desktop TopBar forces mobile preview. No visual regression on desktop.

### Task 0.1: Add `wallpaperOverride` to system slice

**Files:**
- Modify: `src/stores/slices/system.ts`

- [ ] **Step 1:** Read current slice to confirm shape (already reviewed — has `dark`, `volume`, etc.).

- [ ] **Step 2:** Add `wallpaperOverride` field, initial value from `localStorage.wallpaperOverride` (null otherwise), and setter that also writes to `localStorage`.

```ts
// inside SystemSlice interface
wallpaperOverride: string | null;
setWallpaperOverride: (w: string | null) => void;

// inside createSystemSlice (alongside dark init)
const getInitialWallpaper = (): string | null => {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem('wallpaperOverride'); }
  catch { return null; }
};

// in returned object
wallpaperOverride: getInitialWallpaper(),
setWallpaperOverride: (w) => set(() => {
  try {
    if (w) window.localStorage.setItem('wallpaperOverride', w);
    else window.localStorage.removeItem('wallpaperOverride');
  } catch {}
  return { wallpaperOverride: w };
}),
```

- [ ] **Step 3:** Build to confirm TypeScript compiles.

```bash
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 4:** Commit.

```bash
git add src/stores/slices/system.ts
git commit -m "feat(system): add wallpaperOverride state with localStorage persistence"
```

### Task 0.2: Honor `wallpaperOverride` in Desktop background

**Files:**
- Modify: `src/pages/Desktop.tsx` (background style only — line ~273-278)

- [ ] **Step 1:** Pull `wallpaperOverride` from store alongside dark/brightness.

```tsx
const { dark, brightness, wallpaperOverride } = useStore((state) => ({
  dark: state.dark,
  brightness: state.brightness,
  wallpaperOverride: state.wallpaperOverride
}));
```

- [ ] **Step 2:** Use override if present in background URL.

```tsx
style={{
  backgroundImage: `url(${wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day)})`,
  filter: `brightness( ${(brightness as number) * 0.7 + 50}% )`
}}
```

- [ ] **Step 3:** Verify desktop still renders identically (no override set, fallback to existing logic). Run `pnpm dev`, visit, confirm wallpaper matches before.

- [ ] **Step 4:** Commit.

```bash
git add src/pages/Desktop.tsx
git commit -m "feat(desktop): honor wallpaperOverride in background calculation"
```

### Task 0.3: Create mobile slice

**Files:**
- Create: `src/stores/slices/mobile.ts`
- Modify: `src/stores/index.ts` (or wherever slices are combined)

- [ ] **Step 1:** Confirm existing slice combination pattern by reading `src/stores/index.ts`.

- [ ] **Step 2:** Create `mobile.ts`:

```ts
import type { StateCreator } from "zustand";

export type DeviceMode = 'desktop' | 'mobile' | 'auto';

export type PushFrame =
  | { view: 'bear-list'; categoryId: string }
  | { view: 'bear-article'; categoryId: string; mdId: string; file: string }
  | { view: 'settings-section'; sectionId: 'display' | 'wallpaper' | 'sounds' | 'about' };

export interface MobileSlice {
  forcedMode: DeviceMode;
  setForcedMode: (m: DeviceMode) => void;

  lockScreenSeen: boolean;
  unlockScreen: () => void;

  currentPage: 0 | 1;
  setCurrentPage: (p: 0 | 1) => void;

  activeApp: string | null;
  openApp: (id: string) => void;
  closeApp: () => void;

  pushStack: PushFrame[];
  push: (f: PushFrame) => void;
  pop: () => void;

  controlCenterOpen: boolean;
  notificationCenterOpen: boolean;
  appSwitcherOpen: boolean;
  setOverlay: (which: 'cc' | 'nc' | 'sw' | null) => void;
}

const getInitialLock = (): boolean => {
  if (typeof window === 'undefined') return false;
  try { return window.localStorage.getItem('lockSeen') === '1'; }
  catch { return false; }
};

const getInitialMode = (): DeviceMode => {
  if (typeof window === 'undefined') return 'auto';
  try {
    const v = window.localStorage.getItem('forcedMode');
    if (v === 'desktop' || v === 'mobile' || v === 'auto') return v;
  } catch {}
  return 'auto';
};

export const createMobileSlice: StateCreator<MobileSlice> = (set) => ({
  forcedMode: getInitialMode(),
  setForcedMode: (m) => {
    try { window.localStorage.setItem('forcedMode', m); } catch {}
    set({ forcedMode: m });
  },

  lockScreenSeen: getInitialLock(),
  unlockScreen: () => {
    try { window.localStorage.setItem('lockSeen', '1'); } catch {}
    set({ lockScreenSeen: true });
  },

  currentPage: 0,
  setCurrentPage: (p) => set({ currentPage: p }),

  activeApp: null,
  openApp: (id) => set({ activeApp: id, pushStack: [] }),
  closeApp: () => set({ activeApp: null, pushStack: [] }),

  pushStack: [],
  push: (f) => set((s) => ({ pushStack: [...s.pushStack, f] })),
  pop: () => set((s) => ({ pushStack: s.pushStack.slice(0, -1) })),

  controlCenterOpen: false,
  notificationCenterOpen: false,
  appSwitcherOpen: false,
  setOverlay: (which) => set({
    controlCenterOpen: which === 'cc',
    notificationCenterOpen: which === 'nc',
    appSwitcherOpen: which === 'sw',
  }),
});
```

- [ ] **Step 3:** Register the slice in the combined store (mirror the existing `createSystemSlice` registration).

- [ ] **Step 4:** Build.

```bash
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 5:** Commit.

```bash
git add src/stores/slices/mobile.ts src/stores/index.ts
git commit -m "feat(stores): add mobile slice with device mode, lockscreen, push stack"
```

### Task 0.4: `useDeviceMode` hook

**Files:**
- Create: `src/components/mobile/hooks/useDeviceMode.ts`

- [ ] **Step 1:** Implement the hook. Listens to resize and reads `forcedMode` from store.

```ts
import { useEffect, useState } from "react";
import { useStore } from "~/stores";

const MOBILE_BREAKPOINT = 768;

const detectAuto = (): 'desktop' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < MOBILE_BREAKPOINT) return 'mobile';
  const ua = navigator.userAgent || '';
  const touch = navigator.maxTouchPoints > 0;
  if (touch && /iPhone|Android|iPad|iPod/.test(ua)) return 'mobile';
  return 'desktop';
};

export function useDeviceMode(): 'desktop' | 'mobile' {
  const forced = useStore((s) => s.forcedMode);
  const [auto, setAuto] = useState(detectAuto);

  useEffect(() => {
    const handler = () => setAuto(detectAuto());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (forced === 'desktop' || forced === 'mobile') return forced;
  return auto;
}
```

- [ ] **Step 2:** Build.

```bash
pnpm build
```

- [ ] **Step 3:** Commit.

```bash
git add src/components/mobile/hooks/useDeviceMode.ts
git commit -m "feat(mobile): add useDeviceMode hook with auto detection + forced override"
```

### Task 0.5: `Shell` router and `MobileShell` stub

**Files:**
- Create: `src/components/Shell.tsx`
- Create: `src/components/mobile/MobileShell.tsx`
- Modify: wherever `<Desktop />` is currently mounted (likely `App.tsx`)

- [ ] **Step 1:** Find current Desktop mount point. Run:

```bash
grep -rn "<Desktop" src
```

- [ ] **Step 2:** Create `src/components/Shell.tsx`:

```tsx
import { useDeviceMode } from "~/components/mobile/hooks/useDeviceMode";
import Desktop from "~/pages/Desktop";
import MobileShell from "~/components/mobile/MobileShell";
import type { MacActions } from "~/types";

export default function Shell(props: MacActions) {
  const mode = useDeviceMode();
  if (mode === 'mobile') return <MobileShell {...props} />;
  return <Desktop {...props} />;
}
```

- [ ] **Step 3:** Create `src/components/mobile/MobileShell.tsx` stub:

```tsx
import { useStore } from "~/stores";
import type { MacActions } from "~/types";

export default function MobileShell(_props: MacActions) {
  const setForcedMode = useStore((s) => s.setForcedMode);
  return (
    <div className="size-full flex-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-semibold">Mobile shell — coming soon</div>
        <button
          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur"
          onClick={() => setForcedMode('desktop')}
        >
          Back to Desktop
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4:** Replace `<Desktop ... />` with `<Shell ... />` at the mount point.

- [ ] **Step 5:** Build + manual verify: open at >=768px → desktop; resize <768px → mobile stub shown.

```bash
pnpm dev
```

- [ ] **Step 6:** Commit.

```bash
git add src/components/Shell.tsx src/components/mobile/MobileShell.tsx <App-or-mount-file>
git commit -m "feat(mobile): add Shell router + MobileShell stub"
```

### Task 0.6: Mobile preview toggle in desktop TopBar

**Files:**
- Modify: `src/components/menus/TopBar.tsx` (right cluster, near WifiMenu/Battery)

- [ ] **Step 1:** Read current TopBar to identify the right-side icon cluster.

- [ ] **Step 2:** Add a small icon button (UnoCSS icon `i-fa-solid:mobile-screen`) to the right cluster:

```tsx
import { useStore } from "~/stores";

// inside component
const setForcedMode = useStore((s) => s.setForcedMode);

// in the right cluster JSX (find sibling of <Battery />)
<button
  className="hidden sm:inline-flex hover:bg-c-200/50 rounded px-1"
  onClick={() => setForcedMode('mobile')}
  aria-label="Preview mobile shell"
>
  <span className="i-fa-solid:mobile-screen text-base" />
</button>
```

- [ ] **Step 3:** Run dev server, click toggle on desktop → confirm mobile stub renders. Click "Back to Desktop" in stub → confirm desktop returns.

- [ ] **Step 4:** Commit.

```bash
git add src/components/menus/TopBar.tsx
git commit -m "feat(topbar): add mobile shell preview toggle"
```

**Sprint 0 done:** Shell routing works; desktop unchanged; mobile stub reachable from any device.

---

## Sprint 1 — StatusBar, DynamicIsland (static), HomeIndicator, LockScreen

**Goal:** A blank black "phone" body with status bar at top, dynamic island below it, home indicator at bottom, and a lock screen that requires a swipe-up to unlock.

### Task 1.1: Mobile base styles + safe-area scaffolding

**Files:**
- Create: `src/styles/mobile.css`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Create `mobile.css`:

```css
.mobile-shell {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.mobile-stage {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.mobile-status-bar-spacer { height: 54px; }     /* status bar zone */
.mobile-home-indicator-spacer { height: 34px; } /* bottom safe area */
```

- [ ] **Step 2:** Import `mobile.css` in `MobileShell.tsx` and replace stub body with stage scaffold:

```tsx
import "~/styles/mobile.css";
import { useStore } from "~/stores";
import { wallpapers } from "~/configs";
import type { MacActions } from "~/types";

export default function MobileShell(_props: MacActions) {
  const { dark, wallpaperOverride } = useStore((s) => ({
    dark: s.dark, wallpaperOverride: s.wallpaperOverride
  }));
  const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);

  return (
    <div className="mobile-shell">
      <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
      {/* StatusBar / DynamicIsland / HomeIndicator / LockScreen will mount here */}
    </div>
  );
}
```

- [ ] **Step 3:** Verify mobile shell shows wallpaper full-bleed.

- [ ] **Step 4:** Commit.

```bash
git add src/styles/mobile.css src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): mobile-shell base styles + wallpaper stage"
```

### Task 1.2: StatusBar

**Files:**
- Create: `src/components/mobile/shell/StatusBar.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement StatusBar:

```tsx
import { useEffect, useState } from "react";
import { useStore } from "~/stores";

const fmt = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export default function StatusBar() {
  const { wifi, bluetooth } = useStore((s) => ({ wifi: s.wifi, bluetooth: s.bluetooth }));
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(fmt(new Date())), 30 * 1000);
    return () => clearInterval(id);
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
```

- [ ] **Step 2:** Mount in `MobileShell.tsx` after `mobile-stage` div.

- [ ] **Step 3:** Verify time shows top-left, icons top-right.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/shell/StatusBar.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): StatusBar with live time + wifi/bt/battery"
```

### Task 1.3: DynamicIsland (static)

**Files:**
- Create: `src/components/mobile/shell/DynamicIsland.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement static island:

```tsx
import { motion } from "framer-motion";

export default function DynamicIsland() {
  return (
    <motion.div
      layout
      className="absolute top-2.5 left-1/2 -translate-x-1/2 h-8 w-32 bg-black rounded-full z-30"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );
}
```

- [ ] **Step 2:** Mount inside `MobileShell.tsx` after StatusBar. Set z-index/pointer-events so it sits above bg.

- [ ] **Step 3:** Verify island renders centered at top.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/shell/DynamicIsland.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): static DynamicIsland pill"
```

### Task 1.4: HomeIndicator

**Files:**
- Create: `src/components/mobile/shell/HomeIndicator.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement bar with placeholder swipe handler (real handler in Sprint 4):

```tsx
import { motion } from "framer-motion";

interface Props { onSwipeUp?: (velocity: number) => void; }

export default function HomeIndicator({ onSwipeUp }: Props) {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40 && onSwipeUp) onSwipeUp(info.velocity.y);
      }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.25 w-32 rounded-full bg-white/80 z-30 cursor-grab active:cursor-grabbing"
    />
  );
}
```

- [ ] **Step 2:** Mount in `MobileShell.tsx`. Pass empty handler for now.

- [ ] **Step 3:** Verify drag works visually (bar follows finger / mouse).

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/shell/HomeIndicator.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): HomeIndicator with drag handler"
```

### Task 1.5: LockScreen

**Files:**
- Create: `src/components/mobile/lockscreen/LockScreen.tsx`
- Create: `src/components/mobile/lockscreen/lockscreen.css`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement LockScreen:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useStore } from "~/stores";
import "./lockscreen.css";

const fmtTime = () => {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};
const fmtDate = () => {
  const d = new Date();
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${day}, ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
};

export default function LockScreen() {
  const unlock = useStore((s) => s.unlockScreen);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -window.innerHeight, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        if (info.offset.y < -120 || info.velocity.y < -500) unlock();
      }}
      animate={{ y: 0 }}
      className="lock-screen absolute inset-0 z-40 flex flex-col items-center justify-between py-24 cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col items-center pt-16">
        <div className="text-sm font-medium opacity-90">{fmtDate()}</div>
        <div className="text-8xl font-thin tracking-tight mt-2 leading-none">{fmtTime()}</div>
      </div>
      <div className="flex flex-col items-center gap-3 pb-4 opacity-90">
        <span className="i-fa-solid:chevron-up text-xl animate-bounce" />
        <span className="text-sm">{dragging ? '계속 위로' : 'swipe up to unlock'}</span>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2:** Create `lockscreen.css`:

```css
.lock-screen {
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%);
  backdrop-filter: blur(2px);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
```

- [ ] **Step 3:** Mount conditionally in `MobileShell.tsx`:

```tsx
import { AnimatePresence } from "framer-motion";
import LockScreen from "./lockscreen/LockScreen";

// inside render
const lockScreenSeen = useStore((s) => s.lockScreenSeen);

return (
  <div className="mobile-shell">
    <div className="mobile-stage" style={{ backgroundImage: `url(${bg})` }} />
    <StatusBar />
    <DynamicIsland />
    <HomeIndicator />
    <AnimatePresence>{!lockScreenSeen && <LockScreen key="lock" />}</AnimatePresence>
  </div>
);
```

- [ ] **Step 4:** Manual verify: clear localStorage, refresh on mobile width — LockScreen shows. Drag up > 120px → it disappears. Refresh again — gone.

- [ ] **Step 5:** Commit.

```bash
git add src/components/mobile/lockscreen src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): LockScreen with swipe-up unlock + first-visit gate"
```

---

## Sprint 2 — HomeScreen, PageView, Dock, AppIcon, page dots

**Goal:** Two-page swipeable home (page 0 = widget placeholders, page 1 = app grid). Dock pinned on both pages with 4 apps. Page dots indicator.

### Task 2.1: AppIcon component

**Files:**
- Create: `src/components/mobile/apps/AppIcon.tsx`

- [ ] **Step 1:** Implement icon (uses existing app icon images from `apps.tsx` config):

```tsx
import { useStore } from "~/stores";

interface Props {
  id: string;
  title: string;
  img: string;
  link?: string;
}

export default function AppIcon({ id, title, img, link }: Props) {
  const openApp = useStore((s) => s.openApp);

  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    openApp(id);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-black/30 bg-white/10">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs text-white drop-shadow-md">{title}</span>
    </button>
  );
}
```

- [ ] **Step 2:** Build to confirm.

- [ ] **Step 3:** Commit.

```bash
git add src/components/mobile/apps/AppIcon.tsx
git commit -m "feat(mobile): AppIcon component"
```

### Task 2.2: Dock

**Files:**
- Create: `src/components/mobile/home/Dock.tsx`

- [ ] **Step 1:** Implement Dock with 4 pinned apps (Bear, Safari, Contact, Github):

```tsx
import { apps } from "~/configs";
import AppIcon from "../apps/AppIcon";

const DOCK_IDS = ['bear', 'safari', 'contact', 'github'];

export default function MobileDock() {
  const dockApps = DOCK_IDS
    .map((id) => apps.find((a) => a.id === id))
    .filter(Boolean) as typeof apps;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-20">
      <div className="rounded-3xl px-3 py-2.5 bg-white/15 backdrop-blur-2xl flex justify-around">
        {dockApps.map((app) => (
          <AppIcon key={app.id} id={app.id} title="" img={app.img} link={app.link} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/home/Dock.tsx
git commit -m "feat(mobile): Dock with 4 pinned apps"
```

### Task 2.3: AppPage (grid of remaining apps)

**Files:**
- Create: `src/components/mobile/home/AppPage.tsx`

- [ ] **Step 1:** Implement grid of non-dock, non-launchpad apps:

```tsx
import { apps } from "~/configs";
import AppIcon from "../apps/AppIcon";

const DOCK_IDS = ['bear', 'safari', 'contact', 'github'];
const HIDDEN_IDS = ['launchpad'];

export default function AppPage() {
  const gridApps = apps.filter(
    (a) => !DOCK_IDS.includes(a.id) && !HIDDEN_IDS.includes(a.id)
  );
  // Add Settings as a virtual app icon (built in Sprint 6, but shown now)
  const items = [
    ...gridApps,
    { id: 'settings', title: 'Settings', img: '/img/icons/settings.png' as string, link: undefined as string | undefined }
  ];

  return (
    <div className="px-6 pt-20 grid grid-cols-4 gap-y-6 gap-x-3">
      {items.map((app) => (
        <AppIcon key={app.id} id={app.id} title={app.title} img={app.img} link={app.link} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2:** Add a Settings icon image. Since this project uses iconify icons, use a placeholder for now (Sprint 6 may swap):

```bash
# Not creating a binary; we'll reference a UnoCSS icon via background trick.
# Update AppIcon if needed: if `img` starts with "icon:", render <span className={img.slice(5)} />
```

For pragmatism, implement settings icon inline: edit `AppIcon.tsx` to render UnoCSS class when `img.startsWith('icon:')`:

```tsx
// inside AppIcon.tsx
{img.startsWith('icon:') ? (
  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex-center">
    <span className={`${img.slice(5)} text-3xl text-white`} />
  </div>
) : (
  <img src={img} alt={title} className="w-full h-full object-cover" />
)}
```

Then in `AppPage.tsx`, set settings: `img: 'icon:i-fa-solid:gear'`.

- [ ] **Step 3:** Build + verify.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/home/AppPage.tsx src/components/mobile/apps/AppIcon.tsx
git commit -m "feat(mobile): AppPage grid + Settings virtual icon support"
```

### Task 2.4: PageDots indicator

**Files:**
- Create: `src/components/mobile/home/PageDots.tsx`

- [ ] **Step 1:** Implement:

```tsx
interface Props { count: number; current: number; }

export default function PageDots({ count, current }: Props) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i === current ? 'bg-white' : 'bg-white/40'}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/home/PageDots.tsx
git commit -m "feat(mobile): PageDots indicator"
```

### Task 2.5: WidgetPage stub + HomeScreen with horizontal swipe

**Files:**
- Create: `src/components/mobile/home/WidgetPage.tsx` (stub for now)
- Create: `src/components/mobile/home/HomeScreen.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Stub WidgetPage:

```tsx
export default function WidgetPage() {
  return (
    <div className="px-4 pt-16 flex flex-col gap-4">
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-72 flex-center text-white/70">Photo widget (S3)</div>
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">Music widget (S3)</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">Weather</div>
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">Cal</div>
      </div>
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl h-32 flex-center text-white/70">Contact widget (S3)</div>
    </div>
  );
}
```

- [ ] **Step 2:** Implement HomeScreen with framer-motion drag-snap:

```tsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "~/stores";
import WidgetPage from "./WidgetPage";
import AppPage from "./AppPage";
import MobileDock from "./Dock";
import PageDots from "./PageDots";

const PAGE_COUNT = 2;

export default function HomeScreen() {
  const { currentPage, setCurrentPage } = useStore((s) => ({
    currentPage: s.currentPage, setCurrentPage: s.setCurrentPage
  }));
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  return (
    <>
      <motion.div
        className="absolute inset-0 flex"
        animate={{ x: -currentPage * width }}
        transition={{ type: "spring", stiffness: 250, damping: 30 }}
        drag="x"
        dragConstraints={{ left: -width * (PAGE_COUNT - 1), right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          const threshold = width / 4;
          if (info.offset.x < -threshold && currentPage < PAGE_COUNT - 1) {
            setCurrentPage((currentPage + 1) as 0 | 1);
          } else if (info.offset.x > threshold && currentPage > 0) {
            setCurrentPage((currentPage - 1) as 0 | 1);
          }
        }}
        style={{ width: width * PAGE_COUNT }}
      >
        <div style={{ width }} className="overflow-y-auto"><WidgetPage /></div>
        <div style={{ width }} className="overflow-y-auto"><AppPage /></div>
      </motion.div>
      <PageDots count={PAGE_COUNT} current={currentPage} />
      <MobileDock />
    </>
  );
}
```

- [ ] **Step 3:** Mount in `MobileShell.tsx` (only when unlocked AND no active app):

```tsx
const activeApp = useStore((s) => s.activeApp);
// after StatusBar/DynamicIsland/HomeIndicator
{lockScreenSeen && !activeApp && <HomeScreen />}
```

- [ ] **Step 4:** Verify horizontal swipe works, dots update, dock visible on both pages.

- [ ] **Step 5:** Commit.

```bash
git add src/components/mobile/home/HomeScreen.tsx src/components/mobile/home/WidgetPage.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): HomeScreen with swipe-snap pages + dock + dots"
```

---

## Sprint 3 — WidgetFrame and 5 widget wrappers

**Goal:** Page 0 shows real widgets (Photo 4×4, Music 4×2, Weather 2×2, Calendar 2×2, Contact 4×2) using existing widget logic, wrapped in iOS-style frosted-glass cards.

### Task 3.1: WidgetFrame

**Files:**
- Create: `src/components/mobile/widgets/WidgetFrame.tsx`

- [ ] **Step 1:**

```tsx
import { ReactNode } from "react";

type Size = 'small' | 'medium' | 'large';
const SIZE_CLASS: Record<Size, string> = {
  small: 'col-span-2 aspect-square',
  medium: 'col-span-4 aspect-[2/1]',
  large: 'col-span-4 aspect-square'
};

interface Props {
  size: Size;
  children: ReactNode;
  onClick?: () => void;
}

export default function WidgetFrame({ size, children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`${SIZE_CLASS[size]} rounded-3xl bg-white/10 backdrop-blur-2xl shadow-lg shadow-black/20 overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/widgets/WidgetFrame.tsx
git commit -m "feat(mobile): WidgetFrame with small/medium/large variants"
```

### Task 3.2: PhotoLarge widget

**Files:**
- Create: `src/components/mobile/widgets/PhotoLarge.tsx`
- (No edit to existing PhotoWidget.tsx)

- [ ] **Step 1:** Reimplement minimal photo slideshow inside WidgetFrame:

```tsx
import { useEffect, useState } from "react";
import WidgetFrame from "./WidgetFrame";

const VERSION = 'v2';
const PHOTOS = [`/img/photos/1.png?${VERSION}`, `/img/photos/2.png?${VERSION}`, `/img/photos/3.png?${VERSION}`];

export default function PhotoLarge() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <WidgetFrame size="large">
      <div className="relative w-full h-full">
        {PHOTOS.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
          />
        ))}
      </div>
    </WidgetFrame>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/widgets/PhotoLarge.tsx
git commit -m "feat(mobile): PhotoLarge widget with auto-rotate"
```

### Task 3.3: MusicMedium widget

**Files:**
- Create: `src/components/mobile/widgets/MusicMedium.tsx`

- [ ] **Step 1:** Subscribe to existing `nowPlayingService` to get live track info:

```tsx
import { useEffect, useState } from "react";
import WidgetFrame from "./WidgetFrame";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";

export default function MusicMedium() {
  const [np, setNp] = useState<NowPlayingResponse | null>(null);
  useEffect(() => nowPlayingService.subscribe(setNp), []);

  const track = np?.track;
  const title = track?.title ?? 'Now Playing';
  const artist = track?.artist ?? '—';
  const art = track?.albumArt ?? '/img/icons/music.png';

  return (
    <WidgetFrame size="medium">
      <div className="flex items-center gap-3 p-3 h-full">
        <img src={art} alt="" className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-white text-base font-semibold truncate">{title}</div>
          <div className="text-white/70 text-sm truncate">{artist}</div>
        </div>
      </div>
    </WidgetFrame>
  );
}
```

If `nowPlayingService` exposes a different track shape, adjust property accesses to match (verify via `Read` of `src/services/nowPlayingService.ts` before finalizing).

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/widgets/MusicMedium.tsx
git commit -m "feat(mobile): MusicMedium widget with live nowPlaying"
```

### Task 3.4: WeatherSmall, CalendarSmall, ContactMedium

**Files:**
- Create: `src/components/mobile/widgets/WeatherSmall.tsx`
- Create: `src/components/mobile/widgets/CalendarSmall.tsx`
- Create: `src/components/mobile/widgets/ContactMedium.tsx`

- [ ] **Step 1:** WeatherSmall — subscribe to existing `weatherService`:

```tsx
import { useEffect, useState } from "react";
import WidgetFrame from "./WidgetFrame";
import { weatherService, type WeatherData } from "~/services/weatherService";

export default function WeatherSmall() {
  const [w, setW] = useState<WeatherData | null>(null);
  useEffect(() => weatherService.subscribe(setW), []);
  return (
    <WidgetFrame size="small">
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="text-white text-xs opacity-80">{w?.location ?? '—'}</div>
        <div className="text-white text-3xl font-light">{w ? `${Math.round(w.temp)}°` : '--°'}</div>
        <div className="text-white text-xs">{w?.condition ?? ''}</div>
      </div>
    </WidgetFrame>
  );
}
```

(Verify `WeatherData` field names against `src/services/weatherService.ts`.)

- [ ] **Step 2:** CalendarSmall:

```tsx
import WidgetFrame from "./WidgetFrame";

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export default function CalendarSmall() {
  const d = new Date();
  return (
    <WidgetFrame size="small">
      <div className="p-3 h-full flex flex-col">
        <div className="text-red-500 text-xs font-semibold">{MONTHS[d.getMonth()]}</div>
        <div className="text-white text-5xl font-light leading-none mt-1">{d.getDate()}</div>
        <div className="text-white/70 text-xs mt-auto">No events today</div>
      </div>
    </WidgetFrame>
  );
}
```

- [ ] **Step 3:** ContactMedium:

```tsx
import { useStore } from "~/stores";
import WidgetFrame from "./WidgetFrame";

export default function ContactMedium() {
  const openApp = useStore((s) => s.openApp);
  return (
    <WidgetFrame size="medium" onClick={() => openApp('contact')}>
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
```

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/widgets/WeatherSmall.tsx src/components/mobile/widgets/CalendarSmall.tsx src/components/mobile/widgets/ContactMedium.tsx
git commit -m "feat(mobile): Weather/Calendar/Contact widget wrappers"
```

### Task 3.5: Wire widgets into WidgetPage

**Files:**
- Modify: `src/components/mobile/home/WidgetPage.tsx`

- [ ] **Step 1:** Replace stubs with real widgets in 4-col grid:

```tsx
import PhotoLarge from "../widgets/PhotoLarge";
import MusicMedium from "../widgets/MusicMedium";
import WeatherSmall from "../widgets/WeatherSmall";
import CalendarSmall from "../widgets/CalendarSmall";
import ContactMedium from "../widgets/ContactMedium";

export default function WidgetPage() {
  return (
    <div className="px-4 pt-16 grid grid-cols-4 gap-3 pb-44">
      <PhotoLarge />
      <WeatherSmall />
      <CalendarSmall />
      <MusicMedium />
      <ContactMedium />
    </div>
  );
}
```

- [ ] **Step 2:** Verify visual layout matches Spec Section 3 / Decision #4.

- [ ] **Step 3:** Commit.

```bash
git add src/components/mobile/home/WidgetPage.tsx
git commit -m "feat(mobile): wire real widgets into WidgetPage"
```

---

## Sprint 4 — AppContainer, GenericAppMobile, AppNavBar, open/close spring

**Goal:** Tapping a non-Bear/non-Settings app icon zooms a full-screen container open from the icon's position; close by swipe-up or X button.

### Task 4.1: AppNavBar

**Files:**
- Create: `src/components/mobile/apps/AppNavBar.tsx`

- [ ] **Step 1:**

```tsx
import { ReactNode } from "react";

interface Props {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}

export default function AppNavBar({ title, left, right }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 h-13 px-4 flex items-center justify-between z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
      <div className="w-16">{left}</div>
      <div className="flex-1 text-center text-base font-semibold truncate text-black dark:text-white">{title}</div>
      <div className="w-16 flex justify-end">{right}</div>
    </div>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/apps/AppNavBar.tsx
git commit -m "feat(mobile): AppNavBar"
```

### Task 4.2: AppContainer with spring open/close

**Files:**
- Create: `src/components/mobile/apps/AppContainer.tsx`

- [ ] **Step 1:**

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useStore } from "~/stores";

interface Props { children: ReactNode; }

export default function AppContainer({ children }: Props) {
  const closeApp = useStore((s) => s.closeApp);

  return (
    <AnimatePresence>
      <motion.div
        key="app-container"
        initial={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
        animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
        exit={{ scale: 0.6, opacity: 0, borderRadius: 28 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 600 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 800) closeApp();
        }}
        className="absolute inset-0 z-30 bg-white dark:bg-neutral-900 overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/apps/AppContainer.tsx
git commit -m "feat(mobile): AppContainer with spring open/close + drag-to-dismiss"
```

### Task 4.3: GenericAppMobile + dispatch in MobileShell

**Files:**
- Create: `src/components/mobile/apps/GenericAppMobile.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement generic wrapper (renders existing app component inside container with NavBar):

```tsx
import { apps } from "~/configs";
import { useStore } from "~/stores";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";

interface Props { id: string; }

export default function GenericAppMobile({ id }: Props) {
  const closeApp = useStore((s) => s.closeApp);
  const app = apps.find((a) => a.id === id);
  if (!app || !app.content) return null;

  return (
    <AppContainer>
      <AppNavBar
        title={app.title}
        right={
          <button onClick={closeApp} className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex-center">
            <span className="i-fa-solid:xmark text-sm" />
          </button>
        }
      />
      <div className="absolute inset-0 pt-13 overflow-auto">{app.content}</div>
    </AppContainer>
  );
}
```

- [ ] **Step 2:** In `MobileShell.tsx`, dispatch active app:

```tsx
import GenericAppMobile from "./apps/GenericAppMobile";

const activeApp = useStore((s) => s.activeApp);

// Render inside main shell, after HomeScreen mount block
{activeApp && activeApp !== 'bear' && activeApp !== 'settings' && (
  <GenericAppMobile id={activeApp} />
)}
```

- [ ] **Step 3:** Verify: tap Safari icon (or any app icon) → app zooms in. Drag down or X to close.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/apps/GenericAppMobile.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): GenericAppMobile dispatch + open/close flow"
```

---

## Sprint 5 — BearMobile (push navigation)

**Goal:** Bear app, when launched on mobile, shows Categories list. Tap → Articles list. Tap → Article view. Back via NavBar button or left-edge swipe.

### Task 5.1: BearMobile categories view

**Files:**
- Create: `src/components/mobile/apps/BearMobile.tsx`
- Modify: `src/components/mobile/MobileShell.tsx` (route bear to BearMobile)

- [ ] **Step 1:** Implement categories view (top of push stack):

```tsx
import { useStore } from "~/stores";
import { bear } from "~/configs";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";

function CategoriesView() {
  const push = useStore((s) => s.push);
  return (
    <ul className="absolute inset-0 pt-13 overflow-y-auto">
      {bear.map((cat) => (
        <li key={cat.id}>
          <button
            onClick={() => push({ view: 'bear-list', categoryId: cat.id })}
            className="w-full px-4 py-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <span className={`${cat.icon} text-xl text-red-500`} />
            <span className="flex-1 text-left text-black dark:text-white">{cat.title}</span>
            <span className="i-fa-solid:chevron-right text-sm text-c-400" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function BearMobile() {
  const closeApp = useStore((s) => s.closeApp);
  return (
    <AppContainer>
      <AppNavBar
        title="Bear"
        right={
          <button onClick={closeApp} className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex-center">
            <span className="i-fa-solid:xmark text-sm" />
          </button>
        }
      />
      <CategoriesView />
    </AppContainer>
  );
}
```

- [ ] **Step 2:** In `MobileShell.tsx`, route `activeApp === 'bear'` to BearMobile:

```tsx
{activeApp === 'bear' && <BearMobile />}
```

- [ ] **Step 3:** Verify: tap Bear → categories list shown.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/apps/BearMobile.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): BearMobile root with category list"
```

### Task 5.2: ListView and ArticleView with push stack render

**Files:**
- Modify: `src/components/mobile/apps/BearMobile.tsx`

- [ ] **Step 1:** Add ListView + ArticleView and dispatch by top-of-stack:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
// ... existing imports

function ListView({ categoryId }: { categoryId: string }) {
  const cat = bear.find((c) => c.id === categoryId);
  const push = useStore((s) => s.push);
  if (!cat) return null;
  return (
    <ul className="absolute inset-0 pt-13 overflow-y-auto">
      {cat.md.map((m) => (
        <li key={m.id}>
          <button
            onClick={() => push({ view: 'bear-article', categoryId, mdId: m.id, file: m.file })}
            className="w-full px-4 py-3 text-left border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <div className="text-black dark:text-white font-semibold">{m.title}</div>
            <div className="text-c-500 text-sm mt-0.5 line-clamp-2">{m.excerpt}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ArticleView({ file }: { file: string }) {
  const [text, setText] = useState<string>('');
  useEffect(() => {
    fetch(file).then(r => r.text()).then(setText).catch(() => setText('Failed to load.'));
  }, [file]);
  return (
    <div className="absolute inset-0 pt-13 overflow-y-auto px-4 py-4 bear">
      <div className="markdown text-black dark:text-white max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
```

(For full markdown plugin parity with desktop, optionally use the same plugin set. Pragmatic: start with plain ReactMarkdown to avoid coupling, upgrade in S8 polish if needed.)

- [ ] **Step 2:** Replace single `<CategoriesView />` with stack-driven render and slide animation:

```tsx
export default function BearMobile() {
  const { pushStack, pop, closeApp } = useStore((s) => ({
    pushStack: s.pushStack, pop: s.pop, closeApp: s.closeApp
  }));
  const top = pushStack[pushStack.length - 1] ?? null;

  let title = 'Bear';
  let body: JSX.Element = <CategoriesView />;
  if (top?.view === 'bear-list') {
    const cat = bear.find((c) => c.id === top.categoryId);
    title = cat?.title ?? 'List';
    body = <ListView categoryId={top.categoryId} />;
  } else if (top?.view === 'bear-article') {
    const cat = bear.find((c) => c.id === top.categoryId);
    title = cat?.md.find(m => m.id === top.mdId)?.title ?? 'Article';
    body = <ArticleView file={top.file} />;
  }

  return (
    <AppContainer>
      <AppNavBar
        title={title}
        left={
          pushStack.length > 0 ? (
            <button onClick={pop} className="flex items-center gap-1 text-blue-500 text-sm">
              <span className="i-fa-solid:chevron-left" />
              <span>Back</span>
            </button>
          ) : null
        }
        right={
          <button onClick={closeApp} className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex-center">
            <span className="i-fa-solid:xmark text-sm" />
          </button>
        }
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={top ? `${top.view}-${('mdId' in top) ? top.mdId : top.categoryId}` : 'root'}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="absolute inset-0"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </AppContainer>
  );
}
```

- [ ] **Step 3:** Verify drill-down: tap category → list appears with slide; tap article → markdown body appears; Back → pops with slide.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/apps/BearMobile.tsx
git commit -m "feat(mobile): BearMobile push stack with list + article + slide trans"
```

### Task 5.3: Left-edge swipe back gesture

**Files:**
- Create: `src/components/mobile/shell/EdgeBackGesture.tsx`
- Modify: `src/components/mobile/apps/BearMobile.tsx` and `SettingsMobile.tsx` (later) — both consume

- [ ] **Step 1:** Implement edge gesture:

```tsx
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export default function EdgeBackGesture({ onBack }: Props) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 60 || info.velocity.x > 400) onBack();
      }}
      className="absolute top-13 left-0 bottom-12 w-5 z-30"
      style={{ touchAction: 'pan-x' }}
    />
  );
}
```

- [ ] **Step 2:** In `BearMobile.tsx`, mount it when pushStack non-empty:

```tsx
import EdgeBackGesture from "../shell/EdgeBackGesture";
// inside AppContainer, before the AnimatePresence:
{pushStack.length > 0 && <EdgeBackGesture onBack={pop} />}
```

- [ ] **Step 3:** Verify: drill into article → drag from left edge to right → pops.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/shell/EdgeBackGesture.tsx src/components/mobile/apps/BearMobile.tsx
git commit -m "feat(mobile): left-edge swipe back gesture for push stacks"
```

---

## Sprint 6 — SettingsMobile

**Goal:** Settings app with 4 sections (Display & Brightness / Wallpaper / Sounds / About). Each control writes back to the system slice.

### Task 6.1: Settings root + Display section

**Files:**
- Create: `src/components/mobile/apps/SettingsMobile.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement Settings root + push to subsection + Display section:

```tsx
import { useStore } from "~/stores";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";
import { motion, AnimatePresence } from "framer-motion";
import EdgeBackGesture from "../shell/EdgeBackGesture";

const SECTIONS = [
  { id: 'display' as const, title: 'Display & Brightness', icon: 'i-fa-solid:sun' },
  { id: 'wallpaper' as const, title: 'Wallpaper',          icon: 'i-fa-solid:image' },
  { id: 'sounds' as const,   title: 'Sounds',              icon: 'i-fa-solid:volume-high' },
  { id: 'about' as const,    title: 'About',               icon: 'i-fa-solid:circle-info' },
];

function Root() {
  const push = useStore((s) => s.push);
  return (
    <ul className="absolute inset-0 pt-13 overflow-y-auto">
      {SECTIONS.map((s) => (
        <li key={s.id}>
          <button
            onClick={() => push({ view: 'settings-section', sectionId: s.id })}
            className="w-full px-4 py-3.5 flex items-center gap-3 border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <span className={`${s.icon} text-base text-white bg-blue-500 rounded-md w-7 h-7 flex-center`} />
            <span className="flex-1 text-left text-black dark:text-white">{s.title}</span>
            <span className="i-fa-solid:chevron-right text-sm text-c-400" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function DisplaySection() {
  const { dark, brightness, toggleDark, setBrightness } = useStore((s) => ({
    dark: s.dark, brightness: s.brightness, toggleDark: s.toggleDark, setBrightness: s.setBrightness
  }));
  return (
    <div className="absolute inset-0 pt-13 overflow-y-auto px-4 py-4 text-black dark:text-white">
      <div className="bg-white dark:bg-neutral-800 rounded-xl divide-y divide-black/5 dark:divide-white/5">
        <label className="flex items-center justify-between px-4 py-3">
          <span>Dark Mode</span>
          <input type="checkbox" checked={dark} onChange={toggleDark} />
        </label>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span>Brightness</span><span className="text-sm text-c-500">{brightness}%</span>
          </div>
          <input
            type="range" min={20} max={100} value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function SettingsMobile() {
  const { pushStack, pop, closeApp } = useStore((s) => ({
    pushStack: s.pushStack, pop: s.pop, closeApp: s.closeApp
  }));
  const top = pushStack[pushStack.length - 1] ?? null;

  let title = 'Settings';
  let body: JSX.Element = <Root />;
  if (top?.view === 'settings-section') {
    const sec = SECTIONS.find(s => s.id === top.sectionId);
    title = sec?.title ?? '';
    if (top.sectionId === 'display') body = <DisplaySection />;
    // wallpaper / sounds / about added in Tasks 6.2 / 6.3 / 6.4
  }

  return (
    <AppContainer>
      <AppNavBar
        title={title}
        left={pushStack.length > 0 ? (
          <button onClick={pop} className="flex items-center gap-1 text-blue-500 text-sm">
            <span className="i-fa-solid:chevron-left" />
            <span>{title === 'Settings' ? '' : 'Settings'}</span>
          </button>
        ) : null}
        right={
          <button onClick={closeApp} className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex-center">
            <span className="i-fa-solid:xmark text-sm" />
          </button>
        }
      />
      {pushStack.length > 0 && <EdgeBackGesture onBack={pop} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={top ? `${top.view}-${(top as any).sectionId ?? 'root'}` : 'root'}
          initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="absolute inset-0"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </AppContainer>
  );
}
```

- [ ] **Step 2:** Mount in `MobileShell.tsx`:

```tsx
{activeApp === 'settings' && <SettingsMobile />}
```

- [ ] **Step 3:** Verify: tap Settings (icon from S2) → list of 4 sections → tap Display → toggle dark/slider — confirm desktop shell also reflects change (toggle to desktop and verify).

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/apps/SettingsMobile.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): SettingsMobile root + Display section"
```

### Task 6.2: Wallpaper, Sounds, About sections

**Files:**
- Modify: `src/components/mobile/apps/SettingsMobile.tsx`

- [ ] **Step 1:** Inside SettingsMobile add:

```tsx
import { wallpapers } from "~/configs";

function WallpaperSection() {
  const { wallpaperOverride, setWallpaperOverride } = useStore((s) => ({
    wallpaperOverride: s.wallpaperOverride, setWallpaperOverride: s.setWallpaperOverride
  }));
  const opts = [
    { label: 'Auto (Day/Night)', val: null },
    { label: 'Day',              val: wallpapers.day },
    { label: 'Night',            val: wallpapers.night },
  ];
  return (
    <div className="absolute inset-0 pt-13 overflow-y-auto px-4 py-4 text-black dark:text-white">
      <div className="grid grid-cols-2 gap-3">
        {opts.map((o) => {
          const sel = wallpaperOverride === o.val;
          return (
            <button
              key={o.label}
              onClick={() => setWallpaperOverride(o.val)}
              className={`aspect-[3/4] rounded-2xl overflow-hidden border-2 ${sel ? 'border-blue-500' : 'border-transparent'}`}
              style={{
                backgroundImage: o.val ? `url(${o.val})` : 'linear-gradient(135deg,#a8c0ff,#3f2b96)',
                backgroundSize: 'cover'
              }}
            >
              <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded m-2 inline-block">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SoundsSection() {
  const { volume, setVolume } = useStore((s) => ({ volume: s.volume, setVolume: s.setVolume }));
  return (
    <div className="absolute inset-0 pt-13 overflow-y-auto px-4 py-4 text-black dark:text-white">
      <div className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span>Volume</span><span className="text-sm text-c-500">{volume}%</span>
        </div>
        <input
          type="range" min={0} max={100} value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="absolute inset-0 pt-13 overflow-y-auto px-4 py-6 text-center text-black dark:text-white">
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3">
        <img src="/img/photos/1.png?v2" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="text-xl font-semibold">강동현</div>
      <div className="text-sm text-c-500 mb-6">Full-stack Developer</div>
      <div className="bg-white dark:bg-neutral-800 rounded-xl divide-y divide-black/5 dark:divide-white/5">
        <a href="https://github.com/kang1027" target="_blank" rel="noreferrer"
           className="flex items-center justify-between px-4 py-3">
          <span>GitHub</span><span className="text-c-500">@kang1027</span>
        </a>
        <a href="mailto:kang3171611@naver.com"
           className="flex items-center justify-between px-4 py-3">
          <span>Email</span><span className="text-c-500">kang3171611@naver.com</span>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Add the dispatch branches for `wallpaper`/`sounds`/`about` in `SettingsMobile`:

```tsx
if (top.sectionId === 'display') body = <DisplaySection />;
else if (top.sectionId === 'wallpaper') body = <WallpaperSection />;
else if (top.sectionId === 'sounds') body = <SoundsSection />;
else if (top.sectionId === 'about') body = <AboutSection />;
```

- [ ] **Step 3:** Verify all four sections render and Wallpaper change is reflected on shell background (close Settings, see new wallpaper).

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/apps/SettingsMobile.tsx
git commit -m "feat(mobile): SettingsMobile Wallpaper/Sounds/About sections"
```

---

## Sprint 7 — ControlCenter, NotificationCenter, AppSwitcher

**Goal:** Edge gestures from top-right and top-left invoke overlays. App switcher accessible via slow upward swipe on home indicator.

### Task 7.1: ControlCenter

**Files:**
- Create: `src/components/mobile/controls/ControlCenter.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:**

```tsx
import { motion } from "framer-motion";
import { useStore } from "~/stores";

function Tile({ icon, label, on, onClick }: { icon: string; label: string; on: boolean; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 ${on ? 'bg-blue-500 text-white' : 'bg-white/15 text-white'}`}
    >
      <span className={`${icon} text-xl`} />
      <span className="text-[10px] opacity-90">{label}</span>
    </button>
  );
}

export default function ControlCenter() {
  const s = useStore();
  return (
    <motion.div
      key="cc"
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute top-0 right-0 w-[88%] max-w-[420px] m-3 rounded-3xl p-4 z-40 bg-black/60 backdrop-blur-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-2">
        <Tile icon="i-fa-solid:wifi" label="Wi-Fi" on={s.wifi} onClick={s.toggleWIFI} />
        <Tile icon="i-fa-brands:bluetooth-b" label="BT" on={s.bluetooth} onClick={s.toggleBluetooth} />
        <Tile icon="i-fa-solid:tower-broadcast" label="AirDrop" on={s.airdrop} onClick={s.toggleAirdrop} />
        <Tile icon="i-fa-solid:moon" label="Dark" on={s.dark} onClick={s.toggleDark} />
      </div>
      <div className="mt-3 bg-white/15 rounded-2xl p-3">
        <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
          <span className="i-fa-solid:sun" /><span>Brightness</span>
        </div>
        <input type="range" min={20} max={100} value={s.brightness}
               onChange={(e) => s.setBrightness(Number(e.target.value))} className="w-full" />
      </div>
      <div className="mt-3 bg-white/15 rounded-2xl p-3">
        <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
          <span className="i-fa-solid:volume-high" /><span>Volume</span>
        </div>
        <input type="range" min={0} max={100} value={s.volume}
               onChange={(e) => s.setVolume(Number(e.target.value))} className="w-full" />
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2:** In `MobileShell.tsx`, add a top-right invisible "swipe area" that opens CC:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import ControlCenter from "./controls/ControlCenter";

const { setOverlay, controlCenterOpen } = useStore((s) => ({
  setOverlay: s.setOverlay, controlCenterOpen: s.controlCenterOpen
}));

// inside shell render
<motion.div
  drag="y" dragConstraints={{ top: 0, bottom: 200 }} dragElastic={0.2}
  onDragEnd={(_, info) => { if (info.offset.y > 30 || info.velocity.y > 300) setOverlay('cc'); }}
  className="absolute top-0 right-0 w-1/2 h-12 z-50"
  style={{ touchAction: 'pan-y' }}
/>
<AnimatePresence>
  {controlCenterOpen && (
    <>
      <motion.div
        key="cc-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 z-35"
        onClick={() => setOverlay(null)}
      />
      <ControlCenter />
    </>
  )}
</AnimatePresence>
```

- [ ] **Step 3:** Verify: swipe down from top-right → CC shows, all toggles work and reflect in desktop too. Tap outside → close.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/controls/ControlCenter.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): ControlCenter overlay with system toggles"
```

### Task 7.2: NotificationCenter (with fake notifications)

**Files:**
- Create: `src/components/mobile/controls/NotificationCenter.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`

- [ ] **Step 1:** Implement:

```tsx
import { motion } from "framer-motion";
import { useStore } from "~/stores";

const FAKE = [
  { id: 'omninews', app: 'OmniNews', title: '새 뉴스 12건', body: 'Tech / 경제 카테고리 업데이트', time: '방금', icon: '/img/icons/safari.png' },
  { id: 'github',   app: 'GitHub',   title: 'kang1027 starred Omni-News', body: '⭐ 3 new stars this week', time: '5분 전', icon: '/img/icons/github.png' },
];

export default function NotificationCenter() {
  const setOverlay = useStore((s) => s.setOverlay);
  return (
    <motion.div
      key="nc"
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="absolute top-0 left-0 right-0 m-3 z-40"
    >
      {FAKE.map((n) => (
        <div key={n.id} className="flex items-center gap-3 mb-2 p-3 rounded-2xl bg-black/60 backdrop-blur-2xl">
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
        className="text-white/70 text-xs underline mt-2"
        onClick={() => setOverlay(null)}
      >
        Close
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2:** In `MobileShell.tsx`, add top-left swipe area + overlay render:

```tsx
const notificationCenterOpen = useStore((s) => s.notificationCenterOpen);

<motion.div
  drag="y" dragConstraints={{ top: 0, bottom: 200 }} dragElastic={0.2}
  onDragEnd={(_, info) => { if (info.offset.y > 30 || info.velocity.y > 300) setOverlay('nc'); }}
  className="absolute top-0 left-0 w-1/2 h-12 z-50"
  style={{ touchAction: 'pan-y' }}
/>
<AnimatePresence>
  {notificationCenterOpen && (
    <>
      <motion.div
        key="nc-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 z-35"
        onClick={() => setOverlay(null)}
      />
      <NotificationCenter />
    </>
  )}
</AnimatePresence>
```

- [ ] **Step 3:** Verify swipe-down from top-left → NC.

- [ ] **Step 4:** Commit.

```bash
git add src/components/mobile/controls/NotificationCenter.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): NotificationCenter with fake notifications"
```

### Task 7.3: AppSwitcher (slow upward swipe)

**Files:**
- Create: `src/components/mobile/controls/AppSwitcher.tsx`
- Modify: `src/components/mobile/MobileShell.tsx`, `HomeIndicator.tsx`

- [ ] **Step 1:** Implement switcher. For v1, show a card representing currently-active app (or empty state if none). Future v2 = full multi-task.

```tsx
import { motion } from "framer-motion";
import { useStore } from "~/stores";
import { apps } from "~/configs";

export default function AppSwitcher() {
  const { activeApp, setOverlay, closeApp, openApp } = useStore((s) => ({
    activeApp: s.activeApp, setOverlay: s.setOverlay, closeApp: s.closeApp, openApp: s.openApp
  }));
  const list = activeApp ? [apps.find(a => a.id === activeApp)].filter(Boolean) : [];

  return (
    <motion.div
      key="sw"
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="absolute inset-0 z-45 bg-black/60 backdrop-blur-xl flex items-center justify-center"
      onClick={() => setOverlay(null)}
    >
      {list.length === 0 ? (
        <div className="text-white/70">No active apps</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto px-4">
          {list.map((app) => app && (
            <div key={app.id} className="w-56 h-96 rounded-2xl bg-white/10 overflow-hidden flex flex-col">
              <div className="flex justify-between p-2">
                <button onClick={(e) => { e.stopPropagation(); openApp(app.id); setOverlay(null); }}
                        className="text-white text-xs">Open</button>
                <button onClick={(e) => { e.stopPropagation(); closeApp(); setOverlay(null); }}
                        className="text-white text-xs">Close ✕</button>
              </div>
              <div className="flex-1 flex-center">
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
```

- [ ] **Step 2:** Modify `HomeIndicator.tsx` to differentiate slow vs fast upswipe:

```tsx
import { motion } from "framer-motion";
import { useStore } from "~/stores";

export default function HomeIndicator() {
  const { activeApp, closeApp, setOverlay } = useStore((s) => ({
    activeApp: s.activeApp, closeApp: s.closeApp, setOverlay: s.setOverlay
  }));
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) {
          if (info.velocity.y <= -800) {
            if (activeApp) closeApp();
          } else {
            setOverlay('sw');
          }
        }
      }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.25 w-32 rounded-full bg-white/80 z-30 cursor-grab active:cursor-grabbing"
    />
  );
}
```

- [ ] **Step 3:** Mount AppSwitcher in `MobileShell.tsx`:

```tsx
const appSwitcherOpen = useStore((s) => s.appSwitcherOpen);
<AnimatePresence>{appSwitcherOpen && <AppSwitcher />}</AnimatePresence>
```

- [ ] **Step 4:** Verify: open Bear, slowly swipe up on home indicator → switcher with Bear card; tap "Close" → returns home.

- [ ] **Step 5:** Commit.

```bash
git add src/components/mobile/controls/AppSwitcher.tsx src/components/mobile/shell/HomeIndicator.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(mobile): AppSwitcher with slow vs fast upswipe distinction"
```

---

## Sprint 8 — DynamicIsland music morph + polish

**Goal:** Island morphs to show currently playing track when music is playing; tap returns to default. Misc polish (haptics-style press feedback if any, mobile.css tweaks).

### Task 8.1: useDynamicIslandAlerts hook

**Files:**
- Create: `src/components/mobile/hooks/useDynamicIslandAlerts.ts`

- [ ] **Step 1:** Subscribe to `audioPreviewService` + `nowPlayingService` to derive an alert state:

```ts
import { useEffect, useState } from "react";
import { nowPlayingService, type NowPlayingResponse } from "~/services/nowPlayingService";

export interface IslandAlert {
  kind: 'music';
  title: string;
  subtitle: string;
  art?: string;
}

export function useDynamicIslandAlerts(): IslandAlert | null {
  const [a, setA] = useState<IslandAlert | null>(null);
  useEffect(() => nowPlayingService.subscribe((np: NowPlayingResponse | null) => {
    if (np?.isPlaying && np.track) {
      setA({
        kind: 'music',
        title: np.track.title,
        subtitle: np.track.artist ?? '',
        art: np.track.albumArt
      });
    } else {
      setA(null);
    }
  }), []);
  return a;
}
```

(Verify field names against `nowPlayingService.ts`. If shape differs, adjust accordingly.)

- [ ] **Step 2:** Commit.

```bash
git add src/components/mobile/hooks/useDynamicIslandAlerts.ts
git commit -m "feat(mobile): useDynamicIslandAlerts hook subscribed to nowPlaying"
```

### Task 8.2: DynamicIsland morph

**Files:**
- Modify: `src/components/mobile/shell/DynamicIsland.tsx`

- [ ] **Step 1:** Replace static pill with morph:

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useDynamicIslandAlerts } from "../hooks/useDynamicIslandAlerts";

export default function DynamicIsland() {
  const alert = useDynamicIslandAlerts();
  const expanded = !!alert;

  return (
    <motion.div
      layout
      initial={false}
      animate={expanded
        ? { width: 280, height: 44, borderRadius: 22 }
        : { width: 128, height: 32, borderRadius: 16 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black z-30 overflow-hidden flex items-center"
      style={{ x: '-50%' }}
    >
      <AnimatePresence>
        {expanded && alert && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full flex items-center gap-2 px-3 text-white"
          >
            {alert.art && <img src={alert.art} className="w-7 h-7 rounded-md object-cover" alt="" />}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{alert.title}</div>
              <div className="text-[10px] text-white/70 truncate">{alert.subtitle}</div>
            </div>
            <span className="i-fa-solid:music text-base text-pink-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2:** Verify: trigger music preview play (via Music widget tap, if existing service supports it) → island morphs.

- [ ] **Step 3:** Commit.

```bash
git add src/components/mobile/shell/DynamicIsland.tsx
git commit -m "feat(mobile): DynamicIsland morph to show now-playing track"
```

### Task 8.3: Polish pass

**Files:**
- Modify: `src/styles/mobile.css`, possibly tweaks across mobile components

- [ ] **Step 1:** Add tap feedback CSS utility (active scale already on icons; add to widget cards):

```css
.tap-feedback { transition: transform 120ms ease-out; }
.tap-feedback:active { transform: scale(0.97); }
```

Apply to `WidgetFrame` clickable variant, AppIcon, dock items.

- [ ] **Step 2:** Tweak status bar / island spacing if visually off (verify in DevTools at 390x844 iPhone 14 Pro size).

- [ ] **Step 3:** Verify no console errors during all interactions.

- [ ] **Step 4:** Commit.

```bash
git add src/styles/mobile.css src/components/mobile
git commit -m "polish(mobile): tap feedback + spacing tweaks"
```

---

## Sprint 9 — Build, manual QA, optional Playwright

**Goal:** Production build clean, full QA checklist passed, optionally a single Playwright happy-path script for regression.

### Task 9.1: Production build + lint

- [ ] **Step 1:** Run build:

```bash
pnpm build
```

Expected: Build succeeds. If TS errors surface in mobile code, fix inline (do not relax `tsconfig`).

- [ ] **Step 2:** Lint:

```bash
pnpm lint
```

Expected: No errors. Fix warnings introduced by mobile code (best effort).

- [ ] **Step 3:** Commit any fixups.

```bash
git add -A
git commit -m "fix(mobile): build/lint cleanup"
```

### Task 9.2: Manual QA checklist

Run `pnpm dev` and verify each in Chrome DevTools (iPhone 14 Pro frame):

- [ ] First load on mobile width → LockScreen visible
- [ ] Drag up on LockScreen → unlocks, HomeScreen page 0 visible
- [ ] Reload → LockScreen skipped (localStorage)
- [ ] Swipe right→left on home → page 1 (apps); dots reflect
- [ ] Page 0 widgets render (Photo cycles, Music shows track if service has data, Weather/Calendar/Contact static)
- [ ] Tap any dock app → zoom-in spring
- [ ] Tap Bear → categories list; tap category → list; tap article → markdown body; Back button works; left-edge swipe works
- [ ] Tap Settings → Display toggle dark → desktop also reflects when toggled to desktop
- [ ] Wallpaper change → mobile + desktop both updated
- [ ] Sounds slider, About sub-page render
- [ ] Swipe down from top-right → ControlCenter, all toggles function
- [ ] Swipe down from top-left → NotificationCenter (2 fake notifications)
- [ ] Slow swipe up on home indicator (in Bear) → AppSwitcher with Bear card
- [ ] Fast swipe up on home indicator (in any app) → returns home
- [ ] Resize >=768px → DesktopShell; toggle in TopBar → MobileShell preview
- [ ] DesktopShell visually unchanged from main branch (bear.tsx and Desktop.tsx untouched aside from background line)

Mark each as passing in the checklist. If anything fails, file a fix commit and re-run.

### Task 9.3 (optional): Playwright smoke test via MCP

If Playwright MCP is available in this session:

- [ ] **Step 1:** Navigate to `http://localhost:5173/` with mobile emulation.
- [ ] **Step 2:** Click LockScreen unlock area, verify HomeScreen visible.
- [ ] **Step 3:** Click Bear icon, click first category, click first article, verify markdown loaded.
- [ ] **Step 4:** Press Back, Back, X — return to home.
- [ ] **Step 5:** Capture screenshot for the record.

If no Playwright available, skip.

### Task 9.4: Final merge prep

- [ ] **Step 1:** Push branch:

```bash
git push -u origin feat/mobile-iphone-shell
```

- [ ] **Step 2:** Open PR or fast-forward merge into main per user preference. (Hand-off to user — do NOT push to main without confirmation.)

---

## Self-Review Notes

**Spec coverage (cross-check against `2026-05-02-mobile-iphone-shell-design.md`):**
- Decision 1 (Dynamic Island) → Task 1.3 + 8.2
- Decision 2 (auto detect + toggle) → Task 0.4 + 0.6
- Decision 3 (2 pages with dots) → Task 2.4 + 2.5
- Decision 4 (Photo large + others) → Task 3.5 layout + Tasks 3.2–3.4 widgets
- Decision 5 (Bear/Safari/Contact/Github dock) → Task 2.2
- Decision 6 (CC + mini Settings) → Tasks 6.1–6.2 + 7.1
- Decision 7 (Bear push nav) → Tasks 5.1–5.3
- Decision 8 (1-time lock screen) → Task 1.5 + mobile slice `lockScreenSeen`
- Notification Center → Task 7.2
- App Switcher → Task 7.3
- Edge back gesture → Task 5.3
- Dynamic Island music morph → Task 8.2
- Acceptance criteria (Spec §12): each one is covered above; QA checklist (Task 9.2) maps 1:1.

**Risks (Spec §13) addressed:**
- framer-motion learning → exercised early in S0/S1, fail fast
- Touch+mouse → framer-motion handles, verified in QA at desktop preview
- Widget wrapping mismatch → bypassed by re-implementing widget bodies in mobile (no positional coupling)
- Dynamic class purge → all classes used are static / from existing safelist

**Post-self-review fixes applied:**
- Removed mobile-slice `wallpaper` field from earlier draft (uses `system.wallpaperOverride` per spec §4.4)
- Velocity threshold for swipe-up-fast set to `-800` per spec §7
- Added explicit pop chevron text guard in SettingsMobile to avoid empty Back label at root

**Open notes for execution:**
- Verify exact field names of `nowPlayingService` / `weatherService` before coding Tasks 3.3 / 3.4 / 8.1.
- Confirm `<Desktop />` mount location (Step 0.5 begins with a grep) — likely `src/App.tsx`.
- Bear markdown styling on mobile re-uses the existing `.bear .markdown` CSS rules; ensure the wrapper element gets both `bear` and `markdown` class names.
