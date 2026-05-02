import { useDeviceMode } from "~/components/mobile/hooks/useDeviceMode";
import Desktop from "~/pages/Desktop";
import MobileShell from "~/components/mobile/MobileShell";
import type { MacActions } from "~/types";

export default function Shell(props: MacActions) {
  const mode = useDeviceMode();
  return (
    <>
      <div
        style={{ display: mode === "desktop" ? "block" : "none" }}
        className="size-full"
      >
        <Desktop {...props} />
      </div>
      <div
        style={{ display: mode === "mobile" ? "block" : "none" }}
        className="size-full"
      >
        <MobileShell {...props} />
      </div>
    </>
  );
}
