import { motion } from "framer-motion";

interface Props {
  onSwipeUp?: (velocity: number) => void;
}

export default function HomeIndicator({ onSwipeUp }: Props) {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40 && onSwipeUp) onSwipeUp(info.velocity.y);
      }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.25 w-32 rounded-full bg-white/80 z-30 cursor-grab active:cursor-grabbing"
    />
  );
}
