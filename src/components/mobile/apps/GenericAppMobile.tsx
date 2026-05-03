import { useDragControls } from "framer-motion";
import { apps } from "~/configs";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";

interface Props {
  id: string;
}

export default function GenericAppMobile({ id }: Props) {
  const dragControls = useDragControls();
  const app = apps.find((a) => a.id === id);
  // 데스크톱 컨테이너 전제(content)를 모바일에 raw 마운트하면 깨지므로
  // contentMobile이 명시된 앱만 통과시킨다.
  if (!app || !app.contentMobile) return null;

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar title={app.title} dragControls={dragControls} />
      <div
        className="absolute inset-0 overflow-auto"
        style={{ paddingTop: "calc(var(--mobile-safe-top, 12px) + 36px + 52px)" }}
      >
        {app.contentMobile}
      </div>
    </AppContainer>
  );
}
