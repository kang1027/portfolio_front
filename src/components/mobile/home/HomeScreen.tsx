import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [skipTransition, setSkipTransition] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setSkipTransition(true);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    if (skipTransition) {
      const id = requestAnimationFrame(() => setSkipTransition(false));
      return () => cancelAnimationFrame(id);
    }
  }, [skipTransition]);

  return (
    <>
      {/* drag area: below status bar/island, above dock/indicator */}
      <div className="absolute top-13 left-0 right-0 bottom-24 overflow-hidden">
        <motion.div
          className="absolute inset-0 flex"
          style={{ width: width * PAGE_COUNT, touchAction: "pan-y" }}
          animate={{ x: -currentPage * width }}
          transition={
            skipTransition
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
        >
          <div style={{ width }} className="overflow-y-auto h-full">
            <WidgetPage />
          </div>
          <div style={{ width }} className="overflow-y-auto h-full">
            <AppPage />
          </div>
        </motion.div>
      </div>
      <PageDots count={PAGE_COUNT} current={currentPage} />
      <MobileDock />
    </>
  );
}
