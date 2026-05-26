"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

import {
  getNextAvailableStory,
  getStoryStatus,
  getTrack,
  getTrackProgress,
  hasReadyStories,
  isNamesTrack,
  isWordTrack,
  toArabicNumeral,
} from "@/data/days";
import { getTodayTrackRead, getUserData, isDevMode, isDevUnlimited, setActiveTrack, UserData } from "@/lib/storage";

const ease = [0.16, 1, 0.3, 1] as const;
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease, duration: 0.4 } },
};

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = String(params.trackId);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devUnlimited, setDevUnlimited] = useState(false);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    setDevMode(isDevMode());
    setDevUnlimited(isDevUnlimited());
    if (getTrack(trackId)) setActiveTrack(trackId);
  }, [trackId]);

  const track = getTrack(trackId);

  useEffect(() => {
    if (!track) router.replace("/library");
    if (track && isNamesTrack(track)) {
      router.replace(`/tracks/${trackId}/names`);
    }
  }, [track, trackId, router]);

  if (!userData || !track) return null;
  if (isNamesTrack(track)) return null; // will redirect via useEffect

  // At this point TypeScript still has type Track; narrow to WordTrack
  const wordTrack = isWordTrack(track) ? track : null;
  if (!wordTrack) return null;

  const isReady = hasReadyStories(wordTrack, devMode);
  const progress = getTrackProgress(wordTrack.id, userData.completedStoriesByTrack);
  const todayRead = getTodayTrackRead(userData, trackId);
  const hasDoneToday = !!todayRead && !devUnlimited;
  const nextStory = hasDoneToday
    ? null
    : getNextAvailableStory(wordTrack.id, userData.completedStoriesByTrack, devMode);

  return (
    <main className="flex flex-col min-h-screen pb-10">
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
              مسار الكلمة
            </p>
            <p className="text-[13px] font-semibold text-kanah-text truncate leading-tight">
              {wordTrack.word}
            </p>
          </div>
        </div>
      </header>

      <section className="px-6 pt-10 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.45 }}
          className="text-[11px] font-semibold text-kanah-accent-muted tracking-widest uppercase mb-3"
        >
          {isReady ? "رحلة الكلمة" : "قريباً"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease, duration: 0.5 }}
          className="text-[34px] font-extrabold text-kanah-accent leading-[1.5] mb-3"
        >
          {wordTrack.word}
        </motion.h1>
        <p className="text-[16px] text-kanah-text leading-[2] mb-3">
          {wordTrack.subtitle}
        </p>
        <p className="text-[14px] text-kanah-muted leading-[2] mb-6">
          {wordTrack.description}
        </p>

        <div className="bg-kanah-card border border-kanah-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-kanah-locked">التقدّم</span>
            <span className="text-[14px] font-semibold text-kanah-accent">
              {toArabicNumeral(progress)} من {toArabicNumeral(wordTrack.totalStories)}
            </span>
          </div>
        </div>
      </section>

      {hasDoneToday ? (
        <section className="px-6 pb-8">
          <div className="w-full text-center py-4 rounded-2xl text-[15px] font-semibold bg-kanah-surface border border-kanah-border text-kanah-muted">
            يكفيك معنى واحد اليوم · عُد غداً لتعيش معنى جديداً
          </div>
        </section>
      ) : nextStory ? (
        <section className="px-6 pb-8">
          <Link
            href={`/tracks/${wordTrack.id}/stories/${nextStory.id}`}
            className="block w-full text-center py-4 rounded-2xl text-[16px] font-semibold bg-kanah-accent text-white shadow-accent active:scale-[0.98]"
          >
            {progress > 0 ? "تابع القصة المتاحة" : "ابدأ هذا المسار"}
          </Link>
        </section>
      ) : null}

      <section className="px-6 pb-12">
        <h2 className="text-[10px] font-semibold text-kanah-locked tracking-widest uppercase mb-4">
          قصص المسار
        </h2>
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {wordTrack.stories.map((story) => {
            const status = getStoryStatus(
              wordTrack.id,
              story.id,
              userData.completedStoriesByTrack,
              devMode
            );
            const isComingSoon = !story.contentReady && !devMode;
            const blockedByDaily = hasDoneToday && status === "available";
            const canOpen = !isComingSoon && status !== "locked" && !blockedByDaily;

            const card = (
              <motion.div
                variants={listItem}
                whileTap={canOpen ? { scale: 0.985 } : {}}
                className={`rounded-2xl border p-5 transition-colors ${
                  canOpen
                    ? "bg-kanah-card border-kanah-border"
                    : "bg-kanah-card border-kanah-border opacity-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] text-kanah-locked">
                    القصة {toArabicNumeral(story.storyNumber)}
                  </span>
                  {status === "completed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-completed bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={11} />
                      مكتملة
                    </span>
                  ) : isComingSoon ? (
                    <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      قريباً
                    </span>
                  ) : blockedByDaily ? (
                    <span className="text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      غداً
                    </span>
                  ) : status === "available" ? (
                    <span className="text-[11px] font-semibold text-kanah-accent bg-kanah-accent-subtle px-2.5 py-1 rounded-full">
                      متاحة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-kanah-locked bg-kanah-border px-2.5 py-1 rounded-full">
                      <Lock size={10} />
                      لم تُفتح بعد
                    </span>
                  )}
                </div>

                <p className={`text-[20px] font-bold leading-[1.7] mb-2 ${canOpen ? "text-kanah-text" : "text-kanah-locked"}`}>
                  {story.title}
                </p>

                {canOpen && (
                  <div className="flex items-center gap-1.5 text-kanah-locked text-[11px]">
                    <Clock size={11} />
                    <span>{story.readingTime}</span>
                  </div>
                )}
              </motion.div>
            );

            if (!canOpen) return <div key={story.id}>{card}</div>;

            return (
              <Link key={story.id} href={`/tracks/${wordTrack.id}/stories/${story.id}`}>
                {card}
              </Link>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
