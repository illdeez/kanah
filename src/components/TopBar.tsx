"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";

export default function TopBar({
  kicker,
  title,
  readingTime,
}: {
  kicker?: string;
  title?: string;
  readingTime?: string;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-kanah-veil backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 h-16">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-kanah-border bg-kanah-card/60 text-kanah-muted active:scale-90 transition-transform"
          aria-label="رجوع"
        >
          <ChevronRight size={19} />
        </button>
        <div className="flex-1 min-w-0">
          {kicker && (
            <p className="text-[10.5px] text-kanah-accent-muted truncate">
              {kicker}
            </p>
          )}
          {title && (
            <p className="text-[13.5px] font-semibold text-kanah-text truncate leading-tight">
              {title}
            </p>
          )}
        </div>
        {readingTime && (
          <div className="flex items-center gap-1 text-kanah-locked text-[11px] flex-shrink-0">
            <Clock size={11} />
            <span>{readingTime}</span>
          </div>
        )}
      </div>
    </header>
  );
}
