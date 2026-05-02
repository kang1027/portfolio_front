import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "~/stores";
import { PAGE_COUNT } from "~/configs/mobile";
import WidgetPage from "./WidgetPage";
import AppPage from "./AppPage";
import MobileDock from "./Dock";
import PageDots from "./PageDots";

export default function HomeScreen() {
  const { currentPage, setCurrentPage } = useStore(
    useShallow((s) => ({
      currentPage: s.currentPage,
      setCurrentPage: s.setCurrentPage
    }))
  );
  const [width, setWidth] = useState(() => window.innerWidth);
  const skipTransitionRef = useRef(false);

  useEffect(() => {
    const r = () => {
      skipTransitionRef.current = true;
      setWidth(window.innerWidth);
      requestAnimationFrame(() => {
        skipTransitionRef.current = false;
      });
    };
    window.addEventListener("resize", r);
    window.addEventListener("orientationchange", r);
    return () => {
      window.removeEventListener("resize", r);
      window.removeEventListener("orientationchange", r);
    };
  }, []);

  return (
    <>
      <motion.div
        className="absolute inset-0 flex"
        animate={{ x: -currentPage * width }}
        transition={
          skipTransitionRef.current
            ? { duration: 0 }
            : { type: "spring", stiffness: 250, damping: 30 }
        }
        drag="x"
        dragConstraints={{ left: -width * (PAGE_COUNT - 1), right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          const threshold = width / 4;
          if (info.offset.x < -threshold && currentPage < PAGE_COUNT - 1) {
            setCurrentPage(currentPage + 1);
          } else if (info.offset.x > threshold && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          }
        }}
        style={{ width: width * PAGE_COUNT, touchAction: "pan-y" }}
      >
        <div style={{ width }} className="overflow-y-auto h-full">
          <WidgetPage />
        </div>
        <div style={{ width }} className="overflow-y-auto h-full">
          <AppPage />
        </div>
      </motion.div>
      <PageDots count={PAGE_COUNT} current={currentPage} />
      <MobileDock />
    </>
  );
}
