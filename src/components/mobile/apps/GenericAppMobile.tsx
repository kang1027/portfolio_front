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
  if (!app || !app.content) return null;

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar title={app.title} dragControls={dragControls} />
      <div
        className="absolute inset-0 overflow-auto"
        style={{ paddingTop: "calc(var(--mobile-safe-top, 12px) + 36px + 52px)" }}
      >
        {app.content}
      </div>
    </AppContainer>
  );
}
