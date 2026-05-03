import { useDragControls } from "framer-motion";
import AppContainer from "./AppContainer";

export default function FaceTimeMobile() {
  const dragControls = useDragControls();

  return (
    <AppContainer dragControls={dragControls}>
      <div
        className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-white"
        style={{
          paddingTop: "calc(var(--mobile-safe-top, 12px) + 36px + 32px)"
        }}
      >
        <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center shadow-2xl mb-6">
          <span className="i-fa-solid:video text-6xl text-white/60" aria-hidden="true" />
        </div>
        <div className="text-2xl font-light mb-1">FaceTime</div>
        <div className="text-sm text-white/60 mb-8">Mobile demo</div>
        <div className="flex gap-4">
          <button
            type="button"
            aria-label="End call"
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"
          >
            <span
              className="i-fa-solid:phone-slash text-white text-xl"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-label="Mute"
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
          >
            <span
              className="i-fa-solid:microphone-slash text-white text-xl"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-label="Camera"
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
          >
            <span
              className="i-fa-solid:camera-rotate text-white text-xl"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </AppContainer>
  );
}
