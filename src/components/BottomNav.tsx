"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "الرئيسية", Icon: Sun },
  { href: "/library", label: "المكتبة", Icon: BookOpen },
  { href: "/trace", label: "أثري", Icon: Layers },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-kanah-bg/96 backdrop-blur-sm border-t border-kanah-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 flex-1 py-2 relative"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 inset-x-5 h-[1.5px] bg-kanah-accent rounded-full"
                  transition={{ type: "spring", damping: 32, stiffness: 380 }}
                />
              )}
              <motion.div
                animate={{
                  color: active
                    ? "var(--color-kanah-accent)"
                    : "var(--color-kanah-locked)",
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              </motion.div>
              <motion.span
                animate={{
                  color: active
                    ? "var(--color-kanah-accent)"
                    : "var(--color-kanah-locked)",
                }}
                transition={{ duration: 0.2 }}
                className={`text-[10.5px] tracking-wide ${
                  active ? "font-semibold" : "font-normal"
                }`}
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
