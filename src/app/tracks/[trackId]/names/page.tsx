"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Search, X } from "lucide-react";
import { motion } from "framer-motion";

import {
  getNamesTrack,
  getNamesTrackProgress,
  toArabicNumeral,
} from "@/data/days";
import { getUserData, isDevMode, UserData } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

const ease = [0.16, 1, 0.3, 1] as const;

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.4 } },
};

export default function NamesListPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setDevMode(isDevMode());
  }, [trackId]);

  const track = getNamesTrack(trackId);

  useEffect(() => {
    if (!track) router.replace("/library");
  }, [track, router]);

  if (!userData || !track) return null;

  const progress = getNamesTrackProgress(trackId, userData.completedNamesByTrack);
  const completedNames = userData.completedNamesByTrack[trackId] ?? [];
  const completedNameStoriesByTrack = userData.completedNameStoriesByTrack ?? {};

  return (
    <main className="flex flex-col min-h-screen pb-32 relative">
      <TopBar kicker="مسار الأسماء" title={track.word} />

      {/* Hero */}
      <section className="px-6 pt-12 pb-8 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.2em] mb-6"
        >
          أسماء الله الحسنى
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.55 }}
          className="font-display text-[46px] text-kanah-text leading-[1.3] mb-5"
        >
          {track.word}
        </motion.h1>
        <p className="text-[15px] text-kanah-text leading-[2] mb-2">
          {track.subtitle}
        </p>
        <p className="text-[13px] text-kanah-muted leading-[2] mb-7 max-w-[44ch] mx-auto">
          {track.description}
        </p>

        <div className="rounded-[24px] bg-kanah-card border border-kanah-border p-5 text-start">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-kanah-accent-muted tracking-[0.15em]">
              التقدّم
            </span>
            <span className="text-[14px] font-bold text-kanah-accent tabular-nums">
              {toArabicNumeral(progress)} / {toArabicNumeral(track.totalNames)}
            </span>
          </div>
          <div className="h-1.5 bg-kanah-border rounded-full overflow-hidden">
            <div
              className="h-full bg-kanah-accent rounded-full transition-all duration-700"
              style={{ width: `${track.totalNames > 0 ? (progress / track.totalNames) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[12px] text-kanah-muted leading-[1.9] mt-4 pt-4 border-t border-kanah-border">
            اختر اسماً تعيش معه اليوم — يمكنك قراءة أكثر من اسم، لكن قصة واحدة فقط من كل اسم.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="px-6 pb-5 relative z-10">
        <div className="relative">
          <Search
            size={15}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-kanah-locked pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم…"
            dir="rtl"
            className="w-full bg-kanah-card border border-kanah-border rounded-full py-3 pr-10 pl-10 text-[14px] text-kanah-text placeholder:text-kanah-locked focus:outline-none focus:border-kanah-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kanah-locked hover:text-kanah-text transition-colors"
              aria-label="مسح البحث"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {/* Names grid */}
      <section className="px-4 pb-12 relative z-10">
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {track.names
            .filter(
              (name) =>
                search.trim() === "" ||
                name.name.includes(search.trim()) ||
                name.title.includes(search.trim())
            )
            .map((name) => {
              const hasSubStories = !!name.stories && name.stories.length > 0;
              const completedSubStories = hasSubStories
                ? (completedNameStoriesByTrack[trackId]?.[name.id] ?? []).length
                : 0;
              const totalSubStories = hasSubStories ? name.stories!.length : 0;
              const isCompleted = hasSubStories
                ? completedSubStories >= totalSubStories
                : completedNames.includes(name.id);
              const isComingSoon = !name.contentReady && !devMode;
              const canOpen = !isComingSoon;

              const card = (
                <motion.div
                  variants={listItem}
                  whileTap={canOpen ? { scale: 0.97 } : {}}
                  className={`relative rounded-[26px] border p-5 flex flex-col items-center text-center gap-3 transition-colors min-h-[150px] overflow-hidden ${
                    canOpen
                      ? "bg-kanah-card border-kanah-border"
                      : "bg-kanah-card border-kanah-border opacity-40"
                  }`}
                >
                  <span className="absolute top-3.5 start-4 font-display text-[13px] text-kanah-locked">
                    {toArabicNumeral(name.number)}
                  </span>
                  {isCompleted && (
                    <span className="absolute top-3.5 end-4 text-kanah-completed">
                      <CheckCircle2 size={14} />
                    </span>
                  )}

                  <p
                    className={`font-display text-[30px] leading-tight mt-5 ${
                      canOpen ? "text-kanah-accent" : "text-kanah-locked"
                    }`}
                  >
                    {name.name}
                  </p>

                  <p className="text-[11px] text-kanah-muted leading-[1.7] line-clamp-2">
                    {name.title}
                  </p>

                  <div className="mt-auto pt-1 text-[11px] font-semibold">
                    {isComingSoon ? (
                      <span className="text-kanah-locked">قيد الإعداد</span>
                    ) : hasSubStories ? (
                      <span className="text-kanah-accent-muted tabular-nums">
                        {toArabicNumeral(completedSubStories)} من{" "}
                        {toArabicNumeral(totalSubStories)} قصص
                      </span>
                    ) : (
                      <span className="text-kanah-accent-muted">ابدأ اليوم</span>
                    )}
                  </div>
                </motion.div>
              );

              if (!canOpen) return <div key={name.id}>{card}</div>;

              return (
                <Link
                  key={name.id}
                  href={
                    hasSubStories
                      ? `/tracks/${trackId}/names/${name.id}/stories`
                      : `/tracks/${trackId}/names/${name.id}`
                  }
                >
                  {card}
                </Link>
              );
            })}
        </motion.div>
      </section>

      <BottomNav />
    </main>
  );
}
