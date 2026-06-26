"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export default function SplashScreen() {
  // null = undecided (render nothing yet, avoids SSR flash), then show/hide
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem("kanah-splash") === "1";
    } catch {
      /* private mode */
    }
    if (shown) {
      setVisible(false);
      return;
    }
    setVisible(true);
    try {
      sessionStorage.setItem("kanah-splash", "1");
    } catch {
      /* private mode */
    }
    const t = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, transition: { duration: 0.55, ease } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-kanah-bg"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 0%, var(--kanah-glow), transparent 70%)",
            }}
          />

          <motion.p
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="font-display text-[92px] leading-[1.1] text-kanah-text"
          >
            كَنْه
          </motion.p>

          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
            className="block w-12 h-px bg-kanah-accent-muted/60 my-7 origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
            className="text-[14px] text-kanah-muted tracking-wide"
          >
            الكلمة أعمق مما تظن
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
