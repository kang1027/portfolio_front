import type { ReactNode } from "react";

type Size = "small" | "medium" | "large";

const SIZE_CLASS: Record<Size, string> = {
  small: "col-span-2 aspect-square",
  medium: "col-span-4 aspect-[2/1]",
  large: "col-span-4 aspect-square"
};

interface Props {
  size: Size;
  children: ReactNode;
  onClick?: () => void;
}

export default function WidgetFrame({ size, children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`${SIZE_CLASS[size]} rounded-3xl bg-white/10 backdrop-blur-2xl shadow-lg shadow-black/20 overflow-hidden ${onClick ? "cursor-pointer tap-feedback" : ""}`}
    >
      {children}
    </div>
  );
}
