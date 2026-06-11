"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const ease = [0.16, 1, 0.3, 1] as const;

export default function PageHeader({
  title,
  tagline,
}: {
  title: string;
  tagline?: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative z-10 px-6 pt-12 pb-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-display text-[17px] text-kanah-accent leading-none block mb-3">
            كَنْه
          </span>
          <h1 className="font-display text-[38px] font-bold text-kanah-text leading-[1.1]">
            {title}
          </h1>
          {tagline && (
            <p className="text-[12.5px] text-kanah-muted mt-2.5">{tagline}</p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
