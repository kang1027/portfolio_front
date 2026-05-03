import { create } from "zustand";
import { createDockSlice, type DockSlice } from "./slices/dock";
import { createSystemSlice, type SystemSlice } from "./slices/system";
import { createUserSlice, type UserSlice } from "./slices/user";
import { createMobileSlice, type MobileSlice } from "./slices/mobile";

export const useStore = create<DockSlice & SystemSlice & UserSlice & MobileSlice>(
  (...a) => ({
    ...createDockSlice(...a),
    ...createSystemSlice(...a),
    ...createUserSlice(...a),
    ...createMobileSlice(...a)
  })
);

// Dev only: E2E/콘솔에서 store 직접 조작용. prod 빌드에선 dead-code-eliminate.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as unknown as { __store: typeof useStore }).__store = useStore;
}
