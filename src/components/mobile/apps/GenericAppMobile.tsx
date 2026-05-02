import { useDragControls } from "framer-motion";
import { apps } from "~/configs";
import { useStore } from "~/stores";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";

interface Props {
  id: string;
}

export default function GenericAppMobile({ id }: Props) {
  const mobileCloseApp = useStore((s) => s.mobileCloseApp);
  const dragControls = useDragControls();
  const app = apps.find((a) => a.id === id);
  if (!app || !app.content) return null;

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar
        title={app.title}
        dragControls={dragControls}
        right={
          <button
            type="button"
            onClick={mobileCloseApp}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center"
          >
            <span className="i-fa-solid:xmark text-sm" aria-hidden="true" />
          </button>
        }
      />
      <div
        className="absolute inset-0 overflow-auto"
        style={{ paddingTop: "calc(var(--mobile-safe-top, 12px) + 36px + 52px)" }}
      >
        {app.content}
      </div>
    </AppContainer>
  );
}
