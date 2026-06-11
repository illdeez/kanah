"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "اليوم", Icon: Sun },
  { href: "/library", label: "المكتبة", Icon: BookOpen },
  { href: "/trace", label: "أثري", Icon: Layers },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-kanah-border bg-kanah-nav-glass backdrop-blur-xl px-2 py-2 shadow-soft">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-full bg-kanah-accent"
                  transition={{ type: "spring", damping: 30, stiffness: 360 }}
                />
              )}
              <Icon
                size={17}
                strokeWidth={active ? 2.2 : 1.7}
                className={`relative ${
                  active ? "text-kanah-on-accent" : "text-kanah-muted"
                }`}
              />
              <span
                className={`relative text-[12.5px] ${
                  active
                    ? "font-semibold text-kanah-on-accent"
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
