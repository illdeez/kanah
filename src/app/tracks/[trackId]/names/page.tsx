"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Search, X } from "lucide-react";
import { motion } from "framer-motion";

import {
  getNamesTrack,
  getNamesTrackProgress,
  toArabicNumeral,
} from "@/data/days";
import {
  getUserData,
  isDevMode,
  UserData,
} from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

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
    <main className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-kanah-bg/95 backdrop-blur-sm border-b border-kanah-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-kanah-border transition-colors"
            aria-label="رجوع"
          >
            <ChevronRight size={20} className="text-kanah-muted" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-kanah-locked tracking-widest uppercase">
              مسار الأسماء
            </p>
            <p className="text-[13px] font-semibold text-kanah-text truncate leading-tight">
              {track.word}
            </p>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="px-6 pt-10 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-3"
        >
          أسماء الله الحسنى
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.5 }}
          className="text-[34px] font-extrabold text-kanah-accent leading-[1.5] mb-3"
        >
          {track.word}
        </motion.h1>
        <p className="text-[16px] text-kanah-text leading-[2] mb-3">
          {track.subtitle}
        </p>
        <p className="text-[14px] text-kanah-muted leading-[2] mb-6">
          {track.description}
        </p>
        <p className="text-[14px] font-semibold text-kanah-text leading-[1.9] mb-6">
          اختر اسماً لتبدأ رحلتك
        </p>

        <div className="bg-kanah-card border border-kanah-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-kanah-locked">التقدّم</span>
            <span className="text-[14px] font-semibold text-kanah-accent">
              {toArabicNumeral(progress)} من {toArabicNumeral(track.totalNames)}
            </span>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-4 pb-4">
        <div className="relative">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-kanah-locked pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم…"
            dir="rtl"
            className="w-full bg-kanah-card border border-kanah-border rounded-xl py-2.5 pr-9 pl-9 text-[14px] text-kanah-text placeholder:text-kanah-locked focus:outline-none focus:border-kanah-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kanah-locked hover:text-kanah-text transition-colors"
              aria-label="مسح البحث"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {/* Names grid */}
      <section className="px-4 pb-12">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4 px-2">
          أسماء المسار
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {track.names.filter((name) =>
            search.trim() === "" ||
            name.name.includes(search.trim()) ||
            name.title.includes(search.trim())
          ).map((name) => {
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
            const ctaLabel = isComingSoon
              ? "قيد الإعداد"
              : hasSubStories
              ? completedSubStories > 0
                ? "اقرأ قصة اليوم"
                : `ابدأ مع اسم ${name.name}`
              : `ابدأ مع اسم ${name.name}`;

            const badge = isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-kanah-completed bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={9} />
                مكتمل
              </span>
            ) : isComingSoon ? (
              <span className="text-[10px] font-semibold text-kanah-locked bg-kanah-border px-2 py-0.5 rounded-full">
                قريباً
              </span>
            ) : hasSubStories ? (
              <span className="text-[10px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2 py-0.5 rounded-full">
                {toArabicNumeral(completedSubStories)} من {toArabicNumeral(totalSubStories)}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2 py-0.5 rounded-full">
                متاحة
              </span>
            );

            const card = (
              <motion.div
                variants={listItem}
                whileTap={canOpen ? { scale: 0.97 } : {}}
                className={`rounded-2xl border p-4 flex flex-col gap-2 transition-colors min-h-[120px] ${
                  canOpen
                    ? "bg-kanah-card border-kanah-border"
                    : "bg-kanah-card border-kanah-border opacity-50"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] text-kanah-locked">
                    {toArabicNumeral(name.number)}
                  </span>
                  {badge}
                </div>
                <p
                  className={`text-[24px] font-extrabold leading-tight ${
                    canOpen ? "text-kanah-accent" : "text-kanah-locked"
                  }`}
                >
                  {name.name}
                </p>
                <p className="text-[11px] text-kanah-muted leading-[1.6] line-clamp-2">
                  {name.title}
                </p>
                <div
                  className={`mt-auto pt-2 text-[12px] font-semibold ${
                    canOpen ? "text-kanah-accent" : "text-kanah-locked"
                  }`}
                >
                  {ctaLabel}
                </div>
              </motion.div>
            );

            if (!canOpen) return <div key={name.id}>{card}</div>;

            return (
              <Link
                key={name.id}
                href={hasSubStories ? `/tracks/${trackId}/names/${name.id}/stories` : `/tracks/${trackId}/names/${name.id}`}
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
