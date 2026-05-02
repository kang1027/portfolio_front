import { useDragControls } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { bear } from "~/configs";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";

const NAV_TOP_PT = "calc(var(--mobile-safe-top, 12px) + 36px + 52px)";

function CategoriesView() {
  const push = useStore((s) => s.push);
  return (
    <ul className="absolute inset-0 overflow-y-auto" style={{ paddingTop: NAV_TOP_PT }}>
      {bear.map((cat) => (
        <li key={cat.id}>
          <button
            type="button"
            onClick={() => push({ view: "bear-list", categoryId: cat.id })}
            className="w-full px-4 py-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <span className={`${cat.icon} text-xl text-red-500`} />
            <span className="flex-1 text-left text-black dark:text-white">
              {cat.title}
            </span>
            <span
              className="i-fa-solid:chevron-right text-sm text-c-400"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function BearMobile() {
  const { mobileCloseApp } = useStore(
    useShallow((s) => ({
      mobileCloseApp: s.mobileCloseApp
    }))
  );
  const dragControls = useDragControls();

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar
        title="Bear"
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
      <CategoriesView />
    </AppContainer>
  );
}
