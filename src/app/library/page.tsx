"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
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
} from "@/data/days";
import { getUserData, isDevMode, UserData } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } },
};

export default function LibraryPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    setUserData(getUserData());
    setDevMode(isDevMode());
  }, []);

  if (!userData) return null;

  return (
    <main className="flex flex-col min-h-screen pb-24">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease, duration: 0.45 }}
        className="px-6 pt-12 pb-8"
      >
        <p className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-1">
          مكتبة الكلمات
        </p>
        <h1 className="text-[22px] font-bold text-kanah-text leading-tight">
          كل كلمة هنا مسار من قصص ومعانٍ وأعمال يومية
        </h1>
      </motion.header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 flex flex-col gap-4"
      >
        {wordTracks.map((track) => {
          const isActive = userData.activeTrackId === track.id;

          if (isNamesTrack(track)) {
            const progress = getNamesTrackProgress(
              track.id,
              userData.completedNamesByTrack
            );
            const isReady = hasReadyNames(track, devMode);
            const canClick = true;

            const CardContent = (
              <motion.div
                variants={cardVariant}
                whileTap={canClick ? { scale: 0.985 } : {}}
                className={`bg-kanah-card rounded-2xl p-5 border transition-colors ${
                  canClick
                    ? "border-kanah-border shadow-sm"
                    : "border-kanah-border opacity-45"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {canClick ? (
                      isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                          <Sparkles size={11} />
                          آخر مسار قرأته
                        </span>
                      ) : progress > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-completed bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={11} />
                          بدأت هذا المسار
                        </span>
                      ) : !isReady ? (
                        <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                          قيد الإعداد
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-kanah-muted bg-kanah-surface px-2.5 py-1 rounded-full">
                          متاح الآن
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                        <Lock size={10} />
                        قريباً
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-kanah-locked">
                    {toArabicNumeral(track.totalNames)} اسماً
                  </span>
                </div>

                <p
                  className={`text-[26px] font-extrabold leading-tight mb-2 ${
                    canClick ? "text-kanah-accent" : "text-kanah-locked"
                  }`}
                >
                  {track.word}
                </p>

                <p className="text-[14px] text-kanah-text leading-[1.9] mb-2">
                  {track.subtitle}
                </p>

                <p className="text-[13px] text-kanah-muted leading-[1.9] mb-4">
                  {track.description}
                </p>

                <div className="flex items-center justify-between text-[12px] text-kanah-locked">
                  <span>
                    {toArabicNumeral(progress)} من{" "}
                    {toArabicNumeral(track.totalNames)}
                  </span>
                  <span>{progress > 0 ? "تقدّمك الحالي" : "لم تبدأ بعد"}</span>
                </div>
              </motion.div>
            );

            if (!canClick) return <div key={track.id}>{CardContent}</div>;

            return (
              <Link key={track.id} href={`/tracks/${track.id}/names`}>
                {CardContent}
              </Link>
            );
          }

          // WordTrack
          if (!isWordTrack(track)) return null;
          const progress = getTrackProgress(
            track.id,
            userData.completedStoriesByTrack
          );
          const isReady = hasReadyStories(track, devMode);
          const canClick = isReady;

          const CardContent = (
            <motion.div
              variants={cardVariant}
              whileTap={canClick ? { scale: 0.985 } : {}}
              className={`bg-kanah-card rounded-2xl p-5 border transition-colors ${
                canClick
                  ? "border-kanah-border shadow-sm"
                  : "border-kanah-border opacity-45"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  {canClick ? (
                    isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                        <Sparkles size={11} />
                        آخر مسار قرأته
                      </span>
                  ) : progress > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-completed bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={11} />
                        بدأت هذا المسار
                      </span>
                    ) : !isReady ? (
                      <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                        قيد الإعداد
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-kanah-muted bg-kanah-surface px-2.5 py-1 rounded-full">
                        متاح الآن
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      <Lock size={10} />
                      قريباً
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-kanah-locked">
                  {toArabicNumeral(track.totalStories)} قصص
                </span>
              </div>

              <p
                className={`text-[26px] font-extrabold leading-tight mb-2 ${
                  canClick ? "text-kanah-accent" : "text-kanah-locked"
                }`}
              >
                {track.word}
              </p>

              <p className="text-[14px] text-kanah-text leading-[1.9] mb-2">
                {track.subtitle}
              </p>

              <p className="text-[13px] text-kanah-muted leading-[1.9] mb-4">
                {track.description}
              </p>

              <div className="flex items-center justify-between text-[12px] text-kanah-locked">
                <span>
                  {toArabicNumeral(progress)} من{" "}
                  {toArabicNumeral(track.totalStories)}
                </span>
                <span>{progress > 0 ? "تقدّمك الحالي" : "لم تبدأ بعد"}</span>
              </div>
            </motion.div>
          );

          if (!canClick) return <div key={track.id}>{CardContent}</div>;

          return (
            <Link key={track.id} href={`/tracks/${track.id}`}>
              {CardContent}
            </Link>
          );
        })}
      </motion.div>

      <BottomNav />
    </main>
  );
}
