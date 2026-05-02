import { motion } from "framer-motion";

interface Props {
  onBack: () => void;
}

export default function EdgeBackGesture({ onBack }: Props) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.3}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x > 60 || info.velocity.x > 400) onBack();
      }}
      className="absolute left-0 w-5 z-30"
      style={{
        top: "calc(var(--mobile-safe-top, 12px) + 36px + 52px)",
        bottom: "calc(var(--mobile-safe-bottom, 0px) + 12px)",
        touchAction: "pan-y"
      }}
    />
  );
}
