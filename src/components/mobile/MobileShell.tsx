import type { MacActions } from "~/types";

export default function MobileShell(_props: MacActions) {
  const setForcedMode = useStore((s) => s.setForcedMode);
  return (
    <div className="size-full flex-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-semibold">Mobile shell — coming soon</div>
        <button
          className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur"
          onClick={() => setForcedMode("auto")}
        >
          Back to Desktop
        </button>
      </div>
    </div>
  );
}
