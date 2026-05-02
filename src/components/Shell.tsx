import { useDeviceMode } from "~/components/mobile/hooks/useDeviceMode";
import Desktop from "~/pages/Desktop";
import MobileShell from "~/components/mobile/MobileShell";
import type { MacActions } from "~/types";

export default function Shell(props: MacActions) {
  const mode = useDeviceMode();
  if (mode === "mobile") return <MobileShell {...props} />;
  return <Desktop {...props} />;
}
