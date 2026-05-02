import type { ReactNode } from "react";

interface Props {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}

export default function AppNavBar({ title, left, right }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 h-13 px-4 flex items-center justify-between z-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
      <div className="w-16">{left}</div>
      <div className="flex-1 text-center text-base font-semibold truncate text-black dark:text-white">
        {title}
      </div>
      <div className="w-16 flex justify-end">{right}</div>
    </div>
  );
}
