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
