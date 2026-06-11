"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  getTrackProgress,
  getNamesTrackProgress,
  hasReadyStories,
  hasReadyNames,
  isNamesTrack,
  isWordTrack,
  toArabicNumeral,
  wordTracks,
  Track,
} from "@/data/days";
import { getUserData, isDevMode, UserData } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } },
};

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="h-1 bg-kanah-border rounded-full overflow-hidden">
      <div
        className="h-full bg-kanah-accent rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TrackCard({
  track,
  progress,
  total,
  totalLabel,
  isActive,
  isReady,
  canClick,
  featured,
}: {
  track: Track;
  progress: number;
  total: number;
  totalLabel: string;
  isActive: boolean;
  isReady: boolean;
  canClick: boolean;
  featured?: boolean;
}) {
  return (
    <motion.div
      variants={cardVariant}
      whileTap={canClick ? { scale: 0.985 } : {}}
      className={`relative overflow-hidden rounded-[30px] border p-6 transition-colors ${
        canClick ? "bg-kanah-card border-kanah-border" : "bg-kanah-card border-kanah-border opacity-45"
      }`}
    >
      {featured && (
        <div
          aria-hidden
          className="absolute -top-20 -end-20 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--kanah-glow), transparent 70%)",
          }}
        />
      )}

      <div className="flex items-center justify-between mb-5 relative">
        {canClick ? (
          isActive ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-3 py-1 rounded-full">
              <Sparkles size={11} />
              آخر مسار قرأته
            </span>
          ) : progress > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-kanah-completed bg-kanah-completed-subtle px-3 py-1 rounded-full">
              بدأت هذا المسار
            </span>
          ) : !isReady ? (
            <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-surface px-3 py-1 rounded-full">
              قيد الإعداد
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-kanah-muted bg-kanah-surface px-3 py-1 rounded-full">
              متاح الآن
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-locked bg-kanah-surface px-3 py-1 rounded-full">
            <Lock size={10} />
            قريباً
          </span>
        )}
        <span className="text-[11px] text-kanah-locked">{totalLabel}</span>
      </div>

      <p
        className={`font-display leading-[1.15] mb-3 relative ${
          featured ? "text-[40px]" : "text-[34px]"
        } ${canClick ? "text-kanah-accent" : "text-kanah-locked"}`}
      >
        {track.word}
      </p>

      <p className="text-[14px] text-kanah-text leading-[1.9] mb-1.5 relative">
        {track.subtitle}
      </p>

      <p className="text-[12.5px] text-kanah-muted leading-[1.9] mb-6 relative">
        {track.description}
      </p>

      <div className="relative">
        <div className="flex items-center justify-between text-[11.5px] text-kanah-locked mb-2.5">
          <span className="tabular-nums">
            {toArabicNumeral(progress)} من {toArabicNumeral(total)}
          </span>
          <span className="flex items-center gap-1">
            {progress > 0 ? "تقدّمك الحالي" : "لم تبدأ بعد"}
            {canClick && <ChevronLeft size={12} />}
          </span>
        </div>
        <ProgressBar value={progress} total={total} />
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
  }, []);

  if (!userData) return null;

  return (
    <main className="flex flex-col min-h-screen pb-32 relative">
      <PageHeader title="المكتبة" tagline="كل كلمة مسار كامل" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-6 flex flex-col gap-4 relative z-10"
      >
        {wordTracks.map((track) => {
          const isActive = userData.activeTrackId === track.id;

          if (isNamesTrack(track)) {
            const progress = getNamesTrackProgress(
              track.id,
              userData.completedNamesByTrack
            );
            const isReady = hasReadyNames(track, devMode);

            return (
              <Link key={track.id} href={`/tracks/${track.id}/names`}>
                <TrackCard
                  track={track}
                  progress={progress}
                  total={track.totalNames}
                  totalLabel={`${toArabicNumeral(track.totalNames)} اسماً`}
                  isActive={isActive}
                  isReady={isReady}
                  canClick
                  featured
                />
              </Link>
            );
          }

          if (!isWordTrack(track)) return null;
          const progress = getTrackProgress(
            track.id,
            userData.completedStoriesByTrack
          );
          const isReady = hasReadyStories(track, devMode);
          const canClick = isReady;

          const card = (
            <TrackCard
              track={track}
              progress={progress}
              total={track.totalStories}
              totalLabel={`${toArabicNumeral(track.totalStories)} قصص`}
              isActive={isActive}
              isReady={isReady}
              canClick={canClick}
            />
          );

          if (!canClick) return <div key={track.id}>{card}</div>;

          return (
            <Link key={track.id} href={`/tracks/${track.id}`}>
              {card}
            </Link>
          );
        })}
      </motion.div>

      <BottomNav />
    </main>
  );
}
