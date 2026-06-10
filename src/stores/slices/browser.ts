import type { StateCreator } from "zustand";

export interface SafariRequest {
  id: number;
  url: string;
}

export interface BrowserSlice {
  safariRequest: SafariRequest | null;
  openSafariUrl: (url: string) => void;
}

let safariRequestId = 0;

export const createBrowserSlice: StateCreator<BrowserSlice> = (set) => ({
  safariRequest: null,
  openSafariUrl: (url) =>
    set(() => ({
      safariRequest: {
        id: ++safariRequestId,
        url
      }
    }))
});
