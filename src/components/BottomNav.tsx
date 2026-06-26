"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "اليوم" },
  { href: "/library", label: "المكتبة" },
  { href: "/trace", label: "أثري" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-kanah-border bg-kanah-card/95 backdrop-blur-xl p-1.5 shadow-soft">
        {navItems.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-full bg-kanah-text"
                  transition={{ type: "spring", damping: 30, stiffness: 360 }}
                />
              )}
              {active && (
                <span className="relative w-[7px] h-[7px] rounded-full bg-kanah-accent" />
              )}
              <span
                className={`relative text-[13.5px] ${
                  active
                    ? "font-semibold text-kanah-card"
                    : "font-normal text-kanah-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
