import { useEffect, useRef, useState } from "react";

export function usePushNavigation(currentDepth: number, pop: () => void) {
  const lastDepthRef = useRef(currentDepth);
  const direction =
    currentDepth > lastDepthRef.current
      ? 1
      : currentDepth < lastDepthRef.current
        ? -1
        : 1;

  useEffect(() => {
    lastDepthRef.current = currentDepth;
  });

  const [animating, setAnimating] = useState(false);
  const handlePop = () => {
    if (animating) return;
    setAnimating(true);
    pop();
  };

  const onExitComplete = () => setAnimating(false);

  return { direction, handlePop, onExitComplete };
}
