import { useDeviceMode } from "~/components/mobile/hooks/useDeviceMode";
import Desktop from "~/pages/Desktop";
import MobileShell from "~/components/mobile/MobileShell";
import type { MacActions } from "~/types";

export default function Shell(props: MacActions) {
  const mode = useDeviceMode();
  // 모드별로 분기 mount — 양쪽 동시 mount 시 invisible 트리의 effect/구독/interval 이
  // 살아있으면서 디버깅이 어려워지는 걸 막는다. forcedMode 토글 시 desktop state는
  // reset되지만, 실제 사용자는 mode 토글 시나리오를 거의 거치지 않는다.
  if (mode === "mobile") return <MobileShell {...props} />;
  return <Desktop {...props} />;
}
