import apps from "~/configs/apps";

export const DOCK_IDS = ["bear", "safari", "contact", "github"] as const;
export const MOBILE_HIDDEN_FROM_GRID_IDS = [
  "vscode",
  "terminal",
  "typora",
  "settings",
  "launchpad"
] as const;
export const PAGE_COUNT = 2;
// 모바일에서 GenericAppMobile로 라우팅 가능한 앱 = contentMobile이 명시된 앱.
// 하드코딩 리스트를 두지 않아 새 앱 추가 시 contentMobile 정의 누락이 곧 미라우팅
// (= silent 깨짐 방지)으로 이어진다.
export const MOBILE_SAFE_APP_IDS = apps
  .filter((a) => a.contentMobile != null)
  .map((a) => a.id);
