# Mobile iPhone Shell — Design Spec

- **Date**: 2026-05-02
- **Project**: portfolio_front (https://kang1027.com)
- **Owner**: kang1027
- **Status**: Approved (pending implementation)
- **Implementation branch**: `feat/mobile-iphone-shell`

## 1. Goal

데스크톱 방문자에게 macOS 메타포로 보이는 현재 포트폴리오를, **모바일 방문자에게는 진짜 iPhone(15 Pro 류, Dynamic Island)** 처럼 보이게 한다. 데스크톱 사용자도 모바일 모드를 토글로 미리볼 수 있어야 하고, 기존 데스크톱 경험은 1픽셀도 손상되지 않아야 한다.

콘텐츠(About/Experience/Projects/Skills 마크다운) · 위젯(Music/Photo/Weather/Calendar/Contact) · 시스템 토글(다크/볼륨/밝기/wifi 등)은 동일한 zustand 스토어를 공유해 양쪽 모드에서 일관되게 동작한다.

## 2. Non-Goals

- iPhone 잠금화면 카메라/플래시 단축 같은 시스템 기능 흉내
- 진짜 iOS 알림 푸시 (가짜 알림 1~2개만 데모용)
- 다국어 i18n 신규 도입 (현재 ko/en 패턴 유지)
- 풀 Settings.app 구현 (4섹션만: Display / Wallpaper / Sounds / About)
- E2E 테스트 인프라 신규 도입 (Playwright MCP 1 시나리오만 수동 검증)
- 데스크톱 코드 리팩토링 (`src/pages/Desktop.tsx` 외 변경 금지)

## 3. Decisions Summary

| # | 항목 | 선택 |
|---|------|------|
| 1 | iPhone 비주얼 스타일 | Dynamic Island (iPhone 15 Pro / 16 Pro 류) |
| 2 | 셸 감지 | 자동 뷰포트 감지(`< 768px`) + 데스크톱 토글 |
| 3 | 홈스크린 구성 | 2페이지 분리 (위젯 / 앱), 좌우 스와이프 + page dots |
| 4 | 위젯 1페이지 레이아웃 | Photo 4×4 large + Weather/Calendar 2×2 + Music 4×2 + Contact 4×2 |
| 5 | 도크 핀 4개 | Bear · Safari · Contact · Github |
| 6 | 설정 깊이 | Control Center + 미니 Settings 앱 (4 섹션) |
| 7 | Bear 모바일 | iOS Push Navigation (카테고리 → 글 목록 → 본문) |
| 8 | 진입 연출 | 첫 방문 1회만 LockScreen (localStorage 게이트) |

추가 풀세트 항목 (별도 결정 없이 디폴트):
- Notification Center (좌상단 스와이프 다운, 가짜 알림 1~2개)
- App Switcher (홈 인디케이터 위로 스와이프, 카드 스택)
- 좌측 엣지 스와이프 백 (push stack pop 트리거)
- Dynamic Island 음악 모핑 (audioPreviewService 구독)

## 4. Architecture

### 4.1 Entry routing

현재 `src/pages/Desktop.tsx` 가 단일 셸. 진입점에 **`Shell` 라우터** 한 겹을 추가해 모드 분기.

```
Boot → Login → AdminSetup → Shell
                              ├─ DesktopShell  (현재 Desktop.tsx, 그대로)
                              └─ MobileShell   (신규)
```

### 4.2 모드 감지

신규 훅 `src/hooks/useDeviceMode.ts`:

- `forcedMode: 'desktop' | 'mobile' | 'auto'` 가 system slice 에 있으면 그것을 우선
- `auto` 인 경우:
  - `window.innerWidth < 768` → mobile
  - 또는 `navigator.maxTouchPoints > 0 && /iPhone|Android|iPad/.test(navigator.userAgent)` → mobile
  - 그 외 → desktop
- `resize` 이벤트 구독해 reactively 갱신
- 데스크톱 TopBar 우측에 📱 아이콘 → 클릭 시 `forcedMode = 'mobile'` 토글

### 4.3 State

기존 system slice **재사용**: `dark`, `volume`, `brightness`, `wifi`, `bluetooth`, `airdrop`, `fullscreen`, `toggleDark`, … (그대로 동작)

신규 `src/stores/slices/mobile.ts`:

```ts
interface MobileSlice {
  forcedMode: 'desktop' | 'mobile' | 'auto';
  setForcedMode: (m) => void;

  lockScreenSeen: boolean;            // localStorage hydrated
  unlockScreen: () => void;

  currentPage: 0 | 1;                 // 0: 위젯, 1: 앱
  setCurrentPage: (p) => void;

  activeApp: string | null;           // 풀스크린 앱 id
  openApp: (id: string) => void;
  closeApp: () => void;

  pushStack: PushFrame[];             // Bear/Settings 드릴다운
  push: (f: PushFrame) => void;
  pop: () => void;

  controlCenterOpen: boolean;
  notificationCenterOpen: boolean;
  appSwitcherOpen: boolean;
}

type PushFrame =
  | { view: 'bear-list'; categoryId: string }
  | { view: 'bear-article'; categoryId: string; mdId: string; file: string }
  | { view: 'settings-section'; sectionId: 'display' | 'wallpaper' | 'sounds' | 'about' };
```

`localStorage.lockSeen = '1'` 으로 잠금화면 1회 표시 보장.

### 4.4 Wallpaper (system slice 확장)

Wallpaper override 는 데스크톱·모바일 양쪽에 동일하게 적용되어야 하므로 **`system` slice 에 추가** (모바일 전용 아님).

```ts
// system slice 신규 필드
wallpaperOverride: string | null;   // null 이면 dark 기준 자동
setWallpaperOverride: (w: string | null) => void;
```

`localStorage.wallpaperOverride` 로 영속. 사용 시 `dark`/`day` 자동 선택 위에 덮어씀:

```ts
const bg = wallpaperOverride ?? (dark ? wallpapers.night : wallpapers.day);
```

Desktop.tsx 의 background 계산식 1줄 변경, MobileShell 도 동일 식 사용.

## 5. Component Tree

신규 디렉토리 `src/components/mobile/` 아래 약 25 개 파일. 기존 위젯/앱 컴포넌트는 그대로 두고 wrapping.

```
src/components/mobile/
├── MobileShell.tsx              # entry, 잠금→홈→앱 라우팅
├── shell/
│   ├── StatusBar.tsx            # 상단 시계/배터리/wifi (다크모드 자동)
│   ├── DynamicIsland.tsx        # 알약, 음악 재생 시 모핑/확장
│   ├── HomeIndicator.tsx        # 하단 바, 위 스와이프 핸들러
│   └── EdgeBackGesture.tsx      # 좌측 엣지 백 트리거
├── lockscreen/
│   ├── LockScreen.tsx           # 시계 큼지막 + "swipe up" 인디케이터
│   └── lockscreen.css
├── home/
│   ├── HomeScreen.tsx           # PageView + Dock 컨테이너
│   ├── PageDots.tsx
│   ├── WidgetPage.tsx           # 1p 위젯 그리드
│   ├── AppPage.tsx              # 2p 앱 그리드
│   └── Dock.tsx                 # 하단 4슬롯
├── widgets/
│   ├── WidgetFrame.tsx          # iOS 카드 chrome (rounded-3xl + glass)
│   ├── PhotoLarge.tsx           # 4×4
│   ├── MusicMedium.tsx          # 4×2
│   ├── WeatherSmall.tsx         # 2×2
│   ├── CalendarSmall.tsx        # 2×2
│   └── ContactMedium.tsx        # 4×2
├── apps/
│   ├── AppContainer.tsx         # 풀스크린 컨테이너 + 열기/닫기 spring
│   ├── AppNavBar.tsx            # iOS 네비바
│   ├── AppIcon.tsx              # 홈/도크 아이콘
│   ├── BearMobile.tsx           # 카테고리→글목록→본문 push stack
│   ├── SettingsMobile.tsx       # 4 섹션
│   └── GenericAppMobile.tsx     # Safari/Terminal/Typora/VSCode/Contact/FaceTime 풀스크린 wrapper
├── controls/
│   ├── ControlCenter.tsx        # 우상단 스와이프 다운
│   ├── NotificationCenter.tsx   # 좌상단 스와이프 다운
│   └── AppSwitcher.tsx          # 홈 인디케이터 위 스와이프
└── hooks/
    ├── useDeviceMode.ts
    ├── useSwipeGesture.ts
    └── useDynamicIslandAlerts.ts
```

각 파일의 책임은 단일하며 200줄 이내 유지가 목표.

## 6. Data Flow

```
[ App ]
  └── Shell (useDeviceMode() 분기)
        ├── DesktopShell (기존, 무변경)
        └── MobileShell
              ├── system slice (공유: dark/volume/brightness/wifi…)
              ├── mobile slice (전용)
              └── DynamicIsland 가 audioPreviewService 구독
                    재생 시 island 안에 곡명/아트워크 morph
```

**Settings.app → system slice 직결 매핑.**

| 섹션 | 컨트롤 | system slice 액션 |
|------|--------|-------------------|
| Display & Brightness | dark toggle, brightness slider | `toggleDark`, `setBrightness` |
| Wallpaper | 갤러리에서 day/night/custom 선택 | `system.setWallpaperOverride` |
| Sounds | volume slider | `setVolume` |
| About | 정적 콘텐츠 (사진, 이름, 직업, GitHub 링크) | (read-only) |

**Bear push stack 흐름.**
- 카테고리 탭 → `push({view: 'bear-list', categoryId})`
- 글 탭 → `push({view: 'bear-article', mdId, file})`
- 좌측 엣지 스와이프 또는 백 버튼 → `pop()`
- 푸시/팝 모두 framer-motion `<AnimatePresence>` + slide x 트랜지션

## 7. 인터랙션 명세

| 제스처 | 위치 | 동작 |
|--------|------|------|
| 좌우 스와이프 | 홈 | 위젯 페이지 ↔ 앱 페이지, page dots 인디케이터 |
| 위 스와이프 (`velocity.y > -800`, 느림) | 홈, 홈 인디케이터 | App Switcher (열린 앱 카드 스택) |
| 위 스와이프 (`velocity.y ≤ -800`, 빠름) | 앱 안, 홈 인디케이터 | 앱 닫기 + 홈 복귀 |
| 우상단 스와이프 다운 | 어디서나 | Control Center 열기 |
| 좌상단 스와이프 다운 | 어디서나 | Notification Center 열기 |
| 좌측 엣지 스와이프 우측 | 푸시 스택 있을 때 | `pop()` |
| 앱 아이콘 탭 | 홈/도크 | 앱 풀스크린 zoom-in spring (아이콘 위치에서) |
| 곡 재생 시작 | (자동) | Dynamic Island 모핑 → 곡정보 노출, 다시 탭하면 음악 위젯/앱으로 |

framer-motion 의 `useDragControls`, `motion.div` 의 `drag`/`dragConstraints`/`onDragEnd` 로 처리. 이미 dependency 에 포함됨.

## 8. Edge Cases / 에러 처리

- **SSR 없음** (Vite SPA) → `window`/`localStorage` 접근 안전, hydration mismatch 없음
- **Resize 중 모드 전환**: 데스크톱 폭에서 모바일 폭으로 줄이면 셸 자동 전환. zustand 상태는 보존되므로 활성 앱/페이지 위치 유지.
- **터치 + 마우스 동시 지원**: framer-motion 이 자동 처리. 데스크톱에서 `forcedMode=mobile` 로 미리볼 때 마우스 드래그도 정상.
- **Bear 마크다운 fetch**: 데스크톱과 동일 prefetch 활용 (Desktop.tsx 의 `useEffect` 가 이미 모든 .md preload — Shell 분기 이전에 한번 실행되도록 Shell entry 로 이동).
- **잠금 해제 1회만**: `localStorage.lockSeen = '1'` 세팅, 다음 방문부턴 LockScreen 스킵.
- **iPad 같은 경계 디바이스**: `auto` 모드에서는 768px 미만만 mobile. iPad 가로(1024px)는 데스크톱으로 떨어짐. 사용자가 토글 가능.
- **Github 등 외부 링크 앱**: `link` 필드가 있으면 풀스크린 안 열고 새 탭 open (현재 Dock 동작과 동일).
- **다이내믹 아일랜드 충돌**: NotificationCenter 가 열렸을 때는 island 인터랙션 비활성화 (z-index + pointer-events).

## 9. Testing Strategy

이 프로젝트에 Jest/Vitest 셋업 없음 확인. 비용 대비 가치를 위해 다음 전략:

1. **빌드 검증** — `pnpm build` 통과 (TypeScript strict, ESLint 통과)
2. **수동 QA 체크리스트** — 스프린트 종료마다 dev server 에서 인터랙션 별 확인 (체크리스트는 implementation plan 에 첨부)
3. **반응형 검증** — Chrome DevTools iPhone 14 Pro / iPhone SE / iPad 시뮬레이터 + 데스크톱 토글 확인
4. **(선택) Playwright MCP 1 시나리오** — 잠금 해제 → 페이지 스와이프 → Bear 드릴다운 → CC 토글의 단일 happy-path

테스트 인프라 신규 도입은 별도 결정. 디폴트는 위 4가지.

## 10. Implementation Sprints

worktree(`feat/mobile-iphone-shell`) 안에서 진행. 각 스프린트 종료마다 빌드 통과 + 시각 검증 + 1개 이상의 commit. 사용자가 어디서든 중단/리뷰 가능.

| Sprint | 범위 | 시간 | commits |
|--------|------|------|---------|
| **S0** | Shell 분기, useDeviceMode, MobileShell stub, 데스크톱 토글 | 30m | 1 |
| **S1** | StatusBar, DynamicIsland(정적), HomeIndicator, LockScreen | 1.5h | 4 |
| **S2** | HomeScreen + PageView + Dock + AppIcon + page dots | 1.5h | 3 |
| **S3** | WidgetFrame + 위젯 5개 wrapping | 1.5h | 3 |
| **S4** | AppContainer + 열기/닫기 spring + GenericAppMobile | 1h | 2 |
| **S5** | BearMobile (push stack + 백 제스처 + slide trans) | 2h | 3 |
| **S6** | SettingsMobile + system slice 연동 + Wallpaper override | 1.5h | 2 |
| **S7** | ControlCenter + NotificationCenter + AppSwitcher | 2h | 3 |
| **S8** | DynamicIsland 음악 모핑 + 알림 모핑 + 폴리시 | 1h | 2 |
| **S9** | 빌드/QA/리뷰 + (선택) Playwright 1 시나리오 | 1h | 1 |
| **합계** | | **~13h** | **~24** |

## 11. Worktree

- branch: `feat/mobile-iphone-shell`
- 경로: `/Users/kang1027/project/portfolio/portfolio_front-mobile/`
- main 브랜치 유지, 검증 끝나면 fast-forward merge

## 12. Acceptance Criteria

- [ ] 모바일 폭(<768px) 또는 모바일 UA 로 접근 시 자동으로 iPhone 셸 표시
- [ ] 데스크톱에서 TopBar 토글로 모바일 셸 미리보기 가능
- [ ] 첫 방문 시 LockScreen → 위로 스와이프 시 홈, 두번째 방문부터 즉시 홈
- [ ] 좌우 스와이프로 위젯 ↔ 앱 페이지 전환, page dots 갱신
- [ ] 위젯 5개 모두 iOS 카드 chrome 안에서 동작 (Photo 슬라이드, Music live data, Weather data, Calendar, Contact CTA)
- [ ] 도크 4개 + 그리드 4개 앱 아이콘이 iOS 스타일 (rounded-2xl, 그림자)
- [ ] Bear 앱: 카테고리 → 글 목록 → 본문 드릴다운 + 좌측 엣지 백 제스처 + 슬라이드 트랜지션
- [ ] Settings 앱: Display 다크/밝기 / Wallpaper 변경 / Sounds 볼륨 / About 정적
- [ ] Control Center: dark/wifi/bluetooth/airdrop/볼륨/밝기 토글, 모두 즉시 반영
- [ ] Notification Center: 가짜 알림 1~2개 표시
- [ ] App Switcher: 열린 앱 카드 스택 표시
- [ ] Dynamic Island: 음악 재생 시 곡 정보 모핑
- [ ] 데스크톱 셸 동작 0줄 변경 (regression 없음)
- [ ] `pnpm build` 통과

## 13. Risks

- **Framer-motion 학습 비용**: 이미 dep 에 있지만 현재 코드에서 거의 사용 안 함. drag/AnimatePresence 검증 필요.
- **터치 vs 마우스 제스처 정확도**: framer-motion 이 둘 다 추상화하지만 edge swipe 같은 게 데스크톱에서 어색할 수 있음 → S0 직후 검증.
- **위젯 wrapping 시 사이즈 기대 mismatch**: 현재 위젯들은 데스크톱 절대 위치 기반. 모바일 wrapper 에서는 `position: relative` + grid 셀 안에 들어가도록 스타일 격리 필요. 시간이 더 걸리면 S3 늘어날 수 있음.
- **Vite/UnoCSS dynamic class purge**: 동적으로 만들어지는 grid 클래스(`col-span-2` 등) 가 purge 되지 않도록 safelist 확인.

## 14. Out-of-scope (v2 후보)

- 앱 아이콘 long-press 메뉴 (위젯 추가 / Edit Home Screen)
- 위젯 갤러리 (사용자가 위젯 골라 추가)
- 가로 회전 (orientation:landscape)
- Today View (Home 좌측 스와이프)
- 진짜 푸시 알림 (FCM/Webpush)
- iPad 전용 split view
