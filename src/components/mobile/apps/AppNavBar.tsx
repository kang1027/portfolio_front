import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import type { DragControls } from "framer-motion";

interface Props {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  dragControls?: DragControls;
}

export default function AppNavBar({ title, left, right, dragControls }: Props) {
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragControls) dragControls.start(e);
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 h-13 px-4 flex items-center justify-between z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
      onPointerDown={onPointerDown}
      style={{ touchAction: dragControls ? "none" : undefined }}
    >
      <div className="w-16">{left}</div>
      <div className="flex-1 text-center text-base font-semibold truncate text-black dark:text-white pointer-events-none">
        {title}
      </div>
      <div className="w-16 flex justify-end">{right}</div>
    </div>
  );
}
