export const DOCK_IDS = ["bear", "safari", "contact", "github"] as const;
export const HIDDEN_FROM_GRID_IDS = ["launchpad"] as const;
export const PAGE_COUNT = 2;
export const MOBILE_SAFE_APP_IDS = ["contact", "facetime"] as const;

export const MOBILE_STUB_APPS = [
  { id: "bear", name: "Bear", sprintNote: "Sprint 5" },
  { id: "settings", name: "Settings", sprintNote: "Sprint 6" }
] as const;

export const MOBILE_STUB_APP_IDS = MOBILE_STUB_APPS.map((s) => s.id) as readonly string[];
