import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import lcdLogo from "@/assets/lcd-logo.png";

export function Loader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-10 bg-[var(--lcd-bg)] px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(64vw,340px)]"
          >
            <img
              src={lcdLogo}
              alt="LCD — Digital Experiences Studio"
              width={1200}
              height={1200}
              className="h-auto w-full opacity-90"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="flex items-center gap-3 text-hairline text-[var(--lcd-dim)]"
          >
            <span className="h-px w-8 bg-[var(--lcd-line)]" />
            entrée en scène
            <span className="h-px w-8 bg-[var(--lcd-line)]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}